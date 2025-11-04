/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * HTTP client for making OpenAI-compatible API calls.
 */

import type { ThirdPartyProviderConfig } from '../models/thirdPartyProviderConfig.js';
import {
  createOpenAIRequestOptions,
  type OpenAIChatCompletionRequest,
  type OpenAIChatCompletionResponse,
} from '../lib/apiCompatibilityMapper.js';
import { ThirdPartyAPIError } from '../utils/errorHandler.js';

// Define types for the request and response
interface OpenAIBaseRequest {
  model: string;
}
interface OpenAICompletionRequest extends OpenAIBaseRequest {
  prompt: string | string[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[] | null;
  stream?: boolean;
}

export class OpenAIApiClient {
  private readonly baseUrl: string;
  private readonly config: ThirdPartyProviderConfig;

  constructor(config: ThirdPartyProviderConfig) {
    this.config = config;
    // Ensure the base URL doesn't have a trailing slash
    this.baseUrl = config.endpoint.endsWith('/')
      ? config.endpoint.slice(0, -1)
      : config.endpoint;
  }

  /**
   * Makes a request to the OpenAI-compatible API
   * @param requestData The request data to send
   * @returns The API response
   */
  async makeRequest<T = OpenAIChatCompletionResponse>(
    requestData: OpenAIChatCompletionRequest | OpenAICompletionRequest,
  ): Promise<T> {
    const requestOptions = createOpenAIRequestOptions(this.config);
    const endpoint = this.resolveEndpoint(requestData);

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      requestOptions.timeout,
    );
    const requestPayload = requestData as unknown as Record<string, unknown>;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: requestOptions.headers,
        body: JSON.stringify(requestData),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await this.safeParseBody(response);
        throw this.buildErrorFromResponse(
          response.status,
          body,
          requestPayload,
        );
      }

      const data = (await response.json()) as T;
      return data;
    } catch (error) {
      if (error instanceof ThirdPartyAPIError) {
        throw error;
      }
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ThirdPartyAPIError(
          'Request to third-party provider timed out',
          this.config.name || 'unknown',
          endpoint,
          undefined,
          requestPayload,
          error,
        );
      }
      throw new ThirdPartyAPIError(
        `Error making request to third-party API: ${error instanceof Error ? error.message : String(error)}`,
        this.config.name || 'unknown',
        endpoint,
        undefined,
        requestPayload,
        error,
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Tests the connection to the OpenAI-compatible API
   * @returns True if the connection is successful, false otherwise
   */
  async testConnection(): Promise<boolean> {
    try {
      // Make a simple test request
      const testRequest: OpenAIChatCompletionRequest = {
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'test',
          },
        ],
        max_tokens: 5,
      };

      // Try to make the request
      await this.makeRequest(testRequest);

      return true;
    } catch (error) {
      // If there's an error, connection test failed
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Gets the list of available models from the provider
   * Note: This might not be supported by all OpenAI-compatible providers
   */
  async listModels(): Promise<string[]> {
    try {
      // Not all OpenAI-compatible APIs support listing models
      // This is just a placeholder implementation
      // Some providers may have different endpoints for this
      const endpoint = `${this.baseUrl}/models`;

      const requestOptions = createOpenAIRequestOptions(this.config);
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: requestOptions.headers,
        signal: AbortSignal.timeout(requestOptions.timeout),
      });

      if (!response.ok) {
        return [];
      }

      const data = (await response.json()) as { data?: Array<{ id?: string }> };
      return (data.data ?? [])
        .map((entry) => entry.id)
        .filter((id): id is string => typeof id === 'string');
    } catch (error) {
      // If the models endpoint doesn't exist or isn't supported, return an empty array
      // or potentially throw an error depending on the use case
      console.warn('Could not fetch model list from provider:', error);
      return [];
    }
  }

  private resolveEndpoint(
    requestData: OpenAIChatCompletionRequest | OpenAICompletionRequest,
  ): string {
    if ('messages' in requestData) {
      return `${this.baseUrl}/chat/completions`;
    }
    if ('prompt' in requestData) {
      return `${this.baseUrl}/completions`;
    }
    throw new Error(
      'Invalid request data: expected chat or text completion payload.',
    );
  }

  private async safeParseBody(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch {
        return { error: { message: 'Failed to parse JSON error response.' } };
      }
    }
    try {
      return await response.text();
    } catch {
      return { error: { message: 'Failed to read error response body.' } };
    }
  }

  private buildErrorFromResponse(
    statusCode: number,
    body: unknown,
    requestParams: Record<string, unknown>,
  ): ThirdPartyAPIError {
    let message = `Request failed with status ${statusCode}`;

    if (body && typeof body === 'object') {
      const errorField = (body as { error?: { message?: string } }).error;
      if (errorField?.message) {
        message = errorField.message;
      }
    } else if (typeof body === 'string' && body.trim().length > 0) {
      message = body;
    }

    return new ThirdPartyAPIError(
      message,
      this.config.name || 'unknown',
      this.baseUrl,
      statusCode,
      requestParams,
      body,
    );
  }
}
