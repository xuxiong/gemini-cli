/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  SlashCommand,
  MessageActionReturn,
  CommandContext,
} from './types.js';
import { CommandKind } from './types.js';
import {
  setLanguage,
  getAvailableLanguages,
  t,
  getLanguage,
} from '../../i18n/i18n.js';

export const localeCommand: SlashCommand = {
  name: 'locale',
  description: t('app.commands.locale.description'),
  kind: CommandKind.BUILT_IN,
  action: async (
    context: CommandContext,
    args: string,
  ): Promise<MessageActionReturn> => {
    const [langCode] = args.split(' ');

    if (!langCode) {
      return {
        type: 'message',
        messageType: 'info',
        content: t('app.commands.locale.currentLanguage', {
          language: getLanguage(),
        }),
      };
    }

    const availableLanguages = getAvailableLanguages();
    const validLangCode = availableLanguages.find((lang) => lang === langCode);

    if (validLangCode) {
      setLanguage(validLangCode);
      return {
        type: 'message',
        messageType: 'info',
        content: t('app.commands.locale.languageChanged', {
          language: langCode,
        }),
      };
    } else {
      return {
        type: 'message',
        messageType: 'error',
        content: t('app.commands.locale.unsupportedLanguage', {
          language: langCode,
          available: availableLanguages.join(', '),
        }),
      };
    }
  },
};
