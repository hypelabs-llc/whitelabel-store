import { ImageResponse } from "next/og";
import { getConfiguration } from "@/lib/connect";

// Generated favicon: the tenant's branding icon rendered with slightly rounded corners (20%). We read the
// config with raw=true so the icon's DIRECT remote URL is used (not the /api/image proxy): the image is
// fetched server-side and baked into the PNG served from /icon, so the browser only ever sees our origin —
// the vendor domain never reaches the client.
export const dynamic = "force-dynamic";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
	const { branding } = await getConfiguration(true);
	const iconUrl = branding?.iconUrl;
	const accent = branding?.accentColor ?? "#4F46E5";

	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					borderRadius: "21%",
					overflow: "hidden",
					background: accent,
				}}
			>
				{iconUrl ? (
					<img src={iconUrl} width={64} height={64} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
				) : null}
			</div>
		),
		size,
	);
}
