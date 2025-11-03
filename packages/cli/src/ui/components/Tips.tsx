/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { type Config } from '@google/gemini-cli-core';
import { t } from '../../i18n/i18n.js';

interface TipsProps {
  config: Config;
}

export const Tips: React.FC<TipsProps> = ({ config }) => {
  const geminiMdFileCount = config.getGeminiMdFileCount();
  return (
    <Box flexDirection="column">
      <Text color={theme.text.primary}>{t('ui.tips.title')}</Text>
      <Text color={theme.text.primary}>1. {t('ui.tips.tip1')}</Text>
      <Text color={theme.text.primary}>2. {t('ui.tips.tip2')}</Text>
      {geminiMdFileCount === 0 && (
        <Text color={theme.text.primary}>
          3. {t('ui.tips.tip3', { fileName: 'GEMINI.md' })}
        </Text>
      )}
      <Text color={theme.text.primary}>
        {geminiMdFileCount === 0 ? '4.' : '3.'}{' '}
        <Text bold color={theme.text.accent}>
          /help
        </Text>{' '}
        {t('ui.tips.moreInfo')}
      </Text>
    </Box>
  );
};
