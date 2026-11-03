"use client";

import { Loader2, Gauge, Network } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Capability, CapabilityTypes, Plain } from "@hypelabs-llc/ts-sdk";
import { SelectCard } from "./SelectCard";
import { StepHeading } from "./StepHeading";

// Per-capability icon, keyed by the SDK's CapabilityTypes value.
const CAPABILITY_ICONS: Record<string, LucideIcon> = {
	Ipv6: Network,
	IpScore: Gauge,
};

// Optional step: require one or more proxy capabilities. Each card is a toggle — click to require it,
// click again to drop it (multi-select). Out-of-stock capabilities are shown disabled.
export function CapabilitySelector({
	index,
	capabilities,
	loading,
	selected,
	onToggle,
}: {
	index: string;
	capabilities: Plain<Capability>[];
	loading: boolean;
	selected: CapabilityTypes[];
	onToggle: (type: CapabilityTypes) => void;
}) {
	const { t } = useTranslation();
	if (!loading && capabilities.length === 0) return null;
	return (
		<section>
			<StepHeading index={index} title={t("orderDialog.capabilities")} subtitle={t("orderDialog.capabilitiesHint")} />
			{loading ? (
				<Loader2 className="size-5 animate-spin text-muted" />
			) : (
				<div className="grid grid-cols-2 gap-3">
					{capabilities.map((capability) => {
						const type = capability.type as CapabilityTypes | undefined;
						const stock = capability.availableProxies ?? 0;
						const Icon = type ? CAPABILITY_ICONS[type] : undefined;
						return (
							<SelectCard
								key={capability.id}
								selected={!!type && selected.includes(type)}
								disabled={stock <= 0 || !type}
								onClick={() => type && onToggle(type)}
							>
								<span className="flex min-w-0 items-center gap-2 font-medium text-fg-strong">
									{Icon && <Icon className="size-4 shrink-0 text-muted" />}
									<span className="truncate">{capability.name}</span>
								</span>
								<span className="mt-1 text-xs text-muted">
									{stock > 0 ? t("orderDialog.proxiesLeft", { count: stock }) : t("orderDialog.notAvailable")}
								</span>
							</SelectCard>
						);
					})}
				</div>
			)}
		</section>
	);
}
