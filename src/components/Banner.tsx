"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useConfiguration } from "@/contexts/configuration";
import { useTranslation } from "react-i18next";

// localStorage key, scoped to the message so a new announcement shows again after the old one was dismissed.
const DISMISS_KEY = "banner-dismissed";

export default function Banner() {
	const { t } = useTranslation();
	const configuration = useConfiguration();
	const message = configuration?.store?.topBannerMessage;

	// Remembered per message: dismissing hides this exact announcement, a new one reappears.
	const [dismissed, setDismissed] = useState<boolean>(() => {
		if (typeof window === "undefined" || !message) return false;
		try {
			return localStorage.getItem(DISMISS_KEY) === message;
		} catch {
			return false;
		}
	});

	if (!message || dismissed) return null;

	const dismiss = () => {
		setDismissed(true);
		try {
			localStorage.setItem(DISMISS_KEY, message);
		} catch {
			// Ignore storage failures (private mode); the banner just reappears next load.
		}
	};

	return (
		<nav className="relative flex items-center justify-center bg-brand px-10 py-2.5 text-center text-xs text-brand-contrast">
			<span className="truncate">{message}</span>
			<button
				type="button"
				onClick={dismiss}
				aria-label={t("common.dismiss")}
				className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-brand-contrast/80 transition-colors hover:bg-black/10 hover:text-brand-contrast"
			>
				<X className="size-4" />
			</button>
		</nav>
	);
}
