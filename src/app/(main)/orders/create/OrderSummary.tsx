"use client";

import { ShoppingCart } from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { countryName, formatPrice, ispIconUrl } from "@/lib";
import { Button, Card } from "@/components/ui";
import type { Location, Isp, PreviewOrderResponse, Plain } from "@hypelabs-llc/ts-sdk";
import { QuantityStepper } from "./QuantityStepper";

// The sticky order summary: selection recap, live price breakdown, quantity, and the action buttons.
export function OrderSummary({
	location,
	isp,
	currency,
	unitPrice,
	total,
	preview,
	quantity,
	maxQuantity,
	onQuantityChange,
	autoRenew,
	onAutoRenewChange,
	showAutoRenew,
	canOrder,
	submitting,
	onOrder,
}: {
	location: Plain<Location> | null;
	isp: Plain<Isp> | null;
	currency: string;
	unitPrice: number;
	total: number;
	preview: Plain<PreviewOrderResponse> | null;
	quantity: number;
	maxQuantity: number;
	onQuantityChange: (quantity: number) => void;
	autoRenew: boolean;
	onAutoRenewChange: (autoRenew: boolean) => void;
	showAutoRenew: boolean;
	canOrder: boolean;
	submitting: boolean;
	onOrder: () => void;
}) {
	const { t, i18n } = useTranslation();
	const lang = i18n.resolvedLanguage ?? "en";
	const ispLogo = isp ? (isp.logoUrl ?? (isp.id ? ispIconUrl(isp.id) : undefined)) : undefined;
	return (
		<aside className="lg:sticky lg:top-8 lg:self-start">
			<Card className="p-6">
				<h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
					{t("orderDialog.summary")}
				</h3>

				<div className="mt-4 flex items-center gap-3">
					{/* Flag with the ISP logo as a small badge (like the proxy card). */}
					<div className="relative shrink-0">
						{location?.countryCode ? (
							<img
								src={`/images/flags/${location.countryCode.toLowerCase()}.svg`}
								alt={location.countryCode}
								className="h-10 w-10 rounded-full object-cover ring-4 ring-surface-muted"
							/>
						) : (
							<div className="h-10 w-10 rounded-full bg-surface-muted ring-4 ring-surface-muted" />
						)}
						{ispLogo && (
							<img
								src={ispLogo}
								alt={isp?.name ?? ""}
								className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full object-cover ring-2 ring-surface"
							/>
						)}
					</div>
					<div className="min-w-0">
						<div className="truncate font-semibold text-fg-strong">
							{location?.city ?? countryName(location?.countryCode, lang) ?? "—"}
						</div>
						<div className="truncate text-sm text-muted">{isp ? `${t("orderDialog.isp")}: ${isp.name}` : "—"}</div>
					</div>
				</div>

				<div className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
					<div className="flex justify-between">
						<span className="text-muted">{t("orderDialog.unitPrice")}</span>
						<span className="font-medium text-fg">{formatPrice(unitPrice, currency)}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted">{t("orderDialog.subtotal")}</span>
						<span className="font-medium text-fg">{formatPrice(preview?.subtotal ?? unitPrice * quantity, currency)}</span>
					</div>
					{preview?.discount ? (
						<div className="flex justify-between text-emerald-600 dark:text-emerald-400">
							<span>{t("orderDialog.discount")}</span>
							<span>-{formatPrice(preview.discount, currency)}</span>
						</div>
					) : null}
				</div>

				{/* Quantity lives in the summary card (like the mockup), next to the price. Capped by stock. */}
				<div className="mt-4 flex items-center justify-between border-t border-line pt-4">
					<span className="text-sm text-muted">{t("orderDialog.quantity")}</span>
					<QuantityStepper value={quantity} max={maxQuantity} onChange={onQuantityChange} />
				</div>

				{/* Automatic renewal toggle. Hidden for crypto (one-off payment, no recurring charge). */}
				{showAutoRenew && (
				<div className="mt-4 flex items-center justify-between border-t border-line pt-4">
					<span className="text-sm text-muted">{t("orderDialog.autoRenew")}</span>
					<div className="flex items-center rounded-full border border-line bg-surface p-0.5 text-sm font-medium">
						<button
							type="button"
							onClick={() => onAutoRenewChange(true)}
							className={clsx(
								"rounded-full px-3 py-1 transition-colors",
								autoRenew ? "bg-brand text-brand-contrast" : "text-muted hover:text-fg",
							)}
						>
							{t("orderDialog.on")}
						</button>
						<button
							type="button"
							onClick={() => onAutoRenewChange(false)}
							className={clsx(
								"rounded-full px-3 py-1 transition-colors",
								!autoRenew ? "bg-brand text-brand-contrast" : "text-muted hover:text-fg",
							)}
						>
							{t("orderDialog.off")}
						</button>
					</div>
				</div>
				)}

				<div className="mt-4 flex items-end justify-between border-t border-line pt-4">
					<span className="text-xs font-semibold uppercase tracking-widest text-muted">{t("orderDialog.total")}</span>
					<span className="text-3xl font-bold text-fg-strong">{formatPrice(total, currency)}</span>
				</div>

				<div className="mt-6">
					<Button icon={ShoppingCart} size="lg" block disabled={!canOrder} loading={submitting} onClick={onOrder}>
						{t("orderDialog.orderNow")}
					</Button>
				</div>
			</Card>
		</aside>
	);
}
