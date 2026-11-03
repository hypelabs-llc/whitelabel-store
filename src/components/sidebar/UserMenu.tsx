"use client";

import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/useSession";

/** Account block pinned to the bottom of the sidebar: avatar, name, and a sign-out control. */
export default function UserMenu() {
	const { t } = useTranslation();
	const { user, signOut } = useSession();

	const name = user?.name?.trim() || "Account";
	const avatarUrl = user?.avatarUrl ?? undefined;

	return (
		<div className="flex items-center gap-3 rounded-md border border-line bg-surface p-2.5">
			{avatarUrl ? (
				/* eslint-disable-next-line @next/next/no-img-element */
				<img
					src={avatarUrl}
					alt=""
					width={36}
					height={36}
					className="h-9 w-9 shrink-0 rounded-full border border-line object-cover"
				/>
			) : (
				<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
					{name.charAt(0).toUpperCase()}
				</div>
			)}
			<div className="min-w-0 flex-1">
				<div className="truncate text-sm font-medium text-fg-strong">{name}</div>
			</div>
			<button
				type="button"
				onClick={() => signOut()}
				aria-label={t("header.signOut")}
				title={t("header.signOut")}
				className="shrink-0 rounded-sm p-1.5 text-muted transition-colors hover:bg-surface-elevated hover:text-red-500"
			>
				<LogOut size={16} />
			</button>
		</div>
	);
}
