// /api/catalog/capabilities?locationId=…&ispId=… — capabilities for a location + ISP (disabled ones excluded by Connect).
import { getCustomerConnect, connectRoute, ApiError } from "@/lib/connect";

export const dynamic = "force-dynamic";

export const GET = connectRoute(async (request) => {
	const params = new URL(request.url).searchParams;
	const locationId = params.get("locationId");
	const ispId = params.get("ispId");
	if (!locationId || !ispId) throw new ApiError("locationId and ispId are required", 400);

	const client = await getCustomerConnect();
	if (!client) return [];
	return (await client.catalog.capabilities.get({ queryParameters: { locationId, ispId } })) ?? [];
});
