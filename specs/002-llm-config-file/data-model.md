# Data Model for LLM Configuration via File

## ThirdPartyProviderConfig (from existing model)

```typescript
interface ThirdPartyProviderConfig {
  endpoint: string; // The base URL for the OpenAI-compatible API
  apiKey: string; // Authentication key for the API service
  model?: string; // Default model to use (optional)
  name?: string; // Display name for the provider configuration (optional)
  timeout?: number; // Request timeout in milliseconds (optional)
  additionalHeaders?: Record<string, string>; // Additional headers to include with requests (optional)
  enabled: boolean; // Whether this configuration is currently active
}
```

## .env File Structure

The .env file will contain environment variables that map directly to the
ThirdPartyProviderConfig:

- `OPENAI_API_ENDPOINT` - Maps to `endpoint` field
- `OPENAI_API_KEY` - Maps to `apiKey` field
- `OPENAI_MODEL` - Maps to `model` field
- `PROVIDER_NAME` - Maps to `name` field
- `REQUEST_TIMEOUT` - Maps to `timeout` field
- `CONFIG_ENABLED` - Maps to `enabled` field (boolean value)

## Configuration Loading Priority

The system will load configuration in the following priority order:

1. Environment variables (highest priority)
2. .env file configuration
3. Existing settings.json configuration
4. Default values (lowest priority)

## Validation Rules

- The `endpoint` field must be a valid HTTPS URL
- The `apiKey` field must be present and not empty
- If `CONFIG_ENABLED` is set, it must be a boolean value (true/false)
- The `timeout` field must be a positive number if specified
