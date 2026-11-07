// /api/orders — the signed-in customer's orders (trials included), from the customer-scoped Connect API.
// The customer JWT scopes the result; no org key and no manual customerId filter.
import { getCustomerConnect, connectRoute } from "@/lib/connect";

export const dynamic = "force-dynamic";

export const GET = connectRoute(async () => {
	const client = await getCustomerConnect();
	if (!client) return [];
	return (await client.orders.get()) ?? [];
});
