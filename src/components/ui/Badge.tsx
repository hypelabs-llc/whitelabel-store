import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger";

const TONES: Record<Tone, string> = {
	neutral: "bg-surface-muted text-muted border-line",
	brand: "bg-brand-soft text-brand border-transparent",
	success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-transparent",
	warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-transparent",
	danger: "bg-red-500/10 text-red-600 dark:text-red-400 border-transparent",
};

/** Compact status pill. */
export default function Badge({
	tone = "neutral",
	icon: Icon,
	children,
	className,
}: {
	tone?: Tone;
	icon?: LucideIcon;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<span
			className={clsx(
				"inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
				TONES[tone],
				className,
			)}
		>
			{Icon ? <Icon size={12} aria-hidden="true" /> : null}
			{children}
		</span>
	);
}
