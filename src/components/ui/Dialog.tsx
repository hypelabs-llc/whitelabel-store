"use client";

import { Dialog as HDialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import clsx from "clsx";

/**
 * Modal dialog. A centered, rounded card with a soft scrim at every screen size (same on mobile and
 * desktop). Uses headless UI (already a dependency) for focus trap + a11y.
 */
export default function Modal({
	open,
	onClose,
	title,
	children,
	className,
}: {
	open: boolean;
	onClose: () => void;
	title?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<HDialog open={open} onClose={onClose} className="relative z-50">
			<div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-[2px]" aria-hidden="true" />
			<div className="fixed inset-0 flex items-center justify-center p-4">
				<DialogPanel
					transition
					className={clsx(
						"flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-y-auto rounded-2xl border border-line bg-surface text-fg shadow-xl transition duration-200 ease-out",
						"data-[closed]:scale-95 data-[closed]:opacity-0",
						className,
					)}
				>
					{title ? (
						<div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
							<DialogTitle className="text-base font-semibold text-fg-strong">{title}</DialogTitle>
							<button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-muted hover:bg-surface-muted hover:text-fg">
								<X size={18} />
							</button>
						</div>
					) : null}
					<div className="p-5">{children}</div>
				</DialogPanel>
			</div>
		</HDialog>
	);
}
