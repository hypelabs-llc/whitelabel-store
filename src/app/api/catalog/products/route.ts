// /api/catalog/products — sellable products (disabled ones are already excluded by Connect).
import { getCustomerConnect, connectRoute } from "@/lib/connect";

export const dynamic = "force-dynamic";

export const GET = connectRoute(async () => {
	const client = await getCustomerConnect();
	if (!client) return [];
	return (await client.catalog.products.get()) ?? [];
});
