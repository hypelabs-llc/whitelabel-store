// /api/catalog/products — sellable products (disabled ones are already excluded by Connect).
import { getConnect, connectRoute } from "@/lib/connect";

export const dynamic = "force-dynamic";

export const GET = connectRoute(async () => {
	return (await getConnect().catalog.products.get()) ?? [];
});
