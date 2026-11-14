"use server";

// Server Actions for the order builder. Everything runs on the server, so the Connect SDK (and its
// API key) never reaches the browser. Products are loaded in the page (a Server Component); these
// actions drive the location → ISP cascade, the live price preview, and order/trial creation.
//
// Every value crossing back to the client is passed through the SDK's toPlain() so it's a plain-data
// object (no Kiota Parsable methods / additionalData) — safe for the React server/client boundary,
// no hand-written DTOs. Disabled entries are filtered out server-side (disabled = hidden).

import { headers } from "next/headers";
import { getCustomerConnect } from "@/lib/connect";
import { toPlain } from "@hypelabs-llc/ts-sdk";
import type { PreviewOrderResponse, CreateOrderResponse, ExtendOrderRequest, ExtendOrderResponse, Plain } from "@hypelabs-llc/ts-sdk";
import type { BillingCycles, PaymentMethods, CapabilityTypes } from "@hypelabs-llc/ts-sdk";

// Resolves the customer-scoped client or throws a sign-in error. The customer is identified by the token.
async function customer() {
	const client = await getCustomerConnect();
	if (!client) throw new Error("You must be signed in.");
	return client;
}

// The storefront's own origin (scheme + host of the page the customer is on), reconstructed from the
// incoming request headers. Order/extend run as server actions, so the browser's Origin header never
// reaches Connect: without this, Connect builds the payment success URL from a null origin and falls back
// to its console host — leaking the platform to the reseller's customer. We forward it as `Origin` so the
// post-payment redirect lands back on this storefront, on whatever tenant domain served the page.
async function storeOrigin(): Promise<string | null> {
	const h = await headers();
	const origin = h.get("origin");
	if (origin) return origin;
	// No Origin header (same-origin server action): rebuild it from the forwarded proto + host.
	const host = h.get("x-forwarded-host") ?? h.get("host");
	if (!host) return null;
	const proto = h.get("x-forwarded-proto") ?? "https";
	return `${proto}://${host}`;
}

// Request configuration that forwards the storefront origin as `Origin`, or nothing when it can't be
// resolved (Connect then keeps its own fallback).
async function withStoreOrigin(): Promise<{ headers: Record<string, string> } | undefined> {
	const origin = await storeOrigin();
	return origin ? { headers: { Origin: origin } } : undefined;
}

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
	const preview = await (await customer()).orders.preview.post({
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
	// The customer is identified by the token, so customerId is no longer passed. Origin is forwarded so
	// the payment success URL points back at this storefront, not Connect's console.
	const order = await (await customer()).orders.post(
		{
			quantity: selection.quantity,
			isAutoRenew,
			criteria: orderCriteria(selection, paymentMethod),
		},
		await withStoreOrigin(),
	);
	return order ? toPlain(order) : null;
}

/** Renews an existing order for another billing cycle. Returns the extend result (may carry a payment url). */
export async function extendOrder(orderId: string, request: ExtendOrderRequest): Promise<Plain<ExtendOrderResponse> | null> {
	if (!orderId) throw new Error("orderId is required");
	// Origin forwarded so the extend's payment success URL stays on this storefront (see createOrder).
	const result = await (await customer()).orders.byId(orderId).extend.post(request, await withStoreOrigin());
	return result ? toPlain(result) : null;
}

/**
 * Cancels an order: stops it renewing. By default the paid period is kept until expiry; pass
 * `immediate` to end it now. (Refunds aren't requested here.)
 */
export async function cancelOrder(orderId: string, immediate = false): Promise<void> {
	if (!orderId) throw new Error("orderId is required");
	await (await customer()).orders.byId(orderId).delete({ immediateCancellation: immediate, askRefund: false });
}