// Static option lists and their icons for the order builder. Data only — no components here.

import {
	AlertTriangle,
	Bitcoin,
	CalendarClock,
	CalendarDays,
	CalendarRange,
	CheckCircle,
	Clock,
	CreditCard,
	type LucideIcon,
	Sun,
	Trash2,
	XCircle,
} from "lucide-react";
import { BillingCyclesObject, OrderStatusesObject, PaymentMethodsObject } from "@hypelabs-llc/ts-sdk";
import type { BillingCycles, PaymentMethods } from "@hypelabs-llc/ts-sdk";

export const BILLING_CYCLES: BillingCycles[] = [
	BillingCyclesObject.Daily,
	BillingCyclesObject.Weekly,
	BillingCyclesObject.Monthly,
	BillingCyclesObject.Quarterly,
	BillingCyclesObject.Yearly,
];

export const BILLING_ICONS: Record<string, LucideIcon> = {
	Daily: Sun,
	Weekly: CalendarDays,
	Monthly: CalendarRange,
	Quarterly: CalendarRange,
	Yearly: CalendarClock,
};

// Icon per payment method. The methods actually offered are derived at runtime from the org's
// configured payment processors (see getAvailablePaymentMethods), so there's no hardcoded list here.
export const PAYMENT_ICONS: Partial<Record<PaymentMethods, LucideIcon>> = {
	[PaymentMethodsObject.Cryptocurrency]: Bitcoin,
	[PaymentMethodsObject.CreditCard]: CreditCard
};

// Icon paired with each commercial order status, so the single status pill carries both its meaning and
// its tone (see statusTone / statusLabelKey in @/lib). Grace period reuses the warning triangle it had
// back when it was rendered as its own separate lifecycle badge.
export const STATUS_ICONS: Record<string, LucideIcon> = {
	[OrderStatusesObject.Active]: CheckCircle,
	[OrderStatusesObject.Pending]: Clock,
	[OrderStatusesObject.GracePeriod]: AlertTriangle,
	[OrderStatusesObject.Expired]: XCircle,
	[OrderStatusesObject.Deleted]: Trash2,
	Cancelled: XCircle,
};
