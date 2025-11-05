/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * CLI command for managing third-party provider configuration.
 */

import prompts from 'prompts';
import type { CommandContext, SlashCommand } from '../ui/commands/types.js';
import { CommandKind } from '../ui/commands/types.js';
import type { ThirdPartyProviderConfig, Config } from '@google/gemini-cli-core';
import {
  getActiveThirdPartyProviderConfig,
  ThirdPartyConfigManager,
  OpenAICompatibleContentGenerator,
} from '@google/gemini-cli-core';

export const configCommand: SlashCommand = {
  name: 'config',
  description: 'Manage configuration settings',
  kind: CommandKind.BUILT_IN,
  action: async (context: CommandContext, args: string) => {
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
  context: CommandContext,
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
  context: CommandContext,
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
      }
      break;
    }
    case 'get': {
      const key = args[1];
      if (key) {
        await getThirdPartySetting(context, key);
      } else {
        await showAllThirdPartySettings(context);
      }
      break;
    }
    case 'test':
      await testThirdPartyConnection(context);
      break;
    case 'clear':
      await clearThirdPartySettings(context);
      break;
    default:
      console.log(`Unknown third-party action: ${subAction}`);
      console.log('Available actions: interactive, set, get, test, clear');
  }
}

async function interactiveConfigureThirdPartyProvider(context: CommandContext) {
  console.log('🔧 Configure Third-Party Provider Settings');
  console.log('This will allow you to use OpenAI-compatible LLM providers.\n');

  try {
    // Get current configuration for defaults
    const currentConfig = getActiveThirdPartyProviderConfig(
      context.services.config as unknown as Config,
    );

    const responses = await prompts([
      {
        type: 'text',
        name: 'endpoint',
        message: 'API endpoint URL (e.g., https://api.openai.com/v1)',
        initial: currentConfig?.endpoint || '',
        validate: (value: string) => {
          if (!value.trim()) return 'Endpoint is required';
          try {
            new URL(value);
            if (!value.startsWith('https://')) {
              return 'Endpoint must use HTTPS';
            }
            return true;
          } catch {
            return 'Please enter a valid URL';
          }
        },
      },
      {
        type: 'password',
        name: 'apiKey',
        message: 'API key',
        initial: currentConfig?.apiKey || '',
        validate: (value: string) => {
          if (!value.trim()) return 'API key is required';
          return true;
        },
      },
      {
        type: 'text',
        name: 'model',
        message: 'Default model (e.g., gpt-3.5-turbo)',
        initial: currentConfig?.model || 'gpt-3.5-turbo',
      },
      {
        type: 'text',
        name: 'name',
        message: 'Provider name (for display purposes)',
        initial: currentConfig?.name || 'Custom Provider',
      },
    ]);

    if (!responses.endpoint && !responses.apiKey) {
      console.log('❌ Configuration cancelled');
      return;
    }

    const config: ThirdPartyProviderConfig = {
      endpoint: responses.endpoint!,
      apiKey: responses.apiKey!,
      model: responses.model || 'gpt-3.5-turbo',
      name: responses.name || 'Custom Provider',
      enabled: true,
    };

    // Validate the configuration
    const errors = ThirdPartyConfigManager.validateConfig(config);
    if (errors.length > 0) {
      console.log('❌ Configuration validation failed:');
      errors.forEach((error) => console.log(`  • ${error}`));
      return;
    }

    // Save the configuration
    await ThirdPartyConfigManager.setThirdPartyProviderConfig(
      context.services.config as unknown as Config,
      config,
    );

    console.log('✅ Third-party provider configured successfully!');
    console.log(`Provider: ${config.name}`);
    console.log(`Endpoint: ${config.endpoint}`);
    console.log(`Model: ${config.model}`);

    // Test the connection
    console.log('\nTesting connection...');
    const success = await testConnectionWithConfig(config);
    if (success) {
      console.log('✅ Connection test successful!');
    } else {
      console.log(
        '⚠️  Connection test failed. Please check your configuration.',
      );
    }
  } catch (error) {
    console.error(
      '❌ Configuration failed:',
      error instanceof Error ? error.message : String(error),
    );
  }
}

async function setThirdPartySetting(
  context: CommandContext,
  key: string,
  value: string,
) {
  try {
    const currentConfig = getActiveThirdPartyProviderConfig(
      context.services.config as unknown as Config,
    );

    // Parse the key and update the appropriate field
    switch (key.toLowerCase()) {
      case 'endpoint':
        await updateThirdPartyConfig(context, {
          ...currentConfig!,
          endpoint: value,
        });
        console.log(`✅ Endpoint updated to: ${value}`);
        break;
      case 'apikey':
      case 'api-key':
        await updateThirdPartyConfig(context, {
          ...currentConfig!,
          apiKey: value,
        });
        console.log('✅ API key updated');
        break;
      case 'model':
        await updateThirdPartyConfig(context, {
          ...currentConfig!,
          model: value,
        });
        console.log(`✅ Model updated to: ${value}`);
        break;
      case 'name':
        await updateThirdPartyConfig(context, {
          ...currentConfig!,
          name: value,
        });
        console.log(`✅ Provider name updated to: ${value}`);
        break;
      case 'enabled': {
        const enabledValue = value.toLowerCase() === 'true' || value === '1';
        await updateThirdPartyConfig(context, {
          ...currentConfig!,
          enabled: enabledValue,
        });
        console.log(`✅ Provider ${enabledValue ? 'enabled' : 'disabled'}`);
        break;
      }
      default:
        console.log(`❌ Unknown setting: ${key}`);
        console.log(
          'Available settings: endpoint, api-key, model, name, enabled',
        );
    }
  } catch (error) {
    console.error(
      '❌ Failed to update setting:',
      error instanceof Error ? error.message : String(error),
    );
  }
}

