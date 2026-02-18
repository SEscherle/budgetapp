---
name: budget-qa
description: |
  Use when working with Playwright E2E tests for the Arctic Budget app. Triggers:
  (1) Creating or modifying test specs, page objects, or fixtures
  (2) Debugging test failures or flakiness
  (3) Reviewing test coverage against PRD requirements (RTM)
  (4) Running or configuring tests locally or in CI
  (5) Adding new page objects or helpers
---

# Budget QA - Playwright Test Skill

## Project Context

This is a QA testing project for the **Arctic Budget** web app (Angular 21 + Firebase envelope budgeting).
Tests run against `https://arctic-budget-qa.web.app/` using Playwright 1.58.2 + axe-core.

## File Structure

```
tests/
  fixtures/auth.fixture.ts      Auth fixture with storage-state caching
  pages/*.page.ts               Page Object Models (LoginPage, BudgetPage)
  helpers/a11y.helper.ts        axe-core accessibility helper
  system/*.spec.ts              System tests (@system tag)
  integration/*.spec.ts         Integration tests (@integration tag)
docs/qa/
  playwright.md                 QA runbook (scope, structure, conventions)
  rtm.md                        Requirements Traceability Matrix
  checklist.md                  Manual QA checklist (156 items)
  results1.md                   Defect log and test run history
```

## Mandatory Rules

### 1. Tagging

Every `test.describe()` block MUST include exactly one tag in its name string:
- `@system` - single-feature, isolated checks against one PRD requirement
- `@integration` - cross-feature flows spanning multiple pages

```ts
// CORRECT
test.describe('Authentication @system', () => { ... });
test.describe('Auth -> Budget Integration @integration', () => { ... });

// WRONG - no tag
test.describe('Authentication', () => { ... });
```

### 2. Selectors - Strict Policy

**Allowed** (in priority order):
1. `page.getByRole('button', { name: /sign in/i })` - PREFERRED
2. `page.getByLabel('Email')`
3. `page.getByText(/ready to assign/i)`
4. `page.getByPlaceholder(/search transactions/i)`
5. `page.getByTestId('sidebar-account-balance')` - for stable app `data-testid` attributes

**Forbidden** - NEVER use bare CSS selectors like:
```ts
// FORBIDDEN
page.locator('.btn-primary')
page.locator('#submit')
page.locator('div > span.amount')
```

**Exception**: Structural CSS selectors are allowed ONLY when no role/testid/text alternative exists AND the selector targets a semantic HTML element:
```ts
// Allowed exceptions (semantic + structural)
page.locator('aside.sidebar')           // semantic landmark
page.locator('tr.group-row')            // table row with stable class
page.locator('.month-selector button:first-child')  // positional within stable container
```

Document any CSS exception with a comment explaining why no alternative exists.

### 3. Page Object Model

Use POM only where it eliminates duplication across 2+ spec files:
- `LoginPage` - sign-in interactions (used by system + integration + fixtures)
- `BudgetPage` - month nav, categories, assignments (used by system + integration)

Do NOT create a POM for a page used in only one spec file. Use inline locators instead.

### 4. Test Naming

Tests MUST reference their PRD requirement ID:
```ts
test('FR-AUTH-01: Sign-in page loads with email and password fields', ...);
test('FR-NAV-03: Month navigation forward/back arrows', ...);
```

Integration tests use descriptive flow names:
```ts
test('Sign in and verify budget loads with data', ...);
```

### 5. Wait Strategy

NEVER use `waitForLoadState('networkidle')` - Firestore real-time subscriptions prevent it.

Use instead:
```ts
await page.goto('/budget', { waitUntil: 'domcontentloaded' });
await page.getByText(/ready to assign/i).waitFor({ state: 'visible', timeout: 15_000 });
await page.locator('[data-testid="sidebar-account-balance"]')
  .first().waitFor({ state: 'visible', timeout: 30_000 });
```

### 6. Assertions

- Use `expect.soft()` for non-critical checks so one failure doesn't mask others
- Use `test.skip()` when QA env lacks required data/UI, rather than hard-failing
- Use `test.step()` to group logical phases within a test

### 7. Known App Defects

These defects are documented in `docs/qa/results1.md`. Tests for these intentionally fail or use workarounds:

| ID | Issue | Test Impact |
|----|-------|-------------|
| DEF-001 | `/settings` base route 404 | Route tests skip `/settings` |
| DEF-002/003 | Sign-in contrast failures | A11y test expected fail |
| DEF-004/008 | Contrast failures across app | A11y tests expected fail |
| DEF-005 | QA badge hidden on mobile | Test targets sidebar badge |
| DEF-006 | Firestore prevents networkidle | Use domcontentloaded + element waits |
| DEF-007 | Month nav buttons lack aria-label | A11y test expected fail |

### 8. Configuration

Playwright config enforces:
- `trace: 'on-first-retry'` - traces captured on retry for debugging
- `screenshot: 'only-on-failure'` - automatic failure screenshots
- `video: 'on-first-retry'` - video on retry
- HTML + list reporters
- 60s test timeout, 15s action timeout, 30s navigation timeout
- `forbidOnly: !!process.env.CI` - prevents `.only` in CI
- `retries: process.env.CI ? 1 : 0` - 1 retry in CI only

### 9. Running Tests

```bash
npx playwright test                          # all tests
npx playwright test --grep @system           # system tests only
npx playwright test --grep @integration      # integration tests only
npx playwright test --headed                 # watch in browser
npx playwright test --ui                     # interactive UI mode
npx playwright show-report                   # open HTML report
```

## Reference Files

- **RTM**: See [rtm.md](references/rtm.md) for full requirements-to-test traceability
- **Runbook**: See `docs/qa/playwright.md` for complete QA documentation
- **Defect Log**: See `docs/qa/results1.md` for known defects and test history
- **PRD**: See `source/PRD.md` for full product requirements
