import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ConfigurationProvider } from "@/contexts/configuration";
import { getConfiguration } from "@/lib/connect";
import { Providers } from "./providers";
import "./globals.css";

// Inter with contextual alternates + stylistic sets for a crisp, modern dashboard feel.
const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

// Metadata is per-tenant: build it from the store config so the title and the "%s | Store" template
// carry the tenant's name. Page-level metadata (e.g. title "Reviews") fills the %s.
export async function generateMetadata(): Promise<Metadata> {
	const { storeName, store, branding } = await getConfiguration();
	const name = storeName ?? "Store";
	return {
		title: {
			default: name,
			template: `%s | ${name}`,
		},
		description: store?.tagline ?? undefined,
		// Per-tenant favicon from branding; falls back to the app default when unset.
		icons: branding?.iconUrl ? { icon: branding.iconUrl } : undefined,
	};
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	// Load the tenant's branding/store config server-side so the first paint is already branded.
	const configuration = await getConfiguration();

	return (
		// suppressHydrationWarning: next-themes sets the `class`/color scheme on <html> before React
		// hydrates, which would otherwise trip the hydration mismatch check.
		<html lang="en" className={`h-full ${inter.variable}`} suppressHydrationWarning>
			<body className="h-full">
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="theme">
					<ConfigurationProvider value={configuration}>
						<Providers>{children}</Providers>
					</ConfigurationProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
