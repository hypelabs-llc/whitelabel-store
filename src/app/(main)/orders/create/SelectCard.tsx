"use client";

import { Check } from "lucide-react";
import clsx from "clsx";

// A larger selectable card with a checkmark when active (location & ISP steps).
export function SelectCard({
	selected,
	disabled,
	onClick,
	children,
}: {
	selected: boolean;
	disabled?: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			className={clsx(
				"relative flex w-full flex-col rounded-xl border bg-surface p-4 text-left transition-colors",
				disabled && "cursor-not-allowed border-line opacity-40 ring-0",
				!disabled && !selected && "border-line hover:border-brand",
				!disabled && selected && "border-brand bg-brand-soft ring-1 ring-brand",
			)}
		>
			{selected && (
				<span className="absolute right-3 top-3 text-brand">
					<Check className="size-4" />
				</span>
			)}
			{children}
		</button>
	);
}
