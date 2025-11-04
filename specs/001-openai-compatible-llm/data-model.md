# Data Model: OpenAI-Compatible Third-Party LLM Integration

## Entities

### API Configuration

The API Configuration entity contains all information needed to connect to a
third-party OpenAI-compatible service.

**Fields:**

- `endpoint` (string): The base URL for the OpenAI-compatible API
- `apiKey` (string): Authentication key for the API service
- `model` (string, optional): Default model to use (e.g., "gpt-4",
  "claude-3-opus", etc.)
- `name` (string, optional): Display name for the provider configuration
- `timeout` (number, optional): Request timeout in milliseconds (defaults to
  gemini behavior)
- `additionalHeaders` (object, optional): Additional headers to include with
  requests
- `enabled` (boolean): Whether this configuration is currently active

**Validation Rules:**

- `endpoint` must be a valid URL with HTTPS protocol
- `apiKey` must be a non-empty string
- `model` must be a valid model identifier for the provider if specified
- `timeout` must be a positive number if specified

### Request Parameters

The Request Parameters entity contains the input data for an LLM request.

**Fields:**

- `prompt` (string): The main input text for the LLM
- `model` (string, optional): The model to use for this request
- `temperature` (number, optional): Controls randomness in output (0.0-2.0)
- `max_tokens` (number, optional): Maximum number of tokens to generate
- `top_p` (number, optional): Controls diversity via nucleus sampling (0.0-1.0)
- `frequency_penalty` (number, optional): How much to penalize new tokens based
  on frequency (0.0-2.0)
- `presence_penalty` (number, optional): How much to penalize new tokens based
  on presence (0.0-2.0)
- `stop` (string[] | string, optional): Up to 4 sequences where API will stop
  generating tokens

**Validation Rules:**

- `prompt` must be a non-empty string
- `temperature`, `max_tokens`, `top_p`, `frequency_penalty`, `presence_penalty`
  must fall within provider-specific ranges
- `stop` sequences must be valid strings if provided

### Response Data

The Response Data entity contains the output from an LLM request.

**Fields:**

- `choices` (array): Array of response choices
  - `text` (string): The generated text
  - `index` (number): Index of the choice
  - `finish_reason` (string): Reason the model stopped generating (e.g., "stop",
    "length", "content_filter")
- `usage` (object): Token usage information
  - `prompt_tokens` (number): Number of tokens in the prompt
  - `completion_tokens` (number): Number of tokens in the generated response
  - `total_tokens` (number): Total number of tokens used
- `model` (string): The model that generated the response
- `created` (number): Unix timestamp of when the response was created

**Validation Rules:**

- `choices` array must contain at least one choice
- `text` in choices must be a non-empty string
- `usage` values must be non-negative numbers

### Model Mapping

The Model Mapping entity translates between internal model names and
provider-specific model identifiers.

**Fields:**

- `internalName` (string): The internal model identifier used by the gemini-cli
- `providerName` (string): The provider-specific model name
- `providerEndpoint` (string): The endpoint this mapping applies to

**Validation Rules:**

- `internalName` and `providerName` must be non-empty strings
- `providerEndpoint` must be a valid endpoint from API Configuration

### Authentication Credentials

The Authentication Credentials entity contains secure information for API
access.

**Fields:**

- `apiKey` (string): API key for authentication
- `providerEndpoint` (string): The endpoint this key is valid for

**Validation Rules:**

- `apiKey` must be a non-empty string that meets the format requirements for the
  provider
- `providerEndpoint` must match a configured endpoint in API Configuration
