import React from 'react';
import { LanguageContext, useLanguageProvider } from '@/hooks/use-language';

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const languageValue = useLanguageProvider();

  return (
    <LanguageContext.Provider value={languageValue}>
      {children}
    </LanguageContext.Provider>
  );
}