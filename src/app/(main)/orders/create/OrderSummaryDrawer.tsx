"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import { ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui";
import { formatPrice } from "@/lib";
import { OrderSummary, type OrderSummaryProps } from "./OrderSummary";

// Snap points: peek is a fixed px (the header height: total + order button), so it looks right on any
// screen; full (1) opens the sheet to reveal the whole recap.
const PEEK = "105px";
const FULL = "450px";
const SNAP_POINTS = [PEEK, FULL];

/**
 * Mobile-only order summary as a Vaul bottom sheet. It sits peeking at the bottom (total + order button)
 * and drags up to reveal the full breakdown. Non-modal so the selectors behind it stay usable, and it is
 * never dismissed to zero — it always keeps the peek snap point. Desktop uses the sticky <OrderSummary>.
 */
export function OrderSummaryDrawer(props: OrderSummaryProps) {
	const { t } = useTranslation();
	const [snap, setSnap] = useState<number | string | null>(PEEK);
	// `expanded` drives which content shows. It flips the moment a drag starts (onDrag), not only when the
	// snap settles — so the full recap appears as soon as you begin swiping up, not at the end.
	const [expanded, setExpanded] = useState(false);

	const handleSnap = (next: number | string | null) => {
		setSnap(next);
		setExpanded(next !== PEEK);
	};

	return (
		<Drawer.Root
			open
			dismissible={false}
			modal={false}
			disablePreventScroll={false}
			snapPoints={SNAP_POINTS}
			activeSnapPoint={snap}
			setActiveSnapPoint={handleSnap}
			// percentageDragged > 0 while dragging up from the peek: expand right away.
			onDrag={(_event, percentageDragged) => {
				if (snap === PEEK && percentageDragged > 0) setExpanded(true);
			}}
		>
			<Drawer.Portal>
				<Drawer.Content
					className="fixed inset-x-0 bottom-0 z-40 flex h-full flex-col rounded-t-2xl border-t border-line bg-surface shadow-[0_-8px_30px_rgba(0,0,0,0.12)] outline-none lg:hidden"
				>
					<Drawer.Handle className="relative z-10 !mx-auto !mt-3 !h-1.5 !w-10 !rounded-full !bg-muted" />
					<Drawer.Title className="sr-only">{t("orderDialog.summary")}</Drawer.Title>

					{/* Full recap fills the sheet; always mounted so the sheet height never changes mid-drag
					    (swapping content is what makes Vaul's snap math flicker). The peek header overlays the
					    top, shown only at the peek snap, so the collapsed sheet reads as "total + order". */}
					<div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-2">
						<OrderSummary {...props} />
					</div>

					<div
						className={`absolute inset-x-0 top-0 flex items-center justify-between gap-3 rounded-t-2xl bg-surface px-5 pb-5 pt-8 transition-opacity ${expanded ? "pointer-events-none opacity-0" : "opacity-100"}`}
					>
						<div className="min-w-0">
							<div className="text-xs font-semibold uppercase tracking-widest text-muted">{t("orderDialog.total")}</div>
							<div className="text-2xl font-bold text-fg-strong">{formatPrice(props.total, props.currency)}</div>
						</div>
						<Button icon={ShoppingCart} size="lg" disabled={!props.canOrder} loading={props.submitting} onClick={props.onOrder}>
							{t("orderDialog.orderNow")}
						</Button>
					</div>
				</Drawer.Content>
			</Drawer.Portal>
		</Drawer.Root>
	);
}
