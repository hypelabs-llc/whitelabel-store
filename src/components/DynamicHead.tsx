"use client";

// Replaces the react-helmet-async <Helmet> blocks from the Vite app (which have no place in Next's
// App Router). Sets the <html lang> and the dynamic theme-color meta tags imperatively via effects,
// which is SSR-safe and needs no provider. Renders nothing.

import { useEffect } from "react";

function setThemeColorMeta(media: string, content?: string | null) {
	if (!content) return;
	const selector = `meta[name="theme-color"][media="${media}"]`;
	let el = document.head.querySelector<HTMLMetaElement>(selector);
	if (!el) {
		el = document.createElement("meta");
		el.setAttribute("name", "theme-color");
		el.setAttribute("media", media);
		document.head.appendChild(el);
	}
	el.setAttribute("content", content);
}

export function DynamicHead({
	lang,
	brandColor,
	brandColorDark,
}: {
	lang?: string;
	brandColor?: string | null;
	brandColorDark?: string | null;
}) {
	useEffect(() => {
		if (lang) document.documentElement.lang = lang;
	}, [lang]);

	useEffect(() => {
		setThemeColorMeta("(prefers-color-scheme: light)", brandColor);
		setThemeColorMeta("(prefers-color-scheme: dark)", brandColorDark ?? brandColor);
	}, [brandColor, brandColorDark]);

	return null;
}
