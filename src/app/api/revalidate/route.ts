// GET /api/revalidate — drops the cached tenant configuration (branding + store settings) so the next
// request re-reads it from Connect. Lets a branding/store change show up without a redeploy: just open
// this URL. It only clears a cache (reveals nothing, changes no data), so it's intentionally unguarded.
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
	// Next 16 requires a cacheLife profile; "max" expires the tag as aggressively as possible.
	revalidateTag("configuration", "max");
	return NextResponse.json({ revalidated: true, tag: "configuration", now: new Date().toISOString() });
}
