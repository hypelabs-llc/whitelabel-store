// POST /api/proxies/{proxyId}/comment — update a proxy's free-form note (annotation).
//
// TODO(customer-scoped-api): customer-scoped action served with the org API key. Switch to the
// dedicated customer-scoped API once available, and verify the proxy belongs to the signed-in customer.
import { getConnect, connectRoute, ApiError } from "@/lib/connect";

export const dynamic = "force-dynamic";

export const POST = connectRoute(async (request, { params }) => {
	const { proxyId } = await params;
	if (!proxyId) throw new ApiError("proxyId is required", 400);

	const body = await request.json();
	await getConnect().proxies.byProxyId(proxyId).annotations.patch({ note: body.comment ?? "" });
	return { ok: true };
});
