"use client";
import { useState } from "react";
import { Badge, Button, Card, EmptyState, Heading } from "@/components/ui";
import { Package, ShoppingCart, Sparkles, Split } from "lucide-react";
import useSWR, { mutate } from "swr";
import { format, differenceInDays, differenceInHours, isValid } from "date-fns";
import { CopyableId } from "@/lib";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import type { Order, Plain } from "@hypelabs-llc/ts-sdk";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useTranslation } from "react-i18next";

// Count of delivered resources (proxies) across an order's line items.
function resourceCount(order: Plain<Order>): number {
	return (order.items ?? []).reduce((total, item) => total + (item.resourceIds?.length ?? 0), 0);
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
	const [splitOrderId, setSplitOrderId] = useState<string | null>(null);
	const splitOrder = orders.find((order) => order.id === splitOrderId);
	const hasOrders = orders.length > 0;

	const handleSplit = async () => {
		if (!splitOrderId) return;
		await axios
			.post(`/api/orders/${splitOrderId}/split`)
			.then(() => {
				toast.success(t("orders.splitSuccess"));
				mutate("/api/orders");
			})
			.catch(() => toast.error(t("orders.splitFail")));
	};

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
		<section className={"flex flex-1 flex-col"}>
			<Heading icon={Package} title={t("orders.title")} subtitle={t("orders.subtitle")} />

			{hasOrders && (
				<Card className={"overflow-hidden p-0"}>
					<div className={"overflow-x-auto"}>
						<table className={"w-full border-collapse text-sm"}>
							<thead>
								<tr className={"border-b border-line text-left text-xs font-medium uppercase tracking-wide text-muted"}>
									<th className={"px-5 py-3 font-medium"}>{t("orders.purchase")}</th>
									<th className={"px-5 py-3 font-medium"}>{t("orders.proxies")}</th>
									<th className={"px-5 py-3 font-medium"}>{t("orders.expires")}</th>
									<th className={"px-5 py-3 font-medium"}>{t("orders.status")}</th>
									<th className={"px-5 py-3 text-right font-medium"}>{t("orders.actions")}</th>
								</tr>
							</thead>
							<tbody>
								{orders.map((order) => {
									const status = order.status ?? "Pending";
									const count = resourceCount(order);
									const daysLeft = order.expiresAt ? differenceInDays(new Date(order.expiresAt), new Date()) : null;
									const hoursLeft =
										order.expiresAt && daysLeft === 0
											? Math.max(0, differenceInHours(new Date(order.expiresAt), new Date()))
											: null;

									return (
										<tr key={order.id} className={"border-b border-line last:border-0 transition-colors hover:bg-surface-muted"}>
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
													{daysLeft !== null && status === "Active" && (
														<Badge tone={expiryTone(daysLeft)}>
															{daysLeft >= 1 ? t("orders.days", { count: daysLeft }) : t("orders.hours", { count: hoursLeft ?? 0 })}
														</Badge>
													)}
												</div>
											</td>
											<td className={"px-5 py-3 text-right"}>
												{status === "Active" && count > 1 && (
													<Button variant={"secondary"} icon={Split} size={"xs"} onClick={() => setSplitOrderId(order.id ?? null)}>
														{t("orders.split")}
													</Button>
												)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</Card>
			)}

			<ConfirmDialog
				isOpen={!!splitOrderId}
				title={t("orders.splitTitle")}
				message={t("orders.splitMessage", { count: splitOrder ? resourceCount(splitOrder) : 0 })}
				confirmLabel={t("orders.split")}
				confirmIcon={Split}
				onConfirm={handleSplit}
				onClose={() => setSplitOrderId(null)}
			/>
		</section>
	);
}
