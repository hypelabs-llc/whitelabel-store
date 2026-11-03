import type { LucideIcon } from "lucide-react";

/** Page title block: heading (with an optional leading icon), optional subtitle, and actions slot. */
export default function Heading({
	title,
	subtitle,
	actions,
	icon: Icon,
}: {
	title: React.ReactNode;
	subtitle?: React.ReactNode;
	actions?: React.ReactNode;
	icon?: LucideIcon;
}) {
	return (
		<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div className="min-w-0">
				<h1 className="inline-flex items-center gap-2 text-xl font-semibold tracking-tight text-fg-strong sm:text-2xl">
					{Icon ? <Icon className="h-6 w-6 text-brand" aria-hidden="true" /> : null}
					{title}
				</h1>
				{subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
			</div>
			{actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
		</div>
	);
}
