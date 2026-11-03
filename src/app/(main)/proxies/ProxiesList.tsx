"use client";

import { useState } from "react";
import ProxyCard from "./ProxyCard";
import useSWR from "swr";
import { AlertTriangle, Download, History, Server, ShoppingCart } from "lucide-react";
import Link from "next/link";
import type { Proxy, Plain } from "@hypelabs-llc/ts-sdk";
import { exportProxiesCsv } from "@/lib/proxies";
import { Button, EmptyState, Heading } from "@/components/ui";
import ExtendProxiesDialog from "./ExtendProxiesDialog";
import ReportIncidentDialog from "./ReportIncidentDialog";
import { useTranslation } from "react-i18next";

export default function ProxiesList() {
	const { t } = useTranslation();
	// Suspense mode: the page's <Suspense> shows the fallback while loading, so `proxies` is defined here.
	const { data: proxies = [] } = useSWR<Plain<Proxy>[]>("/api/proxies");
	const [extendOpen, setExtendOpen] = useState(false);
	const [reportOpen, setReportOpen] = useState(false);
	const [reportProxyId, setReportProxyId] = useState<string>();

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
						<Button
							icon={AlertTriangle}
							variant="secondary"
							size="sm"
							onClick={() => {
								setReportProxyId(undefined);
								setReportOpen(true);
							}}
						>
							{t("proxies.reportIncident")}
						</Button>
						<Button icon={History} size="sm" onClick={() => setExtendOpen(true)}>
							{t("proxies.extendProxies")}
						</Button>
					</>
				}
			/>

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

			<ExtendProxiesDialog isOpen={extendOpen} onClose={() => setExtendOpen(false)} />
			<ReportIncidentDialog isOpen={reportOpen} proxyId={reportProxyId} onClose={() => setReportOpen(false)} />
		</section>
	);
}
