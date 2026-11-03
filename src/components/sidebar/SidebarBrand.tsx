"use client";

import Link from "next/link";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { useConfiguration } from "@/contexts/configuration";
import { useMounted } from "@/lib/useMounted";
import { resolveUrl } from "@/lib";

/**
 * Tenant logo. Falls back to the store name when no logo is configured. `className` styles the link
 * wrapper and `imgClassName` overrides the logo size (default `h-8`) so it can be reused smaller, e.g.
 * in the mobile top bar.
 */
export default function SidebarBrand({ className, imgClassName }: { className?: string; imgClassName?: string }) {
	const configuration = useConfiguration();
	const { resolvedTheme } = useTheme();
	// Gate theme-dependent src on mount so SSR and first client render match (next-themes).
	const mounted = useMounted();

	const logoUrl = resolveUrl(configuration?.branding?.logoLightUrl);
	const logoDarkUrl = resolveUrl(configuration?.branding?.logoDarkUrl) ?? logoUrl;
	const storeName = configuration?.storeName;

	return (
		<Link href="/" className={clsx("flex items-center gap-2 px-2", className)} aria-label={storeName ?? "Home"}>
			{logoUrl ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img alt={storeName ?? "Logo"} src={mounted && resolvedTheme === "dark" ? logoDarkUrl : logoUrl} className={clsx("w-auto max-w-full object-contain", imgClassName ?? "h-8 max-w-[90%]")} />
			) : (
				<span className="text-lg font-bold text-fg-strong">{storeName}</span>
			)}
		</Link>
	);
}
