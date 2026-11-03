import type { LucideIcon } from "lucide-react";
import Card from "./Card";

/** Metric tile: small label + icon, large value, optional helper line. Replaces ad-hoc Tremor cards. */
export default function Stat({
	label,
	value,
	icon: Icon,
	hint,
}: {
	label: string;
	value: React.ReactNode;
	icon?: LucideIcon;
	hint?: string;
}) {
	return (
		<Card>
			<div className="flex items-center gap-2 text-xs text-muted sm:text-sm">
				{Icon ? <Icon size={16} className="shrink-0 text-brand" aria-hidden="true" /> : null}
				<span className="truncate whitespace-nowrap">{label}</span>
			</div>
			<div className="mt-2 text-xl font-semibold tracking-tight text-fg-strong sm:text-2xl">{value}</div>
			{hint ? <div className="mt-1 truncate text-xs text-muted">{hint}</div> : null}
		</Card>
	);
}
