"use client";

import clsx from "clsx";

/**
 * Minimal CSS tooltip — no dependency. Wraps its trigger (`children`) and shows `content` on hover/focus
 * above it. Styled with the design-system tokens; works in both themes.
 */
export default function Tooltip({
	content,
	children,
	className,
}: {
	content: React.ReactNode;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<span className={clsx("group/tooltip relative inline-flex", className)}>
			{children}
			<span
				role="tooltip"
				className={clsx(
					"pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap",
					"rounded-md border border-line bg-surface-elevated px-2 py-1 text-xs font-medium text-fg shadow-md",
					"opacity-0 transition-opacity duration-150",
					"group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
				)}
			>
				{content}
			</span>
		</span>
	);
}
