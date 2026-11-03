// /api/catalog/isps?productId=…&locationId=… — ISPs for a product + location (disabled ones excluded by Connect).
import { getConnect, connectRoute, ApiError } from "@/lib/connect";
import { maskImageUrlsDeep } from "@/lib/imageProxy";

export const dynamic = "force-dynamic";

export const GET = connectRoute(async (request) => {
	const params = new URL(request.url).searchParams;
	const productId = params.get("productId");
	const locationId = params.get("locationId");
	if (!productId || !locationId) throw new ApiError("productId and locationId are required", 400);

	// Mask isp.logoUrl so the upstream host never reaches the client (white-label).
	return maskImageUrlsDeep((await getConnect().catalog.isps.get({ queryParameters: { productId, locationId } })) ?? []);
});
