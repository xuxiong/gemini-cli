/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Configuration management for third-party OpenAI-compatible providers.
 */

import type { ThirdPartyProviderConfig } from '../models/thirdPartyProviderConfig.js';
import type { Config } from './config.js';

/**
 * Manages third-party provider configurations
 */
export class ThirdPartyConfigManager {
  /**
   * Gets the third-party provider configuration from the main config
   * @param config The main application config
   * @returns The third-party provider configuration or undefined if not configured
   */
  static getThirdPartyProviderConfig(
    config: Config,
  ): ThirdPartyProviderConfig | undefined {
    // Access the third-party provider settings from the main config
    // Using index notation to safely access potentially extended config properties
    // since direct intersection with Config causes issues with private fields
    const configWithOptionalThirdParty = config as Config & {
      thirdPartyProvider?: Partial<ThirdPartyProviderConfig> | null;
      model?: {
        thirdPartyProvider?: Partial<ThirdPartyProviderConfig> | null;
      };
    };

    const settings =
      configWithOptionalThirdParty.thirdPartyProvider ??
      configWithOptionalThirdParty.model?.thirdPartyProvider ??
      undefined;

    if (!settings || !settings.enabled) {
      return undefined;
    }

    // Only return a config if it has the required fields
    if (!settings.endpoint || !settings.apiKey) {
      return undefined;
    }

    return {
      endpoint: settings.endpoint,
      apiKey: settings.apiKey,
      model: settings.model,
      name: settings.name,
      enabled: settings.enabled,
    };
  }

  /**
   * Checks if a third-party provider is properly configured and enabled
   * @param config The main application config
   * @returns True if a third-party provider is configured and enabled
   */
  static isThirdPartyProviderEnabled(config: Config): boolean {
    const providerConfig = this.getThirdPartyProviderConfig(config);
    return providerConfig !== undefined && providerConfig.enabled;
  }

  /**
   * Validates a third-party provider configuration
   * @param config The third-party provider configuration to validate
   * @returns An array of validation errors, empty if valid
   */
  static validateConfig(config: ThirdPartyProviderConfig): string[] {
    const errors: string[] = [];

    // Validate endpoint
    if (!config.endpoint) {
      errors.push('Endpoint is required');
    } else {
      try {
        const url = new URL(config.endpoint);
        if (url.protocol !== 'https:') {
          errors.push('Endpoint must use HTTPS protocol');
        }
      } catch (_error) {
        errors.push('Endpoint must be a valid URL');
      }
    }

    // Validate API key
    if (!config.apiKey || config.apiKey.trim() === '') {
      errors.push('API key is required');
    }

    // Validate timeout if provided
    if (
      config.timeout !== undefined &&
      (typeof config.timeout !== 'number' || config.timeout <= 0)
    ) {
      errors.push('Timeout must be a positive number if specified');
    }

    return errors;
  }

  /**
   * Updates the main config with third-party provider settings
   * @param config The main application config
   * @param providerConfig The third-party provider configuration to set
   */
  static async setThirdPartyProviderConfig(
    config: Config,
    providerConfig: ThirdPartyProviderConfig,
  ): Promise<void> {
    // In a real implementation, this would update the user's configuration file
    // For now, we'll just validate the config
    const errors = this.validateConfig(providerConfig);
    if (errors.length > 0) {
      throw new Error(
        `Invalid third-party provider configuration: ${errors.join(', ')}`,
      );
    }

    // In the real application, this would save the configuration to the user's settings file
    // This might involve using the Storage class or a similar mechanism to persist the settings
  }

  /**
   * Clears the third-party provider configuration
   * @param config The main application config
   */
  static async clearThirdPartyProviderConfig(_config: Config): Promise<void> {
    // In a real implementation, this would remove third-party provider settings from the config
    // For now, we'll just do nothing
  }
}

/**
 * Helper function to get the active third-party provider configuration
 * @param config The main application config
 * @returns The active third-party provider configuration or undefined
 */
export function getActiveThirdPartyProviderConfig(
  config: Config,
): ThirdPartyProviderConfig | undefined {
  return ThirdPartyConfigManager.getThirdPartyProviderConfig(config);
}
