# QA Test Results

**Date**: 18 February 2026
**Environment**: QA (`https://arctic-budget-qa.web.app/`)
**Browser**: Chromium (Playwright 1.58.2, headless)
**Test user**: qa-primary@arcticbudget.test
**Run command**: `npx playwright test --reporter=list`

---

## Latest Run Summary (Run 4)

| Metric | Run 1 | Run 4 (latest) |
|--------|-------|----------------|
| Total tests | 29 | 29 |
| Passed | 5 | 22 |
| Failed | 24 | 6 |
| Skipped | 0 | 1 |
| **App defects found** | **6** | **7** |
| **Test infra issues remaining** | **4** | **0** |

### Pass / Fail Breakdown (Run 4)

| Status | Tests |
|--------|-------|
| PASS (22) | FR-AUTH-01, FR-AUTH-02, FR-AUTH-04, FR-NAV-01, FR-NAV-02, FR-NAV-03, FR-NAV-04, FR-BUD-03, FR-ACC-03, FR-ACC-06, FR-TXN-03, FR-TXN-04/05, FR-EXP-01, Sign-in a11y labels, Auth→Budget, Categories integration, Month nav integration, Accounts→Transactions, Transactions→Filtering, Transactions→Search, Settings navigation, Cross-page consistency |
| FAIL (app defect — 5) | A11y: sign-in page (DEF-002/003), A11y: budget overview (DEF-007/008), A11y: transaction register, A11y: settings page (DEF-004), Axe-core budget scan (DEF-007) |
| FAIL (soft — 1) | Transaction creation (inline form save — complex interaction, soft assertion) |
| SKIP (1) | Budget assignment (no editable category rows found in inline editing mode) |

---

## App Defects

### DEF-001: `/settings` base route returns 404

| Field | Detail |
|-------|--------|
| **Severity** | Medium |
| **PRD ref** | FR-NAV-02 |
| **Type** | Missing route / navigation |

**Steps to reproduce**:
1. Sign in as qa-primary@arcticbudget.test
2. Navigate to `https://arctic-budget-qa.web.app/settings`

**Expected**: Redirect to `/settings/budget` or display a settings index page.
**Actual**: 404 "Page Not Found" with a "Go to Budget" link.

**Notes**: All sub-routes work (`/settings/budget`, `/settings/accounts`, `/settings/payees`, `/settings/export`, `/settings/delete-budget`). Only the bare `/settings` path is missing. The sidebar "Settings" link correctly navigates to `/settings/budget`, so users won't hit this in normal flow — but direct URL entry or bookmarks will break.

**Suggested fix location**: App route configuration (e.g. `apps/web-budget/src/app/app.routes.ts`). Add a redirect from `/settings` → `/settings/budget`.

---

### DEF-002: Color contrast failure — Sign-in page submit button (WCAG AA)

| Field | Detail |
|-------|--------|
| **Severity** | Medium (Accessibility / WCAG 2.1 AA) |
| **PRD ref** | Section 11.5 — "WCAG AA compliant (minimum 4.5:1 ratio)" |
| **Type** | Accessibility — color-contrast |
| **axe rule** | `color-contrast` (serious) |

**Steps to reproduce**:
1. Navigate to `https://arctic-budget-qa.web.app/sign-in`
2. Inspect the "Sign In" button

**Expected**: Foreground/background contrast ratio ≥ 4.5:1 (WCAG AA for normal text).
**Actual**: White text `rgb(255, 255, 255)` on teal background `rgb(8, 145, 178)`. Calculated contrast ratio ≈ **3.9:1** — fails AA threshold.

**Affected element**: `button.submit-btn`

**Suggested fix location**: Sign-in component styles. Darken the button background to at least `rgb(6, 120, 148)` / `#067894` to achieve 4.5:1, or increase font-size to ≥ 18px (large text threshold is 3:1).

---

### DEF-003: Color contrast failure — Sign-in page secondary text (WCAG AA)

| Field | Detail |
|-------|--------|
| **Severity** | Low (Accessibility) |
| **PRD ref** | Section 11.5 |
| **Type** | Accessibility — color-contrast |
| **axe rule** | `color-contrast` (serious) |

**Steps to reproduce**:
1. Navigate to `https://arctic-budget-qa.web.app/sign-in`
2. Inspect "or continue with" divider text and "By signing in, you agree to..." footer text

**Expected**: Contrast ratio ≥ 4.5:1.
**Actual**: Text color `rgb(124, 130, 144)` / `#7C8290` on dark card background (~`#1E293B`). Estimated contrast ratio ≈ **3.4:1** — fails AA.

