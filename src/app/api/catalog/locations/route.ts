// /api/catalog/locations?productId=… — locations for a product (disabled ones already excluded by Connect).
import { getCustomerConnect, connectRoute, ApiError } from "@/lib/connect";

export const dynamic = "force-dynamic";

export const GET = connectRoute(async (request) => {
	const productId = new URL(request.url).searchParams.get("productId");
	if (!productId) throw new ApiError("productId is required", 400);

	const client = await getCustomerConnect();
	if (!client) return [];
	return (await client.catalog.locations.get({ queryParameters: { productId } })) ?? [];
});
