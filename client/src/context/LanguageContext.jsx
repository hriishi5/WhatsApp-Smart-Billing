import { createContext, useContext, useState } from "react";

import en from "../Translations/en";
import kn from "../Translations/kn";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {

  const [language, setLanguage] = useState(

  localStorage.getItem("language") || "en"

); 

const changeLanguage = (lang) => {

    localStorage.setItem("language", lang);

    setLanguage(lang);

};

  const translations = {
    en,
    kn,
  };

  const value = {

language,

setLanguage: changeLanguage,

t: translations[language],

}

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}