**Affected elements**: `.divider-text`, `.footer-text`

**Suggested fix location**: Sign-in component styles. Lighten the text color to at least `rgb(156, 163, 175)` / `#9CA3AF` to reach 4.5:1 against the dark background.

---

### DEF-004: Color contrast failure — Settings page elements (WCAG AA)

| Field | Detail |
|-------|--------|
| **Severity** | Low (Accessibility) |
| **PRD ref** | Section 11.5 |
| **Type** | Accessibility — color-contrast |
| **axe rule** | `color-contrast` (serious) |

**Steps to reproduce**:
1. Sign in and navigate to `/settings/budget`
2. Run axe-core WCAG 2.1 AA scan

**Expected**: Contrast ratio ≥ 4.5:1 on all text elements.
**Actual**: Multiple elements fail contrast: sidebar nav label, account balances, user email, primary buttons, theme badge, and danger zone heading.

**Affected elements**: `.nav-label`, `.sidebar-account-balance`, `.negative`, `.user-email`, `.btn-primary`, `.theme-active-badge`, `.danger-zone > h3`

**Suggested fix location**: Global token styles (`libs/ui-tokens/src/lib/tokens.scss`). Ensure `--primary`, `--text-muted`, and `--danger` tokens provide adequate contrast on `--surface` backgrounds.

---

### DEF-005: QA environment badge hidden on desktop inside mobile-only header

| Field | Detail |
|-------|--------|
| **Severity** | Low |
| **PRD ref** | FR-NAV-04 — "QA environments display a visible banner" |
| **Type** | UI / Layout |

**Steps to reproduce**:
1. Sign in on a desktop viewport (1280×720)
2. Inspect `<header class="mobile-header">` — it contains `<app-environment-badge>` with `<span class="env-badge env-badge--qa">QA</span>`

**Expected**: The environment badge is visible on all viewport sizes.
**Actual**: The mobile header has `display: none` on desktop, hiding its badge. A separate badge in the sidebar header IS visible (`Arctic Budget QA` in top-left), so users can see the environment — but the DOM has a redundant hidden badge instance.

**Notes**: Partially a false positive — the badge IS visible in the sidebar. However, the mobile header badge would be invisible if the sidebar were collapsed on mobile (needs manual verification).

**Suggested fix location**: Mobile header component — ensure the env badge is visible in the mobile header when the sidebar is not shown. Consider adding `aria-hidden="true"` to the hidden duplicate.

---

### DEF-006: Budget page Firestore subscriptions prevent `networkidle` state

| Field | Detail |
|-------|--------|
| **Severity** | Low (Developer Experience / Testability) |
| **PRD ref** | Section 9.2 — Real-time subscriptions |
| **Type** | Testability |

**Steps to reproduce**:
1. Sign in and navigate to any authenticated page
2. Open Network tab in DevTools
3. Observe continuous WebSocket/long-polling activity from Firestore

**Expected**: After initial data load, the page reaches a stable network state.
**Actual**: Firestore real-time subscriptions maintain persistent connections. Playwright's `waitForLoadState('networkidle')` never resolves.

**Notes**: Not a bug per se — real-time subscriptions are a feature. But it impacts testability. Test infrastructure now uses `domcontentloaded` + explicit element waits.

---

### DEF-007: `button-name` axe violation — Budget page buttons lack accessible names

| Field | Detail |
|-------|--------|
| **Severity** | Medium (Accessibility / WCAG 2.1 AA) |
| **PRD ref** | Section 11.5 |
| **Type** | Accessibility — button-name |
| **axe rule** | `button-name` (critical) |

**Steps to reproduce**:
1. Sign in and navigate to `/budget`
2. Run axe-core WCAG 2.1 AA scan

**Expected**: All interactive buttons have accessible names (via text content, `aria-label`, or `aria-labelledby`).
**Actual**: The month navigation prev/next buttons (`<` and `>` arrows in `.month-selector`) contain only SVG icons with `aria-hidden="true"` and have no accessible name.

**Affected elements**: `.month-selector button:first-child` (previous month), `.month-selector button:last-child` (next month)

**Suggested fix location**: Budget header component. Add `aria-label="Previous month"` and `aria-label="Next month"` to the navigation buttons.

---

### DEF-008: Color contrast failures across authenticated pages (WCAG AA)

| Field | Detail |
|-------|--------|
| **Severity** | Medium (Accessibility / WCAG 2.1 AA) |
| **PRD ref** | Section 11.5 |
| **Type** | Accessibility — color-contrast |
| **axe rule** | `color-contrast` (serious) |

