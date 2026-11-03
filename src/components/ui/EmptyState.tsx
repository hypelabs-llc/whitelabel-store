import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import Card from "./Card";

/**
 * THE empty-state / section-intro block, matching the Support page the user approved:
 * a soft brand icon badge, an optional brand eyebrow, a large title, a message, and an action.
 * Use this for every empty state so they stay identical.
 */
export default function EmptyState({
	icon: Icon,
	eyebrow,
	title,
	message,
	children,
	bare = false,
	className,
}: {
	icon?: LucideIcon;
	eyebrow?: string;
	title?: string;
	message?: string;
	children?: React.ReactNode;
	/** Drop the full-page <section> + Card wrapper and render just the content, for embedding inside an existing container. */
	bare?: boolean;
	/** Extra classes for the content wrapper (e.g. padding when embedded with `bare`). */
	className?: string;
}) {
	const content = (
		<>
			{Icon ? (
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
					<Icon size={22} aria-hidden="true" />
				</div>
			) : null}
			{eyebrow ? <p className="mt-6 text-sm font-semibold text-brand">{eyebrow}</p> : null}
			{title ? <h1 className="mt-6 text-3xl font-semibold tracking-tight text-fg-strong sm:text-4xl">{title}</h1> : null}
			{message ? <p className="mx-auto mt-4 max-w-md text-pretty text-base text-muted">{message}</p> : null}
			{children ? <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{children}</div> : null}
		</>
	);

	// Embedded: just the centered content, for dropping inside an existing container.
	if (bare) {
		return <div className={clsx("text-center", className)}>{content}</div>;
	}

	// Default: the full-page centered block (matching the approved Support empty state).
	return (
		<section className="flex flex-1 flex-col items-center justify-center pb-20 pt-8">
			<Card className={clsx("w-full max-w-xl px-6 py-10 text-center", className)}>{content}</Card>
		</section>
	);
}
