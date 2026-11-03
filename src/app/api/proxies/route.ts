// /api/proxies — the customer's proxies, straight from Connect.
//
// TODO(customer-scoped-api): this is customer-scoped data served with the org API key. It currently
// returns the org's proxies (no customer filter yet); switch to the dedicated customer-scoped API
// (customer authenticated directly) once available so each customer only ever sees their own proxies.
import { getConnect, connectRoute } from "@/lib/connect";
import { maskImageUrlsDeep } from "@/lib/imageProxy";

export const dynamic = "force-dynamic";

export const GET = connectRoute(async () => {
	// Mask proxy.isp.logoUrl so the upstream host never reaches the client (white-label).
	return maskImageUrlsDeep((await getConnect().proxies.get()) ?? []);
});