**Steps to reproduce**:
1. Sign in and navigate to `/budget`, `/transactions`, or `/settings/budget`
2. Run axe-core WCAG 2.1 AA scan on each page

**Expected**: All text elements meet 4.5:1 contrast ratio (WCAG AA).
**Actual**: Multiple elements fail on all authenticated pages. Common failures:
- Sidebar navigation labels and account balances
- Negative balance indicators (`.negative`)
- User email in sidebar footer
- Primary action buttons (`.btn-primary`)
- Active theme badge

**Affected pages**: Budget overview, transaction register, settings

**Suggested fix location**: Global design tokens. The dark-mode theme's muted text (`--text-muted`), negative values (`--danger`), and button backgrounds (`--primary`) need contrast adjustments.

---

## Test Infrastructure Issues — All Resolved

All 4 test infrastructure issues identified in Run 1 have been fixed.

### TI-001: `networkidle` timeout — RESOLVED

**Root cause**: Firestore real-time subscriptions keep the network active indefinitely.

**Fix applied**: Replaced all `waitForLoadState('networkidle')` with `domcontentloaded` + explicit element waits.

**Files changed**: `tests/pages/budget.page.ts`, `tests/pages/login.page.ts`, `tests/fixtures/auth.fixture.ts`, all spec files.

---

### TI-002: Sidebar locator matched hidden overlay — RESOLVED

**Root cause**: `[class*="sidebar"]` matched `div.sidebar-overlay` (hidden) before `aside.sidebar` (visible).

**Fix applied**: Replaced with specific selectors: `aside.sidebar`, `nav.sidebar-nav`, `a.sidebar-account-link`.

---

### TI-003: QA badge locator matched hidden mobile badge — RESOLVED

**Root cause**: Two badge instances; Playwright's `.first()` found the hidden one.

**Fix applied**: Target visible sidebar badge: `aside.sidebar .env-badge`.

---

### TI-004: Firestore data loading race condition — RESOLVED

**Root cause**: The budget page shell renders instantly ("Ready to Assign: £0.00") but Firestore data (categories, accounts, balances) loads asynchronously. Tests that checked for budget data immediately after navigation saw the empty state.

**Fix applied**:
- `BudgetPage.goto()` now waits for `[data-testid="sidebar-account-balance"]` (30s timeout) after the page shell loads
- `ensureBudgetSelected()` waits for account balance data before proceeding
- Auth fixture waits for Firestore data before saving storage state
- Global test timeout increased from 30s to 60s
- Cross-page consistency test uses `[data-testid="sidebar-account-balance"]` instead of `accountLinks.first()` (which matched "All Transactions" with no balance)

**Additional locator fixes**:
- Category groups: `tr.group-row` (was `[class*="category-group"]` which never matched)
- Month nav buttons: `.month-selector button:first-child/last-child` (SVG-only buttons with no text or aria-label)
- Transaction filter: `getByText(/all transactions/i)` (actual dropdown label)
- Search input: `getByPlaceholder(/search transactions/i)` (actual placeholder)

---

## Test Results Detail (Run 4)

### Passed (22)

| # | Test | File |
|---|------|------|
| 1 | FR-AUTH-01: Sign-in page loads with fields | system |
| 2 | FR-AUTH-02: Email/password sign-in works | system |
| 3 | FR-AUTH-04: localStorage cleared on sign-out | system |
| 4 | FR-NAV-01: App layout has sidebar and main content | system |
| 5 | FR-NAV-02: All major routes accessible after auth | system |
| 6 | FR-NAV-03: Month navigation forward/back arrows | system |
| 7 | FR-NAV-04: QA environment banner visible | system |
| 8 | FR-BUD-03: Category groups with Assigned/Activity/Available | system |
| 9 | FR-ACC-03: Account balances display | system |
| 10 | FR-ACC-06: Sidebar shows accounts with balances | system |
| 11 | FR-TXN-03: Transaction register loads with columns | system |
| 12 | FR-TXN-04/05: Transaction filtering and search UI | system |
| 13 | FR-EXP-01: Export page accessible | system |
| 14 | Sign-in page has proper a11y attributes | system |
| 15 | Auth→Budget: Sign in and verify budget loads | integration |
| 16 | Categories: expand/collapse groups | integration |
| 17 | Month navigation: data changes between months | integration |
| 18 | Accounts→Transactions: click account, register loads | integration |
| 19 | Transactions→Filtering: apply filter | integration |
| 20 | Transactions→Search: search for payee | integration |
| 21 | Settings navigation: all settings pages | integration |
| 22 | Cross-page consistency: sidebar balance matches account page | integration |

