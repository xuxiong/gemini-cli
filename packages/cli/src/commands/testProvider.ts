/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * CLI command for testing third-party provider connectivity.
 */

import type { Config } from '@google/gemini-cli-core';
import type { LoadedSettings } from '../config/settings.js';
import {
  getActiveThirdPartyProviderConfig,
  OpenAICompatibleContentGenerator,
} from '@google/gemini-cli-core';
import type { GenerateContentParameters } from '@google/genai';

interface TestProviderCommandContext {
  config: Config;
  settings: LoadedSettings;
}

export const testProviderCommand = {
  name: 'test-provider',
  description: 'Test connectivity to the configured third-party provider',
  action: async (context: TestProviderCommandContext, _args: string) => {
    console.log('Testing third-party provider connectivity...');

    try {
      // Get the active third-party provider configuration
      const providerConfig = getActiveThirdPartyProviderConfig(context.config);

      if (!providerConfig) {
        console.log(
          '❌ No third-party provider is currently configured or enabled.',
        );
        console.log('Use "/config third-party" to configure a provider.');
        return;
      }

      console.log(`Provider: ${providerConfig.name || 'Unknown'}`);
      console.log(`Endpoint: ${providerConfig.endpoint}`);
      console.log(`Model: ${providerConfig.model || 'Default'}`);

      // Create a temporary content generator to test the connection
      const contentGenerator = new OpenAICompatibleContentGenerator(
        providerConfig,
      );

      console.log('Sending test request...');

      const testRequest: GenerateContentParameters = {
        model: providerConfig.model ?? 'gpt-3.5-turbo',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: 'Hello, this is a connectivity test. Please respond with a simple acknowledgment.',
              },
            ],
          },
        ],
        config: {
          temperature: 0.1,
          maxOutputTokens: 50,
        },
      };

      const result = await contentGenerator.generateContent(
        testRequest,
        'cli-test-provider',
      );

      console.log('✅ Connection successful!');
      console.log('Provider responded with:');
      console.log('------------------------');

      // Print the response from the provider
      if (result.candidates && result.candidates.length > 0) {
        const responseText = result.candidates[0].content?.parts
          ?.map((part) => part.text ?? '')
          .join('');
        console.log(responseText ?? '');
      } else {
        console.log('Received empty response from provider');
      }

      console.log('------------------------');
      console.log(
        'Third-party provider connectivity test completed successfully.',
      );
    } catch (error) {
      console.log('❌ Connection test failed:');
      console.error(error instanceof Error ? error.message : String(error));

      // Provide troubleshooting tips
      console.log('\nTroubleshooting tips:');
      console.log('• Verify your API endpoint is correct');
      console.log('• Check that your API key is valid and has not expired');
      console.log(
        '• Ensure your network connection allows access to the provider',
      );
      console.log('• Confirm the provider service is operational');
    }
  },
};

// Export as default for compatibility with the command loading system
// eslint-disable-next-line import/no-default-export
export default testProviderCommand;
