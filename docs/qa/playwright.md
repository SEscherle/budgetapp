# Arctic Budget - Playwright QA Runbook

**Last Updated**: 18 February 2026
**Framework**: Playwright 1.58.2 + axe-core
**Target**: `https://arctic-budget-qa.web.app/`

---

## Table of Contents

1. [Scope](#1-scope)
2. [Test Structure](#2-test-structure)
3. [Selector Strategy](#3-selector-strategy)
4. [Tagging Rules](#4-tagging-rules)
5. [Debugging Failures](#5-debugging-failures)
6. [CI Behaviour](#6-ci-behaviour)
7. [Flakiness Guidelines](#7-flakiness-guidelines)
8. [Running Locally](#8-running-locally)

---

## 1. Scope

### In Scope

| Area | What Is Tested |
|------|----------------|
| Authentication | Email/password sign-in, sign-out, session management, localStorage cleanup |
| Navigation | All 14 routes load correctly, sidebar nav, month navigation, deep links |
| Budget Overview | Ready to Assign, category groups, Assigned/Activity/Available columns, visual snapshots |
| Account Display | Sidebar account listing, balance display (current/cleared/uncleared) |
| Transaction Register | Table rendering, column headers, visual snapshots |
| Transaction Search & Filter | Search input, filter dropdown, result filtering |
| Transaction Creation | Add Transaction flow (soft assertions due to complex inline form) |
| Budget Assignment | Inline category editing (skipped when QA env lacks editable rows) |
| Settings | All 5 settings sub-routes accessible |
| Export | Export page loads |
| Accessibility | axe-core WCAG 2.1 AA scans on 4 pages + manual a11y attribute checks |
| Cross-page Consistency | Sidebar balance matches account page balance |

### Out of Scope

| Area | Reason |
|------|--------|
| Google OAuth sign-in | Requires real Google account; OAuth popup not automatable |
| Allowlist enforcement | Server-side Cloud Function; tested at API/unit level |
| Account creation | Mutates QA data; needs seed/teardown strategy |
| Category CRUD (create/rename/delete) | Mutates QA data |
| Drag-and-drop reordering | High flakiness risk with CDK drag-and-drop |
| Transaction deletion | Destructive; needs seed/teardown strategy |
| Transfer paired transactions | Complex server-side logic; needs dedicated fixtures |
| Recurring transactions | Experimental feature; client-side only |
| Payee management | Low-risk CRUD; manual testing sufficient |
| Mobile/tablet viewports | Not yet automated; desktop Chrome only |
| Performance benchmarking | Manual DevTools profiling |
| Multi-budget switching | Needs secondary budget fixture |
| Offline behaviour | Requires network interception setup |

---

## 2. Test Structure

### Directory Layout

```
tests/
  fixtures/
    auth.fixture.ts              Extends Playwright test with auth fixtures
  pages/
    login.page.ts                LoginPage POM (sign-in interactions)
    budget.page.ts               BudgetPage POM (month nav, categories, assignments)
  helpers/
    a11y.helper.ts               axe-core wrapper with formatted violations
  system/
    budget-app.system.spec.ts    15 system tests (@system)
    accessibility.spec.ts        4 accessibility scan tests (@system)
  integration/
    budget-app.integration.spec.ts   10 integration tests (@integration)
```

### Spec File Organisation

Each spec file is organised by PRD feature area using `test.describe()` blocks:

```ts
test.describe('Authentication @system', () => {
  test('FR-AUTH-01: Sign-in page loads with email and password fields', ...);
  test('FR-AUTH-02: Email/password sign-in works and redirects to budget', ...);
});
```

### Page Objects

POMs are used **only** where they reduce duplication across multiple spec files:

| POM | Used By | Locators | Actions |
|-----|---------|----------|---------|
| `LoginPage` | system specs, integration specs, auth fixture | emailInput, passwordInput, signInButton | goto(), signIn(), loginAndWaitForApp() |
| `BudgetPage` | system specs, integration specs | readyToAssign, categoryGroups, monthLabel, prevMonthButton, nextMonthButton | goto(), gotoMonth(), goToPreviousMonth(), goToNextMonth(), editAssignment() |

Pages used in only one spec file use inline locators. Do not create a POM for single-use pages.

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Spec files | `<feature>.<type>.spec.ts` | `budget-app.system.spec.ts` |
| Page objects | `<page>.page.ts` | `login.page.ts` |
| Helpers | `<domain>.helper.ts` | `a11y.helper.ts` |
| Fixtures | `<purpose>.fixture.ts` | `auth.fixture.ts` |
| System tests | `FR-<AREA>-<##>: <description>` | `FR-AUTH-01: Sign-in page loads...` |
| Integration tests | `<descriptive flow name>` | `Sign in and verify budget loads with data` |
| Describe blocks | `<Feature Area> @<tag>` | `Authentication @system` |

### Auth Fixture

The `auth.fixture.ts` provides these fixtures:

| Fixture | Description |
|---------|-------------|
| `authenticatedPage` | Page with primary user signed in, budget selected, Firestore data loaded |
| `secondaryAuthPage` | Page with secondary user signed in |
| `loginPage` | Unauthenticated LoginPage instance |
| `budgetPage` | BudgetPage instance on the authenticated page |

Auth state is cached to `tests/.auth/` (gitignored) for fast re-use. If tests fail with auth issues, delete the cache: `rm -rf tests/.auth/`.

---

## 3. Selector Strategy

### Priority Order

1. **`getByRole()`** - Always preferred. Maps to ARIA roles, resilient to text/style changes.
   ```ts
   page.getByRole('button', { name: /sign in/i })
   page.getByRole('link', { name: /budget/i })
   page.getByRole('table')
   page.getByRole('searchbox')
   ```

2. **`getByLabel()`** - For form fields with associated labels.
   ```ts
   page.getByLabel('Email')
   page.getByLabel('Password')
   ```

3. **`getByText()`** - For visible text content.
   ```ts
   page.getByText(/ready to assign/i)
   page.getByText(/all transactions/i)
   ```

4. **`getByPlaceholder()`** - When placeholder is the primary identifier.
   ```ts
   page.getByPlaceholder(/search transactions/i)
   ```

5. **`getByTestId()`** - For stable `data-testid` attributes set by the app.
   ```ts
   page.getByTestId('sidebar-account-balance')
   page.getByTestId('category-row')
   page.getByTestId('user-menu')
   ```

### Forbidden

**CSS class selectors and ID selectors are forbidden:**
```ts
// NEVER DO THIS
page.locator('.btn-primary')
page.locator('#submit-button')
page.locator('div > span.amount')
page.locator('[class*="some-class"]')
```

### Documented Exceptions

Structural CSS selectors targeting semantic HTML are allowed when no role/testid alternative exists. Each exception must include a comment:

```ts
// Exception: aside.sidebar is a semantic landmark; no data-testid available
const sidebar = page.locator('aside.sidebar');

// Exception: tr.group-row is the only stable identifier for category group rows
this.categoryGroups = page.locator('tr.group-row');

// Exception: month-selector buttons have no aria-label (DEF-007)
this.prevMonthButton = page.locator('.month-selector button:first-child');
```

### Known `data-testid` Values

| `data-testid` | Element | Notes |
|----------------|---------|-------|
| `sidebar-account-balance` | Account balance in sidebar | Primary data-load indicator |
| `sidebar-total-balance` | Total balance in sidebar header | |
| `category-row` | Category item row in budget table | |
| `assigned` | Assigned cell within category row | |
| `transaction-register` | Transaction list/table | Fallback selector |
| `transaction-filter` | Filter control | Fallback selector |
| `transaction-search` | Search input | Fallback selector |
| `add-transaction` | Add Transaction button | Fallback selector |
| `user-menu` | User/account menu trigger | |

---

## 4. Tagging Rules

### Tags

| Tag | Purpose | Directory | When to Use |
|-----|---------|-----------|-------------|
| `@system` | Single-feature verification | `tests/system/` | Test validates one PRD requirement in isolation |
| `@integration` | Cross-feature flow | `tests/integration/` | Test spans 2+ features or pages |

### Enforcement

- Every `test.describe()` MUST include exactly one tag
- Tag appears in the describe block name string, not as a Playwright tag annotation
- Run by tag: `npx playwright test --grep @system`

### Current Test Count

| Tag | Count | Files |
|-----|-------|-------|
| @system | 19 | `budget-app.system.spec.ts` (15), `accessibility.spec.ts` (4) |
| @integration | 10 | `budget-app.integration.spec.ts` (10) |
| **Total** | **29** | |

---

## 5. Debugging Failures

### Step 1: Check the HTML Report

```bash
npx playwright show-report
```

The report includes failure screenshots, error messages, and (on retries) trace files and video.

### Step 2: Inspect Traces

Traces are captured on first retry (`trace: 'on-first-retry'`). Open from the HTML report or directly:

```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```

The trace viewer shows a timeline of actions, network requests, DOM snapshots, and console logs.

### Step 3: Run a Single Test in Debug Mode

```bash
npx playwright test -g "FR-AUTH-01" --debug
```

This opens the Playwright Inspector with step-through debugging.

### Step 4: Run Headed

```bash
npx playwright test --headed --grep @system
```

Watch tests execute in a visible browser.

### Step 5: Use UI Mode

```bash
npx playwright test --ui
```

Interactive mode with test explorer, time-travel debugging, and DOM inspector.

### Common Failure Patterns

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| All tests timeout | QA environment down | Check `https://arctic-budget-qa.web.app/` manually |
| Auth tests fail | Credentials changed or stale cache | `rm -rf tests/.auth/` and re-run |
| `waitForURL` timeout | App redirected unexpectedly | Check if budget-select is required |
| Locator not found | UI changed | Update selectors in POM or spec; prefer role selectors |
| Visual regression diff | Intentional UI change | `npx playwright test --update-snapshots` |
| axe-core violations | Known defects (DEF-002-008) | Check `docs/qa/results1.md`; these are app bugs, not test bugs |
| `test.skip` triggered | QA env missing data | Seed QA data or adjust test expectations |

### Failure Screenshots

Saved to `test-results/` on failure. Visual regression baselines are in `tests/**/*.spec.ts-snapshots/`.

---

## 6. CI Behaviour

### Configuration Differences

| Setting | Local | CI |
|---------|-------|----|
| `retries` | 0 | 1 |
| `forbidOnly` | false | true (prevents `.only()`) |
| `workers` | 1 | 1 |
| `trace` | on-first-retry | on-first-retry |
| Browser | Chromium (headed or headless) | Chromium headless |

### CI Pipeline Setup

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on:
  push:
    branches: [main]
  pull_request:

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run Playwright tests
        run: npx playwright test
        env:
          CI: true
          BASE_URL: https://arctic-budget-qa.web.app
          QA_PRIMARY_EMAIL: ${{ secrets.QA_PRIMARY_EMAIL }}
          QA_PRIMARY_PASSWORD: ${{ secrets.QA_PRIMARY_PASSWORD }}

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
          retention-days: 7
```

### CI Secrets Required

| Secret | Purpose |
|--------|---------|
| `QA_PRIMARY_EMAIL` | Primary test user email |
| `QA_PRIMARY_PASSWORD` | Primary test user password |
| `QA_SECONDARY_EMAIL` | Secondary test user email (optional) |
| `QA_SECONDARY_PASSWORD` | Secondary test user password (optional) |

### Artifacts

| Artifact | When | Contents |
|----------|------|----------|
| `playwright-report` | Always | HTML report with screenshots, traces |
| `test-results` | On failure | Failure screenshots, trace ZIPs, videos |

---

## 7. Flakiness Guidelines

### Root Causes of Flakiness in This Project

| Cause | Mitigation |
|-------|------------|
| **Firestore data loading** | Wait for `[data-testid="sidebar-account-balance"]` (30s timeout) instead of networkidle |
| **Firestore real-time connections** | Use `domcontentloaded` for navigation waits, never `networkidle` (see DEF-006) |
| **Animation/transition timing** | Use `waitForTimeout()` sparingly (500-2000ms) for CSS transitions; prefer element waits |
| **Auth state expiry** | Storage-state caching with automatic fallback to fresh login |
| **QA environment data changes** | Use `test.skip()` when required data is missing; avoid hard-coded assertions on mutable data |
| **Visual regression** | Set `maxDiffPixelRatio: 0.01` to tolerate minor anti-aliasing differences |

### Rules for Preventing Flakiness

1. **Never use `networkidle`** - Firestore keeps connections open permanently.

2. **Always wait for specific elements** - not arbitrary timeouts:
   ```ts
   // GOOD
   await page.getByText(/ready to assign/i).waitFor({ state: 'visible', timeout: 15_000 });

   // BAD
   await page.waitForTimeout(5_000);
   ```

3. **Use `waitForTimeout()` only for CSS transitions** - keep to 500-1000ms max. Always add a comment explaining why:
   ```ts
   // Wait for collapse animation to complete
   await page.waitForTimeout(500);
   ```

4. **Use soft assertions for non-critical checks** - prevents one flaky assertion from hiding other failures:
   ```ts
   expect.soft(page.url()).toContain('/budget');
   ```

5. **Use `test.skip()` for environment-dependent tests** - don't let missing QA data cause false failures:
   ```ts
   if (rowCount === 0) {
     test.skip(true, 'No editable category rows found');
     return;
   }
   ```

6. **Handle budget-select redirect** - the app may redirect to `/budget-select` instead of `/budget`:
   ```ts
   await page.waitForURL(/\/(budget|budget-select)/, { timeout: 30_000 });
   ```

7. **Set generous timeouts for Firestore** - real-time data can take 10-30s on cold start:
   ```ts
   await page.locator('[data-testid="sidebar-account-balance"]')
     .first().waitFor({ state: 'visible', timeout: 30_000 });
   ```

### Flakiness Triage Process

1. Check if the failure is a **known app defect** (see `docs/qa/results1.md`)
2. Check if the failure is **environment-related** (QA down, data missing)
3. Check if the failure is **timing-related** (add element waits, increase timeout)
4. If truly flaky after investigation, add `test.skip()` with a descriptive reason and file an issue

### Quarantine Policy

Tests that fail intermittently for unresolved reasons should be:
1. Tagged with a skip reason: `test.skip(true, 'Flaky: <issue-link>')`
2. Tracked in the defect log with a `TI-` prefix (Test Infrastructure issue)
3. Investigated within 5 business days
4. Either fixed or permanently removed

---

## 8. Running Locally

### Prerequisites

- Node.js 22+
- npm

### Setup

```bash
cd budget-app
npm install
npx playwright install chromium
```

### Run All Tests

```bash
npx playwright test
```

### Run by Tag

```bash
npx playwright test --grep @system
npx playwright test --grep @integration
```

### Run a Specific File

```bash
npx playwright test tests/system/accessibility.spec.ts
```

### Run a Specific Test

```bash
npx playwright test -g "FR-AUTH-01"
```

### Interactive Modes

```bash
npx playwright test --ui            # UI mode with time-travel debug
npx playwright test --headed        # Watch in browser
npx playwright test --debug         # Step-through debugger
```

### View Report

```bash
npx playwright show-report
```

### Override Target URL

```bash
BASE_URL=http://localhost:4200 npx playwright test
```

### Override Credentials

```bash
QA_PRIMARY_EMAIL=my@email.com QA_PRIMARY_PASSWORD=pass npx playwright test
```

### Clear Auth Cache

```bash
rm -rf tests/.auth/
```

### Update Visual Baselines

```bash
npx playwright test --update-snapshots
```
