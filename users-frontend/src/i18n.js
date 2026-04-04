import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import hi from "./locales/hi.json";
import mr from "./locales/mr.json";

/* 🔥 GET SAVED LANGUAGE */
const savedLang = localStorage.getItem("lang");

/* 🔥 CLEAN LANGUAGE (en-IN → en) */
const getLanguage = () => {
  if (savedLang) return savedLang;

  const browserLang = navigator.language || navigator.userLanguage;

  if (browserLang.startsWith("hi")) return "hi";
  if (browserLang.startsWith("mr")) return "mr";

  return "en"; // default
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr }
    },

    /* ✅ GLOBAL LANGUAGE */
    lng: getLanguage(),

    fallbackLng: "en",

    /* ✅ IMPORTANT: Avoid region issues */
    load: "languageOnly",   // en-IN → en

    /* ✅ DEBUG (optional) */
    debug: false,

    interpolation: {
      escapeValue: false
    },

    react: {
      useSuspense: false
    }
  });

export default i18n;