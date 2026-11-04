"use client";

import { type SubmitEvent, useState } from "react";
import { Button, Modal } from "@/components/ui";
import { History } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";
import { BILLING_CYCLES, BILLING_ICONS } from "@/constants";
import { OptionChip } from "./create/OptionChip";
import { extendOrder } from "@/lib/actions/order";
import { BillingCyclesObject, PaymentMethodsObject } from "@hypelabs-llc/ts-sdk";
import type { BillingCycles, PaymentMethods } from "@hypelabs-llc/ts-sdk";
import { useTranslation } from "react-i18next";

// Same single payment method the order builder offers; extend reuses it.
const PAYMENT_METHODS: PaymentMethods[] = [PaymentMethodsObject.Cryptocurrency];

export default function ExtendOrderDialog({ orderId, isOpen, onClose }: { orderId: string | null; isOpen: boolean; onClose: () => void }) {
	const { t } = useTranslation();
	const [billingCycle, setBillingCycle] = useState<BillingCycles>(BillingCyclesObject.Monthly);
	const [paymentMethod] = useState<PaymentMethods>(PAYMENT_METHODS[0]);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!orderId) return;
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
