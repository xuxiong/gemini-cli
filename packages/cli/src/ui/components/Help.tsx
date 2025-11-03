/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { type SlashCommand, CommandKind } from '../commands/types.js';
import { t } from '../../i18n/i18n.js';

interface Help {
  commands: readonly SlashCommand[];
}

export const Help: React.FC<Help> = ({ commands }) => (
  <Box
    flexDirection="column"
    marginBottom={1}
    borderColor={theme.border.default}
    borderStyle="round"
    padding={1}
  >
    {/* Basics */}
    <Text bold color={theme.text.primary}>
      {t('app.commands.help.basics')}
    </Text>
    <Text color={theme.text.primary}>
      <Text bold color={theme.text.accent}>
        {t('app.commands.help.addContext')}
      </Text>
      : {t('app.commands.help.use')}{' '}
      <Text bold color={theme.text.accent}>
        {t('app.commands.help.atSymbol')}
      </Text>{' '}
      {t('app.commands.help.toSpecifyFiles')} (
      <Text bold color={theme.text.accent}>
        @src/myFile.ts
      </Text>
      ) {t('app.commands.help.toTargetSpecificFiles')}.
    </Text>
    <Text color={theme.text.primary}>
      <Text bold color={theme.text.accent}>
        {t('app.commands.help.shellMode')}
      </Text>
      : {t('app.commands.help.executeShell')}{' '}
      <Text bold color={theme.text.accent}>
        {t('app.commands.help.exclamationSymbol')}
      </Text>{' '}
      (
      <Text bold color={theme.text.accent}>
        !npm run start
      </Text>
      ) {t('app.commands.help.orUseNaturalLanguage')} (
      <Text bold color={theme.text.accent}>
        {t('app.commands.help.startServer')}
      </Text>
      ).
    </Text>

    <Box height={1} />

    {/* Commands */}
    <Text bold color={theme.text.primary}>
      {t('app.commands.help.commands')}
    </Text>
    {commands
      .filter((command) => command.description && !command.hidden)
      .map((command: SlashCommand) => (
        <Box key={command.name} flexDirection="column">
          <Text color={theme.text.primary}>
            <Text bold color={theme.text.accent}>
              {' '}
              /{command.name}
            </Text>
            {command.kind === CommandKind.MCP_PROMPT && (
              <Text color={theme.text.secondary}> [MCP]</Text>
            )}
            {command.description && ' - ' + command.description}
          </Text>
          {command.subCommands &&
            command.subCommands
              .filter((subCommand) => !subCommand.hidden)
              .map((subCommand) => (
                <Text key={subCommand.name} color={theme.text.primary}>
                  <Text bold color={theme.text.accent}>
                    {'   '}
                    {subCommand.name}
                  </Text>
                  {subCommand.description && ' - ' + subCommand.description}
                </Text>
              ))}
        </Box>
      ))}
    <Text color={theme.text.primary}>
      <Text bold color={theme.text.accent}>
        {' '}
        !{' '}
      </Text>
      - {t('app.commands.help.shellCommand')}
    </Text>
    <Text color={theme.text.primary}>
      <Text color={theme.text.secondary}>[MCP]</Text> -{' '}
      {t('app.commands.help.mcpDescription')}
    </Text>

    <Box height={1} />

    {/* Shortcuts */}
    <Text bold color={theme.text.primary}>
      {t('app.commands.help.keyboardShortcuts')}
    </Text>
    <Text color={theme.text.primary}>
      <Text bold color={theme.text.accent}>
        {t('app.commands.help.altLeftRight')}
      </Text>{' '}
      - {t('app.commands.help.jumpWords')}
    </Text>
    <Text color={theme.text.primary}>
      <Text bold color={theme.text.accent}>
        {t('app.commands.help.ctrlC')}
      </Text>{' '}
      - {t('app.commands.help.quitApp')}
    </Text>
    <Text color={theme.text.primary}>
      <Text bold color={theme.text.accent}>
        {process.platform === 'win32' ? 'Ctrl+Enter' : 'Ctrl+J'}
      </Text>{' '}
      {process.platform === 'linux'
        ? `- ${t('app.commands.help.newLineLinux')}`
        : `- ${t('app.commands.help.newLine')}`}
    </Text>
    <Text color={theme.text.primary}>
      <Text bold color={theme.text.accent}>
        {t('app.commands.help.ctrlL')}
      </Text>{' '}
      - {t('app.commands.help.clearScreen')}
    </Text>
    <Text color={theme.text.primary}>
      <Text bold color={theme.text.accent}>
        {process.platform === 'darwin' ? 'Ctrl+X / Meta+Enter' : 'Ctrl+X'}
      </Text>{' '}
      - {t('app.commands.help.openEditor')}
    </Text>
    <Text color={theme.text.primary}>
      <Text bold color={theme.text.accent}>
        {t('app.commands.help.ctrlY')}
      </Text>{' '}
      - {t('app.commands.help.toggleYolo')}
    </Text>
    <Text color={theme.text.primary}>
      <Text bold color={theme.text.accent}>
        {t('app.commands.help.enter')}
      </Text>{' '}
      - {t('app.commands.help.sendMessage')}
    </Text>
    <Text color={theme.text.primary}>
      <Text bold color={theme.text.accent}>
        {t('app.commands.help.esc')}
      </Text>{' '}
      - {t('app.commands.help.cancelOperation')}
    </Text>
    <Text color={theme.text.primary}>
      <Text bold color={theme.text.accent}>
        {t('app.commands.help.shiftTab')}
      </Text>{' '}
      - {t('app.commands.help.toggleAutoAccept')}
    </Text>
    <Text color={theme.text.primary}>
      <Text bold color={theme.text.accent}>
        {t('app.commands.help.upDown')}
      </Text>{' '}
      - {t('app.commands.help.cycleHistory')}
    </Text>
    <Box height={1} />
    <Text color={theme.text.primary}>
      {t('app.commands.help.fullList')}{' '}
      <Text bold color={theme.text.accent}>
        docs/cli/keyboard-shortcuts.md
      </Text>
    </Text>
  </Box>
);
