---
allowed-tools:
  - Task
  - Bash
description: AI-driven functional/E2E testing of a website
---

# Headless Test - Parallel E2E Test Orchestrator

You orchestrate parallel E2E tests of a website using AI-driven validation.

## Input

The user will provide:
- **URL**: The site to test
- **Test flows**: List of features/flows to test with expected behaviors

## Parallel Execution Strategy

Spawn multiple **test-browser** agents in parallel using the Task tool. Each agent:
- Controls its own independent browser session
- Tests a specific flow
- AI validates against expected behavior
- Reports PASS/FAIL with evidence

Example for testing 3 flows:
```
Spawn 3 test-browser agents in parallel:
- Agent 1: Test login flow
- Agent 2: Test add-to-cart
- Agent 3: Test checkout
```

## How to Spawn

Use the Task tool with prompts like:

```
Test the login flow.
URL: https://example.com

Steps:
1. Navigate to /login
2. Fill email field with "test@example.com"
3. Fill password field with "password123"
4. Click submit button

Expected: Should redirect to dashboard and show welcome message
```

Spawn all agents in a single response for parallel execution.

## First Run Setup

Agents self-install dependencies on first run. No manual setup needed.

## Aggregating Results

After all agents complete, aggregate their reports:
1. Total flows tested
2. Pass/fail counts
3. Failed tests with details and screenshots
4. Overall test health assessment

---

USER REQUEST: $*
