"use client";

import { useEffect, useState } from "react";
import ProxyCard from "./ProxyCard";
import ProxyRow from "./ProxyRow";
import useSWR from "swr";
import { Download, History, LayoutGrid, List, Server, ShoppingCart } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import type { Proxy, Plain } from "@hypelabs-llc/ts-sdk";
import { exportProxiesCsv } from "@/lib/proxies";
import { Button, EmptyState, Heading } from "@/components/ui";
import ExtendProxiesDialog from "./ExtendProxiesDialog";
import ReportIncidentDialog from "./ReportIncidentDialog";
import { useTranslation } from "react-i18next";

type ViewMode = "grid" | "list";
const VIEW_STORAGE_KEY = "proxies-view";

export default function ProxiesList() {
	const { t } = useTranslation();
	// Suspense mode: the page's <Suspense> shows the fallback while loading, so `proxies` is defined here.
	const { data: proxies = [] } = useSWR<Plain<Proxy>[]>("/api/proxies");
	const [extendOpen, setExtendOpen] = useState(false);
	const [reportOpen, setReportOpen] = useState(false);
	const [reportProxyId, setReportProxyId] = useState<string>();

	// Start on "grid" so server and first client render agree (no hydration mismatch), then restore the
	// persisted choice after mount. Every change is written back to localStorage.
	const [view, setView] = useState<ViewMode>("grid");
	useEffect(() => {
		try {
			const saved = localStorage.getItem(VIEW_STORAGE_KEY);
			if (saved === "grid" || saved === "list") setView(saved);
		} catch {
			// localStorage can be unavailable (private mode, blocked cookies); default view is fine.
		}
	}, []);
	const changeView = (next: ViewMode) => {
		setView(next);
		try {
			localStorage.setItem(VIEW_STORAGE_KEY, next);
		} catch {
			// Ignore write failures; the in-memory state still updates.
		}
	};

	if (proxies.length === 0) {
		return (
			<EmptyState icon={Server} title={t("proxies.noProxies")} message={t("proxies.emptyHint")}>
				<Link href="/orders/create">
					<Button icon={ShoppingCart} size="lg">
						{t("header.orderNow")}
					</Button>
				</Link>
			</EmptyState>
		);
	}

	return (
		<section className="space-y-6">
			<Heading
				icon={Server}
				title={t("proxies.title")}
				subtitle={t("proxies.subtitle")}
				actions={
					<>
						<Button icon={Download} variant="secondary" size="sm" onClick={() => exportProxiesCsv(proxies)}>
							{t("proxies.exportCsv")}
						</Button>
						<Button icon={History} size="sm" onClick={() => setExtendOpen(true)}>
							{t("proxies.extendProxies")}
						</Button>

						{/* Vertical divider, then the grid/list view switch. */}
						<span className="mx-1 h-6 w-px self-center bg-line" aria-hidden="true" />
						<div className="inline-flex items-center rounded-lg border border-line bg-surface p-0.5">
							<button
								type="button"
								onClick={() => changeView("grid")}
								aria-pressed={view === "grid"}
								aria-label={t("proxies.viewGrid")}
								className={clsx(
									"flex size-8 items-center justify-center rounded-md transition-colors",
									view === "grid" ? "bg-surface-muted text-fg-strong" : "text-muted hover:text-fg",
								)}
							>
								<LayoutGrid className="size-4" />
							</button>
							<button
								type="button"
								onClick={() => changeView("list")}
								aria-pressed={view === "list"}
								aria-label={t("proxies.viewList")}
								className={clsx(
									"flex size-8 items-center justify-center rounded-md transition-colors",
									view === "list" ? "bg-surface-muted text-fg-strong" : "text-muted hover:text-fg",
								)}
							>
								<List className="size-4" />
							</button>
						</div>
					</>
				}
			/>

			{/* List mode shows a table on sm+, but falls back to the card grid on narrow screens (the row
			    layout can't fit); grid mode is always the card grid. */}
			{view === "list" ? (
				<>
					<div className="hidden overflow-hidden rounded-xl border border-line sm:block">
						<table className="w-full border-collapse text-sm">
							<thead>
								<tr className="border-b border-line bg-surface-muted text-left text-xs font-medium uppercase tracking-wider text-muted">
									<th className="px-4 py-2.5 font-medium">{t("proxies.colProxy")}</th>
									<th className="px-4 py-2.5 font-medium">{t("proxies.colPing")}</th>
									<th className="px-4 py-2.5 font-medium">{t("proxies.colEndpoint")}</th>
									<th className="px-4 py-2.5 font-medium">{t("proxies.colAuth")}</th>
									<th className="px-4 py-2.5 font-medium">{t("proxies.colRotation")}</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-line">
								{proxies.map((proxy) => (
									<ProxyRow
										key={proxy.id}
										proxy={proxy}
										onReportIncident={(proxyId) => {
											setReportProxyId(proxyId);
											setReportOpen(true);
										}}
									/>
								))}
							</tbody>
						</table>
					</div>
					<div className="grid grid-cols-1 gap-4 sm:hidden">
						{proxies.map((proxy) => (
							<ProxyCard
								key={proxy.id}
								proxy={proxy}
								onReportIncident={(proxyId) => {
									setReportProxyId(proxyId);
									setReportOpen(true);
								}}
							/>
						))}
					</div>
				</>
			) : (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{proxies.map((proxy) => (
						<ProxyCard
							key={proxy.id}
							proxy={proxy}
							onReportIncident={(proxyId) => {
								setReportProxyId(proxyId);
								setReportOpen(true);
							}}
						/>
					))}
				</div>
			)}

			<ExtendProxiesDialog isOpen={extendOpen} onClose={() => setExtendOpen(false)} />
			<ReportIncidentDialog isOpen={reportOpen} proxyId={reportProxyId} onClose={() => setReportOpen(false)} />
		</section>
	);
}
