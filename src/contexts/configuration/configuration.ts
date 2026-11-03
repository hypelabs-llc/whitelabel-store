import type { OrganizationBranding, OrganizationStore, Plain } from "@hypelabs-llc/ts-sdk";

// The white-label configuration the app renders with: the tenant's branding and storefront, straight
// from the Connect SDK models (no hand-written DTOs), plus the few fields Connect doesn't expose.
export interface Configuration {
	/** Accent color + logos. From `organizations.branding`. */
	branding: Plain<OrganizationBranding>;
	/** Storefront settings (name, tagline, documentation, tabs, support…). From `organizations.store`. */
	store: Plain<OrganizationStore>;
	/** Display name of the store. Prefer `store.name` (SDK 0.2.3); this is the app-side fallback. */
	storeName?: string;
}

// Neutral fallback used only when Connect's branding/store reads fail, so the app always has a valid
// Configuration to render. No fake identity (no demo name, logos, tagline or banner): empty branding and
// store. The brand color falls back to the neutral default in globals.css, storeName is undefined so
// metadata uses its own "Store" default, and feature tabs stay off until the real store config says so.
export const FALLBACK_CONFIGURATION: Configuration = { branding: {}, store: {} };
