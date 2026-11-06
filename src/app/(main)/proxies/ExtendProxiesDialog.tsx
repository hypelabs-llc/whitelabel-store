"use client";

import { type SubmitEvent, useEffect, useState } from "react";
import { Badge, Button, Card, Modal } from "@/components/ui";
import { History } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";
import { ispIconUrl, shortId, timeLeft } from "@/lib";
import { BILLING_CYCLES, BILLING_ICONS } from "@/constants";
import { OptionChip } from "../orders/create/OptionChip";
import { extendOrder } from "@/lib/actions/order";
import { BillingCyclesObject, PaymentMethodsObject } from "@hypelabs-llc/ts-sdk";
import type { BillingCycles, PaymentMethods, Order, Proxy, Plain } from "@hypelabs-llc/ts-sdk";
import useSWR from "swr";
import { useTranslation } from "react-i18next";

// Same single payment method the order builder and the per-order extend use.
const PAYMENT_METHODS: PaymentMethods[] = [PaymentMethodsObject.Cryptocurrency];

export default function ExtendProxiesDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
	const { t } = useTranslation();
	const { data: orders } = useSWR<Plain<Order>[]>("/api/orders", { suspense: false });
	const { data: proxies } = useSWR<Plain<Proxy>[]>("/api/proxies", { suspense: false });
	const [selectedOrderId, setSelectedOrderId] = useState<string>();
	const [billingCycle, setBillingCycle] = useState<BillingCycles>(BillingCyclesObject.Monthly);
	const [paymentMethod] = useState<PaymentMethods>(PAYMENT_METHODS[0]);
	const [loading, setLoading] = useState(false);

	// Only active, non-trial orders can be renewed; soonest-to-expire first.
	const extendable = (orders ?? [])
		.filter((order) => order.status === "Active" && !order.isTrial)
		.sort((a, b) => new Date(a.expiresAt ?? 0).getTime() - new Date(b.expiresAt ?? 0).getTime());

	// Default to the first extendable order once the list loads / the dialog opens.
	useEffect(() => {
		if (isOpen && !selectedOrderId && extendable.length > 0) setSelectedOrderId(extendable[0].id ?? undefined);
	}, [isOpen, selectedOrderId, extendable]);

	const selectedOrder = extendable.find((order) => order.id === selectedOrderId);
	// The order carries its proxies as line-item resourceIds; resolve them against the proxies list for display.
	const resourceIds = new Set((selectedOrder?.items ?? []).flatMap((item) => item.resourceIds ?? []));
	const orderProxies = (proxies ?? []).filter((proxy) => proxy.id && resourceIds.has(proxy.id));
	const expiry = selectedOrder?.expiresAt ? timeLeft(new Date(selectedOrder.expiresAt)) : null;
	const expiryTone = expiry ? (expiry.unit !== "days" ? "danger" : expiry.value <= 3 ? "danger" : expiry.value <= 7 ? "warning" : "success") : "neutral";

	const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!selectedOrderId) return;
		setLoading(true);
		try {
			const result = await extendOrder(selectedOrderId, { billingCycle, paymentMethod });
			// A returnUrl means payment is required: hand off to it. Otherwise it's done.
			if (result?.returnUrl) {
				window.location.assign(result.returnUrl);
				return;
			}
			toast.success(t("extendOrderDialog.success"));
			mutate("/api/orders");
			onClose();
		} catch {
			toast.error(t("extendOrderDialog.fail"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal open={isOpen} onClose={onClose} title={t("extendDialog.title")}>
			<form onSubmit={handleSubmit} className={"space-y-6"}>
				<p className={"text-sm text-muted"}>{t("extendDialog.subtitle")}</p>

				<div className={"space-y-1.5"}>
					<label className={"text-sm font-medium text-fg-strong required"}>{t("extendDialog.purchase")}</label>
					<select
						value={selectedOrderId ?? ""}
						onChange={(event) => setSelectedOrderId(event.target.value || undefined)}
						className={"w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-fg transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"}
					>
						<option value={""} disabled>{t("extendDialog.selectPurchase")}</option>
						{extendable.map((order) => {
							const left = order.expiresAt ? timeLeft(new Date(order.expiresAt)) : null;
							const remaining = left ? t(`orders.${left.unit}`, { count: left.value }) : "";
							return (
								<option key={order.id} value={order.id ?? ""}>
									#{shortId(order.id ?? "")}{remaining ? ` · ${remaining}` : ""}
								</option>
							);
						})}
					</select>
				</div>

				{selectedOrder && orderProxies.length > 0 && (
					<Card className={"space-y-3 !p-4"}>
						<div className={"flex items-center justify-between gap-3"}>
							<p className={"text-xs font-medium uppercase tracking-wider text-muted"}>{t("extendDialog.proxiesIn")}</p>
							{expiry && (
								<Badge tone={expiryTone}>{t(`orders.${expiry.unit}`, { count: expiry.value })}</Badge>
							)}
						</div>
						<div className={"space-y-2"}>
							{orderProxies.map((proxy) => {
								const cc = proxy.location?.countryCode;
								const ispLogo = proxy.isp?.logoUrl ?? (proxy.isp?.id ? ispIconUrl(proxy.isp.id) : undefined);
								return (
									<div key={proxy.id} className={"flex items-center gap-3"}>
										<div className={"relative shrink-0"}>
											{cc && <img src={`/images/flags/${cc.toLowerCase()}.svg`} className={"h-6 w-6 rounded-full border border-line"} alt={cc} />}
											{ispLogo && <img src={ispLogo} className={"absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border border-surface"} alt={proxy.isp?.name ?? ""} />}
										</div>
										<p className={"text-sm text-fg"}>
											#{shortId(proxy.id ?? "")} — {proxy.host}:{proxy.port}
										</p>
									</div>
								);
							})}
						</div>
					</Card>
				)}

				<div className={"space-y-1.5"}>
					<label className={"text-sm font-medium text-fg-strong"}>{t("extendOrderDialog.billingCycle")}</label>
					<div className={"flex flex-wrap gap-2"}>
						{BILLING_CYCLES.map((cycle) => (
							<OptionChip
								key={cycle}
								selected={billingCycle === cycle}
								icon={BILLING_ICONS[String(cycle)]}
								label={t(`billingCycle.${String(cycle).toLowerCase()}`)}
								onClick={() => setBillingCycle(cycle)}
							/>
						))}
					</div>
				</div>

				<div className={"flex justify-end gap-3"}>
					<Button type={"button"} variant={"secondary"} onClick={onClose}>{t("extendDialog.dismiss")}</Button>
					<Button type={"submit"} icon={History} disabled={!selectedOrderId} loading={loading}>{t("extendDialog.extend")}</Button>
				</div>
			</form>
		</Modal>
	);
}
