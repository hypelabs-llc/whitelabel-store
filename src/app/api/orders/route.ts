// /api/orders — the signed-in customer's orders (trials included), from Connect.
//
// TODO(customer-scoped-api): this is customer-scoped data served with the org API key + a customerId
// filter. Switch to the dedicated customer-scoped API (customer authenticated directly) once available,
// so the store never queries with org credentials on the customer's behalf.
import { getConnect, connectRoute } from "@/lib/connect";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export const GET = connectRoute(async () => {
	const session = await auth();
	const customerId = session?.user?.id;
	if (!customerId) return [];

	return (await getConnect().orders.get({ queryParameters: { customerId } })) ?? [];
});
