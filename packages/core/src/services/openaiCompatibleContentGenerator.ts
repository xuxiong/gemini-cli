/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Content generator for OpenAI-compatible third-party providers.
 */

import type {
  Candidate,
  CountTokensParameters,
  CountTokensResponse,
  EmbedContentParameters,
  EmbedContentResponse,
  GenerateContentParameters,
  GenerateContentResponse,
} from '@google/genai';
import { toContents } from '../code_assist/converter.js';
import type { ContentGenerator } from '../core/contentGenerator.js';
import {
  mapInternalToOpenAIFormat,
  mapOpenAIToInternalFormat,
  mapInternalParamsToOpenAI,
  type OpenAIChatCompletionRequest,
  type OpenAIChatCompletionResponse,
} from '../lib/apiCompatibilityMapper.js';
import { OpenAIApiClient } from './openaiApiClient.js';
import { processThirdPartyError } from '../utils/errorHandler.js';
import type { ThirdPartyProviderConfig } from '../models/thirdPartyProviderConfig.js';

export class OpenAICompatibleContentGenerator implements ContentGenerator {
  private readonly apiClient: OpenAIApiClient;

  constructor(private readonly config: ThirdPartyProviderConfig) {
    this.apiClient = new OpenAIApiClient(config);
  }

  async generateContent(
    request: GenerateContentParameters,
    _userPromptId: string,
  ): Promise<GenerateContentResponse> {
    try {
      const contents = toContents(request.contents);
      const mappedParams = mapInternalParamsToOpenAI({
        temperature: request.config?.temperature,
        max_tokens: request.config?.maxOutputTokens,
        top_p: request.config?.topP,
        stop: request.config?.stopSequences,
      });

      const openAIRequest: OpenAIChatCompletionRequest = {
        ...mapInternalToOpenAIFormat(
          contents,
          this.config,
          request.model,
          mappedParams,
        ),
        stream: false,
      };

      const apiResponse = await this.apiClient.makeRequest(openAIRequest);
      return this.buildGenerateContentResponse(apiResponse, request);
    } catch (error) {
      const message = processThirdPartyError(error, this.config);
      throw new Error(message);
    }
  }

  async generateContentStream(
    request: GenerateContentParameters,
    userPromptId: string,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    const response = await this.generateContent(request, userPromptId);
    async function* stream() {
      yield response;
    }
    return stream();
  }

  async countTokens(
    _request: CountTokensParameters,
  ): Promise<CountTokensResponse> {
    throw new Error('countTokens is not supported for third-party providers.');
  }

  async embedContent(
    _request: EmbedContentParameters,
  ): Promise<EmbedContentResponse> {
    throw new Error('embedContent is not supported for third-party providers.');
  }

  async validateConfig(): Promise<boolean> {
    try {
      const testRequest: OpenAIChatCompletionRequest = {
        model: this.config.model ?? 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Test connection',
          },
        ],
        max_tokens: 5,
      };

      await this.apiClient.makeRequest(testRequest);
      return true;
    } catch (error) {
      processThirdPartyError(error, this.config);
      return false;
    }
  }

  private buildGenerateContentResponse(
    apiResponse: unknown,
    request: GenerateContentParameters,
  ): GenerateContentResponse {
    const mapping = mapOpenAIToInternalFormat(
      apiResponse as OpenAIChatCompletionResponse,
    );

    const candidates: Candidate[] = mapping.contents.map((content, index) => {
      const candidate = { content } as Candidate;
      (candidate as Record<string, unknown>)['index'] = index;
      return candidate;
    });

    const usageMetadata = mapping.usage
      ? {
          promptTokenCount: mapping.usage.prompt_tokens ?? 0,
          candidatesTokenCount: mapping.usage.completion_tokens ?? 0,
          totalTokenCount: mapping.usage.total_tokens ?? 0,
        }
      : undefined;

    const aggregatedText = candidates
      .flatMap((candidate) =>
        (candidate.content?.parts ?? []).map((part) => part.text ?? ''),
      )
      .join('');

    const responsePayload: Record<string, unknown> = {
      candidates,
      model: mapping.model ?? request.model,
      modelVersion: mapping.model ?? request.model,
      responseId:
        (apiResponse as { id?: string | null })?.id ??
        `third-party-${Date.now()}`,
      usageMetadata,
      promptFeedback: undefined,
      text: aggregatedText,
    };

    return responsePayload as unknown as GenerateContentResponse;
  }
}
