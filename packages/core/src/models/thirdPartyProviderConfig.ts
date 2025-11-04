/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Model representing configuration for a third-party OpenAI-compatible provider.
 */
export interface ThirdPartyProviderConfig {
  /**
   * The base URL for the OpenAI-compatible API
   */
  endpoint: string;

  /**
   * Authentication key for the API service
   */
  apiKey: string;

  /**
   * Default model to use (e.g., "gpt-4", "claude-3-opus", etc.)
   * Optional - defaults to provider's default
   */
  model?: string;

  /**
   * Display name for the provider configuration
   * Optional
   */
  name?: string;

  /**
   * Request timeout in milliseconds
   * Defaults to gemini behavior if not specified
   */
  timeout?: number;

  /**
   * Additional headers to include with requests
   * Optional
   */
  additionalHeaders?: Record<string, string>;

  /**
   * Whether this configuration is currently active
   */
  enabled: boolean;
}

/**
 * Validates the ThirdPartyProviderConfig
 * @param config The configuration to validate
 * @returns An array of validation errors, empty if valid
 */
export function validateThirdPartyProviderConfig(
  config: ThirdPartyProviderConfig,
): string[] {
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
