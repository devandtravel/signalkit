import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLng = i18n.language === "en" ? "ru" : "en";
    i18n.changeLanguage(nextLng);
  };

  // Use the actual i18n language to match server-rendered state
  const currentLang = i18n.language || "en";

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:border-zinc-700 hover:text-white transition-all"
    >
      <span className={currentLang === "en" ? "text-white" : ""}>EN</span>
      <span className="text-zinc-700">/</span>
      <span className={currentLang === "ru" ? "text-white" : ""}>RU</span>
    </button>
  );
}
