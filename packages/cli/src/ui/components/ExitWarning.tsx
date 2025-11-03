/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { Box, Text } from 'ink';
import { useUIState } from '../contexts/UIStateContext.js';
import { theme } from '../semantic-colors.js';
import { t } from '../../i18n/i18n.js';

export const ExitWarning: React.FC = () => {
  const uiState = useUIState();
  return (
    <>
      {uiState.dialogsVisible && uiState.ctrlCPressedOnce && (
        <Box marginTop={1}>
          <Text color={theme.status.warning}>
            {t('app.messages.exitWarningCtrlC')}
          </Text>
        </Box>
      )}

      {uiState.dialogsVisible && uiState.ctrlDPressedOnce && (
        <Box marginTop={1}>
          <Text color={theme.status.warning}>
            {t('app.messages.exitWarningCtrlD')}
          </Text>
        </Box>
      )}
    </>
  );
};
