/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Integration test for third-party provider functionality.
 * Tests the complete flow of using a third-party OpenAI-compatible provider.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ThirdPartyProviderConfig } from '../../src/models/thirdPartyProviderConfig.js';
import { OpenAICompatibleContentGenerator } from '../../src/services/openaiCompatibleContentGenerator.js';
import { OpenAIApiClient } from '../../src/services/openaiApiClient.js';
import type { GenerateContentParameters } from '@google/genai';
import { ThirdPartyAPIError } from '../../src/utils/errorHandler.js';

describe('Third-Party Provider Integration', () => {
  const mockConfig: ThirdPartyProviderConfig = {
    endpoint: 'https://api.example.com/v1',
    apiKey: 'test-api-key',
    model: 'gpt-3.5-turbo',
    name: 'Test Provider',
    enabled: true,
  };

  const originalFetch = globalThis.fetch;
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  describe('OpenAIApiClient', () => {
    let apiClient: OpenAIApiClient;

    beforeEach(() => {
      apiClient = new OpenAIApiClient(mockConfig);
    });

    it('should make a properly formatted request to the OpenAI-compatible endpoint', async () => {
      const responseBody = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'This is a test response',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
        id: 'resp_123',
        model: 'gpt-3.5-turbo',
      };

      fetchMock.mockResolvedValue(
        new Response(JSON.stringify(responseBody), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const requestData = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Hello, test message',
          },
        ],
        temperature: 0.7,
      };

      const result = await apiClient.makeRequest(requestData);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe(`${mockConfig.endpoint}/chat/completions`);
      expect(options?.method).toBe('POST');
      expect(options?.headers).toMatchObject({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mockConfig.apiKey}`,
      });
      expect(JSON.parse(options?.body as string)).toEqual({
        ...requestData,
        stream: false,
      });

      expect(result).toHaveProperty('choices');
      expect(result.choices).toHaveLength(1);
      expect(result.choices?.[0]?.message?.content).toBe(
        'This is a test response',
      );
    });

    it('should handle API errors properly', async () => {
      const errorBody = {
        error: {
          message: 'Invalid API key',
          code: 'invalid_api_key',
        },
      };

      fetchMock.mockResolvedValue(
        new Response(JSON.stringify(errorBody), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const requestData = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Hello, test message',
          },
        ],
      };

      await expect(apiClient.makeRequest(requestData)).rejects.toThrow(
        ThirdPartyAPIError,
      );
    });
  });

  describe('OpenAICompatibleContentGenerator', () => {
    let contentGenerator: OpenAICompatibleContentGenerator;

    beforeEach(() => {
      contentGenerator = new OpenAICompatibleContentGenerator(mockConfig);
    });

    it('should generate content using the third-party provider', async () => {
      const mockApiResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content:
                'This is the generated content from third-party provider',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
        usage: {
          prompt_tokens: 5,
          completion_tokens: 25,
          total_tokens: 30,
        },
        id: 'resp_456',
        model: 'gpt-3.5-turbo',
      };

      vi.spyOn(OpenAIApiClient.prototype, 'makeRequest').mockResolvedValue(
        mockApiResponse,
      );

      const testRequest: GenerateContentParameters = {
        model: 'gpt-3.5-turbo',
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Generate a simple greeting' }],
          },
        ],
      };

      const result = await contentGenerator.generateContent(
        testRequest,
        'prompt-1',
      );

      expect(result.candidates).toHaveLength(1);
      const candidate = result.candidates?.[0];
      expect(candidate?.content?.parts?.[0]?.text).toBe(
        'This is the generated content from third-party provider',
      );

      expect(OpenAIApiClient.prototype.makeRequest).toHaveBeenCalled();
      const callArgs = (OpenAIApiClient.prototype.makeRequest as vi.Mock).mock
        .calls[0][0];
      expect(callArgs).toHaveProperty('messages');
      expect(callArgs.messages).toHaveLength(1);
      expect(callArgs.messages[0]).toEqual({
        role: 'user',
        content: 'Generate a simple greeting',
      });
    });

    it('should handle errors from the third-party API', async () => {
      vi.spyOn(OpenAIApiClient.prototype, 'makeRequest').mockRejectedValue(
        new Error('API request failed'),
      );

      const testRequest: GenerateContentParameters = {
        model: 'gpt-3.5-turbo',
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Test message' }],
          },
        ],
      };

      await expect(
        contentGenerator.generateContent(testRequest, 'prompt-2'),
      ).rejects.toThrow('API request failed');
    });

    it('should handle different response formats from third-party providers', async () => {
      const mockApiResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'First choice',
            },
            finish_reason: 'stop',
            index: 0,
          },
          {
            message: {
              role: 'assistant',
              content: 'Second choice',
            },
            finish_reason: 'stop',
            index: 1,
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 40,
          total_tokens: 50,
        },
      };

      vi.spyOn(OpenAIApiClient.prototype, 'makeRequest').mockResolvedValue(
        mockApiResponse,
      );

      const testRequest: GenerateContentParameters = {
        model: 'gpt-3.5-turbo',
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Provide multiple options' }],
          },
        ],
      };

      const result = await contentGenerator.generateContent(
        testRequest,
        'prompt-3',
      );

      expect(result.candidates).toHaveLength(2);
      expect(result.candidates?.[0]?.content?.parts?.[0]?.text).toBe(
        'First choice',
      );
      expect(result.candidates?.[1]?.content?.parts?.[0]?.text).toBe(
        'Second choice',
      );
    });
  });

  describe('Full Integration Flow', () => {
    it('should process a complete request from input to response', async () => {
      // This test simulates the full flow from a user prompt to a response

      // Mock the API response
      const mockApiResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content:
                'Hello! I am an AI assistant powered by a third-party OpenAI-compatible API.',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
        usage: {
          prompt_tokens: 8,
          completion_tokens: 22,
          total_tokens: 30,
        },
        model: 'gpt-3.5-turbo',
      };

      vi.spyOn(OpenAIApiClient.prototype, 'makeRequest').mockResolvedValue(
        mockApiResponse,
      );

      // Create the content generator
      const contentGenerator = new OpenAICompatibleContentGenerator(mockConfig);

      const userInput: GenerateContentParameters = {
        model: 'gpt-3.5-turbo',
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Hello, who are you?' }],
          },
        ],
      };

      const response = await contentGenerator.generateContent(
        userInput,
        'prompt-4',
      );

      expect(response.candidates).toHaveLength(1);
      const candidate = response.candidates?.[0];
      expect(candidate?.content?.parts).toHaveLength(1);

      const responseText = candidate?.content?.parts?.[0]?.text ?? '';
      expect(responseText).toContain('Hello!');
      expect(responseText).toContain('AI assistant');
      expect(responseText).toContain('third-party OpenAI-compatible API');

      expect(response.model).toBe('gpt-3.5-turbo');
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    globalThis.fetch = originalFetch;
  });
});
