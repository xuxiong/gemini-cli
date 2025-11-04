/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utilities for mapping between internal gemini-cli formats and OpenAI-compatible formats.
 */

import type { Content } from '@google/genai';
import type { ThirdPartyProviderConfig } from '../models/thirdPartyProviderConfig.js';

export interface OpenAIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIChatCompletionRequest {
  model: string;
  messages: OpenAIChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[] | null;
  stream?: boolean;
}

export interface OpenAIUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

export interface OpenAIChatCompletionResponseChoice {
  index?: number;
  finish_reason?: string | null;
  message?: {
    role?: string;
    content?: string;
  };
}

export interface OpenAIChatCompletionResponse {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices?: OpenAIChatCompletionResponseChoice[];
  usage?: OpenAIUsage;
}

export interface InternalContentMapping {
  contents: Content[];
  usage?: OpenAIUsage;
  model?: string;
}

function toAssistantRole(
  role: string | undefined,
): 'model' | 'user' | 'system' {
  if (role === 'assistant' || role === 'model') {
    return 'model';
  }
  if (role === 'system') {
    return 'system';
  }
  return 'user';
}

function partToText(part: unknown): string | null {
  if (!part) {
    return null;
  }
  if (typeof part === 'string') {
    return part;
  }
  if (typeof part === 'object' && 'text' in (part as Record<string, unknown>)) {
    const value = (part as { text?: unknown }).text;
    return typeof value === 'string' ? value : null;
  }
  return null;
}

export function mapInternalToOpenAIFormat(
  contents: Content[],
  config: ThirdPartyProviderConfig,
  model?: string,
  params?: Partial<Omit<OpenAIChatCompletionRequest, 'messages' | 'model'>>,
): OpenAIChatCompletionRequest {
  const messages: OpenAIChatMessage[] = [];

  for (const item of contents) {
    const baseRole = item.role === 'model' ? 'assistant' : item.role;
    if (item.parts && Array.isArray(item.parts)) {
      for (const part of item.parts) {
        const text = partToText(part);
        if (text) {
          messages.push({
            role: baseRole as OpenAIChatMessage['role'],
            content: text,
          });
        }
      }
    } else if (typeof (item as { text?: unknown }).text === 'string') {
      messages.push({
        role: baseRole as OpenAIChatMessage['role'],
        content: (item as { text: string }).text,
      });
    }
  }

  return {
    model: model ?? config.model ?? 'gpt-3.5-turbo',
    messages,
    ...params,
  } satisfies OpenAIChatCompletionRequest;
}

export function mapOpenAIToInternalFormat(
  response: OpenAIChatCompletionResponse,
): InternalContentMapping {
  const choices = Array.isArray(response.choices) ? response.choices : [];

  const contents: Content[] = choices
    .filter((choice) => choice.message && typeof choice.message === 'object')
    .map((choice) => {
      const message = choice.message ?? {};
      const role = toAssistantRole(message.role);
      const text = typeof message.content === 'string' ? message.content : '';
      return {
        role,
        parts: text ? [{ text }] : [],
      } satisfies Content;
    });

  return {
    contents,
    usage: response.usage,
    model: response.model,
  };
}

export function mapInternalParamsToOpenAI(
  params: Partial<Omit<OpenAIChatCompletionRequest, 'messages' | 'model'>>,
): Partial<Omit<OpenAIChatCompletionRequest, 'messages' | 'model'>> {
  const mapped: Partial<
    Omit<OpenAIChatCompletionRequest, 'messages' | 'model'>
  > = {};

  if (params.temperature !== undefined) {
    mapped.temperature = params.temperature;
  }
  if (params.max_tokens !== undefined) {
    mapped.max_tokens = params.max_tokens;
  }
  if (params.top_p !== undefined) {
    mapped.top_p = params.top_p;
  }
  if (params.frequency_penalty !== undefined) {
    mapped.frequency_penalty = params.frequency_penalty;
  }
  if (params.presence_penalty !== undefined) {
    mapped.presence_penalty = params.presence_penalty;
  }
  if (params.stop !== undefined) {
    mapped.stop = params.stop;
  }
  if (params.stream !== undefined) {
    mapped.stream = params.stream;
  }

  return mapped;
}

export function createOpenAIRequestOptions(config: ThirdPartyProviderConfig) {
  if (!config.apiKey || config.apiKey.trim() === '') {
    throw new Error('Third-party provider API key is required for requests.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
    ...(config.additionalHeaders ?? {}),
  };

  return {
    headers,
    timeout: config.timeout ?? 30_000,
  };
}
