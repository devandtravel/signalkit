import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ru from "./locales/ru.json";

const i18nInstance = i18n.use(initReactI18next);

if (typeof window !== "undefined") {
  i18nInstance.use(LanguageDetector);
}

i18nInstance.init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
  fallbackLng: "en",
  load: "languageOnly",
  interpolation: {
    escapeValue: false,
  },
  detection: {
    order: ["cookie", "localStorage", "navigator"],
    caches: ["cookie", "localStorage"],
    lookupCookie: "i18next",
    cookieOptions: { path: "/", maxAge: 31536000, sameSite: "lax" },
  },
});

export default i18n;
