"use client";

// Injects the tenant's custom CSS and JS (OrganizationStore.customCss / customJs, SDK 0.2.4) into the
// page. This is white-label configuration set by the store owner through Connect — not user input — so
// running it is intended. CSS goes in a <style>, JS in a <script>, both tagged so we can update/remove
// them when the config changes.

import { useEffect } from "react";
import { useConfiguration } from "@/contexts/configuration";

const STYLE_ID = "tenant-custom-css";
const SCRIPT_ID = "tenant-custom-js";

export function CustomCode() {
	const configuration = useConfiguration();
	const customCss = configuration?.store?.customCss;
	const customJs = configuration?.store?.customJs;

	// Custom CSS: a single <style> in <head>, kept in sync with the config.
	useEffect(() => {
		let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
		if (!customCss) {
			style?.remove();
			return;
		}
		if (!style) {
			style = document.createElement("style");
			style.id = STYLE_ID;
			document.head.appendChild(style);
		}
		style.textContent = customCss;
	}, [customCss]);

	// Custom JS: appended once as a <script>. A script element only executes when first inserted, so on a
	// change we remove the old one and insert a fresh one.
	useEffect(() => {
		document.getElementById(SCRIPT_ID)?.remove();
		if (!customJs) return;
		const script = document.createElement("script");
		script.id = SCRIPT_ID;
		script.textContent = customJs;
		document.body.appendChild(script);
		return () => script.remove();
	}, [customJs]);

	return null;
}
