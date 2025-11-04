/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import en from './locales/en.json' with { type: 'json' }; // eslint-disable-line import/no-internal-modules
import zhCN from './locales/zh-CN.json' with { type: 'json' }; // eslint-disable-line import/no-internal-modules

// Define the supported locales
export type Locale = 'en' | 'zh-CN';

// Translation resources type
interface TranslationResources {
  [key: string]: string | TranslationResources;
}

const resources: Record<Locale, TranslationResources> = {
  en,
  'zh-CN': zhCN,
};

// Current active language
let currentLanguage: Locale = 'en';

// Determine the initial language based on environment or settings
const getInitialLanguage = (): Locale => {
  // Check if user has set a language preference in settings
  // This will be implemented to read from the user's config later
  const userPreferredLang =
    process.env['GEMINI_CLI_LANG'] ||
    process.env['LANG']?.substring(0, 5) ||
    process.env['LC_ALL']?.substring(0, 5) ||
    'en';

  // Return supported language, defaulting to English
  if (userPreferredLang.startsWith('zh')) {
    return 'zh-CN';
  }

  return 'en';
};

// Initialize with the initial language
currentLanguage = getInitialLanguage();

// Function to translate a key
export const t = (
  key: string,
  replacements?: Record<string, string>,
): string => {
  // Navigate through the nested object to find the translation
  const keys = key.split('.');
  let translation: unknown = resources[currentLanguage];

  for (const k of keys) {
    if (translation && typeof translation === 'object') {
      translation = (translation as Record<string, unknown>)[k];
    } else {
      break; // Could not find the key in the current language
    }
  }

  // If the key wasn't found in the current language, try English as fallback
  if (typeof translation !== 'string') {
    let fallbackTranslation: unknown = resources['en'];
    for (const fallbackKey of keys) {
      if (fallbackTranslation && typeof fallbackTranslation === 'object') {
        fallbackTranslation = (fallbackTranslation as Record<string, unknown>)[
          fallbackKey
        ];
      } else {
        return key; // Return the key itself if no translation is found even in fallback
      }
    }

    // If fallback was found, use it
    if (typeof fallbackTranslation === 'string') {
      translation = fallbackTranslation;
    } else {
      return key; // Return the key if no valid translation is found
    }
  }

  // Perform replacements if provided
  if (replacements) {
    let result = translation as string;
    for (const [placeholder, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(`{{${placeholder}}}`, 'g'), value);
    }
    return result;
  }

  return translation as string;
};

// Function to set the active language
export const setLanguage = (lang: Locale): void => {
  if (lang in resources) {
    currentLanguage = lang;
  }
};

// Function to get the active language
export const getLanguage = (): Locale => currentLanguage;

// Function to get all available languages
export const getAvailableLanguages = (): Locale[] =>
  Object.keys(resources) as Locale[];

// Initialize with the initial language setting
currentLanguage = getInitialLanguage();
