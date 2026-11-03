import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import ru from "./locales/ru.json";
import zh from "./locales/zh.json";
import es from "./locales/es.json";
import pt from "./locales/pt.json";
import uk from "./locales/uk.json";

export const SUPPORTED_LANGUAGES = ["en", "ru", "zh", "es", "pt", "uk"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Initialized on both server (prerender) and client so useTranslation() never touches an
// uninitialized instance. The browser language detector is client-only; on the server we just
// start from the fallback language, and the client re-detects on hydration.
const isBrowser = typeof window !== "undefined";

if (!i18n.isInitialized) {
	if (isBrowser) i18n.use(LanguageDetector);
	i18n.use(initReactI18next).init({
		resources: {
			en: { translation: en },
			ru: { translation: ru },
			zh: { translation: zh },
			es: { translation: es },
			pt: { translation: pt },
			uk: { translation: uk },
		},
		lng: isBrowser ? undefined : "en",
		fallbackLng: "en",
		supportedLngs: SUPPORTED_LANGUAGES,
		nonExplicitSupportedLngs: true,
		detection: {
			order: ["localStorage", "navigator"],
			lookupLocalStorage: "language",
			caches: ["localStorage"],
		},
		interpolation: { escapeValue: false },
	});
}

export default i18n;
