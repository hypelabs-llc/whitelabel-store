"use client";

import { useTranslation } from "react-i18next";
import type { PaymentMethods } from "@hypelabs-llc/ts-sdk";
import { PaymentMethodsObject } from "@hypelabs-llc/ts-sdk";
import { PAYMENT_ICONS } from "@/constants";
import { OptionChip } from "./OptionChip";
import { StepHeading } from "./StepHeading";

// Methods hidden from the order builder for now. Temporary: the real exclusion will move to the API,
// after which this list (and the filter below) can be removed.
const HIDDEN_METHODS: PaymentMethods[] = [PaymentMethodsObject.Balance];

// Step 04: pick a payment method. The list is the org's available methods (derived server-side from
// its configured payment processors); each renders with a Lucide icon.
export function PaymentMethodSelector({
	index,
	methods,
	value,
	onChange,
}: {
	index: string;
	methods: PaymentMethods[];
	value: PaymentMethods | null;
	onChange: (method: PaymentMethods) => void;
}) {
	const { t } = useTranslation();
	const visibleMethods = methods.filter((method) => !HIDDEN_METHODS.includes(method));
	return (
		<section>
			<StepHeading index={index} title={t("orderDialog.paymentMethod")} subtitle={t("orderDialog.paymentMethodHint")} />
			<div className="flex flex-wrap gap-2">
				{visibleMethods.map((method) => (
					<OptionChip
						key={method}
						selected={value === method}
						icon={PAYMENT_ICONS[method]}
						label={t(`paymentMethod.${String(method).toLowerCase()}`)}
						onClick={() => onChange(method)}
					/>
				))}
			</div>
		</section>
	);
}
