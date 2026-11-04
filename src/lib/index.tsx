"use client";

import axios from "axios";

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
