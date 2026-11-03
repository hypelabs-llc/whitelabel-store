import clsx from "clsx";
import type { HTMLAttributes } from "react";

/** Surface container. Replaces Tremor <Card>: elevated panel with subtle border and soft shadow. */
export default function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={clsx(
				"rounded-xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
				className,
			)}
			{...rest}
		>
			{children}
		</div>
	);
}
