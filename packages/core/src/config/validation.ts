/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Configuration validation for third-party providers.
 */

import type { ThirdPartyProviderConfig } from '../models/thirdPartyProviderConfig.js';
import { validateThirdPartyProviderConfig } from '../models/thirdPartyProviderConfig.js';
import { ThirdPartyConfigManager } from './thirdPartyConfig.js';
import type { Config } from './config.js';

type SettingsLike =
  | {
      model?: {
        thirdPartyProvider?: Partial<ThirdPartyProviderConfig> | null;
      } | null;
    }
  | null
  | undefined;

/**
 * Validates a third-party provider configuration
 * @param config The third-party provider configuration to validate
 * @returns An object containing validation results
 */
export function validateThirdPartyProvider(config: ThirdPartyProviderConfig) {
  // Use the validation function from the model
  const errors = validateThirdPartyProviderConfig(config);
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates configuration settings related to third-party providers
 * @param settings The settings object to validate
 * @returns An object containing validation results
 */
export function validateThirdPartySettings(settings: SettingsLike) {
  // Check if third-party provider settings exist
  const thirdPartySettings = settings?.model?.thirdPartyProvider;
  if (!thirdPartySettings) {
    // Not an error, just means no third-party provider is configured
    return {
      isValid: true,
      errors: [],
      hasThirdPartyConfig: false,
    };
  }

  // Validate the configuration
  const config: ThirdPartyProviderConfig = {
    endpoint: thirdPartySettings.endpoint,
    apiKey: thirdPartySettings.apiKey,
    model: thirdPartySettings.model,
    name: thirdPartySettings.name,
    enabled: thirdPartySettings.enabled,
    timeout: thirdPartySettings.timeout,
    additionalHeaders: thirdPartySettings.additionalHeaders,
  };

  const validation = validateThirdPartyProvider(config);

  return {
    isValid: validation.isValid,
    errors: validation.errors,
    hasThirdPartyConfig: true,
  };
}

/**
 * Performs a comprehensive validation of third-party provider configuration
 * including connectivity test if the provider is enabled
 * @param config The main application config
 * @returns An object containing validation results
 */
export async function validateThirdPartyProviderCompletely(config: Config) {
  const settingsValidation = validateThirdPartySettings(config);

  if (!settingsValidation.hasThirdPartyConfig || !settingsValidation.isValid) {
    return settingsValidation;
  }

  // If settings are valid, check if the provider is enabled
  const thirdPartyProviderConfig =
    ThirdPartyConfigManager.getThirdPartyProviderConfig(config);

  if (thirdPartyProviderConfig?.enabled) {
    // Attempt to validate the configuration by testing connectivity
    try {
      // Import the OpenAICompatibleContentGenerator to test the configuration
      const { OpenAICompatibleContentGenerator } = await import(
        '../services/openaiCompatibleContentGenerator.js'
      );
      const contentGenerator = new OpenAICompatibleContentGenerator(
        thirdPartyProviderConfig,
      );

      const isValid = await contentGenerator.validateConfig();

      if (!isValid) {
        settingsValidation.errors.push(
          'Third-party provider configuration failed connectivity test',
        );
        settingsValidation.isValid = false;
      }
    } catch (error) {
      settingsValidation.errors.push(
        `Error validating third-party provider configuration: ${error instanceof Error ? error.message : String(error)}`,
      );
      settingsValidation.isValid = false;
    }
  }

  return settingsValidation;
}
