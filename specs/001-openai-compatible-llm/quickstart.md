# Quickstart: OpenAI-Compatible Third-Party LLM Integration

This guide provides a quick introduction to using third-party OpenAI-compatible
LLM providers with the gemini-cli.

## Prerequisites

- gemini-cli installed and working
- API key from your chosen third-party OpenAI-compatible provider
- API endpoint URL from your provider

## Configuration

1. Configure your third-party provider:

```bash
gemini config set thirdPartyProvider.endpoint "https://api.provider.com/v1"
gemini config set thirdPartyProvider.apiKey "your-api-key-here"
gemini config set thirdPartyProvider.model "model-name"  # optional, defaults to provider's default
```

2. Verify your configuration:

```bash
gemini test-provider
```

## Usage

Once configured, you can use the third-party provider just like you would use
the default gemini models:

```bash
gemini "Hello, how are you?"
```

The command will route to your configured third-party provider and return the
response.

## Setting Parameters

You can set common OpenAI-compatible parameters:

```bash
gemini --temperature 0.7 --max-tokens 500 "Your prompt here"
```

## Switching Back to Default

To temporarily use the default Gemini models instead of your configured
third-party provider:

```bash
gemini --default "Your prompt here"
```

## Testing Different Providers

To test a different provider configuration without changing your default:

1. Save your current configuration:

```bash
gemini config export > my-config.json
```

2. Set up new provider:

```bash
gemini config set thirdPartyProvider.endpoint "https://newprovider.com/v1"
gemini config set thirdPartyProvider.apiKey "new-api-key"
```

3. Use the new provider:

```bash
gemini "Your prompt here"
```

4. Restore your original configuration:

```bash
gemini config import my-config.json
```

## Troubleshooting

If you encounter errors:

- Check that your API key is correct
- Verify the endpoint URL is properly formatted
- Confirm that your provider supports the model you're trying to use
- Check if you've exceeded rate limits with your provider
