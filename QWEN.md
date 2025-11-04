# Gemini CLI Project Context

## Project Overview

Gemini CLI is an open-source AI agent that brings the power of Google's Gemini
AI directly into the terminal. It provides lightweight access to Gemini models,
giving users the most direct path from their prompt to the AI model. The project
is built with Node.js and uses a monorepo structure with multiple packages.

### Key Features

- **AI Integration**: Access to powerful Gemini 2.5 Pro with 1M token context
  window
- **Built-in Tools**: Google Search grounding, file operations, shell commands,
  web fetching
- **Extensibility**: Model Context Protocol (MCP) support for custom
  integrations
- **Terminal-first Design**: Built for developers who live in the command line
- **Sandboxing**: Security features to safely execute commands
- **Authentication Options**: OAuth with Google account, API key, or Vertex AI

### Project Architecture

- **Monorepo Structure**: Uses npm workspaces with multiple packages
- **Core Package**: `@google/gemini-cli-core` - Contains the core backend logic
- **CLI Package**: `@google/gemini-cli` - The command-line interface
- **Additional Packages**: `a2a-server`, `vscode-ide-companion`, `test-utils`

### Technologies Used

- **Language**: TypeScript/JavaScript
- **Framework**: React (via Ink for terminal UI)
- **Build Tool**: esbuild, npm scripts
- **Testing**: Vitest
- **Linting**: ESLint with Prettier
- **Platform**: Node.js (requires >=20.0.0)

## Building and Running

### Prerequisites

- Node.js version 20 or higher (development uses ~20.19.0)
- Git
- For sandboxing, optionally Docker, Podman, or macOS seatbelt

### Setup Commands

```bash
# Clone the repository
git clone https://github.com/google-gemini/gemini-cli.git
cd gemini-cli

# Install dependencies
npm install

# Build the project
npm run build

# Or build all (including sandbox container)
npm run build:all
```

### Running the CLI

```bash
# Start the CLI in development mode
npm start

# Or run in debug mode
npm run debug
```

### Testing Commands

```bash
# Run all tests
npm run test

# Run integration tests
npm run test:e2e

# Run preflight checks (format, lint, test)
npm run preflight
```

### Alternative Commands via Makefile

```bash
# Install dependencies
make install

# Build project
make build

# Run tests
make test

# Format code
make format

# Lint code
make lint

# Run preflight checks
make preflight
```

### Development Workflow

- Use `npm run preflight` before submitting changes to ensure all checks pass
- Code follows ESLint and Prettier formatting standards
- Conventional Commits standard for commit messages
- Sandboxing recommended for security during development

## Development Conventions

### Code Structure

- `packages/`: Contains individual sub-packages
  - `cli/`: The command-line interface
  - `core/`: Core backend logic
  - `a2a-server/`: A2A server implementation (experimental)
  - `vscode-ide-companion/`: VS Code extension
  - `test-utils/`: Utilities for testing
- `docs/`: Documentation files
- `scripts/`: Build and development scripts
- `integration-tests/`: End-to-end test suite

### Testing Guidelines

- Unit tests in each package directory using Vitest
- Integration tests in the `integration-tests/` directory
- All tests must pass before submitting pull requests
- Use `npm run preflight` to run all checks

### Contribution Guidelines

- Follow existing code style and patterns in the codebase
- PRs should be linked to an existing issue
- Keep PRs small and focused on a single issue or feature
- Update documentation in `/docs` for user-facing changes
- Write clear commit messages following Conventional Commits
- Sign the Google CLA before contributing

### Debugging Tools

- VS Code debugging configuration available
- React DevTools integration for UI debugging (use `DEV=true npm start`)
- Use `DEBUG=1 gemini` to enable debug output inside sandbox

### Sandboxing Options

- macOS: Uses Seatbelt with permissive or restrictive profiles
- Container-based: Docker/Podman support for stronger isolation
- Proxy networking support to control outbound traffic

## Active Technologies

- TypeScript/JavaScript, Node.js v20+ + axios for HTTP requests, existing
  project dependencies in package.json (001-openai-compatible-llm)
- Local configuration file (plain text in user's config directory)
  (001-openai-compatible-llm)

## Recent Changes

- 001-openai-compatible-llm: Added TypeScript/JavaScript, Node.js v20+ + axios
  for HTTP requests, existing project dependencies in package.json
