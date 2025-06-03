import { useState, useEffect, createContext, useContext } from 'react';
import { getTranslation, type TranslationKey, supportedLanguages } from '@shared/languages';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  t: (key: TranslationKey) => string;
  languages: typeof supportedLanguages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useLanguageProvider() {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Get language from localStorage or default to English
    return localStorage.getItem('preferred-language') || 'en';
  });

  const setLanguage = (language: string) => {
    setCurrentLanguage(language);
    localStorage.setItem('preferred-language', language);
    // Also set HTML lang attribute for accessibility
    document.documentElement.lang = language;
  };

  const t = (key: TranslationKey): string => {
    return getTranslation(key, currentLanguage);
  };

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  return {
    currentLanguage,
    setLanguage,
    t,
    languages: supportedLanguages
  };
}

export { LanguageContext };