/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Contract test for OpenAI-compatible API endpoint.
 * This test ensures our implementation adheres to the OpenAI API contract.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ThirdPartyProviderConfig } from '../../src/models/thirdPartyProviderConfig.js';
import { OpenAICompatibleContentGenerator } from '../../src/services/openaiCompatibleContentGenerator.js';
import {
  mapInternalToOpenAIFormat,
  mapOpenAIToInternalFormat,
  mapInternalParamsToOpenAI,
} from '../../src/lib/apiCompatibilityMapper.js';
import type { Content } from '@google/gemini-cli-core';

describe('OpenAI-Compatible API Contract', () => {
  const mockConfig: ThirdPartyProviderConfig = {
    endpoint: 'https://api.example.com/v1',
    apiKey: 'test-api-key',
    model: 'gpt-3.5-turbo',
    name: 'Test Provider',
    enabled: true,
  };

  describe('API Compatibility Mapper', () => {
    describe('mapInternalToOpenAIFormat', () => {
      it('should correctly map internal content to OpenAI messages format', () => {
        const internalContent: Content[] = [
          {
            role: 'user',
            parts: [{ text: 'Hello, how are you?' }],
          },
          {
            role: 'model',
            parts: [{ text: 'I am doing well, thank you!' }],
          },
        ];

        const result = mapInternalToOpenAIFormat(internalContent, mockConfig);

        expect(result).toHaveProperty('messages');
        expect(Array.isArray(result.messages)).toBe(true);
        expect(result.messages).toHaveLength(2);

        expect(result.messages[0]).toEqual({
          role: 'user',
          content: 'Hello, how are you?',
        });

        expect(result.messages[1]).toEqual({
          role: 'assistant', // Note: model role maps to assistant in OpenAI format
          content: 'I am doing well, thank you!',
        });
      });

      it('should use the provided model parameter if available', () => {
        const internalContent: Content[] = [
          { role: 'user', parts: [{ text: 'Test' }] },
        ];
        const model = 'gpt-4';

        const result = mapInternalToOpenAIFormat(
          internalContent,
          mockConfig,
          model,
        );

        expect(result.model).toBe(model);
      });

      it('should use the config model if no model parameter is provided', () => {
        const internalContent: Content[] = [
          { role: 'user', parts: [{ text: 'Test' }] },
        ];

        const result = mapInternalToOpenAIFormat(internalContent, mockConfig);

        expect(result.model).toBe(mockConfig.model);
      });

      it('should use a default model if neither provided model nor config model is available', () => {
        const internalContent: Content[] = [
          { role: 'user', parts: [{ text: 'Test' }] },
        ];
        const configWithoutModel = { ...mockConfig, model: undefined };

        const result = mapInternalToOpenAIFormat(
          internalContent,
          configWithoutModel,
        );

        expect(result.model).toBe('gpt-3.5-turbo'); // Default fallback
      });

      it('should include additional parameters', () => {
        const internalContent: Content[] = [
          { role: 'user', parts: [{ text: 'Test' }] },
        ];
        const params = { temperature: 0.7, max_tokens: 150 };

        const result = mapInternalToOpenAIFormat(
          internalContent,
          mockConfig,
          undefined,
          params,
        );

        expect(result.temperature).toBe(0.7);
        expect(result.max_tokens).toBe(150);
      });
    });

    describe('mapOpenAIToInternalFormat', () => {
      it('should correctly map OpenAI response to internal format', () => {
        const openAIResponse = {
          choices: [
            {
              message: {
                role: 'assistant',
                content: 'This is the response content',
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
        };

        const result = mapOpenAIToInternalFormat(openAIResponse);

        expect(result.contents).toHaveLength(1);
        expect(result.contents[0]).toHaveProperty('role', 'model');
        expect(result.contents[0]).toHaveProperty('parts');
        expect(Array.isArray(result.contents[0].parts)).toBe(true);
        expect(result.contents[0].parts).toHaveLength(1);
        expect(result.contents[0].parts[0]).toHaveProperty(
          'text',
          'This is the response content',
        );
        expect(result.usage).toEqual({
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        });
      });

      it('should handle multiple choices from OpenAI response', () => {
        const openAIResponse = {
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
        };

        const result = mapOpenAIToInternalFormat(openAIResponse);

        expect(result.contents).toHaveLength(2);
        expect(result.contents[0].parts?.[0]?.text).toBe('First choice');
        expect(result.contents[1].parts?.[0]?.text).toBe('Second choice');
      });

      it('should handle response without usage data', () => {
        const openAIResponse = {
          choices: [
            {
              message: {
                role: 'assistant',
                content: 'Response without usage',
              },
              finish_reason: 'stop',
              index: 0,
            },
          ],
        };

        const result = mapOpenAIToInternalFormat(openAIResponse);

        expect(result.contents).toHaveLength(1);
        expect(result.usage).toBeUndefined();
      });
    });

    describe('mapInternalParamsToOpenAI', () => {
      it('should map common parameters to OpenAI format', () => {
        const internalParams = {
          temperature: 0.7,
          max_tokens: 150,
          top_p: 0.9,
          frequency_penalty: 0.5,
          presence_penalty: 0.5,
          stop: ['stop_sequence'],
        };

        const result = mapInternalParamsToOpenAI(internalParams);

        expect(result.temperature).toBe(0.7);
        expect(result.max_tokens).toBe(150);
        expect(result.top_p).toBe(0.9);
        expect(result.frequency_penalty).toBe(0.5);
        expect(result.presence_penalty).toBe(0.5);
        expect(result.stop).toEqual(['stop_sequence']);
      });

      it('should only include parameters that are defined', () => {
        const internalParams = {
          temperature: 0.7,
          // max_tokens is undefined
          top_p: 0.9,
          // other params are undefined
        };

        const result = mapInternalParamsToOpenAI(internalParams);

        expect(result.temperature).toBe(0.7);
        expect(result.top_p).toBe(0.9);
        expect(result).not.toHaveProperty('max_tokens');
        expect(result).not.toHaveProperty('frequency_penalty');
        expect(result).not.toHaveProperty('presence_penalty');
        expect(result).not.toHaveProperty('stop');
      });
    });
  });

  describe('OpenAI Compatible Content Generator', () => {
    let contentGenerator: OpenAICompatibleContentGenerator;

    beforeEach(() => {
      contentGenerator = new OpenAICompatibleContentGenerator(mockConfig);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should initialize with the provided configuration', () => {
      expect(contentGenerator).toBeDefined();
      // Since we can't directly access the config due to privacy,
      // we'll test that the instance was created successfully
    });

    // More tests would go here for the actual content generation functionality
    // but that would require a more complex setup with HTTP mocks
  });
});
