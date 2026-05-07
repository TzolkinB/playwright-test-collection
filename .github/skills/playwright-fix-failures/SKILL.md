---
name: playwright-fix-failures
description: 'Use when npm test fails, Playwright tests fail, or lint/type errors appear in test runs. Iteratively fix each failure one by one by correcting underlying test code, fixtures, helpers, page objects, selectors, or setup logic. Do not weaken assertions. Remove temporary debugging artifacts after tests pass.'
argument-hint: '[optional failing command or failure summary]'
user-invocable: true
---

# Playwright Test Failure Triage

## When To Use

- A test run failed after npm test or npx playwright test.
- CI or local output shows Playwright failures, lint errors, or typecheck errors.
- You want root-cause fixes without loosening expectations.

## Required Workflow

1. Run the failing command and capture all failures.
2. If the run succeeds, stop and make no code changes.
3. If the run fails, create a numbered failure list from the output.
4. Fix failures one at a time in priority order.
5. After each individual fix, run the smallest relevant test scope first, then continue to the next failure.
6. After all individual failures are fixed, run npm test to confirm full pass.

## Fixing Rules

- Do fix underlying code and configuration issues.
- Do fix shared helpers, fixtures, selectors, waits, retries, and page object logic when they are the root cause.
- Do not bypass or weaken assertions to make failures disappear.
- Do not delete meaningful test coverage to force a pass.
- Keep fixes minimal and localized to the identified root cause.

## Cleanup Rules

- Remove temporary debug files and one-off diagnostics after the suite passes.
- Remove ad hoc logging and temporary tracing added only for debugging.
- Do not leave scratch scripts, throwaway notes, or temporary artifacts in the repository.
- Before finishing, verify no temporary files remain and rerun tests.

## Completion Criteria

- All previously failing tests now pass.
- No assertion weakening was used as a shortcut.
- No temporary debugging artifacts remain.
- Final validation command completed successfully.
