# API Contracts for LLM Configuration via File

## Overview

This document outlines the API contracts for the file-based LLM configuration
feature, focusing on the interfaces that will be modified or used.

## Configuration Loading Interface

### Core Configuration Loading Function

```typescript
interface ConfigLoader {
  /**
   * Loads configuration from .env file with the following precedence:
   * 1. Environment variables (highest priority)
   * 2. .env file configuration
   * 3. Existing settings.json configuration
   * 4. Default values (lowest priority)
   *
   * @param configPath Optional custom path to .env file
   * @returns Promise containing the merged configuration object
   */
  loadConfigFromEnv: (configPath?: string) => Promise<Config | null>;
}
```

### Environment Variable Mapping

The following environment variables will be recognized by the system:

| Environment Variable  | Type    | Description                                    | Maps to Config Field                 |
| --------------------- | ------- | ---------------------------------------------- | ------------------------------------ |
| `OPENAI_API_ENDPOINT` | String  | The base URL for the OpenAI-compatible API     | `config.thirdPartyProvider.endpoint` |
| `OPENAI_API_KEY`      | String  | Authentication key for the API service         | `config.thirdPartyProvider.apiKey`   |
| `OPENAI_MODEL`        | String  | Default model to use (optional)                | `config.thirdPartyProvider.model`    |
| `PROVIDER_NAME`       | String  | Display name for the provider configuration    | `config.thirdPartyProvider.name`     |
| `REQUEST_TIMEOUT`     | Number  | Request timeout in milliseconds (optional)     | `config.thirdPartyProvider.timeout`  |
| `CONFIG_ENABLED`      | Boolean | Whether this configuration is currently active | `config.thirdPartyProvider.enabled`  |
| `GEMINI_CONFIG_PATH`  | String  | Custom path to .env configuration file         | Config file location                 |

## ThirdPartyConfigManager Interface Changes

The ThirdPartyConfigManager will be updated to support file-based configuration:

```typescript
class ThirdPartyConfigManager {
  /**
   * Gets the third-party provider configuration, now prioritizing .env file
   * @param config The main application config
   * @returns The third-party provider configuration or undefined if not configured
   */
  static getThirdPartyProviderConfig(
    config: Config,
  ): ThirdPartyProviderConfig | undefined;

  /**
   * Loads configuration from .env file
   * @param configPath Optional custom path to .env file
   * @returns Promise containing the configuration object loaded from file
   */
  static loadFromEnvFile(
    configPath?: string,
  ): Promise<ThirdPartyProviderConfig | null>;

  /**
   * Validates the third-party provider configuration loaded from file
   * @param config The third-party provider configuration to validate
   * @returns An array of validation errors, empty if valid
   */
  static validateConfig(config: ThirdPartyProviderConfig): string[];

  /**
   * Checks if a third-party provider is properly configured and enabled
   * @param config The main application config
   * @returns True if a third-party provider is configured and enabled
   */
  static isThirdPartyProviderEnabled(config: Config): boolean;
}
```

## Command System Changes

### Command Loading Interface

The command loading system will no longer load the `/config` command:

```typescript
interface BuiltinCommandLoader {
  /**
   * Loads all built-in commands except for the `/config` command
   * @returns Array of all available built-in slash commands except /config
   */
  loadBuiltinCommands(): SlashCommand[];
}
```

## Configuration File Format

### .env File Format

The system will read configuration from .env files in this format:

```env
# API Configuration
OPENAI_API_ENDPOINT=https://api.openai.com/v1
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4
PROVIDER_NAME=OpenAI
REQUEST_TIMEOUT=30000
CONFIG_ENABLED=true
```

### Default Configuration Locations

The system will check for .env files in the following locations in order:

1. Custom location specified by `GEMINI_CONFIG_PATH` environment variable
2. Current working directory: `./.env`
3. User config directory: `~/.config/gemini/.env`

## Error Handling Contracts

### Configuration Loading Errors

When configuration loading fails, the system will throw specific errors:

```typescript
interface ConfigError {
  type:
    | 'CONFIG_FILE_NOT_FOUND'
    | 'CONFIG_VALIDATION_ERROR'
    | 'MISSING_CREDENTIALS'
    | 'INVALID_FORMAT';
  message: string;
  details?: any;
}
```

### Error Response Format

All configuration-related errors will follow this format:

```json
{
  "error": {
    "type": "CONFIG_FILE_NOT_FOUND",
    "message": "Configuration file not found at specified path: /path/to/config/.env",
    "details": {
      "path": "/path/to/config/.env",
      "triedPaths": [
        "/path/to/config/.env",
        "/home/user/.config/gemini/.env",
        "./.env"
      ]
    }
  }
}
```
