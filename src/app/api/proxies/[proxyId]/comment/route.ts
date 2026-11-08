// POST /api/proxies/{proxyId}/comment — update a proxy's free-form note (annotation).
// The customer-scoped client scopes this to the signed-in customer's own proxies via the JWT.
import { getCustomerConnect, connectRoute, ApiError } from "@/lib/connect";

export const dynamic = "force-dynamic";

export const POST = connectRoute(async (request, { params }) => {
	const { proxyId } = await params;
	if (!proxyId) throw new ApiError("proxyId is required", 400);

	const client = await getCustomerConnect();
	if (!client) throw new ApiError("You must be signed in.", 401);

	const body = await request.json();
	await client.proxies.byProxyId(proxyId).annotations.patch({ note: body.comment ?? "" });
	return { ok: true };
});
