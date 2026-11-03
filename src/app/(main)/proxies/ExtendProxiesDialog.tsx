"use client";

import { useState } from "react";
import { Badge, Button, Card, Modal } from "@/components/ui";
import { History, Split } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { mutate } from "swr";
import { ispIconUrl, shortId } from "@/lib";
import { differenceInDays, differenceInHours } from "date-fns";
import useSWR from "swr";
import { useTranslation } from "react-i18next";

/** Minimal order shape the extend flow needs (the SDK no longer ships this reseller-store type). */
type ExtendProxy = { id: string; countryCode?: string | null; isp?: string | null; hostname?: string | null; port?: number | null };
type Order = { id: string; expiresAt?: string | null; status?: string; location?: string; isp?: string; proxies?: ExtendProxy[] };

export default function ExtendProxiesDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
	const { t } = useTranslation();
	const { data: orders } = useSWR<Order[]>("/api/orders", { suspense: false });
	const [selectedOrderId, setSelectedOrderId] = useState<string>();
	const [showSplitConfirm, setShowSplitConfirm] = useState(false);
	const [splitting, setSplitting] = useState(false);

	const confirmedOrders = (orders?.filter((order) => order.status === "Confirmed" && (order.proxies?.length ?? 0) > 0) ?? [])
		.sort((a, b) => new Date(a.expiresAt!).getTime() - new Date(b.expiresAt!).getTime());

	if (confirmedOrders.length > 0 && !selectedOrderId) {
		setSelectedOrderId(confirmedOrders[0].id);
	}
	const selectedOrder = confirmedOrders.find((order) => order.id === selectedOrderId);
	const proxies = selectedOrder?.proxies ?? [];

	const [loading, setLoading] = useState(false);

	const handleSubmit = () => {
		if (!selectedOrderId) return;
		setLoading(true);
		axios.post(`/api/orders/${selectedOrderId}/extend`)
			.then((response) => {
				if (response.data.returnUrl) window.open(response.data.returnUrl, "_blank");
				onClose();
			})
			.catch(() => toast.error(t("extendDialog.paymentFail")))
			.finally(() => setLoading(false));
	};

	const selectedDaysLeft = selectedOrder?.expiresAt ? differenceInDays(new Date(selectedOrder.expiresAt), new Date()) : null;
	const selectedHoursLeft = selectedOrder?.expiresAt && selectedDaysLeft === 0 ? Math.max(0, differenceInHours(new Date(selectedOrder.expiresAt), new Date())) : null;

	const handleSplit = () => {
		if (!selectedOrderId) return;
		setSplitting(true);
		axios.post(`/api/orders/${selectedOrderId}/split`)
			.then(() => { toast.success(t("extendDialog.splitSuccess")); mutate("/api/orders"); setSelectedOrderId(undefined); })
			.catch(() => toast.error(t("extendDialog.splitFail")))
			.finally(() => { setSplitting(false); setShowSplitConfirm(false); });
	};

	return (
		<>
			<Modal open={isOpen} onClose={onClose} title={t("extendDialog.title")}>
				<div className={"space-y-6"}>
					<p className={"text-sm text-muted"}>{t("extendDialog.subtitle")}</p>

					<div className={"space-y-1.5"}>
						<label className={"text-sm font-medium text-fg-strong required"}>{t("extendDialog.purchase")}</label>
						<select
							value={selectedOrderId ?? ""}
							onChange={(event) => setSelectedOrderId(event.target.value || undefined)}
							className={"w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-fg transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"}
						>
							<option value={""} disabled>{t("extendDialog.selectPurchase")}</option>
							{confirmedOrders.map((order) => {
								const daysLeft = differenceInDays(new Date(order.expiresAt!), new Date());
								const hoursLeft = daysLeft === 0 ? Math.max(0, differenceInHours(new Date(order.expiresAt!), new Date())) : null;
								const remaining = daysLeft >= 1 ? t("extendDialog.days", { count: daysLeft }) : t("extendDialog.hours", { count: hoursLeft ?? 0 });
								return (
									<option key={order.id} value={order.id}>
										#{shortId(order.id)} — {order.location}/{order.isp} · {remaining}
									</option>
								);
							})}
						</select>
					</div>

					{selectedOrder && proxies.length > 0 && (
						<Card className={"space-y-3 !p-4"}>
							<div className={"flex items-center justify-between gap-3"}>
								<p className={"text-xs font-medium uppercase tracking-wider text-muted"}>{t("extendDialog.proxiesIn")}</p>
								<div className={"flex items-center gap-2"}>
									{selectedDaysLeft !== null && (
										<Badge tone={selectedDaysLeft <= 3 ? "danger" : selectedDaysLeft <= 7 ? "warning" : "success"}>
											{selectedDaysLeft >= 1 ? t("extendDialog.days", { count: selectedDaysLeft }) : t("extendDialog.hours", { count: selectedHoursLeft ?? 0 })}
										</Badge>
									)}
									{proxies.length > 1 && (
										<Button variant={"light"} size={"xs"} icon={Split} onClick={() => setShowSplitConfirm(true)}>{t("extendDialog.split")}</Button>
									)}
								</div>
							</div>
							<div className={"space-y-2"}>
								{proxies.map((proxy) => (
									<div key={proxy.id} className={"flex items-center gap-3"}>
										<div className={"relative shrink-0"}>
											<img src={`/images/flags/${proxy.countryCode?.toLowerCase()}.svg`} className={"h-6 w-6 rounded-full border border-line"} alt={proxy.countryCode ?? ""} />
											{proxy.isp && <img src={ispIconUrl(proxy.isp)} className={"absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border border-surface"} alt={proxy.isp} />}
										</div>
										<p className={"text-sm text-fg"}>
											#{shortId(proxy.id)} — {proxy.hostname}:{proxy.port}
										</p>
									</div>
								))}
							</div>
						</Card>
					)}

					<div className={"flex justify-end gap-3"}>
						<Button variant={"secondary"} onClick={onClose}>{t("extendDialog.dismiss")}</Button>
						<Button icon={History} disabled={!selectedOrderId} loading={loading} onClick={handleSubmit}>{t("extendDialog.extend")}</Button>
					</div>
				</div>
			</Modal>

			<Modal open={showSplitConfirm} onClose={() => setShowSplitConfirm(false)} title={t("extendDialog.splitTitle")}>
				<div className={"space-y-6"}>
					<p className={"text-sm text-muted"}>{t("extendDialog.splitMessage", { count: proxies.length })}</p>
					<div className={"flex justify-end gap-3"}>
						<Button variant={"secondary"} onClick={() => setShowSplitConfirm(false)}>{t("common.dismiss")}</Button>
						<Button icon={Split} loading={splitting} onClick={handleSplit}>{t("extendDialog.split")}</Button>
					</div>
				</div>
			</Modal>
		</>
	);
}