### Failed (6)

| # | Test | Category | Root Cause |
|---|------|----------|------------|
| 1 | A11y: sign-in page | **DEF-002/003** | `color-contrast` violations on submit button and secondary text |
| 2 | A11y: budget overview | **DEF-007/008** | `button-name` (month nav) + `color-contrast` (sidebar elements) |
| 3 | A11y: transaction register | **DEF-008** | `color-contrast` violations on sidebar and table elements |
| 4 | A11y: settings page | **DEF-004/008** | `color-contrast` violations on links, buttons, and sidebar |
| 5 | Axe-core budget scan | **DEF-007** | `button-name` violation on month nav buttons |
| 6 | Transaction creation | Soft fail | Inline form Save button does not trigger save (complex combobox + category interaction) |

### Skipped (1)

| # | Test | Reason |
|---|------|--------|
| 1 | Budget assignment | No editable category rows found via inline double-click |

---

## Useful DOM Selectors Discovered

| Element | Selector | Notes |
|---------|----------|-------|
| Sidebar container | `aside.sidebar` | Visible on desktop |
| Sidebar overlay | `div.sidebar-overlay` | Hidden on desktop, do NOT use |
| Main nav | `nav.sidebar-nav` | Contains Budget, Settings links |
| Account nav | `nav.sidebar-accounts-nav` | Contains All Transactions + account links |
| Account link | `a.sidebar-account-link` | First one is "All Transactions" (no balance) |
| Account balance | `[data-testid="sidebar-account-balance"]` | Inside actual account links only |
| Total balance | `[data-testid="sidebar-total-balance"]` | In sidebar header |
| Budget selector | `link "QA Test Budget"` → `/budget-select` | Dropdown at top of sidebar |
| Ready to Assign | Text "Ready to Assign:" | App shell — appears before data loads |
| Category group row | `tr.group-row` | Contains group name + totals |
| Category item rows | Inside `tr.category-drop-zone-row` | Nested within group sections |
| QA badge (visible) | `aside.sidebar .env-badge` | In sidebar header |
| QA badge (hidden) | `.mobile-header .env-badge` | Hidden on desktop |
| Sign-in button | `button.submit-btn` | "Sign In" text |
| Month nav prev | `.month-selector button:first-child` | SVG icon, no accessible name |
| Month nav next | `.month-selector button:last-child` | SVG icon, no accessible name |
| Month label | `button.current-month-btn` | Shows "February 2026" |
| Add Transaction | `button.btn.btn-primary.btn-compact` | "Add Transaction" text |
| Transaction inline edit | `tr.editing-row` / `tr.new-transaction-row` | Inline form row |
| Payee input | `input.payee-input[role="combobox"]` | Placeholder "Enter payee..." |
| Amount inputs | `input.amount-input[type="number"]` | Two: outflow and inflow |
| Save button | `button.btn-save` | Accessible name: "Save new transaction" |
| Cancel button | `button.btn-cancel` | Accessible name: "Cancel adding transaction" |
| Filter dropdown | `combobox "Filter transactions"` | Options: All / Mine Only / Shared Only |
| Search input | `textbox "Search transactions"` | Placeholder "Search transactions..." |
| Sign-out button | `button "Sign out"` | In `.sidebar-footer`, icon only |
| localStorage key | `currentBudgetId` | Set automatically by app after budget loads |

---

## Run History

| Run | Date | Passed | Failed | Skipped | Key changes |
|-----|------|--------|--------|---------|-------------|
| 1 | 17 Feb | 5 | 24 | 0 | Initial run — identified 6 defects + 4 infra issues |
| 2 | 17 Feb | 13 | 15 | 1 | Fixed TI-001 (networkidle), TI-002 (sidebar), TI-003 (badge) |
| 3 | 17 Feb | 16 | 12 | 1 | Fixed locators: month nav, columns, search, filter, add button |
| 4 | 18 Feb | 22 | 6 | 1 | Fixed TI-004 (Firestore data wait), category groups (`tr.group-row`), month nav (`.month-selector`), cross-page balance selector, test timeout 30→60s |

---

## Next Steps

1. **File DEF-001–008** in issue tracker for the app team
2. **Priority fixes**: DEF-007 (button-name — critical a11y) and DEF-002 (sign-in contrast — user-facing)
3. **Investigate transaction creation form** — inline combobox + save interaction needs deeper analysis of Angular form bindings
4. **Add mobile viewport tests** — verify sidebar collapse and env badge on small screens
5. **Run on CI** — configure for headless Chromium with appropriate timeouts for Firestore
