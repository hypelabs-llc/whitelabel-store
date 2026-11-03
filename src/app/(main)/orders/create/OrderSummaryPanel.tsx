"use client";

import { Card } from "@/components/ui";
import { OrderSummary, type OrderSummaryProps } from "./OrderSummary";

/** Sticky order summary panel for desktop (lg+). On mobile the OrderSummaryDrawer is used instead. */
export function OrderSummaryPanel(props: OrderSummaryProps) {
	return (
		<aside className="hidden lg:sticky lg:top-8 lg:block lg:self-start">
			<Card className="p-6">
				<OrderSummary {...props} />
			</Card>
		</aside>
	);
}
