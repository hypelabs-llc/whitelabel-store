"use client";
import { useState } from "react";
import { Badge, Button, EmptyState, Heading } from "@/components/ui";
import { History, Package, ShoppingCart, Sparkles, XCircle } from "lucide-react";
import useSWR from "swr";
import { format, differenceInDays, differenceInHours, differenceInMinutes, isValid } from "date-fns";
import { CopyableId } from "@/lib";
import Link from "next/link";
import type { Order, Plain } from "@hypelabs-llc/ts-sdk";
import ExtendOrderDialog from "./ExtendOrderDialog";
import CancelOrderDialog from "./CancelOrderDialog";
import { useTranslation } from "react-i18next";

// Count of delivered resources (proxies) across an order's line items.
function resourceCount(order: Plain<Order>): number {
	return (order.items ?? []).reduce((total, item) => total + (item.resourceIds?.length ?? 0), 0);
}

// Time remaining as the finest useful unit: days when >= 1 day, else hours when >= 1 hour, else minutes
// (so an order expiring in under an hour shows "45m" rather than "0h"). Clamped at zero.
function timeLeft(expiresAt: Date): { value: number; unit: "days" | "hours" | "minutes" } {
	const now = new Date();
	const days = differenceInDays(expiresAt, now);
	if (days >= 1) return { value: days, unit: "days" };
	const hours = differenceInHours(expiresAt, now);
	if (hours >= 1) return { value: hours, unit: "hours" };
	return { value: Math.max(0, differenceInMinutes(expiresAt, now)), unit: "minutes" };
}

// Safe date format: the SDK dates can be null/invalid, so render a dash rather than crash.
function formatDate(value: unknown): string {
	if (!value) return "-";
	const date = new Date(value as string);
	return isValid(date) ? format(date, "MMM dd, yyyy") : "-";
}

export default function OrdersList() {
	const { t } = useTranslation();
	// Suspense mode: the page's <Suspense> shows the fallback while loading, so `orders` is defined here.
	const { data: orders = [] } = useSWR<Plain<Order>[]>("/api/orders");
	const [extendOrderId, setExtendOrderId] = useState<string | null>(null);
	const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
	const hasOrders = orders.length > 0;

	const statusTone = (status: string): "neutral" | "success" | "warning" | "danger" => {
		switch (status) {
			case "Active":
				return "success";
			case "Pending":
				return "warning";
			case "Expired":
			case "Cancelled":
				return "danger";
			default:
				return "neutral";
		}
	};

	const expiryTone = (daysLeft: number): "success" | "warning" | "danger" =>
		daysLeft <= 3 ? "danger" : daysLeft <= 7 ? "warning" : "success";

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

	return (
		<section className={"space-y-6"}>
			<Heading icon={Package} title={t("orders.title")} subtitle={t("orders.subtitle")} />

			{hasOrders && (
				<div className={"overflow-hidden rounded-xl border border-line"}>
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
							<tbody className={"divide-y divide-line"}>
								{orders.map((order) => {
									const status = order.status ?? "Pending";
									const count = resourceCount(order);
									const daysLeft = order.expiresAt ? differenceInDays(new Date(order.expiresAt), new Date()) : null;
									const expiry = order.expiresAt ? timeLeft(new Date(order.expiresAt)) : null;

									return (
										<tr key={order.id} className={"transition-colors hover:bg-surface-muted/40"}>
											<td className={"px-5 py-3 text-fg-strong"}>
												<div className={"flex items-center gap-3"}>
													<span className={"flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand"}>
														<Package size={16} />
													</span>
													<CopyableId id={order.id ?? ""} />
													{order.isTrial && (
														<Badge tone={"brand"} icon={Sparkles}>
															{t("orders.trial")}
														</Badge>
													)}
												</div>
											</td>
											<td className={"px-5 py-3 text-fg"}>{count > 0 ? count : "-"}</td>
											<td className={"px-5 py-3 text-fg"}>{formatDate(order.expiresAt)}</td>
											<td className={"px-5 py-3"}>
												<div className={"inline-flex items-center gap-2"}>
													<Badge tone={statusTone(status)}>{status}</Badge>
													{expiry !== null && daysLeft !== null && status === "Active" && (
														<Badge tone={expiryTone(daysLeft)}>
															{t(`orders.${expiry.unit}`, { count: expiry.value })}
														</Badge>
													)}
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
								})}
							</tbody>
						</table>
					</div>
				</div>
			)}

			<ExtendOrderDialog orderId={extendOrderId} isOpen={!!extendOrderId} onClose={() => setExtendOrderId(null)} />
			<CancelOrderDialog orderId={cancelOrderId} isOpen={!!cancelOrderId} onClose={() => setCancelOrderId(null)} />
		</section>
	);
}
