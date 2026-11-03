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
	const atPeek = snap === PEEK;

	return (
		<Drawer.Root
			open
			dismissible={false}
			modal={false}
			snapPoints={SNAP_POINTS}
			activeSnapPoint={snap}
			setActiveSnapPoint={setSnap}
		>
			<Drawer.Portal>
				<Drawer.Content
					className="fixed inset-x-0 bottom-0 z-40 flex h-full flex-col rounded-t-2xl border-t border-line bg-surface shadow-[0_-8px_30px_rgba(0,0,0,0.12)] outline-none lg:hidden"
				>
					<Drawer.Handle className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-line" />
					<Drawer.Title className="sr-only">{t("orderDialog.summary")}</Drawer.Title>

					{/* Peek header: always visible, shows the total and the order CTA so the user can buy without
					    expanding. When the sheet is expanded, this collapses into the full content below. */}
					{atPeek ? (
						<div className="flex items-center justify-between gap-3 px-5 pb-5 pt-3">
							<div className="min-w-0">
								<div className="text-xs font-semibold uppercase tracking-widest text-muted">{t("orderDialog.total")}</div>
								<div className="text-2xl font-bold text-fg-strong">{formatPrice(props.total, props.currency)}</div>
							</div>
							<Button
								icon={ShoppingCart}
								size="lg"
								disabled={!props.canOrder}
								loading={props.submitting}
								onClick={props.onOrder}
							>
								{t("orderDialog.orderNow")}
							</Button>
						</div>
					) : (
						<div className="overflow-y-auto px-5 pb-8 pt-2">
							<OrderSummary {...props} />
						</div>
					)}
				</Drawer.Content>
			</Drawer.Portal>
		</Drawer.Root>
	);
}
