"use client";

import Nav from "@/components/sidebar/Nav";
import UserMenu from "@/components/sidebar/UserMenu";

/**
 * Slide-in nav for small screens, opened from the top bar's menu button. It is positioned `absolute`
 * inside its parent column (header + content), so `top-14` sits it right under the static h-14 header
 * whatever the banner above the column does — no viewport math. A plain panel (not Headless UI's Dialog)
 * because that portals to <body>, which would break the column anchoring. `md:hidden` — desktop uses
 * <Sidebar>.
 */
export default function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
	return (
		<div className="absolute bottom-0 left-0 right-0 top-14 z-30 md:hidden" aria-hidden={!open} style={{ pointerEvents: open ? "auto" : "none" }}>
			{/* Click-catcher: closes the drawer when tapping the content area beside it. */}
			<button
				type="button"
				aria-label="Close menu"
				tabIndex={-1}
				onClick={onClose}
				className={`absolute inset-0 cursor-default transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
			/>
			<aside
				role="dialog"
				aria-modal="true"
				className={`absolute bottom-0 left-0 top-0 flex w-[280px] max-w-[86%] flex-col gap-4 border-r border-line bg-surface px-4 py-5 shadow-xl transition-transform duration-200 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
			>
				<div className="flex-1 overflow-y-auto">
					<Nav onNavigate={onClose} />
				</div>
				<UserMenu />
			</aside>
		</div>
	);
}
