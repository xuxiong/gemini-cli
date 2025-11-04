---
description:
  'Task list for OpenAI-Compatible Third-Party LLM Integration feature'
---

# Tasks: OpenAI-Compatible Third-Party LLM Integration

**Input**: Design documents from `/specs/001-openai-compatible-llm/`
**Prerequisites**: plan.md (required), spec.md (required for user stories),
research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only
include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

<!-- Generated tasks for the OpenAI-Compatible Third-Party LLM Integration feature -->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure per implementation plan in packages/
- [x] T002 Initialize TypeScript project with axios dependency for HTTP requests
- [x] T003 [P] Configure linting and formatting tools per existing project
      standards

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can
be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create ThirdPartyProviderConfig model in
      packages/core/src/models/thirdPartyProviderConfig.ts
- [x] T005 [P] Update settings schema to include third-party provider options in
      packages/cli/src/config/settingsSchema.ts
- [x] T006 [P] Create API compatibility mapping utilities in
      packages/core/src/lib/apiCompatibilityMapper.ts
- [x] T007 Create OpenAI-compatible request/response models in
      packages/core/src/models/openaiModels.ts
- [x] T008 Configure error handling and logging infrastructure for third-party
      API interactions in packages/core/src/utils/errorHandler.ts
- [x] T009 Setup configuration management for third-party providers in
      packages/core/src/config/config.ts
- [x] T010 [P] Update CLI commands to support third-party provider configuration
      in packages/cli/src/commands/config.ts
- [x] T011 Create secure credential storage for third-party API keys in
      packages/core/src/core/apiKeyCredentialStorage.ts

---

## Phase 3: User Story 1 - Use Third-Party LLM Provider (Priority: P1) 🎯 MVP

**Goal**: Enable users to configure and use a third-party LLM provider that
offers an OpenAI-compatible API instead of the default Gemini models.

**Independent Test**: Can be fully tested by configuring a third-party
OpenAI-compatible API endpoint and verifying that prompts are correctly sent and
responses are properly received and displayed.

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

- [x] T012 [P] [US1] Contract test for OpenAI-compatible API endpoint in
      packages/core/tests/contract/test_openai_api.ts
- [x] T013 [P] [US1] Integration test for third-party provider functionality in
      packages/core/tests/integration/test_third_party_provider.ts

### Implementation for User Story 1

- [x] T014 [P] [US1] Create OpenAICompatibleContentGenerator class in
      packages/core/src/services/openaiCompatibleContentGenerator.ts
- [x] T015 [US1] Implement API request mapping from internal format to OpenAI
      format in packages/core/src/lib/apiCompatibilityMapper.ts
- [x] T016 [US1] Implement API response mapping from OpenAI format to internal
      format in packages/core/src/lib/apiCompatibilityMapper.ts
- [x] T017 [US1] Add HTTP client for OpenAI-compatible API calls in
      packages/core/src/services/openaiApiClient.ts
- [x] T018 [US1] Update ContentGenerator factory to include OpenAI-compatible
      option in packages/core/src/core/contentGenerator.ts
- [x] T019 [US1] Implement configuration validation for third-party provider in
      packages/core/src/config/validation.ts
- [x] T020 [US1] Add CLI command for testing third-party provider connectivity
      in packages/cli/src/commands/testProvider.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and
testable independently

---

## Phase 4: User Story 2 - Switch Between Different LLM Providers (Priority: P2)

**Goal**: Enable users to switch between different LLM providers (both Gemini
and third-party OpenAI-compatible ones) without reinstalling or reconfiguring
the CLI extensively.

**Independent Test**: Can be tested by configuring the CLI with different API
endpoints and verifying that switching between them produces responses from the
correct provider.

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T021 [P] [US2] Integration test for provider switching functionality in
      packages/core/tests/integration/test_provider_switching.ts

### Implementation for User Story 2

- [ ] T022 [P] [US2] Implement provider selection mechanism in
      packages/core/src/services/providerSelector.ts
- [ ] T023 [US2] Add CLI command for switching between providers in
      packages/cli/src/commands/switchProvider.ts
- [ ] T024 [US2] Update configuration system to handle provider switching in
      packages/core/src/config/config.ts
- [ ] T025 [US2] Implement caching for different provider configurations in
      packages/core/src/config/configCache.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work
independently

---

## Phase 5: User Story 3 - Configure API Settings for Third-Party Service (Priority: P3)

**Goal**: Allow users to adjust specific API settings such as model selection,
temperature, max tokens, or other parameters when using third-party LLM
services.

**Independent Test**: Can be tested by setting various API parameters when using
a third-party service and verifying that these parameters are properly passed
through to the service and affect the output as expected.

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T026 [P] [US3] Unit test for API parameter mapping in
      packages/core/tests/unit/test_parameter_mapping.ts

### Implementation for User Story 3

- [ ] T027 [P] [US3] Implement parameter validation for OpenAI-compatible APIs
      in packages/core/src/services/parameterValidator.ts
- [ ] T028 [US3] Add support for common OpenAI parameters (temperature, max
      tokens, etc.) in
      packages/core/src/services/openaiCompatibleContentGenerator.ts
- [ ] T029 [US3] Update CLI interface to expose API parameters in
      packages/cli/src/commands/paramConfig.ts
- [ ] T030 [US3] Implement parameter mapping between internal and OpenAI formats
      in packages/core/src/lib/apiCompatibilityMapper.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T031 [P] Documentation updates in docs/third-party-providers.md
- [ ] T032 Code cleanup and refactoring across all new modules
- [ ] T033 Performance optimization for API request handling
- [ ] T034 [P] Additional unit tests for error handling in
      packages/core/tests/unit/
- [ ] T035 Security hardening for API key handling
- [ ] T036 Run quickstart.md validation with actual third-party provider

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user
  stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No
  dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate
  with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate
  with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if
  team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for OpenAI-compatible API endpoint in packages/core/tests/contract/test_openai_api.ts"
Task: "Integration test for third-party provider functionality in packages/core/tests/integration/test_third_party_provider.ts"

# Launch all models for User Story 1 together:
Task: "Create OpenAICompatibleContentGenerator class in packages/core/src/services/openaiCompatibleContentGenerator.ts"
Task: "Add HTTP client for OpenAI-compatible API calls in packages/core/src/services/openaiApiClient.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break
  independence
