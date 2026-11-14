"use client";

import { type SubmitEvent, useEffect, useState } from "react";
import { Button, Modal } from "@/components/ui";
import { History } from "lucide-react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { BILLING_CYCLES, BILLING_ICONS, PAYMENT_ICONS } from "@/constants";
import { OptionChip } from "./create/OptionChip";
import { extendOrder } from "@/lib/actions/order";
import { BillingCyclesObject } from "@hypelabs-llc/ts-sdk";
import type { BillingCycles, PaymentMethods } from "@hypelabs-llc/ts-sdk";
import { useTranslation } from "react-i18next";

export default function ExtendOrderDialog({ orderId, isOpen, onClose }: { orderId: string | null; isOpen: boolean; onClose: () => void }) {
	const { t } = useTranslation();
	const [billingCycle, setBillingCycle] = useState<BillingCycles>(BillingCyclesObject.Monthly);
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethods | null>(null);
	const [loading, setLoading] = useState(false);

	// Payment methods the org accepts (same source as the order builder), not a hardcoded pair.
	const { data: paymentMethods = [] } = useSWR<PaymentMethods[]>("/api/payment-methods", { suspense: false });
	useEffect(() => {
		if (paymentMethods.length === 0) return;
		if (!paymentMethod || !paymentMethods.includes(paymentMethod)) setPaymentMethod(paymentMethods[0]);
	}, [paymentMethods, paymentMethod]);

	const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!orderId || !paymentMethod) return;
		setLoading(true);
		try {
			const result = await extendOrder(orderId, { billingCycle, paymentMethod });
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
		<Modal open={isOpen} onClose={onClose} title={t("extendOrderDialog.title")}>
			<form onSubmit={handleSubmit} className={"space-y-6"}>
				<p className={"text-sm text-muted"}>{t("extendOrderDialog.subtitle")}</p>

				<div className={"space-y-3"}>
					<label className={"block text-sm font-medium text-fg-strong"}>{t("extendOrderDialog.billingCycle")}</label>
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

				<div className={"space-y-3"}>
					<label className={"block text-sm font-medium text-fg-strong"}>{t("orderDialog.paymentMethod")}</label>
					<div className={"flex flex-wrap gap-2"}>
						{paymentMethods.map((method) => (
							<OptionChip
								key={method}
								selected={paymentMethod === method}
								icon={PAYMENT_ICONS[method]}
								label={t(`paymentMethod.${String(method).toLowerCase()}`)}
								onClick={() => setPaymentMethod(method)}
							/>
						))}
					</div>
				</div>

				<div className={"flex justify-end gap-3"}>
					<Button type={"button"} variant={"secondary"} onClick={onClose}>
						{t("common.dismiss")}
					</Button>
					<Button type={"submit"} icon={History} loading={loading}>
						{t("extendOrderDialog.confirm")}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
