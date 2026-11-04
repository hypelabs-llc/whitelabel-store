"use server";

// Server Actions for the order builder. Everything runs on the server, so the Connect SDK (and its
// API key) never reaches the browser. Products are loaded in the page (a Server Component); these
// actions drive the location → ISP cascade, the live price preview, and order/trial creation.
//
// Every value crossing back to the client is passed through the SDK's toPlain() so it's a plain-data
// object (no Kiota Parsable methods / additionalData) — safe for the React server/client boundary,
// no hand-written DTOs. Disabled entries are filtered out server-side (disabled = hidden).

import { getConnect } from "@/lib/connect";
import { auth } from "@/auth";
import { toPlain } from "@hypelabs-llc/ts-sdk";
import type { PreviewOrderResponse, CreateOrderResponse, ExtendOrderRequest, ExtendOrderResponse, Plain } from "@hypelabs-llc/ts-sdk";
import type { BillingCycles, PaymentMethods, CapabilityTypes } from "@hypelabs-llc/ts-sdk";

export interface OrderSelection {
	productId: string;
	locationId: string;
	ispId: string;
	quantity: number;
	billingCycle: BillingCycles;
	/** Required proxy capabilities (empty = no requirement). */
	capabilities?: CapabilityTypes[];
}

// Since ts-sdk 0.2.1 the order requests wrap the selection in an `OrderCriteria` object (quantity stays
// at the root). The product/location/ISP/billing cycle — and, for an order, the payment method — all live
// under `criteria`.
function orderCriteria(selection: OrderSelection, paymentMethod?: PaymentMethods) {
	return {
		productId: selection.productId,
		locationId: selection.locationId,
		ispId: selection.ispId,
		billingCycle: selection.billingCycle,
		...(selection.capabilities?.length ? { capabilities: selection.capabilities } : {}),
		...(paymentMethod ? { paymentMethod } : {}),
	};
}

/** Live price preview for the current selection. */
export async function previewOrder(selection: OrderSelection): Promise<Plain<PreviewOrderResponse> | null> {
	const preview = await getConnect().orders.preview.post({
		quantity: selection.quantity,
		criteria: orderCriteria(selection),
	});
	return preview ? toPlain(preview) : null;
}

/** Places a paid order for the signed-in customer. Returns the created order (with payment url). */
export async function createOrder(
	selection: OrderSelection,
	paymentMethod: PaymentMethods,
	isAutoRenew = false,
): Promise<Plain<CreateOrderResponse> | null> {
	const session = await auth();
	const customerId = session?.user?.id;
	if (!customerId) throw new Error("You must be signed in to place an order.");

	const order = await getConnect().orders.post({
		quantity: selection.quantity,
		customerId,
		isAutoRenew,
		criteria: orderCriteria(selection, paymentMethod),
	});
	return order ? toPlain(order) : null;
}

/** Renews an existing order for another billing cycle. Returns the extend result (may carry a payment url). */
export async function extendOrder(orderId: string, request: ExtendOrderRequest): Promise<Plain<ExtendOrderResponse> | null> {
	if (!orderId) throw new Error("orderId is required");
	const result = await getConnect().orders.byId(orderId).extend.post(request);
	return result ? toPlain(result) : null;
}

/**
 * Cancels an order: stops it renewing. By default the paid period is kept until expiry; pass
 * `immediate` to end it now. (Refunds aren't requested here.)
 */
export async function cancelOrder(orderId: string, immediate = false): Promise<void> {
	if (!orderId) throw new Error("orderId is required");
	await getConnect().orders.byId(orderId).delete({ immediateCancellation: immediate, askRefund: false });
}