"use client";
import useSWR from "swr";
import { Card } from "@/components/ui";
import type { Proxy, Plain } from "@hypelabs-llc/ts-sdk";
import { useConfiguration } from "@/contexts/configuration";
import { useTranslation } from "react-i18next";

// Hero: the page's focal point. Brand-tinted panel with the welcome copy and a soft decorative glow.
export default function Hero() {
	const { t } = useTranslation();
	const configuration = useConfiguration();
	const storeName = configuration?.storeName;
	const { data: proxies = [] } = useSWR<Plain<Proxy>[]>("/api/proxies");
	const hasProxies = proxies.length > 0;

	return (
		<Card className={"relative overflow-hidden border-line-strong p-0"}>
			<div
				className={"pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-soft blur-3xl"}
				aria-hidden={"true"}
			/>
			<div className={"relative flex flex-col gap-6 p-5 sm:p-9"}>
				{/* Centered on mobile, left-aligned from sm up. */}
				<div className={"mx-auto max-w-2xl space-y-2.5 text-center sm:mx-0 sm:text-left"}>
					<h1 className={"text-3xl font-semibold tracking-tight text-fg-strong sm:text-4xl"}>
						{t("home.welcome", { storeName })}
					</h1>
					<p className={"text-sm text-muted sm:text-base"}>
						{hasProxies
							? configuration?.store?.tagline || t("home.taglineFallback")
							: t("home.getStartedSubtitle")}
					</p>
				</div>
			</div>
		</Card>
	);
}
