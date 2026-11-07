import { getCustomerConnect, connectRoute } from "@/lib/connect";

export const dynamic = "force-dynamic";

export const GET = connectRoute(async () => {
	const client = await getCustomerConnect();
	if (!client) return [];
	return (await client.reviews.get()) ?? [];
});
