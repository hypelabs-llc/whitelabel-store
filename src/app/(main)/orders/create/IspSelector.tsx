"use client";

import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Isp, Plain } from "@hypelabs-llc/ts-sdk";
import { SelectCard } from "./SelectCard";
import { StepHeading } from "./StepHeading";

// Step 02: pick a carrier / ISP for the chosen location. Out-of-stock ISPs are shown disabled
// (disabled ones are already filtered out server-side).
export function IspSelector({
	index,
	isps,
	loading,
	selectedId,
	onSelect,
}: {
	index: string;
	isps: Plain<Isp>[];
	loading: boolean;
	selectedId: string | null;
	onSelect: (id: string) => void;
}) {
	const { t } = useTranslation();
	return (
		<section>
			<StepHeading index={index} title={t("orderDialog.carrier")} subtitle={t("orderDialog.carrierHint")} />
			{loading ? (
				<Loader2 className="size-5 animate-spin text-muted" />
			) : (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					{isps.map((isp) => {
						const stock = isp.availableProxies ?? 0;
						return (
							<SelectCard key={isp.id} selected={isp.id === selectedId} disabled={stock <= 0} onClick={() => onSelect(isp.id!)}>
								<span className="flex min-w-0 items-center gap-2 font-medium text-fg-strong">
									{isp.logoUrl && <img src={isp.logoUrl} alt="" className="size-5 shrink-0 rounded" />}
									<span className="truncate">{isp.name}</span>
								</span>
								<span className="mt-1 text-xs text-muted">
									{stock > 0 ? t("orderDialog.proxiesLeft", { count: stock }) : t("orderDialog.noStock")}
								</span>
							</SelectCard>
						);
					})}
				</div>
			)}
		</section>
	);
}
