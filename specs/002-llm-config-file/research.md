# Research for LLM Configuration via File

## Decision: Remove the entire /config command and implement automatic file-based configuration

- **Rationale**: The feature specification requires that users no longer need to
  fill in third-party LLM information through any interactive interface.
  Instead, configuration should be automatically read from a .env file to avoid
  repeatedly entering sensitive information and improve security. The entire
  `/config` command is not needed anymore.

## Background

- Current `/config` command provides an interactive interface for users to input
  third-party LLM credentials
- The interactive interface stores credentials in settings.json but requires
  users to input them each time if not saved
- The new approach will automatically read credentials from a .env file during
  system startup, completely removing the need for any interactive configuration
  commands

## Technical Approach

1. **Completely remove** the `/config` command from the CLI
2. **Add automatic .env file reading capability** to the configuration system
3. **Preserve existing functionality** for all other CLI operations
4. **Maintain backward compatibility** where possible for other authentication
   methods

## .env File Format

- The system will support .env format for environment-specific configurations
- Expected format:

```env
OPENAI_API_ENDPOINT=https://api.openai.com/v1
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4
PROVIDER_NAME=OpenAI
```

## File Location Strategy

- Default location: `~/.config/gemini/` or `./config/` or look for `.env` file
  in current directory
- Allow users to specify custom config file location via environment variable
  `GEMINI_CONFIG_PATH`
- Will automatically attempt to load configuration during CLI startup

## Security Considerations

- Implement file permission controls (600) for .env files containing credentials
- Fail securely by stopping execution when config issues occur
- Add validation to ensure configuration file format is correct

## Alternatives Considered

1. **Keep /config command with non-interactive mode**: Rejected as the
   requirement is to completely remove the command
2. **JSON configuration file**: Rejected in favor of .env format as specified in
   requirements
3. **YAML configuration file**: Rejected in favor of .env format as specified in
   requirements

## Implementation Strategy

1. Modify the existing `ThirdPartyConfigManager` to automatically read from .env
   file
2. Remove the `/config` command implementation completely from
   packages/cli/src/commands/
3. Update the command loader to not load the config command
4. Modify the configuration loading system to try to load from .env file first
   during startup
5. Maintain all existing authentication methods for backward compatibility
