"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useConfiguration } from "@/contexts/configuration";

/**
 * Card near the bottom of the sidebar. Shows the store announcement (topBannerMessage) and links to
 * the order flow. No icon, no boilerplate title — just the message.
 */
export default function OrderCta() {
	const { t } = useTranslation();
	const configuration = useConfiguration();
	const message = configuration?.store?.topBannerMessage;

	if (!message) return null;

	return (
		<Link
			href="/orders/create"
			className="group flex flex-col gap-2 rounded-lg border border-line bg-brand-soft p-3 transition-colors hover:border-brand"
		>
			<span className="text-sm leading-snug text-fg">{message}</span>
			<span className="inline-flex items-center gap-1 text-xs font-medium text-brand">
				{t("header.orderNow")}
				<ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
			</span>
		</Link>
	);
}
