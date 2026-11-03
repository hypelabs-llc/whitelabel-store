"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useConfiguration } from "@/contexts/configuration";
import { useSession } from "@/lib/useSession";
import { resolveUrl } from "@/lib";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DynamicHead } from "@/components/DynamicHead";
import LanguageSwitcher from "@/components/shell/LanguageSwitcher";
import { useMounted } from "@/lib/useMounted";
import useSWR from "swr";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	const { t, i18n } = useTranslation();
	const configuration = useConfiguration();
	const { data: versionInfo } = useSWR<{ version: string }>("/api/version", { refreshInterval: 0, suspense: false });
	const { theme, resolvedTheme, setTheme } = useTheme();
	// next-themes only knows the real theme after mount; before that, server and client must agree.
	const mounted = useMounted();
	const cycleTheme = () => setTheme(theme === "dark" ? "light" : theme === "light" ? "system" : "dark");
	const themeIcon = !mounted ? <Monitor className="size-5" /> : theme === "dark" ? <Sun className="size-5" /> : theme === "light" ? <Moon className="size-5" /> : <Monitor className="size-5" />;
	const pathname = usePathname();
	const { status } = useSession();
	const router = useRouter();
	const logoUrl = resolveUrl(configuration?.branding?.logoLightUrl);
	const logoDarkUrl = resolveUrl(configuration?.branding?.logoDarkUrl) ?? logoUrl;
	const storeName = configuration?.storeName;
	// Only redirect away once we're certain the user is signed in — never while the session is still
	// loading, otherwise the form flashes and vanishes. The form stays visible when unauthenticated.
	useEffect(() => {
		if (status === "authenticated") router.replace("/");
	}, [status, router]);
	if (status === "authenticated") {
		return null;
	}
	return (
		<div className="flex min-h-screen flex-col bg-surface-muted">
			<DynamicHead lang={i18n.resolvedLanguage ?? "en"} />

			{/* Top bar: logo left, controls right — like Proxyware. Absolute so it doesn't offset the
			    vertical centering of the form in the page. */}
			<header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5">
				<Link href="/" aria-label={storeName ?? "Home"} className="flex items-center">
					{configuration &&
						(logoUrl ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img alt={storeName ?? "Logo"} src={mounted && resolvedTheme === "dark" ? logoDarkUrl : logoUrl} className="h-7 max-w-[75%] w-auto object-contain" />
						) : (
							<span className="text-xl font-bold text-fg-strong">{storeName}</span>
						))}
				</Link>
				<div className="flex items-center gap-2">
					<LanguageSwitcher />
					<button
						type="button"
						onClick={cycleTheme}
						aria-label="Toggle theme"
						className="flex items-center justify-center rounded-full p-1.5 text-muted transition-colors hover:text-fg"
					>
						{themeIcon}
					</button>
				</div>
			</header>

			<main className="flex flex-1 items-center justify-center px-6">
				<div className="w-full max-w-md">
					<div className="mb-6 space-y-1 text-center" suppressHydrationWarning>
						<h1 className="text-2xl font-semibold tracking-tight text-fg-strong">
							{mounted ? (pathname === "/auth/register" ? t("auth.createAccount") : t("auth.welcomeBack")) : null}
						</h1>
						<p className="text-sm text-muted">
							{mounted ? (pathname === "/auth/register" ? t("auth.registerSubtitle") : t("auth.signInSubtitle")) : null}
						</p>
					</div>

					<div className="rounded-xl border border-line bg-surface p-6 shadow-sm sm:p-8">{children}</div>

					<p className="mt-8 text-center text-sm text-muted">
						{pathname === "/auth/register" ? (
							<>
								{t("auth.haveAccount")}{" "}
								<Link href="/auth/login" className="font-medium text-brand hover:underline">
									{t("auth.signInHere")}
								</Link>
							</>
						) : (
							<>
								{t("auth.noAccount")}{" "}
								<Link href="/auth/register" className="font-medium text-brand hover:underline">
									{t("auth.registerHere")}
								</Link>
							</>
						)}
					</p>
				</div>
			</main>

			<footer className="absolute inset-x-0 bottom-0 px-6 py-5 text-center text-xs text-muted">
				{versionInfo?.version ? <span>v{versionInfo.version}</span> : null}
			</footer>
		</div>
	);
}
