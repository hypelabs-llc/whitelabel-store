// /api/catalog/locations?productId=… — locations for a product (disabled ones already excluded by Connect).
import { getConnect, connectRoute, ApiError } from "@/lib/connect";

export const dynamic = "force-dynamic";

export const GET = connectRoute(async (request) => {
	const productId = new URL(request.url).searchParams.get("productId");
	if (!productId) throw new ApiError("productId is required", 400);

	return (await getConnect().catalog.locations.get({ queryParameters: { productId } })) ?? [];
});
