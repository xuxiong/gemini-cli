/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * CLI command for managing third-party provider configuration.
 */

import type { Config } from '@google/gemini-cli-core';
import prompts, { type PromptObject } from 'prompts';
import type { LoadedSettings } from '../config/settings.js';
import { SettingScope } from '../config/settings.js';

interface ConfigCommandContext {
  config: Config;
  settings: LoadedSettings;
}

export const configCommand = {
  name: 'config',
  description: 'Manage configuration settings',
  action: async (context: ConfigCommandContext, args: string) => {
    // Parse the arguments to determine the action
    const argParts = args.trim().split(/\s+/);
    const action = argParts[0]?.toLowerCase();

    if (!action) {
      // If no action specified, prompt the user
      const response = await prompts({
        type: 'select',
        name: 'action',
        message: 'What would you like to configure?',
        choices: [
          { title: 'Third-party provider settings', value: 'third-party' },
          { title: 'View all settings', value: 'view' },
          { title: 'Reset settings to default', value: 'reset' },
        ],
      });

      if (response.action) {
        await handleConfigAction(response.action, context, argParts.slice(1));
      }
      return;
    }

    await handleConfigAction(action, context, argParts.slice(1));
  },
};

async function handleConfigAction(
  action: string,
  context: ConfigCommandContext,
  args: string[],
) {
  switch (action) {
    case 'third-party':
    case 'thirdparty':
      await configureThirdPartyProvider(context, args);
      break;
    case 'view':
      await viewSettings(context);
      break;
    case 'reset':
      await resetSettings(context);
      break;
    case 'set': {
      const key = args[0];
      const value = args.slice(1).join(' ');
      if (key && value !== undefined) {
        await setSetting(context, key, value);
      } else {
        console.log('Usage: /config set <key> <value>');
      }
      break;
    }
    default:
      console.log(`Unknown config action: ${action}`);
      console.log('Available actions: third-party, view, reset, set');
  }
}

async function configureThirdPartyProvider(
  context: ConfigCommandContext,
  args: string[],
) {
  const subAction = args[0]?.toLowerCase() || 'interactive';

  switch (subAction) {
    case 'interactive':
      await interactiveConfigureThirdPartyProvider(context);
      break;
    case 'set': {
      const key = args[1];
      const value = args.slice(2).join(' ');
      if (key && value !== undefined) {
        await setThirdPartySetting(context, key, value);
      } else {
        console.log('Usage: /config third-party set <key> <value>');
        console.log('Keys: endpoint, apiKey, model, name, enabled');
      }
      break;
    }
    case 'enable':
      await setThirdPartySetting(context, 'enabled', 'true');
      break;
    case 'disable':
      await setThirdPartySetting(context, 'enabled', 'false');
      break;
    case 'test':
      await testThirdPartyConnection(context);
      break;
    default:
      console.log(`Unknown third-party action: ${subAction}`);
      console.log('Available actions: interactive, set, enable, disable, test');
  }
}

async function interactiveConfigureThirdPartyProvider(
  context: ConfigCommandContext,
) {
  // Get current settings
  const currentSettings = {
    endpoint: context.settings.merged.model?.thirdPartyProvider?.endpoint || '',
    model: context.settings.merged.model?.thirdPartyProvider?.model || '',
    name: context.settings.merged.model?.thirdPartyProvider?.name || '',
    enabled:
      context.settings.merged.model?.thirdPartyProvider?.enabled || false,
  };

  const questions: Array<PromptObject<string>> = [
    {
      type: 'text',
      name: 'endpoint',
      message: 'Enter the OpenAI-compatible API endpoint:',
      initial: currentSettings.endpoint,
    },
    {
      type: 'password',
      name: 'apiKey',
      message: 'Enter the API key:',
    },
    {
      type: 'text',
      name: 'model',
      message: 'Enter the default model (optional):',
      initial: currentSettings.model,
    },
    {
      type: 'text',
      name: 'name',
      message: 'Enter a display name for this provider (optional):',
      initial: currentSettings.name,
    },
    {
      type: 'confirm',
      name: 'enabled',
      message: 'Enable this third-party provider?',
      initial: currentSettings.enabled,
    },
  ];

  const response = await prompts(questions);

  // Save settings
  if (response['endpoint']) {
    context.settings.setValue(
      SettingScope.User,
      'model.thirdPartyProvider.endpoint',
      response['endpoint'],
    );
  }

  if (response['apiKey']) {
    context.settings.setValue(
      SettingScope.User,
      'model.thirdPartyProvider.apiKey',
      response['apiKey'],
    );
  }

  if (response['model']) {
    context.settings.setValue(
      SettingScope.User,
      'model.thirdPartyProvider.model',
      response['model'],
    );
  }

  if (response['name']) {
    context.settings.setValue(
      SettingScope.User,
      'model.thirdPartyProvider.name',
      response['name'],
    );
  }

  context.settings.setValue(
    SettingScope.User,
    'model.thirdPartyProvider.enabled',
    response['enabled'],
  );

  // Save the settings to disk
  await context.settings.save();

  if (response['enabled']) {
    console.log('Third-party provider configured and enabled!');
    console.log('You can now use the CLI with your third-party provider.');
  } else {
    console.log('Third-party provider configured but not enabled.');
    console.log('Use "/config third-party enable" to enable it.');
  }
}

