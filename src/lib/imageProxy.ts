import "server-only";
import crypto from "node:crypto";

// White-label image masking. Connect returns absolute image URLs (ISP logos, branding, avatars) that
// carry the upstream vendor's domain. We never hand those to the browser: the client would see the real
// host in the DOM / network tab, breaking the white label. Instead the server rewrites every image URL to
// an opaque, signed token on OUR origin (/api/image?t=…). The token is HMAC-signed with AUTH_SECRET so it
// can't be forged (no open proxy / SSRF via arbitrary urls) and the original URL never leaks client-side.

function secret(): string {
	const value = process.env.AUTH_SECRET;
	if (!value) throw new Error("AUTH_SECRET is not set; required to sign proxied image URLs.");
	return value;
}

function sign(payload: string): string {
	return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

// Encodes `<base64url(url)>.<signature>`. The signature covers the encoded url, so tampering is rejected.
function encodeToken(url: string): string {
	const encoded = Buffer.from(url, "utf8").toString("base64url");
	return `${encoded}.${sign(encoded)}`;
}

// Verifies the signature (constant-time) and returns the original URL, or null if the token is invalid.
export function decodeToken(token: string): string | null {
	const dot = token.lastIndexOf(".");
	if (dot <= 0) return null;
	const encoded = token.slice(0, dot);
	const signature = token.slice(dot + 1);

	const expected = sign(encoded);
	const a = Buffer.from(signature);
	const b = Buffer.from(expected);
	if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

	try {
		return Buffer.from(encoded, "base64url").toString("utf8");
	} catch {
		return null;
	}
}

/**
 * Rewrites an image URL for the browser. Absolute http(s) URLs become an opaque `/api/image?t=…` token;
 * relative paths and empty values pass through unchanged (nothing to hide). Call this on the server for
 * every image URL that comes from Connect before it reaches a client component.
 */
export function maskImageUrl(url?: string | null): string | null | undefined {
	if (!url) return url;
	if (!/^https?:\/\//i.test(url)) return url; // local/relative path — not an upstream host.
	return `/api/image?t=${encodeToken(url)}`;
}

// Object keys that hold an image URL anywhere in a Connect payload (branding, ISPs, avatars, …).
const IMAGE_URL_KEYS = new Set(["logo", "logoUrl", "logoLightUrl", "logoDarkUrl", "iconUrl", "avatarUrl", "imageUrl"]);

/**
 * Deep-masks every known image-URL field in a Connect response (arrays and nested objects included), so a
 * route can hand the result straight to the client without any upstream host leaking. Returns a new value;
 * the input is not mutated. Use this in /api/* handlers that return models carrying logos/avatars.
 */
export function maskImageUrlsDeep<T>(value: T): T {
	if (Array.isArray(value)) return value.map((item) => maskImageUrlsDeep(item)) as T;
	if (value && typeof value === "object") {
		const out: Record<string, unknown> = {};
		for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
			out[key] = IMAGE_URL_KEYS.has(key) && typeof val === "string" ? maskImageUrl(val) : maskImageUrlsDeep(val);
		}
		return out as T;
	}
	return value;
}
