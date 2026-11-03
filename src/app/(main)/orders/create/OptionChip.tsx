"use client";

import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

// A pill-style option with an optional leading icon (billing cycle & payment method).
export function OptionChip({
	selected,
	disabled,
	icon: Icon,
	label,
	onClick,
}: {
	selected: boolean;
	disabled?: boolean;
	icon?: LucideIcon;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			className={clsx(
				"inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
				disabled && "cursor-not-allowed border-line bg-surface text-muted opacity-50",
				!disabled && selected && "border-brand bg-brand text-brand-contrast",
				!disabled && !selected && "border-line bg-surface text-fg hover:border-brand hover:text-fg-strong",
			)}
		>
			{Icon && <Icon className="size-4" />}
			{label}
		</button>
	);
}
