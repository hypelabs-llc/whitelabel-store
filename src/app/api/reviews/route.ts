import { getConnect, connectRoute } from "@/lib/connect";

export const dynamic = "force-dynamic";

export const GET = connectRoute(async () => {
	return (await getConnect().reviews.get()) ?? [];
});