"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, Menu, Monitor, Moon, ShoppingCart, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui";
import LanguageSwitcher from "@/components/shell/LanguageSwitcher";
import SidebarBrand from "@/components/sidebar/SidebarBrand";
import ReportIncidentDialog from "@/app/(main)/proxies/ReportIncidentDialog";
import { useMounted } from "@/lib/useMounted";
import { useConfiguration } from "@/contexts/configuration";

/**
 * Slim top bar for the vertical shell. Left: mobile menu button (opens the nav drawer). Right:
 * language, theme toggle, and the primary "order" call to action. The nav itself lives in the
 * sidebar, so this bar stays uncluttered.
 */
export default function TopBar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
	const { t } = useTranslation();
	const { theme, setTheme } = useTheme();
	const mounted = useMounted();
	const configuration = useConfiguration();
	const bannerMessage = configuration?.store?.tagline;
	const [reportOpen, setReportOpen] = useState(false);

	const cycleTheme = () => setTheme(theme === "dark" ? "light" : theme === "light" ? "system" : "dark");
	const themeIcon = !mounted ? <Monitor className="size-5" /> : theme === "dark" ? <Sun className="size-5" /> : theme === "light" ? <Moon className="size-5" /> : <Monitor className="size-5" />;

	return (
		<header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-surface px-4 sm:px-6">
			<button
				type="button"
				onClick={onOpenMobileNav}
				aria-label={t("header.openMainMenu")}
				className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-fg transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 md:hidden"
			>
				<Menu className="size-5" />
			</button>

			{/* Logo in the mobile bar only (the sidebar carries it from md up); smaller here. */}
			<div className="md:hidden">
				<SidebarBrand imgClassName="h-5" />
			</div>

			{bannerMessage ? (
				<p className="hidden min-w-0 flex-1 truncate text-xs text-muted sm:block">{bannerMessage}</p>
			) : null}

			<div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-3">
				<div className="hidden sm:block">
					<LanguageSwitcher />
				</div>
				<button
					type="button"
					onClick={cycleTheme}
					aria-label="Toggle theme"
					className="hidden items-center justify-center rounded-full p-1.5 text-muted hover:text-fg sm:flex"
				>
					{themeIcon}
				</button>
				<Button
					type="button"
					icon={AlertTriangle}
					variant="secondary"
					size="sm"
					aria-label={t("proxies.reportIncident")}
					className="max-lg:w-9 max-lg:gap-0 max-lg:px-0"
					onClick={() => setReportOpen(true)}
				>
					<span className="hidden lg:inline">{t("proxies.reportIncident")}</span>
				</Button>
				<Link href="/orders/create">
					<Button
						type="button"
						icon={ShoppingCart}
						size="sm"
						aria-label={t("header.orderNow")}
						className="max-sm:w-9 max-sm:gap-0 max-sm:px-0"
					>
						<span className="hidden sm:inline">{t("header.orderNow")}</span>
					</Button>
				</Link>
			</div>

			<ReportIncidentDialog isOpen={reportOpen} onClose={() => setReportOpen(false)} />
		</header>
	);
}
