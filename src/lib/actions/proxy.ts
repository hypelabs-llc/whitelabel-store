"use server";

// Server Actions for proxy actions. They run on the server so the Connect SDK (and its API key) never
// reaches the browser. Results cross back to the client through toPlain() as plain-data objects.
//
// TODO(customer-scoped-api): these are customer-scoped actions served with the org API key. Switch to
// the dedicated customer-scoped API once available, and verify the proxy belongs to the signed-in customer.

import { headers } from "next/headers";
import { getConnect } from "@/lib/connect";
import { toPlain } from "@hypelabs-llc/ts-sdk";
import type { ProxyPingResponse, ProxyCredentialResponse, UpdateProxyCredentialsRequest, IpRotationLinkResponse, Plain } from "@hypelabs-llc/ts-sdk";

/** Checks that a proxy is reachable through its own credentials and measures its latency. */
export async function pingProxy(proxyId: string): Promise<Plain<ProxyPingResponse> | null> {
	if (!proxyId) throw new Error("proxyId is required");
	const result = await getConnect().proxies.byProxyId(proxyId).ping.post();
	return result ? toPlain(result) : null;
}

/** Reads a proxy's current authentication credentials (to pre-fill the change dialog). */
export async function getProxyCredentials(proxyId: string): Promise<Plain<ProxyCredentialResponse> | null> {
	if (!proxyId) throw new Error("proxyId is required");
	const result = await getConnect().proxies.byProxyId(proxyId).credentials.get();
	return result ? toPlain(result) : null;
}

/**
 * Updates a proxy's authentication credentials. Takes the SDK request as-is: a null username/password is
 * regenerated from the org defaults, and `allowedIps` restricts which IPs may connect (empty = no restriction).
 */
export async function updateProxyCredentials(proxyId: string, request: UpdateProxyCredentialsRequest): Promise<void> {
	if (!proxyId) throw new Error("proxyId is required");
	await getConnect().proxies.byProxyId(proxyId).credentials.put(request);
}

/**
 * Configures a proxy's IP rotation. The UI works in minutes; the API takes seconds (0 disables).
 * Pass minutes = null (or enabled = false upstream) to turn rotation off.
 */
export async function updateProxyIpRotation(proxyId: string, minutes: number | null): Promise<void> {
	if (!proxyId) throw new Error("proxyId is required");
	const intervalSeconds = minutes && minutes > 0 ? Math.round(minutes * 60) : 0;
	await getConnect().proxies.byProxyId(proxyId).ipRotation.put({ intervalSeconds });
}

/** Triggers an immediate IP rotation on the proxy ("rotate now"). */
export async function triggerIpRotation(proxyId: string): Promise<void> {
	if (!proxyId) throw new Error("proxyId is required");
	await getConnect().proxies.byProxyId(proxyId).ipRotation.trigger.post();
}

/** Generates (fetches) the proxy's IP rotation link, served on the org's rotation domain. */
export async function getIpRotationLink(proxyId: string): Promise<Plain<IpRotationLinkResponse> | null> {
	if (!proxyId) throw new Error("proxyId is required");
	const result = await getConnect().proxies.byProxyId(proxyId).ipRotation.link.get();
	return result ? toPlain(result) : null;
}

/** Reads the caller's public IP from the request headers (for the "add my IP" shortcut in the UI). */
export async function getClientIp(): Promise<string | null> {
	const h = await headers();
	// x-forwarded-for is a comma-separated chain; the first entry is the original client.
	const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
	return forwarded || h.get("x-real-ip") || null;
}

/** Updates a proxy's free-form note (annotation). */
export async function updateProxyComment(proxyId: string, comment: string): Promise<void> {
	if (!proxyId) throw new Error("proxyId is required");
	await getConnect().proxies.byProxyId(proxyId).annotations.patch({ note: comment ?? "" });
}
