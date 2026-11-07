// /api/proxies — the signed-in customer's proxies, from the customer-scoped Connect API.
// The customer JWT scopes the result to their own proxies (no org key, no manual filter).
import { getCustomerConnect, connectRoute } from "@/lib/connect";
import { maskImageUrlsDeep } from "@/lib/imageProxy";

export const dynamic = "force-dynamic";

export const GET = connectRoute(async () => {
	const client = await getCustomerConnect();
	if (!client) return [];
	// Mask proxy.isp.logoUrl so the upstream host never reaches the client (white-label).
	return maskImageUrlsDeep((await client.proxies.get()) ?? []);
});
