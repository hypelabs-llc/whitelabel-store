// /api/image?t=… — server-side image proxy for white-labeling. Logos (ISP, branding) and avatars come
// from Connect as absolute URLs on the upstream vendor's domain. Rendering them directly would expose that
// domain in the client's DOM/network tab (breaking the white label) and leak the client's IP/referer to it.
//
// The client only ever gets an opaque, signed token (see lib/imageProxy.ts: maskImageUrl). Here we verify
// the signature, recover the original URL, and re-stream the bytes from our origin. Because the URL is
// signed with AUTH_SECRET, the client can't point this at an arbitrary host (no open proxy / SSRF).
import { NextResponse } from "next/server";
import { decodeToken } from "@/lib/imageProxy";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB — logos/avatars are small; cap to avoid abuse.

export async function GET(request: Request) {
	const token = new URL(request.url).searchParams.get("t");
	if (!token) return NextResponse.json({ error: "t is required" }, { status: 400 });

	// Only URLs we signed ourselves decode successfully, so the target host is implicitly trusted.
	const target = decodeToken(token);
	if (!target) return NextResponse.json({ error: "invalid token" }, { status: 403 });

	let parsed: URL;
	try {
		parsed = new URL(target);
	} catch {
		return NextResponse.json({ error: "invalid url" }, { status: 400 });
	}
	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
		return NextResponse.json({ error: "unsupported protocol" }, { status: 400 });
	}

	let upstream: Response;
	try {
		upstream = await fetch(parsed.toString(), {
			redirect: "follow",
			signal: AbortSignal.timeout(10_000),
			headers: { accept: "image/*" },
		});
	} catch {
		return NextResponse.json({ error: "upstream fetch failed" }, { status: 502 });
	}

	if (!upstream.ok || !upstream.body) {
		return NextResponse.json({ error: "upstream error" }, { status: 502 });
	}

	const contentType = upstream.headers.get("content-type") ?? "";
	if (!contentType.startsWith("image/")) {
		return NextResponse.json({ error: "not an image" }, { status: 415 });
	}

	const length = Number(upstream.headers.get("content-length") ?? "");
	if (Number.isFinite(length) && length > MAX_BYTES) {
		return NextResponse.json({ error: "image too large" }, { status: 413 });
	}

	return new NextResponse(upstream.body, {
		status: 200,
		headers: {
			"content-type": contentType,
			// Cache at the edge/browser: these logos change rarely. Served from our origin, so no leak.
			"cache-control": "public, max-age=86400, s-maxage=86400, immutable",
		},
	});
}
