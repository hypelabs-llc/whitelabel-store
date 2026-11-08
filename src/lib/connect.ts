import "server-only";
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";
import { createCustomerClient, toPlain } from "@hypelabs-llc/ts-sdk";
import { FALLBACK_CONFIGURATION } from "@/contexts/configuration/configuration";
import { maskImageUrl } from "@/lib/imageProxy";
import type { Configuration } from "@/contexts/configuration/configuration";

// `server-only` keeps the Connect client out of browser bundles. The store talks to Connect only through
// the customer client — anonymous (X-Organization-Id) before sign-in, Bearer after — so there's no org
// API key anywhere in the store.

// The org the store sells for. The customer client (anonymous or Bearer) sends it as X-Organization-Id so
// Connect scopes anonymous endpoints (authenticate, sign-up, branding) to this org.
function orgId(): string {
	const value = process.env.CONNECT_ORG_ID;
	if (!value) throw new Error("CONNECT_ORG_ID is not set. Add it to .env.local (server-side only).");
	return value;
}

// Options shared by every customer client: the org id, plus the optional base-URL override.
function customerOptions() {
	return { organizationId: orgId(), baseUrl: process.env.CONNECT_API_URL };
}

// The customer-scoped Connect client.
//
// - getCustomerConnect() returns a client authenticated as the logged-in customer (Authorization: Bearer
//   <JWT>), or null when there's no valid session. The JWT is read from the NextAuth session token
//   (httpOnly, server-side only) and never reaches the browser.
// - getCustomerConnect({ anonymous: true }) returns an anonymous client (no token, only X-Organization-Id)
//   for the pre-sign-in endpoints — customers.authenticate and sign-up — so the org secret is never used.
//
// Not memoized: the client is request-scoped because the token is per-customer.
export async function getCustomerConnect(options?: { anonymous: true }): Promise<ReturnType<typeof createCustomerClient> | null> {
	if (options?.anonymous) return createCustomerClient(undefined, customerOptions());

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

	return createCustomerClient(accessToken, customerOptions());
}

// Loads the tenant's white-label configuration from Connect: branding from `organizations.branding`,
// storefront settings from `organizations.store`. These are anonymous (org-scoped) endpoints, so the
// config renders before sign-in through the anonymous customer client. Falls back to the neutral config
// if both fail.
//
// `raw` controls the branding image URLs: masked through /api/image by default (safe for the client), or
// the direct upstream URLs when `raw` is true — ONLY for server-side rendering that fetches the image
// itself and never hands the URL to the browser (e.g. app/icon.tsx). Never pass a raw config to a client.
async function loadConfiguration(raw = false): Promise<Configuration> {
	const client = createCustomerClient(undefined, customerOptions());

	const [branding, store] = await Promise.all([
		client.organizations.branding.get().catch(() => null),
		client.organizations.store.get().catch(() => null),
	]);

	if (!branding && !store) return FALLBACK_CONFIGURATION;

	const plainStore = store ? toPlain(store) : FALLBACK_CONFIGURATION.store;
	const plainBranding = branding ? toPlain(branding) : null;

	return {
		// storeName comes from the store (store.name); fall back to the neutral default.
		storeName: plainStore.name ?? FALLBACK_CONFIGURATION.storeName,
		branding: plainBranding ? (raw ? plainBranding : maskBrandingImages(plainBranding)) : FALLBACK_CONFIGURATION.branding,
		store: plainStore,
	};
}

// The Connect SDK uses its own HTTP client, so Next can't see the request to cache or revalidate it.
// Wrap the load in a tagged data cache instead: the config is served from cache (no Connect call, so a
// tenant's branding/store changes don't need a redeploy to render fast) until the "configuration" tag is
// revalidated — hit GET /api/revalidate to pull the latest without rebuilding. The `raw` argument is part
// of the cache key, so masked and raw configs are cached separately.
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
