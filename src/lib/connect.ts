import "server-only";
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";
import { createConnectClient, createCustomerClient, toPlain } from "@hypelabs-llc/ts-sdk";
import { FALLBACK_CONFIGURATION } from "@/contexts/configuration/configuration";
import { maskImageUrl } from "@/lib/imageProxy";
import type { Configuration } from "@/contexts/configuration/configuration";

// Initialize on the first API call so builds do not require runtime credentials.
// `server-only` keeps the client and its API key out of browser bundles.
let connect: ReturnType<typeof createConnectClient> | undefined;

export function getConnect(): ReturnType<typeof createConnectClient> {
	if (!connect) {
		const apiKey = process.env.CONNECT_API_KEY;
		if (!apiKey) {
			throw new Error("CONNECT_API_KEY is not set. Add it to .env.local (server-side only).");
		}
		// CONNECT_API_URL overrides the SDK's default base URL (e.g. to point at a staging Connect).
		// Leave it unset in production to use the SDK default.
		connect = createConnectClient(apiKey, process.env.CONNECT_API_URL);
	}
	return connect;
}

// Returns a Connect client authenticated as the logged-in customer (Authorization: Bearer <JWT>),
// or null when there's no valid session token. The customer JWT is read from the NextAuth session
// token (httpOnly, server-side only) — it is never exposed to the browser. Not memoized: the client
// is request-scoped because the token is per-customer.
export async function getCustomerConnect(): Promise<ReturnType<typeof createCustomerClient> | null> {
	const token = await getToken({
		req: { headers: await headers() },
		secret: process.env.AUTH_SECRET,
		// NextAuth sets a __Secure- prefixed cookie over HTTPS; match it so we read the right one.
		secureCookie: process.env.NODE_ENV === "production",
	});

	const accessToken = token?.accessToken;
	const expires = token?.accessTokenExpires;
	if (!accessToken) return null;
	// Treat an expired token as no session rather than making a doomed Bearer call.
	if (typeof expires === "number" && expires <= Date.now()) return null;

	return createCustomerClient(accessToken, process.env.CONNECT_API_URL);
}

// Loads the tenant's white-label configuration from Connect: branding from `organizations.branding`,
// storefront settings from `organizations.store`. Falls back to the neutral fallback config if both fail.
async function loadConfiguration(): Promise<Configuration> {
	const client = getConnect();

	const [branding, store] = await Promise.all([
		client.organizations.branding.get().catch(() => null),
		client.organizations.store.get().catch(() => null),
	]);

	if (!branding && !store) return FALLBACK_CONFIGURATION;

	const plainStore = store ? toPlain(store) : FALLBACK_CONFIGURATION.store;

	return {
		// storeName comes from the store (store.name); fall back to the neutral default.
		storeName: plainStore.name ?? FALLBACK_CONFIGURATION.storeName,
		branding: branding ? maskBrandingImages(toPlain(branding)) : FALLBACK_CONFIGURATION.branding,
		store: plainStore,
	};
}

// The Connect SDK uses its own HTTP client, so Next can't see the request to cache or revalidate it.
// Wrap the load in a tagged data cache instead: the config is served from cache (no Connect call, so a
// tenant's branding/store changes don't need a redeploy to render fast) until the "configuration" tag is
// revalidated — hit GET /api/revalidate to pull the latest without rebuilding.
export const getConfiguration = unstable_cache(loadConfiguration, ["store-configuration"], { tags: ["configuration"] });

// White-label: rewrite the branding image URLs to our opaque /api/image proxy so the client never sees
// the upstream vendor's domain. Non-URL / relative values pass through unchanged.
function maskBrandingImages<T extends Configuration["branding"]>(branding: T): T {
	return {
		...branding,
		logo: maskImageUrl(branding.logo),
		logoLightUrl: maskImageUrl(branding.logoLightUrl),
		logoDarkUrl: maskImageUrl(branding.logoDarkUrl),
		iconUrl: maskImageUrl(branding.iconUrl),
	};
}

// Thin wrapper for /api/* route handlers that talk to Connect. It runs the handler, returns its value
// as JSON, and turns any thrown error into a uniform { error } response — so each route.ts stays a few
// lines and every route fails the same way. Throw an ApiError to set a specific status.
export class ApiError extends Error {
	status: number;
	constructor(message: string, status = 500) {
		super(message);
		this.status = status;
	}
}

type Handler<T> = (request: Request, context: { params: Promise<Record<string, string>> }) => Promise<T>;

export function connectRoute<T>(handler: Handler<T>) {
	return async (request: Request, context: { params: Promise<Record<string, string>> }) => {
		try {
			const data = await handler(request, context);
			return NextResponse.json(data ?? null);
		} catch (error) {
			const status = error instanceof ApiError ? error.status : 500;
			const message = error instanceof Error ? error.message : "Unexpected error";
			return NextResponse.json({ error: message }, { status });
		}
	};
}
