/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { HybridTokenStorage } from '../mcp/token-storage/hybrid-token-storage.js';
import type { OAuthCredentials } from '../mcp/token-storage/types.js';

const SERVICE_NAME = 'third-party-openai-provider';
const DEFAULT_SERVER_NAME = 'default-api-key';

let storagePromise: Promise<HybridTokenStorage> | null = null;

async function getStorage(): Promise<HybridTokenStorage> {
  if (!storagePromise) {
    storagePromise = Promise.resolve(new HybridTokenStorage(SERVICE_NAME));
  }
  return await storagePromise;
}

function buildCredentials(apiKey: string): OAuthCredentials {
  return {
    serverName: DEFAULT_SERVER_NAME,
    token: {
      accessToken: apiKey,
      tokenType: 'ApiKey',
    },
    updatedAt: Date.now(),
  };
}

export async function loadApiKey(): Promise<string | null> {
  try {
    const storage = await getStorage();
    const credentials = await storage.getCredentials(DEFAULT_SERVER_NAME);
    return credentials?.token.accessToken ?? null;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message === 'Token file does not exist'
    ) {
      return null;
    }

    console.warn('Failed to load API key from storage:', error);
    return null;
  }
}

export async function saveApiKey(
  apiKey: string | null | undefined,
): Promise<void> {
  const storage = await getStorage();

  if (!apiKey) {
    await storage.deleteCredentials(DEFAULT_SERVER_NAME);
    return;
  }

  await storage.setCredentials(buildCredentials(apiKey));
}

export async function clearApiKey(): Promise<void> {
  const storage = await getStorage();
  await storage.deleteCredentials(DEFAULT_SERVER_NAME);
}
