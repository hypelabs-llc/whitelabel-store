"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useConfiguration } from "@/contexts/configuration";
import { useSession } from "@/lib/useSession";
import Banner from "@/components/Banner";
import CrispChat from "@/components/CrispChat";
import { DynamicHead } from "@/components/DynamicHead";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/shell/TopBar";
import MobileNav from "@/components/shell/MobileNav";

export default function Layout({ children }: { children: React.ReactNode }) {
	const { i18n } = useTranslation();
	const configuration = useConfiguration();
	const { status } = useSession();
	const router = useRouter();
	const [mobileNavOpen, setMobileNavOpen] = useState(false);

	// Auth is NextAuth's session cookie. Only bounce to login once the session has resolved to
	// "unauthenticated" — never during "loading", or a signed-in user flashes to the login page.
	useEffect(() => {
		if (status === "unauthenticated") router.replace("/auth/login");
	}, [status, router]);

	// While the session is loading or the user is not signed in, render nothing (no app chrome).
	if (status !== "authenticated") {
		return null;
	}

	return (
		<div className="flex h-screen w-full flex-col overflow-hidden bg-surface-muted">
			<DynamicHead
				lang={i18n.resolvedLanguage ?? "en"}
				brandColor={configuration?.branding?.accentColor}
				brandColorDark={configuration?.branding?.accentColor ?? configuration?.branding?.accentColor}
			/>

			{/* Brand banner pinned to the very top, full width, above the sidebar and everything else. */}
			{configuration?.store?.topBannerMessage && <Banner />}

			<div className="flex min-h-0 flex-1 overflow-hidden">
				<Sidebar />
				<div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
					<TopBar onOpenMobileNav={() => setMobileNavOpen((prev) => !prev)} />
					<MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
					<main role="main" className="flex min-w-0 flex-1 flex-col overflow-y-auto p-6 sm:px-8 sm:py-12">
						<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">{children}</div>
					</main>
				</div>
			</div>

			{configuration?.store?.crispWorkspaceId && <CrispChat websiteId={configuration.store.crispWorkspaceId} />}
		</div>
	);
}
