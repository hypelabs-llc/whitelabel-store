import axios from "axios";
import { format, differenceInDays, differenceInHours, differenceInMinutes, isValid } from "date-fns";
import type { Order, Plain } from "@hypelabs-llc/ts-sdk";

// JSX helpers live in ./utils; re-export them so `@/lib` stays the single import surface.
export * from "./utils";

// Pick black or white for text on a given background, using WCAG relative luminance (sRGB linearized
// and channel-weighted) — more accurate than a naive average, so vivid colors like magenta correctly
// get white text. Falls back to white on a malformed hex.
export const getReadableTextColor = (background: string): "#000000" | "#FFFFFF" => {
	const hex = background.replace("#", "").trim();
	const full =
		hex.length === 3
			? hex
					.split("")
					.map((char) => char + char)
					.join("")
			: hex;
	if (full.length !== 6 || /[^0-9a-fA-F]/.test(full)) return "#FFFFFF";

	const channel = (start: number) => {
		const value = parseInt(full.slice(start, start + 2), 16) / 255;
		return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
	};
	const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);

	return luminance > 0.5 ? "#000000" : "#FFFFFF";
};

export const getCachedConfiguration = <T,>(): T | undefined => {
	// SSR-safe: localStorage doesn't exist during Next's server render / prerender.
	if (typeof window === "undefined") return undefined;
	const item = localStorage.getItem("configuration");
	return item ? (JSON.parse(item) as T) : undefined;
};

export const resolveUrl = (url?: string | null) => (url?.startsWith("/") ? `${axios.defaults.baseURL ?? ""}${url}` : (url ?? undefined));

export const shortId = (guid: string) => guid.split("-")[0];

// Turns an ISO country code (FR, ES, …) into its full name (France, Spain), localized to the given
// language via the built-in Intl.DisplayNames — no extra dependency. Falls back to the raw code.
export const countryName = (isoCode?: string | null, locale: string = "en"): string => {
	if (!isoCode) return "";
	try {
		return new Intl.DisplayNames([locale], { type: "region" }).of(isoCode.toUpperCase()) ?? isoCode;
	} catch {
		return isoCode;
	}
};

export const ispIconUrl = (ispId: string) => resolveUrl(`/cdn/isps/${ispId}.jpg`)!;

export const formatPrice = (amount: number, currency: string = "USD", fractionDigits: number = 2): string =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
	}).format(amount);

// Time remaining as the finest useful unit: days when >= 1 day, else hours when >= 1 hour, else minutes
// (so something expiring in under an hour shows "45m" rather than "0h"). Clamped at zero.
export const timeLeft = (expiresAt: Date): { value: number; unit: "days" | "hours" | "minutes" } => {
	const now = new Date();
	const days = differenceInDays(expiresAt, now);
	if (days >= 1) return { value: days, unit: "days" };
	const hours = differenceInHours(expiresAt, now);
	if (hours >= 1) return { value: hours, unit: "hours" };
	return { value: Math.max(0, differenceInMinutes(expiresAt, now)), unit: "minutes" };
};

// Safe date format: SDK dates can be null/invalid, so render a dash rather than crash.
export const formatDate = (value: unknown): string => {
	if (!value) return "-";
	const date = new Date(value as string);
	return isValid(date) ? format(date, "MMM dd, yyyy") : "-";
};

// Plain IPv4 only (no CIDR, no IPv6): four 0-255 octets.
export const isIpv4 = (value: string): boolean => {
	const parts = value.split(".");
	if (parts.length !== 4) return false;
	return parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
};

// Count of delivered resources (proxies) across an order's line items.
export const resourceCount = (order: Plain<Order>): number =>
	(order.items ?? []).reduce((total, item) => total + (item.resourceIds?.length ?? 0), 0);

// Whether a nav link is active. "/" matches only itself; any other href matches when the current path
// starts with it (so nested routes keep the parent link active).
export const isActive = (href: string, pathname: string): boolean =>
	href === "/" ? pathname === "/" : pathname.startsWith(href);
