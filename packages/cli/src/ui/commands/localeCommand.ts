/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { OpenDialogActionReturn, SlashCommand } from './types.js';
import {
  setLanguage,
  getAvailableLanguages,
  t,
  getLanguage,
} from '../../i18n/i18n.js';

export const localeCommand: SlashCommand = {
  name: 'locale',
  description: t('app.commands.locale.description'),
  examples: ['/locale en', '/locale zh-CN'],
  action: async (args: string): Promise<OpenDialogActionReturn> => {
    const [langCode] = args.split(' ');

    if (!langCode) {
      return {
        type: 'info',
        text: t('app.commands.locale.currentLanguage', {
          language: getLanguage(),
        }),
      };
    }

    const availableLanguages = getAvailableLanguages();
    const validLangCode = availableLanguages.find((lang) => lang === langCode);

    if (validLangCode) {
      setLanguage(validLangCode);
      return {
        type: 'info',
        text: t('app.commands.locale.languageChanged', {
          language: langCode,
        }),
      };
    } else {
      return {
        type: 'error',
        text: t('app.commands.locale.unsupportedLanguage', {
          language: langCode,
          available: availableLanguages.join(', '),
        }),
      };
    }
  },
};
