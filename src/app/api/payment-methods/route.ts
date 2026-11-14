// /api/payment-methods — the payment methods the org actually accepts (derived server-side from its
// configured payment processors). Scoped to the signed-in customer, like the rest of /api.
import { getCustomerConnect, connectRoute } from "@/lib/connect";

export const dynamic = "force-dynamic";

export const GET = connectRoute(async () => {
	const client = await getCustomerConnect();
	if (!client) return [];
	return (await client.organizations.paymentProcessors.paymentMethods.get()) ?? [];
});