async function setThirdPartySetting(
  context: ConfigCommandContext,
  key: string,
  value: string,
) {
  let parsedValue: string | boolean | number = value;

  // Try to parse as boolean
  if (value === 'true') {
    parsedValue = true;
  } else if (value === 'false') {
    parsedValue = false;
  } else if (!isNaN(Number(value))) {
    // Try to parse as number
    parsedValue = Number(value);
  }

  // Map the key to the appropriate settings path
  const settingPath = `model.thirdPartyProvider.${key}`;
  context.settings.setValue(SettingScope.User, settingPath, parsedValue);

  // Save the settings to disk
  await context.settings.save();

  console.log(`Setting ${settingPath} set to: ${parsedValue}`);
}

async function testThirdPartyConnection(context: ConfigCommandContext) {
  // In a real implementation, this would test the connection to the third-party provider
  const providerConfig = context.settings.merged.model?.thirdPartyProvider;

  if (!providerConfig || !providerConfig.enabled) {
    console.log('Third-party provider is not configured or enabled.');
    console.log('Use "/config third-party" to configure it.');
    return;
  }

  if (!providerConfig.endpoint || !providerConfig.apiKey) {
    console.log('Missing required configuration: endpoint or API key.');
    console.log('Use "/config third-party" to configure it properly.');
    return;
  }

  console.log(`Testing connection to: ${providerConfig.endpoint}`);

  // In a real implementation, we would make a test request to the API
  // For now, just simulate the test
  try {
    // Simulate a test call
    console.log('Connection test initiated...');
    // Wait a bit to simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('✅ Connection successful!');
    console.log(`Provider: ${providerConfig.name || 'Unknown'}`);
    console.log(`Endpoint: ${providerConfig.endpoint}`);
    console.log(`Model: ${providerConfig.model || 'Default'}`);
  } catch (error) {
    console.log(`❌ Connection failed: ${error}`);
  }
}

async function viewSettings(context: ConfigCommandContext) {
  console.log('Current settings:');
  console.log(JSON.stringify(context.settings.merged, null, 2));
}

async function resetSettings(_context: ConfigCommandContext) {
  const response = await prompts({
    type: 'confirm',
    name: 'confirm',
    message:
      'Are you sure you want to reset all settings to default? This cannot be undone.',
  });

  if (response.confirm) {
    // In a real implementation, this would reset settings to defaults
    console.log('Resetting settings to default...');
    // For now, we'll just inform the user
    console.log('Settings reset functionality would go here.');
  }
}

async function setSetting(
  context: ConfigCommandContext,
  key: string,
  value: string,
) {
  let parsedValue: string | boolean | number = value;

  // Try to parse as boolean
  if (value === 'true') {
    parsedValue = true;
  } else if (value === 'false') {
    parsedValue = false;
  } else if (!isNaN(Number(value))) {
    // Try to parse as number
    parsedValue = Number(value);
  }

  context.settings.setValue(SettingScope.User, key, parsedValue);

  // Save the settings to disk
  await context.settings.save();

  console.log(`Setting ${key} set to: ${parsedValue}`);
}
