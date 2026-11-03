"use client";

import { Minus, Plus } from "lucide-react";

// A compact −/+ quantity control (shown inside the order summary card). `max` caps the value at the
// available stock for the current selection; the + button disables once it's reached.
export function QuantityStepper({
	value,
	onChange,
	min = 1,
	max,
}: {
	value: number;
	onChange: (quantity: number) => void;
	min?: number;
	max?: number;
}) {
	const atMin = value <= min;
	const atMax = max !== undefined && value >= max;
	return (
		<div className="flex items-center rounded-full border border-line bg-surface">
			<button
				type="button"
				disabled={atMin}
				onClick={() => onChange(Math.max(min, value - 1))}
				className="flex size-8 items-center justify-center rounded-l-full text-muted transition-colors hover:bg-surface-muted hover:text-fg-strong disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
			>
				<Minus className="size-4" />
			</button>
			<span className="w-8 text-center text-sm font-semibold text-fg-strong">{value}</span>
			<button
				type="button"
				disabled={atMax}
				onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
				className="flex size-8 items-center justify-center rounded-r-full text-muted transition-colors hover:bg-surface-muted hover:text-fg-strong disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
			>
				<Plus className="size-4" />
			</button>
		</div>
	);
}
