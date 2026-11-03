"use client";

import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Location, Plain } from "@hypelabs-llc/ts-sdk";
import { countryName, locationIcon } from "@/lib";
import { SelectCard } from "./SelectCard";
import { StepHeading } from "./StepHeading";

// Step 01: pick a location (a card grid). Out-of-stock locations are shown disabled (disabled ones
// are already filtered out server-side).
export function LocationSelector({
	index,
	locations,
	loading,
	selectedId,
	onSelect,
}: {
	index: string;
	locations: Plain<Location>[];
	loading: boolean;
	selectedId: string | null;
	onSelect: (id: string) => void;
}) {
	const { t, i18n } = useTranslation();
	const lang = i18n.resolvedLanguage ?? "en";
	return (
		<section>
			<StepHeading index={index} title={t("orderDialog.location")} subtitle={t("orderDialog.locationHint")} />
			{loading ? (
				<Loader2 className="size-5 animate-spin text-muted" />
			) : (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					{locations.map((location) => {
						const stock = location.availableProxies ?? 0;
						return (
							<SelectCard key={location.id} selected={location.id === selectedId} disabled={stock <= 0} onClick={() => onSelect(location.id!)}>
								<span className="flex min-w-0 items-center gap-2 font-medium text-fg-strong">
									{location.countryCode && <span className="shrink-0">{locationIcon(location.countryCode)}</span>}
									<span className="truncate">{location.city ?? countryName(location.countryCode, lang)}</span>
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
