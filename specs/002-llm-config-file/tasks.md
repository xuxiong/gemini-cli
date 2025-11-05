# Implementation Tasks: LLM Configuration via File

**Feature**: LLM Configuration via File | **Branch**: `002-llm-config-file` |
**Spec**: [spec.md](./spec.md)

**Goal**: Completely remove the `/config` command and implement automatic
file-based LLM configuration. Configuration will be automatically read from a
.env file during system startup instead of prompting users in any interface,
addressing security concerns and improving user convenience.

## Phase 1: Setup

Setup tasks for initializing the project infrastructure.

- [ ] T001 Create dotenv dependency installation task for file-based
      configuration
- [ ] T002 Set up file permission checking utilities for secure config file
      handling
- [ ] T003 Add environment variable precedence logic for configuration loading

## Phase 2: Foundational Tasks

Blocking prerequisites that all user stories depend on.

- [ ] T004 Implement .env file reading utility function in core config module
- [ ] T005 Create configuration validation function that checks .env files
      follow required format
- [ ] T006 [P] Modify ThirdPartyConfigManager to support loading from .env files
- [ ] T007 [P] Update ThirdPartyConfigManager.loadFromEnvFile method per API
      contract
- [ ] T008 Update configuration loading priority logic (env vars > .env file >
      settings.json > defaults)
- [ ] T009 Create environment variable mapping based on contract specification
- [ ] T010 Implement file location strategy (custom path > current dir > user
      config dir)

## Phase 3: [US1] Configuration File Setup (Priority: P1)

Implement the core functionality for users to configure LLM credentials via file
instead of interactive input.

**Goal**: Allow users to configure third-party LLM credentials in a
configuration file instead of the interactive interface, avoiding repeatedly
entering sensitive information.

**Independent Test**: Can be fully tested by creating a configuration file with
LLM credentials and verifying the system reads and uses these credentials to
connect to the LLM service without requiring user input during runtime.

**Acceptance Scenarios**:

1. Given a properly formatted configuration file with LLM credentials exists,
   When the system starts, Then it should read the credentials from the file
   without prompting the user for them.
2. Given the system requires LLM access, When the user initiates an LLM
   operation, Then the system should use the credentials from the config file
   without asking the user to input them.

- [ ] T011 [P] [US1] Create .env file loader function in
      packages/core/src/config/thirdPartyConfig.ts
- [ ] T012 [P] [US1] Update getThirdPartyProviderConfig to prioritize .env file
      configuration
- [ ] T013 [P] [US1] Update isThirdPartyProviderEnabled to work with file-based
      configuration
- [ ] T014 [US1] Modify the CLI startup to automatically attempt .env file
      loading
- [ ] T015 [US1] Implement validation to ensure required fields exist in .env
      file
- [ ] T016 [US1] Update existing third-party provider usage to respect
      file-based credentials

## Phase 4: [US2] Config File Location and Format (Priority: P2)

Implement the functionality for users to understand where to place the
configuration file and what format it should follow.

**Goal**: Enable users to know where to place the configuration file and what
format it should follow, so they can easily set up the system with their LLM
credentials.

**Independent Test**: Can be tested by creating a config file in the expected
location with the specified format and verifying the system correctly reads the
credentials.

**Acceptance Scenarios**:

1. Given a config file exists in the default location with proper format, When
   the system starts, Then it should successfully read the LLM credentials from
   that file.
2. Given the user wants to specify a custom config file location, When they
   provide a path to the config file, Then the system should read credentials
   from that custom location.

- [ ] T017 [P] [US2] Implement standard location checking: ~/.config/gemini/ for
      .env files
- [ ] T018 [P] [US2] Implement current directory checking: ./ for .env files
- [ ] T019 [US2] Support custom config location via GEMINI_CONFIG_PATH
      environment variable
- [ ] T020 [US2] Create .env file format validation based on data model
      specification
- [ ] T021 [US2] Update documentation to reflect correct .env file format and
      locations

## Phase 5: [US3] Error Handling for Missing Config (Priority: P3)

Implement proper error handling when the configuration file is missing or has
incorrect format.

**Goal**: Provide users with appropriate feedback when the configuration file is
missing or has incorrect format, so they can take corrective action.

**Independent Test**: Can be tested by removing or creating an incorrectly
formatted config file and verifying the system provides clear error messages and
guidance to the user.

**Acceptance Scenarios**:

1. Given the config file is missing, When the system tries to access LLM
   credentials, Then it should provide a helpful error message with instructions
   on how to create the configuration file.
2. Given the config file has formatting errors, When the system tries to read
   it, Then it should provide specific error details about the formatting
   issues.

- [ ] T022 [P] [US3] Create CONFIG_FILE_NOT_FOUND error type per API contract
- [ ] T023 [P] [US3] Create CONFIG_VALIDATION_ERROR error type per API contract
- [ ] T024 [P] [US3] Create MISSING_CREDENTIALS error type per API contract
- [ ] T025 [P] [US3] Create INVALID_FORMAT error type per API contract
- [ ] T026 [US3] Implement error handling when .env file is not found
- [ ] T027 [US3] Implement error handling for invalid .env file format
- [ ] T028 [US3] Add helpful error messages with instructions for creating .env
      files
- [ ] T029 [US3] Create error response formatting per API contract specification

## Phase 6: [US4] Remove Interactive /config Command

Remove the entire `/config` command as specified in the requirements.

**Goal**: Completely remove the interactive `/config` command from the CLI to
enforce file-based configuration.

**Independent Test**: Verify that the `/config` command no longer exists in the
CLI but all other functionality remains.

**Acceptance Scenarios**:

1. Given the CLI is running, When users type `/config`, Then it should return an
   unknown command error.

- [ ] T030 [US4] Remove config command implementation from
      packages/cli/src/commands/config.ts
- [ ] T031 [US4] Remove config command import from BuiltinCommandLoader
- [ ] T032 [US4] Update BuiltinCommandLoader to exclude config command
- [ ] T033 [US4] Verify all references to the config command are removed

## Phase 7: Polish & Cross-Cutting Concerns

Final implementation details and cross-cutting concerns.

- [ ] T034 Add file permission validation (600) for .env files containing
      credentials
- [ ] T035 Implement security validation to fail securely when config issues
      occur
- [ ] T036 Update README/docs with new configuration instructions
- [ ] T037 Add integration tests for .env file loading functionality
- [ ] T038 Update TypeScript types to reflect configuration changes
- [ ] T039 Create success metrics tracking for file-based config usage

## Dependencies

### User Story Dependency Graph

```
US2 (Config file location) -> US1 (Config setup)
US3 (Error handling) -> US1 (Config setup)
US4 (Remove interactive command) -> US1 (Config setup)
```

### Parallel Execution by User Story

**User Story 1 (Config file setup)**:

- Tasks T011, T012, T013 can run in parallel (different parts of the same file)
- Tasks T014, T015 can run after T011-T013 are complete

**User Story 2 (Config file location)**:

- Tasks T017, T018 can run in parallel (different location checks)

**User Story 3 (Error handling)**:

- Tasks T022-T025 can run in parallel (different error types)

## Implementation Strategy

**MVP Scope (User Story 1)**: Just implement the core functionality to read
configuration from .env files and use those credentials instead of prompting
users. This fulfills the primary requirement of avoiding repeated credential
input.

**Incremental Delivery**:

1. MVP: Basic .env file reading and credential usage
2. Enhancement: Multiple file locations and format validation
3. Polish: Error handling, security features, documentation
4. Completion: Remove the interactive /config command completely
