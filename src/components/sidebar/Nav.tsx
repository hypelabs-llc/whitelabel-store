"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { BookOpen, LayoutDashboard, LifeBuoy, Package, Server, Star, type LucideIcon } from "lucide-react";
import clsx from "clsx";
import { useConfiguration } from "@/contexts/configuration";
import { isActive } from "@/lib";

type NavItem = {
	/** i18n key for the label. */
	key: string;
	href: string;
	icon: LucideIcon;
	/** Config flag that must be true for the item to show (optional). */
	requires?: "showReviewsTab" | "showDocumentationTab";
};

type NavGroup = { titleKey?: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
	{
		items: [{ key: "nav.overview", href: "/", icon: LayoutDashboard }],
	},
	{
		titleKey: "nav.sectionManage",
		items: [
			{ key: "nav.proxies", href: "/proxies", icon: Server },
			{ key: "header.myOrders", href: "/orders", icon: Package },
		],
	},
	{
		titleKey: "nav.sectionResources",
		items: [
			{ key: "nav.documentation", href: "/documentation", icon: BookOpen, requires: "showDocumentationTab" },
			{ key: "nav.reviews", href: "/reviews", icon: Star, requires: "showReviewsTab" },
			{ key: "nav.support", href: "/support", icon: LifeBuoy },
		],
	},
];

export default function Nav({ onNavigate }: { onNavigate?: () => void }) {
	const { t } = useTranslation();
	const pathname = usePathname();
	const configuration = useConfiguration();

	const visibleGroups = GROUPS.map((group) => ({
		...group,
		items: group.items.filter((item) => (item.requires ? configuration?.store?.[item.requires] === true : true)),
	})).filter((group) => group.items.length > 0);

	return (
		<nav className="flex flex-col gap-6">
			{visibleGroups.map((group, index) => (
				<div key={index} className="flex flex-col gap-1">
					{group.titleKey ? (
						<div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
							{t(group.titleKey)}
						</div>
					) : null}
					{group.items.map((item) => {
						const active = isActive(item.href, pathname);
						const Icon = item.icon;
						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={onNavigate}
								aria-current={active ? "page" : undefined}
								className={clsx(
									"group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
									"outline-none",
									active
										? "bg-brand-soft font-medium text-fg-strong"
										: "text-fg hover:bg-surface-muted",
								)}
							>
								<Icon
									size={17}
									aria-hidden="true"
									className={clsx("shrink-0", active ? "text-brand" : "text-muted group-hover:text-fg")}
								/>
								<span className="truncate">{t(item.key)}</span>
							</Link>
						);
					})}
				</div>
			))}
		</nav>
	);
}
