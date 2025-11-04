# Research: OpenAI-Compatible Third-Party LLM Integration

## Key Decisions

### 1. OpenAI-Compatible API Client Implementation

**Decision**: Implement a generic OpenAI-compatible API client using axios that
can work with multiple third-party providers.

**Rationale**:

- Most OpenAI-compatible services follow the same API structure (e.g.,
  OpenRouter, Perplexity, Anthropic's OpenAI compatibility layer, etc.)
- Using axios provides consistent HTTP handling with proper error handling and
  response parsing
- The approach allows for easy extension to new providers in the future
- Keeps the implementation lightweight and maintainable

**Alternatives considered**:

- Creating individual clients for each provider would add complexity without
  significant benefits
- Using a third-party library for OpenAI compatibility might introduce
  unnecessary dependencies
- Implementing a generic adapter pattern would be more complex than needed for
  this use case

### 2. Configuration Management

**Decision**: Add third-party provider configuration options to the existing
settings system, with API endpoint, authentication key, and model mapping
options.

**Rationale**:

- Integrates cleanly with the existing configuration architecture
- Maintains backward compatibility with current settings
- Allows for easy switching between providers
- Supports the requirement to store API keys in plain text in the local config
  file

**Alternatives considered**:

- Using a separate configuration file would create additional complexity
- Using environment variables would be less convenient for users
- Storing in system keychain would require more complex implementation than
  needed

### 3. Request/Response Mapping

**Decision**: Implement mapping functions to convert between internal gemini-cli
request/response formats and the OpenAI-compatible format.

**Rationale**:

- Ensures compatibility with the existing codebase while supporting new
  providers
- Maintains consistent user experience across all LLM providers
- Handles the differences between internal representation and OpenAI format
- Supports the requirement to pass common OpenAI parameters (temperature,
  max_tokens, etc.)

**Alternatives considered**:

- Creating separate code paths for different providers would create code
  duplication
- Forcing all providers to use the internal format would limit compatibility

### 4. Error Handling Strategy

**Decision**: Use standard HTTP error handling with specific error codes and
messages that indicate the type of failure.

**Rationale**:

- Provides clear feedback to users about what went wrong
- Enables appropriate retry logic for different types of errors
- Maintains consistency with existing error handling patterns
- Allows users to distinguish between authentication, network, and
  provider-specific issues

**Alternatives considered**:

- Creating custom error types would add complexity without significant benefit
- Passing through third-party error messages directly might be inconsistent
  across providers

### 5. Authentication and Security

**Decision**: Store API keys in plain text in the local configuration file,
following the specified requirement.

**Rationale**:

- Aligns with the explicit requirement from the feature specification
- Provides the simplest implementation path
- Maintains consistency with how the gemini-cli currently handles authentication
- Accepts the security trade-off as specified in the requirements

**Alternatives considered**:

- Using system credential stores would be more secure but adds platform-specific
  complexity
- Encrypting the config file would require managing an encryption key, which has
  its own security implications
