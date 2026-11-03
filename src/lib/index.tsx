"use client";

import axios from "axios";

export const getReadableTextColor = (hexColor: string): "black" | "white" => {
	const hex = hexColor.replace("#", "");
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.5 ? "black" : "white";
};

export const getCachedConfiguration = <T extends any>(): T | undefined => {
	// SSR-safe: localStorage doesn't exist during Next's server render / prerender.
	if (typeof window === "undefined") return undefined;
	const item = localStorage.getItem("configuration");
	return item ? (JSON.parse(item) as T) : undefined;
};

export const resolveUrl = (url?: string | null) => url?.startsWith("/") ? `${axios.defaults.baseURL ?? ""}${url}` : (url ?? undefined);
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export const shortId = (guid: string) => guid.split("-")[0];

// Copy-to-clipboard button that briefly shows a "copied" state (green check) after a click.
export const CopyButton = ({ value }: { value: string }) => {
	const [copied, setCopied] = useState(false);
	const handleCopy = () => {
		navigator.clipboard.writeText(value);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};
	return (
		<button
			type={"button"}
			onClick={handleCopy}
			aria-label={copied ? "Copied" : "Copy"}
			className={"text-muted transition-colors hover:text-brand"}
		>
			{copied ? <Check className={"h-3.5 w-3.5 text-brand"} /> : <Copy className={"h-3.5 w-3.5"} />}
		</button>
	);
};

export const CopyableId = ({ id }: { id: string }) => (
	<span className={"inline-flex items-center gap-1.5 font-mono text-sm"}>
		#{shortId(id)}
		<CopyButton value={id} />
	</span>
);
export const locationIcon = (isoCode: string, dimmed: boolean = false) => <img src={`/images/flags/${isoCode.toLowerCase()}.svg`} alt={isoCode} className={`w-4 h-4 mr-2 ${dimmed ? "grayscale" : ""}`} />;

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
export const ispIcon = (ispId: string, dimmed: boolean = false) => <img src={ispIconUrl(ispId)} alt={""} className={`w-4 h-4 mr-2 ${dimmed ? "grayscale" : ""}`} />;

export const formatPrice = (amount: number, currency: string = "USD", fractionDigits: number = 2): string =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
	}).format(amount);
