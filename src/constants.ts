// Static option lists and their icons for the order builder. Data only — no components here.

import {
	Bitcoin,
	CalendarClock,
	CalendarDays,
	CalendarRange,
	CreditCard,
	type LucideIcon,
	Sun,
	Wallet,
} from "lucide-react";
import { BillingCyclesObject, PaymentMethodsObject } from "@hypelabs-llc/ts-sdk";
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
