import type { MetadataRoute } from "next";
import { getConfiguration } from "@/lib/connect";

// Per-tenant PWA manifest, built from the store config like generateMetadata in layout.tsx: name and
// description from the storefront, theme color + icon from branding (iconUrl is already masked through
// our /api/image proxy by getConfiguration, so the upstream vendor domain never leaks).
export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
	const { storeName, store, branding } = await getConfiguration();
	const name = storeName ?? "Store";
	const themeColor = branding?.accentColor ?? "#4F46E5";

	return {
		name,
		short_name: name,
		description: store?.tagline ?? undefined,
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: themeColor,
		icons: branding?.iconUrl
			? [{ src: branding.iconUrl, sizes: "any", type: "image/png" }]
			: [],
	};
}
