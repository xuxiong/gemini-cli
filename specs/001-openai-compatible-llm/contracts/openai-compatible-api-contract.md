# OpenAI-Compatible API Contract

This contract defines the interface for third-party OpenAI-compatible LLM
providers that can be integrated with the gemini-cli.

## Base Path

The contract assumes that third-party providers implement the OpenAI-compatible
API endpoints.

## Supported Endpoints

### Chat Completions API

**Endpoint:** `POST /chat/completions`

**Request Headers:**

- `Authorization: Bearer {API_KEY}` - Required for authentication
- `Content-Type: application/json` - Required for request body

**Request Body:**

```json
{
  "model": "string",
  "messages": [
    {
      "role": "string",
      "content": "string"
    }
  ],
  "temperature": "number (optional)",
  "max_tokens": "number (optional)",
  "top_p": "number (optional)",
  "frequency_penalty": "number (optional)",
  "presence_penalty": "number (optional)",
  "stop": "string or array of strings (optional)"
}
```

**Response:**

```json
{
  "id": "string",
  "object": "chat.completion",
  "created": "number",
  "model": "string",
  "choices": [
    {
      "index": "number",
      "message": {
        "role": "string",
        "content": "string"
      },
      "finish_reason": "string"
    }
  ],
  "usage": {
    "prompt_tokens": "number",
    "completion_tokens": "number",
    "total_tokens": "number"
  }
}
```

### Completions API

**Endpoint:** `POST /completions`

**Request Headers:**

- `Authorization: Bearer {API_KEY}` - Required for authentication
- `Content-Type: application/json` - Required for request body

**Request Body:**

```json
{
  "model": "string",
  "prompt": "string",
  "suffix": "string (optional)",
  "max_tokens": "number (optional)",
  "temperature": "number (optional)",
  "top_p": "number (optional)",
  "frequency_penalty": "number (optional)",
  "presence_penalty": "number (optional)",
  "stop": "string or array of strings (optional)"
}
```

**Response:**

```json
{
  "id": "string",
  "object": "text_completion",
  "created": "number",
  "model": "string",
  "choices": [
    {
      "text": "string",
      "index": "number",
      "logprobs": "object or null",
      "finish_reason": "string"
    }
  ],
  "usage": {
    "prompt_tokens": "number",
    "completion_tokens": "number",
    "total_tokens": "number"
  }
}
```

## Error Responses

All endpoints may return standard HTTP error responses:

- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Invalid or missing API key
- **403 Forbidden**: Insufficient permissions
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side error

**Error Response Format:**

```json
{
  "error": {
    "message": "string",
    "type": "string",
    "param": "string or null",
    "code": "string or null"
  }
}
```

## Common Parameters Support

The following common OpenAI parameters must be supported:

- `model`: Specifies which model to use
- `temperature`: Controls randomness in output (0.0-2.0)
- `max_tokens`: Maximum number of tokens to generate
- `top_p`: Controls diversity via nucleus sampling (0.0-1.0)
- `frequency_penalty`: How much to penalize new tokens based on frequency
  (0.0-2.0)
- `presence_penalty`: How much to penalize new tokens based on presence
  (0.0-2.0)
- `stop`: Up to 4 sequences where API will stop generating tokens
