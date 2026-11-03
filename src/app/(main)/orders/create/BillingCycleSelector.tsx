"use client";

import { useTranslation } from "react-i18next";
import type { BillingCycles } from "@hypelabs-llc/ts-sdk";
import { BILLING_CYCLES, BILLING_ICONS } from "@/constants";
import { OptionChip } from "./OptionChip";
import { StepHeading } from "./StepHeading";

// Step 03: pick a billing cycle (Daily … Yearly), each with a Lucide icon.
export function BillingCycleSelector({
	index,
	value,
	onChange,
}: {
	index: string;
	value: BillingCycles;
	onChange: (cycle: BillingCycles) => void;
}) {
	const { t } = useTranslation();
	return (
		<section>
			<StepHeading index={index} title={t("orderDialog.billingCycle")} subtitle={t("orderDialog.billingCycleHint")} />
			<div className="flex flex-wrap gap-2">
				{BILLING_CYCLES.map((c) => (
					<OptionChip
						key={c}
						selected={value === c}
						icon={BILLING_ICONS[String(c)]}
						label={t(`billingCycle.${String(c).toLowerCase()}`)}
						onClick={() => onChange(c)}
					/>
				))}
			</div>
		</section>
	);
}
