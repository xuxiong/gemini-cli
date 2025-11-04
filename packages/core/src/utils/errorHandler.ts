/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Error handling and logging infrastructure for third-party API interactions.
 */

import type { ThirdPartyProviderConfig } from '../models/thirdPartyProviderConfig.js';

/**
 * Custom error class for third-party API interactions
 */
export class ThirdPartyAPIError extends Error {
  readonly statusCode?: number;
  readonly provider: string;
  readonly endpoint: string;
  readonly requestParams?: Record<string, unknown>;
  readonly originalError?: unknown;

  constructor(
    message: string,
    provider: string,
    endpoint: string,
    statusCode?: number,
    requestParams?: Record<string, unknown>,
    originalError?: unknown,
  ) {
    super(message);
    this.name = 'ThirdPartyAPIError';
    this.statusCode = statusCode;
    this.provider = provider;
    this.endpoint = endpoint;
    this.requestParams = requestParams;
    this.originalError = originalError;
  }
}

/**
 * Custom error class for configuration errors
 */
export class ThirdPartyConfigError extends Error {
  readonly config: Partial<ThirdPartyProviderConfig>;

  constructor(message: string, config: Partial<ThirdPartyProviderConfig>) {
    super(message);
    this.name = 'ThirdPartyConfigError';
    this.config = config;
  }
}

/**
 * Error response from third-party APIs
 */
export interface ThirdPartyAPIErrorResponse {
  error: {
    message: string;
    type?: string;
    param?: string | null;
    code?: string | null;
  };
}

/**
 * Handles errors from third-party API responses
 * @param response The response from the third-party API
 * @param config The third-party provider configuration
 * @param requestParams The parameters sent in the request
 * @returns A ThirdPartyAPIError with appropriate details
 */
export function handleThirdPartyAPIError(
  response: unknown,
  config: ThirdPartyProviderConfig,
  requestParams?: Record<string, unknown>,
): ThirdPartyAPIError {
  // Check if the response is an error response from the third-party API
  if (isThirdPartyAPIErrorResponse(response)) {
    const error = response.error;
    const message = error.message || 'Unknown error from third-party API';
    const code = error.code || 'UNKNOWN_ERROR';

    return new ThirdPartyAPIError(
      `Third-party API error (${code}): ${message}`,
      config.name || 'unknown',
      config.endpoint,
      undefined, // statusCode not available in response body
      requestParams,
      response,
    );
  }

  // If it's a network error or other response object
  return new ThirdPartyAPIError(
    `Third-party API error: ${JSON.stringify(response)}`,
    config.name || 'unknown',
    config.endpoint,
    undefined,
    requestParams,
    response,
  );
}

/**
 * Checks if a response is a third-party API error response
 * @param response The response to check
 * @returns True if the response is an error response
 */
function isThirdPartyAPIErrorResponse(
  response: unknown,
): response is ThirdPartyAPIErrorResponse {
  if (!response || typeof response !== 'object') {
    return false;
  }

  const resp = response as Partial<ThirdPartyAPIErrorResponse>;
  return (
    resp.error !== undefined &&
    typeof resp.error === 'object' &&
    typeof resp.error.message === 'string'
  );
}

/**
 * Validates the third-party provider configuration and throws an error if invalid
 * @param config The third-party provider configuration to validate
 */
export function validateThirdPartyConfig(
  config: ThirdPartyProviderConfig,
): void {
  if (!config.enabled) {
    throw new ThirdPartyConfigError(
      'Third-party provider is not enabled',
      config,
    );
  }

  if (!config.endpoint) {
    throw new ThirdPartyConfigError(
      'Third-party provider endpoint is required',
      config,
    );
  }

  if (!config.apiKey) {
    throw new ThirdPartyConfigError(
      'Third-party provider API key is required',
      config,
    );
  }

  // Additional validation can be added here based on specific provider requirements
}

/**
 * Logs a third-party API error with appropriate details
 * @param error The error to log
 * @param logger Optional logger to use for logging
 */
export function logThirdPartyError(
  error: ThirdPartyAPIError | ThirdPartyConfigError,
  logger?: { error: (msg: string, ...args: unknown[]) => void },
): void {
  const payload: Record<string, unknown> = {
    name: error.name,
    message: error.message,
  };

  if (error instanceof ThirdPartyAPIError) {
    payload['provider'] = error.provider;
    payload['endpoint'] = error.endpoint;
    payload['statusCode'] = error.statusCode;
    payload['requestParams'] = error.requestParams;
    payload['originalError'] = error.originalError;
  } else if (error instanceof ThirdPartyConfigError) {
    payload['config'] = error.config;
  }

  if (logger) {
    logger.error('Third-party API error:', payload);
  } else {
    console.error('Third-party API error:', payload);
  }
}

/**
 * Handles and logs an error, then returns a standardized error message
 * @param error The error to handle
 * @param config The third-party provider configuration
 * @param logger Optional logger to use for logging
 * @returns A standardized error message
 */
export function processThirdPartyError(
  error: unknown,
  config: ThirdPartyProviderConfig,
  logger?: { error: (msg: string, ...args: unknown[]) => void },
): string {
  let thirdPartyError: ThirdPartyAPIError | ThirdPartyConfigError;

  if (
    error instanceof ThirdPartyAPIError ||
    error instanceof ThirdPartyConfigError
  ) {
    thirdPartyError = error;
  } else {
    // Wrap unknown errors in a ThirdPartyAPIError
    thirdPartyError = new ThirdPartyAPIError(
      `Unknown error during third-party API interaction: ${error instanceof Error ? error.message : String(error)}`,
      config.name || 'unknown',
      config.endpoint,
      undefined,
      undefined,
      error,
    );
  }

  // Log the error
  logThirdPartyError(thirdPartyError, logger);

  // Return a user-friendly error message
  return `Error communicating with third-party provider: ${thirdPartyError.message}`;
}
