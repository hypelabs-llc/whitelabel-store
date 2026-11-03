"use client";

// The white-label configuration (store name, branding, feature flags). In the Vite app this lived
// inside RootLayout; extracted here into its own provider so every consumer imports it from a stable
// path (@/contexts/configuration) instead of a route component, and so the Next root layout
// stays a thin server component.
//
// Data note: the Connect SDK is server-side only, so the runtime configuration will ultimately be
// injected from a Server Component. For now this provider accepts an optional `value` (which the
// server can pass down later) and falls back to the locally cached configuration, without forcing a
// client-side data call on mount.

import { createContext, useContext, useEffect, useState } from "react";
import { type Configuration, FALLBACK_CONFIGURATION } from "./configuration";
import { getCachedConfiguration, getReadableTextColor } from "@/lib";

const ConfigurationContext = createContext<Configuration | undefined>(undefined);

export const useConfiguration = () => useContext(ConfigurationContext);

export function ConfigurationProvider({
	value,
	children,
}: {
	value?: Configuration;
	children: React.ReactNode;
}) {
	// Prefer a server-provided value; otherwise fall back to the last cached configuration. The cache
	// read is client-only (localStorage), loaded after mount to keep the server render SSR-safe.
	const [cached, setCached] = useState<Configuration | undefined>(undefined);
	useEffect(() => {
		if (!value) setCached(getCachedConfiguration<Configuration>());
	}, [value]);
	const configuration = value ?? cached ?? FALLBACK_CONFIGURATION;

	useEffect(() => {
		if (!configuration?.storeName) return;
		document.title = [configuration.storeName, configuration.store?.tagline].filter(Boolean).join(" | ");
	}, [configuration?.storeName, configuration?.store?.tagline]);

	useEffect(() => {
		// The SDK exposes a single accentColor; derive readable text for both themes from it.
		const brandColor = configuration?.branding?.accentColor;
		if (!brandColor) return;
		const root = document.documentElement.style;
		root.setProperty("--brand-color-light", brandColor);
		root.setProperty("--brand-color-dark", brandColor);
		root.setProperty("--brand-text-color-light", getReadableTextColor(brandColor));
		root.setProperty("--brand-text-color-dark", getReadableTextColor(brandColor));
	}, [configuration?.branding?.accentColor]);

	useEffect(() => {
		if (configuration) localStorage.setItem("configuration", JSON.stringify(configuration));
	}, [configuration]);

	return <ConfigurationContext.Provider value={configuration}>{children}</ConfigurationContext.Provider>;
}
