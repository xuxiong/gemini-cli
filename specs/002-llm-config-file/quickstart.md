# Quickstart: Setting Up LLM Configuration via File

## Overview

This guide will help you configure your third-party LLM credentials using a
configuration file instead of the interactive interface.

## Prerequisites

- Node.js v20+ installed
- Access to your preferred OpenAI-compatible LLM provider
- API credentials from your LLM provider

## Step 1: Create a .env Configuration File

Create a `.env` file in one of these locations:

- Current working directory: `./.env`
- User config directory: `~/.config/gemini/.env`
- Custom location (set via environment variable)

The file should contain your LLM provider credentials in this format:

```env
OPENAI_API_ENDPOINT=https://api.openai.com/v1
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4
PROVIDER_NAME=OpenAI
CONFIG_ENABLED=true
```

## Step 2: Set Proper File Permissions

For security, set proper permissions on your .env file:

```bash
chmod 600 ~/.config/gemini/.env
```

## Step 3: Verify Configuration

Start the Gemini CLI as you normally would. The system will automatically detect
and load your configuration from the .env file.

```bash
npx @google/gemini-cli
```

## Step 4: Test the Connection

Once the CLI starts, you can test that your configuration is working by running:

```
/test third-party
```

## Custom Configuration Location

If you want to store your configuration in a custom location, set the
environment variable:

```bash
export GEMINI_CONFIG_PATH="/path/to/your/custom/config/.env"
```

## Troubleshooting

### Configuration Not Loading

- Verify your .env file exists in one of the expected locations
- Check that file permissions are set correctly (600)
- Ensure all required values are properly set in your .env file

### Invalid Configuration

- Check that your API endpoint is a valid HTTPS URL
- Verify that your API key is not empty
- Ensure CONFIG_ENABLED is set to 'true' to enable the configuration

### Security Warning

Never commit your .env file to version control or share it publicly. The file
contains sensitive credentials that could be misused if exposed.
