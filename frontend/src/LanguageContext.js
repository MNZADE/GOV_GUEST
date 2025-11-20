import React, { createContext, useState, useEffect } from "react";
import translations from "./translations";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("English");

  // Load saved preference
  useEffect(() => {
    const savedLang = localStorage.getItem("preferredLanguage");
    if (savedLang && translations[savedLang]) setLanguage(savedLang);
  }, []);

  // Save on change
  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("preferredLanguage", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};
