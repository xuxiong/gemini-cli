/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReactNode } from 'react';
import type React from 'react';
import { createContext, useContext, useState } from 'react';
import {
  getLanguage,
  setLanguage as setLang,
  t as translate,
  getAvailableLanguages,
  type Locale,
} from '../../i18n/i18n.js';

// Define the context type
interface I18nContextType {
  language: Locale;
  setLanguage: (lang: Locale) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
  availableLanguages: Locale[];
  getCurrentLanguage: () => Locale;
}

// Create the context with default values
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Provider component
interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setInternalLanguage] = useState<Locale>(getLanguage());

  const handleSetLanguage = (lang: Locale) => {
    setLang(lang);
    setInternalLanguage(lang);
  };

  const contextValue: I18nContextType = {
    language,
    setLanguage: handleSetLanguage,
    t: translate,
    availableLanguages: getAvailableLanguages(),
    getCurrentLanguage: getLanguage,
  };

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
};

// Custom hook to use the i18n context
export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
