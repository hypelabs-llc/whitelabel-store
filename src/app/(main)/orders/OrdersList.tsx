"use client";
import { useState } from "react";
import { Badge, Button, EmptyState, Heading } from "@/components/ui";
import { AlertTriangle, History, Package, RefreshCw, ShoppingCart, Timer, XCircle } from "lucide-react";
import useSWR from "swr";
import { CopyableId, formatDate, orderBadge, resourceCount, statusTone } from "@/lib";
import Link from "next/link";
import type { Order, Plain } from "@hypelabs-llc/ts-sdk";
import ExtendOrderDialog from "./ExtendOrderDialog";
import CancelOrderDialog from "./CancelOrderDialog";
import { useTranslation } from "react-i18next";

export default function OrdersList() {
	const { t } = useTranslation();
	// Suspense mode: the page's <Suspense> shows the fallback while loading, so `orders` is defined here.
	const { data: orders = [] } = useSWR<Plain<Order>[]>("/api/orders");
	const [extendOrderId, setExtendOrderId] = useState<string | null>(null);
	const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
	const hasOrders = orders.length > 0;

	// Split into live orders (still holding their proxies: Active or in grace) and inactive ones (Expired,
	// Cancelled, Deleted). Within each group, most recent first — ordered by expiry since the SDK exposes no
	// creation date, so a later-expiring order is the more recent purchase. Sort a copy; SWR's array is shared.
	const byExpiryDesc = (a: Plain<Order>, b: Plain<Order>) =>
		new Date(b.expiresAt ?? 0).getTime() - new Date(a.expiresAt ?? 0).getTime();
	const activeOrders = orders.filter((order) => order.isInactive !== true).sort(byExpiryDesc);
	const inactiveOrders = orders.filter((order) => order.isInactive === true).sort(byExpiryDesc);

	// Empty state: show it alone (no page header), like the Proxies page.
	if (!hasOrders) {
		return (
			<EmptyState icon={Package} title={t("orders.empty")} message={t("orders.emptyHint")}>
				<Link href={"/orders/create"}>
					<Button icon={ShoppingCart} size="lg">
						{t("orders.orderNow")}
					</Button>
				</Link>
			</EmptyState>
		);
	}

	const renderRow = (order: Plain<Order>) => {
		const status = order.status ?? "Pending";
		const count = resourceCount(order);
		// Same lifecycle badge the proxy cards show, from the shared lib helper.
		const badge = orderBadge(order);

		return (
			<tr key={order.id} className={"transition-colors hover:bg-surface-muted/40"}>
				<td className={"px-5 py-3 text-fg-strong"}>
					<div className={"flex items-center gap-3"}>
						<span className={"flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand"}>
							<Package size={16} />
						</span>
						<span className={"inline-flex items-center gap-1.5 font-mono text-sm text-fg-strong"}>
							<span>{order.isTrial ? t("orders.trial") : t("orders.order")}</span>
							<CopyableId id={order.id ?? ""} />
						</span>
					</div>
				</td>
				<td className={"px-5 py-3 text-fg"}>{count > 0 ? count : "-"}</td>
				<td className={"px-5 py-3 text-fg"}>{formatDate(order.expiresAt)}</td>
				<td className={"px-5 py-3"}>
					<div className={"inline-flex items-center gap-2"}>
						<Badge tone={statusTone(status)}>{status}</Badge>
						{badge?.kind === "auto-renew" ? (
							<Badge tone={"brand"} icon={RefreshCw}>
								{t("proxies.autoRenew")}
							</Badge>
						) : badge?.kind === "grace" ? (
							<Badge tone={"danger"} icon={AlertTriangle}>
								{t("proxies.gracePeriod")}
							</Badge>
						) : badge?.kind === "time-left" && status === "Active" ? (
							<Badge tone={badge.tone} icon={Timer}>
								{t(`orders.${badge.unit}`, { count: badge.value })}
							</Badge>
						) : null}
					</div>
				</td>
				<td className={"px-5 py-3"}>
					{order.isTrial ? (
						// A trial has no extend/cancel actions — show an em dash instead.
						<div className={"text-right text-muted"}>—</div>
					) : (
						<div className={"flex flex-wrap items-center justify-end gap-2"}>
							{status === "Active" && (
								<Button variant={"secondary"} icon={History} size={"xs"} onClick={() => setExtendOrderId(order.id ?? null)}>
									{t("orders.extend")}
								</Button>
							)}
							{(status === "Active" || status === "Pending") && (
								<Button variant={"secondary"} icon={XCircle} size={"xs"} onClick={() => setCancelOrderId(order.id ?? null)}>
									{t("orders.cancel")}
								</Button>
							)}
						</div>
					)}
				</td>
			</tr>
		);
	};

	const renderTable = (title: string, rows: Plain<Order>[]) => (
		<div className={"space-y-3"}>
			<h2 className={"text-sm font-medium text-fg-strong"}>{title}</h2>
			<div className={"overflow-hidden rounded-xl border border-line bg-surface"}>
				<div className={"overflow-x-auto"}>
					<table className={"w-full border-collapse text-sm"}>
						<thead>
							<tr className={"border-b border-line bg-surface-muted text-left text-xs font-medium uppercase tracking-wider text-muted"}>
								<th className={"px-5 py-2.5 font-medium"}>{t("orders.purchase")}</th>
								<th className={"px-5 py-2.5 font-medium"}>{t("orders.proxies")}</th>
								<th className={"px-5 py-2.5 font-medium"}>{t("orders.expires")}</th>
								<th className={"px-5 py-2.5 font-medium"}>{t("orders.status")}</th>
								<th className={"px-5 py-2.5 text-right font-medium"}>{t("orders.actions")}</th>
							</tr>
						</thead>
						<tbody className={"divide-y divide-line"}>{rows.map(renderRow)}</tbody>
					</table>
				</div>
			</div>
		</div>
	);

	return (
		<section className={"space-y-8"}>
			<Heading icon={Package} title={t("orders.title")} subtitle={t("orders.subtitle")} />

			{activeOrders.length > 0 && renderTable(t("orders.activeOrders"), activeOrders)}
			{inactiveOrders.length > 0 && renderTable(t("orders.inactiveOrders"), inactiveOrders)}

			<ExtendOrderDialog orderId={extendOrderId} isOpen={!!extendOrderId} onClose={() => setExtendOrderId(null)} />
			<CancelOrderDialog orderId={cancelOrderId} isOpen={!!cancelOrderId} onClose={() => setCancelOrderId(null)} />
		</section>
	);
}