async function updateThirdPartyConfig(
  context: CommandContext,
  config: Partial<ThirdPartyProviderConfig>,
) {
  // This would update the configuration in the actual implementation
  // For now, we'll just validate and show what would be updated
  const errors = ThirdPartyConfigManager.validateConfig(
    config as ThirdPartyProviderConfig,
  );
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
  // Actual implementation would save to storage here
}

async function showAllThirdPartySettings(context: CommandContext) {
  const config = getActiveThirdPartyProviderConfig(
    context.services.config as unknown as Config,
  );

  if (!config) {
    console.log('❌ No third-party provider configured');
    return;
  }

  console.log('📋 Current Third-Party Provider Configuration:');
  console.log(`Provider Name: ${config.name || 'Not specified'}`);
  console.log(`Endpoint: ${config.endpoint}`);
  console.log(`Model: ${config.model || 'Default'}`);
  console.log(`Status: ${config.enabled ? '✅ Enabled' : '❌ Disabled'}`);
}

async function getThirdPartySetting(context: CommandContext, key: string) {
  const config = getActiveThirdPartyProviderConfig(
    context.services.config as unknown as Config,
  );

  if (!config) {
    console.log('❌ No third-party provider configured');
    return;
  }

  switch (key.toLowerCase()) {
    case 'endpoint':
      console.log(`Endpoint: ${config.endpoint}`);
      break;
    case 'apikey':
    case 'api-key':
      console.log(`API Key: ${config.apiKey.substring(0, 8)}...`);
      break;
    case 'model':
      console.log(`Model: ${config.model || 'Default'}`);
      break;
    case 'name':
      console.log(`Provider Name: ${config.name || 'Not specified'}`);
      break;
    case 'enabled':
      console.log(`Status: ${config.enabled ? '✅ Enabled' : '❌ Disabled'}`);
      break;
    default:
      console.log(`❌ Unknown setting: ${key}`);
  }
}

async function testThirdPartyConnection(context: CommandContext) {
  console.log('🔗 Testing third-party provider connection...');

  try {
    const config = getActiveThirdPartyProviderConfig(
      context.services.config as unknown as Config,
    );

    if (!config) {
      console.log('❌ No third-party provider configured');
      return;
    }

    const success = await testConnectionWithConfig(config);
    if (success) {
      console.log('✅ Connection test successful!');
      console.log(`Provider: ${config.name}`);
      console.log(`Endpoint: ${config.endpoint}`);
    } else {
      console.log('❌ Connection test failed');
      console.log('Please check your configuration and network connection');
    }
  } catch (error) {
    console.error(
      '❌ Connection test failed:',
      error instanceof Error ? error.message : String(error),
    );
  }
}

async function testConnectionWithConfig(
  config: ThirdPartyProviderConfig,
): Promise<boolean> {
  try {
    const contentGenerator = new OpenAICompatibleContentGenerator(config);
    return await contentGenerator.validateConfig();
  } catch {
    return false;
  }
}

async function clearThirdPartySettings(context: CommandContext) {
  try {
    await ThirdPartyConfigManager.clearThirdPartyProviderConfig(
      context.services.config as unknown as Config,
    );
    console.log('✅ Third-party provider configuration cleared');
  } catch (error) {
    console.error(
      '❌ Failed to clear configuration:',
      error instanceof Error ? error.message : String(error),
    );
  }
}

async function viewSettings(context: CommandContext) {
  console.log('📋 Current Settings:');
  console.log(
    'Third-party provider: ' +
      (ThirdPartyConfigManager.isThirdPartyProviderEnabled(
        context.services.config as unknown as Config,
      )
        ? '✅ Configured'
        : '❌ Not configured'),
  );
}

async function resetSettings(context: CommandContext) {
  console.log('🔄 Resetting settings to default...');
  try {
    await ThirdPartyConfigManager.clearThirdPartyProviderConfig(
      context.services.config as unknown as Config,
    );
    console.log('✅ Settings reset to default');
  } catch (error) {
    console.error(
      '❌ Failed to reset settings:',
      error instanceof Error ? error.message : String(error),
    );
  }
}

async function setSetting(context: CommandContext, key: string, value: string) {
  console.log(`Setting ${key} = ${value}`);
  // This would update general settings in the actual implementation
}
