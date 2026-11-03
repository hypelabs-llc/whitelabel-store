"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/i18n";

// Each language maps to its circle-flag (by country code) and display name. `flag: null` falls back to
// the Globe icon — used for English, which has no single-country flag here.
const LABELS: Record<SupportedLanguage, { flag: string | null; name: string }> = {
	en: { flag: null, name: "English" },
	ru: { flag: "ru", name: "Русский" },
	zh: { flag: "cn", name: "中文" },
	es: { flag: "es", name: "Español" },
	pt: { flag: "br", name: "Português" },
	uk: { flag: "ua", name: "Українська" },
};

function Flag({ code, className }: { code: string | null; className?: string }) {
	if (!code) return <Globe className={clsx("text-muted", className)} />;
	return <img src={`/images/circle-flags/${code}.svg`} alt="" className={clsx("rounded-full", className)} />;
}

export default function LanguageSwitcher() {
	const { i18n, t } = useTranslation();
	const resolved = i18n.resolvedLanguage;
	const current = (SUPPORTED_LANGUAGES.includes(resolved as SupportedLanguage) ? resolved : "en") as SupportedLanguage;

	return (
		<Menu as="div" className="relative">
			<MenuButton
				aria-label={t("language.label")}
				title={LABELS[current].name}
				className="flex items-center justify-center rounded-full p-1.5 text-muted transition-colors hover:text-fg"
			>
				<Flag code={LABELS[current].flag} className="size-5" />
			</MenuButton>
			<MenuItems
				anchor="bottom end"
				className="z-50 mt-2 w-40 origin-top-right rounded-lg border border-line bg-surface-elevated py-1 shadow-lg focus:outline-none"
			>
				{SUPPORTED_LANGUAGES.map((languageCode) => (
					<MenuItem key={languageCode}>
						<button
							type="button"
							onClick={() => i18n.changeLanguage(languageCode)}
							className={clsx(
								"flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm data-[focus]:bg-surface-muted data-[focus]:outline-none",
								languageCode === current ? "font-semibold text-fg-strong" : "text-fg",
							)}
						>
							<Flag code={LABELS[languageCode].flag} className="size-4 shrink-0" />
							{LABELS[languageCode].name}
						</button>
					</MenuItem>
				))}
			</MenuItems>
		</Menu>
	);
}
