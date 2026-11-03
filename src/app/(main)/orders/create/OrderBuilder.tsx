"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useSWR from "swr";
import { BillingCyclesObject, PaymentMethodsObject } from "@hypelabs-llc/ts-sdk";
import type { BillingCycles, PaymentMethods, Product, Location, Isp, Capability, CapabilityTypes, PreviewOrderResponse, Plain } from "@hypelabs-llc/ts-sdk";
import { useTranslation } from "react-i18next";
import { previewOrder, createOrder } from "@/lib/actions/order";
import { Heading } from "@/components/ui";
import { LocationSelector } from "./LocationSelector";
import { IspSelector } from "./IspSelector";
import { CapabilitySelector } from "./CapabilitySelector";
import { BillingCycleSelector } from "./BillingCycleSelector";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { OrderSummary } from "./OrderSummary";

// Only crypto is offered for now.
const PAYMENT_METHODS: PaymentMethods[] = [PaymentMethodsObject.Cryptocurrency];

// Orchestrates the order flow: holds the selection state, drives the location → ISP cascade and the
// live price preview through server actions, and composes the step selectors + summary. Product is
// hardcoded (Mobile Proxies) for now, so there is no visible product step.
export function OrderBuilder() {
	const { t } = useTranslation();
	const router = useRouter();

	// Products load via SWR in suspense mode, so `products` is always defined here (the page's <Suspense>
	// shows the fallback until then).
	const { data: products = [] } = useSWR<Plain<Product>[]>("/api/catalog/products");

	// Default to the "mobile" product if present, else the first — always a value so the tree works.
	const defaultProductId =
		products.find((product) => /mobile/i.test(product.name ?? "") || /mobile/i.test(String(product.id)))?.id ??
		products[0]?.id ??
		null;

	const [productId] = useState<string | null>(defaultProductId ? String(defaultProductId) : null);
	const [locationId, setLocationId] = useState<string | null>(null);
	const [ispId, setIspId] = useState<string | null>(null);
	const [selectedCapabilities, setSelectedCapabilities] = useState<CapabilityTypes[]>([]);
	const [quantity, setQuantity] = useState(1);
	const [autoRenew, setAutoRenew] = useState(true);
	const [billingCycle, setBillingCycle] = useState<BillingCycles>(BillingCyclesObject.Monthly);
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethods | null>(PAYMENT_METHODS[0] ?? null);
	const [preview, setPreview] = useState<Plain<PreviewOrderResponse> | null>(null);

	const [submitting, startSubmitting] = useTransition();

	// Dependent cascade: each level fetches only once the one above it has a value (a null SWR key skips
	// the request). locations ← product, isps ← product+location, capabilities ← location+ISP.
	// Non-suspense: these are conditional (null key = skip) and use isLoading for per-step spinners, so
	// they must not suspend the whole builder.
	const { data: locations = [], isLoading: loadingLocations } = useSWR<Plain<Location>[]>(
		productId ? `/api/catalog/locations?productId=${productId}` : null,
		{ suspense: false },
	);
	const { data: isps = [], isLoading: loadingIsps } = useSWR<Plain<Isp>[]>(
		productId && locationId ? `/api/catalog/isps?productId=${productId}&locationId=${locationId}` : null,
		{ suspense: false },
	);
	const { data: capabilities = [], isLoading: loadingCapabilities } = useSWR<Plain<Capability>[]>(
		locationId && ispId ? `/api/catalog/capabilities?locationId=${locationId}&ispId=${ispId}` : null,
		{ suspense: false },
	);

	const product = useMemo(() => products.find((product) => String(product.id) === productId) ?? null, [products, productId]);
	const location = useMemo(() => locations.find((location) => location.id === locationId) ?? null, [locations, locationId]);
	const isp = useMemo(() => isps.find((isp) => isp.id === ispId) ?? null, [isps, ispId]);

	// Preselect the first in-stock location once they load. Only in-stock: an out-of-stock selection makes
	// the price preview fail (StockInsufficient) and leaves the summary stuck on the base price.
	useEffect(() => {
		if (locationId || locations.length === 0) return;
		const preselected = locations.find((location) => (location.availableProxies ?? 0) > 0);
		if (preselected?.id) setLocationId(preselected.id);
	}, [locations, locationId]);

	// Preselect the first in-stock ISP once they load for the current location.
	useEffect(() => {
		if (ispId || isps.length === 0) return;
		const preselected = isps.find((isp) => (isp.availableProxies ?? 0) > 0);
		if (preselected?.id) setIspId(preselected.id);
	}, [isps, ispId]);

	// Reset the ISP when the location changes, and clear capability selection when the location/ISP change
	// (requirements are optional, so nothing is preselected).
	useEffect(() => {
		setIspId(null);
	}, [locationId]);
	useEffect(() => {
		setSelectedCapabilities([]);
	}, [locationId, ispId]);

	const toggleCapability = (type: CapabilityTypes) =>
		setSelectedCapabilities((current) =>
			current.includes(type) ? current.filter((t) => t !== type) : [...current, type],
		);

	// Live price preview whenever the full selection or quantity/cycle changes.
	useEffect(() => {
		if (!productId || !locationId || !ispId) {
			setPreview(null);
			return;
		}
		let cancelled = false;
		previewOrder({ productId, locationId, ispId, quantity, billingCycle, capabilities: selectedCapabilities })
			.then((p) => !cancelled && setPreview(p))
			.catch(() => !cancelled && setPreview(null));
		return () => {
			cancelled = true;
		};
	}, [productId, locationId, ispId, quantity, billingCycle, selectedCapabilities]);

	const currency = preview?.currency ?? "USD";
	const unitPrice = preview?.unitPrice ?? product?.basePrice ?? 0;
	const total = preview?.total ?? unitPrice * quantity;

	// Quantity can't exceed what's in stock for the current selection: the preview's availableProxies is
	// the authoritative count, falling back to the selected ISP's (then location's) stock before preview
	// resolves. Keep at least 1 so the stepper always has a valid range.
	const maxQuantity = Math.max(
		1,
		preview?.availableProxies ?? isp?.availableProxies ?? location?.availableProxies ?? 1,
	);
	// If the selection shrank the available stock below the current quantity, clamp it down.
	useEffect(() => {
		setQuantity((q) => Math.min(q, maxQuantity));
	}, [maxQuantity]);

	// Auto-renew makes no sense for a one-off crypto payment (there's nothing to charge on renewal), so
	// it's hidden and never sent for crypto.
	const isCrypto = paymentMethod === PaymentMethodsObject.Cryptocurrency;
	const effectiveAutoRenew = autoRenew && !isCrypto;

	const canOrder = Boolean(productId && locationId && ispId && paymentMethod) && !submitting;

	const selection = () =>
		productId && locationId && ispId
			? { productId, locationId, ispId, quantity, billingCycle, capabilities: selectedCapabilities }
			: null;

	const submit = () => {
		const sel = selection();
		if (!sel || !paymentMethod) return;
		startSubmitting(async () => {
			try {
				const result = await createOrder(sel, paymentMethod, effectiveAutoRenew);
				if (result?.returnUrl) window.location.assign(result.returnUrl);
				else router.push("/orders");
			} catch {
				toast.error(t("orderDialog.orderFailed"));
			}
		});
	};

	return (
		<div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:gap-16">
			<div className="space-y-12">
				<Heading title={t("orderDialog.title")} subtitle={t("orderDialog.subtitle")} />

				<LocationSelector index="01" locations={locations} loading={loadingLocations} selectedId={locationId} onSelect={setLocationId} />
				<IspSelector index="02" isps={isps} loading={loadingIsps} selectedId={ispId} onSelect={setIspId} />
				<CapabilitySelector index="03" capabilities={capabilities} loading={loadingCapabilities} selected={selectedCapabilities} onToggle={toggleCapability} />
				<BillingCycleSelector index="04" value={billingCycle} onChange={setBillingCycle} />
				<PaymentMethodSelector index="05" methods={PAYMENT_METHODS} value={paymentMethod} onChange={setPaymentMethod} />
			</div>

			<OrderSummary
				location={location}
				isp={isp}
				currency={currency}
				unitPrice={unitPrice}
				total={total}
				preview={preview}
				quantity={quantity}
				maxQuantity={maxQuantity}
				onQuantityChange={setQuantity}
				autoRenew={autoRenew}
				onAutoRenewChange={setAutoRenew}
				showAutoRenew={!isCrypto}
				canOrder={canOrder}
				submitting={submitting}
				onOrder={submit}
			/>
		</div>
	);
}
