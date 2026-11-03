import type { LucideIcon } from "lucide-react";

/**
 * Section heading: an optional leading icon badge, a title, and an optional one-line description.
 * Used for steps and sections inside a page (e.g. the order builder steps).
 */
export default function SectionHeading({
	icon: Icon,
	title,
	description,
	className,
}: {
	icon?: LucideIcon;
	title: string;
	description?: string;
	className?: string;
}) {
	return (
		<div className={className}>
			<div className="flex items-center gap-2.5">
				{Icon ? (
					<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand">
						<Icon size={16} />
					</span>
				) : null}
				<h2 className="text-lg font-semibold tracking-tight text-fg-strong">{title}</h2>
			</div>
			{description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
		</div>
	);
}
