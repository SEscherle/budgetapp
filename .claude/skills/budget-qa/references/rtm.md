# Requirements Traceability Matrix (RTM)

**Project**: Arctic Budget QA
**Last Updated**: 18 February 2026
**PRD Version**: 1.0

---

## Coverage Summary

| Category | Total Requirements | Automated | Manual Only | Not Covered | Coverage |
|----------|--------------------|-----------|-------------|-------------|----------|
| Authentication (FR-AUTH) | 4 | 3 | 1 | 0 | 75% |
| Budget Management (FR-BUD) | 4 | 1 | 3 | 0 | 25% |
| Category System (FR-CAT) | 5 | 1 (partial) | 4 | 0 | 20% |
| Account Management (FR-ACC) | 6 | 2 | 4 | 0 | 33% |
| Transaction Mgmt (FR-TXN) | 9 | 4 | 5 | 0 | 44% |
| Payee Management (FR-PAY) | 2 | 0 | 2 | 0 | 0% |
| Data Export (FR-EXP) | 1 | 1 | 0 | 0 | 100% |
| Navigation (FR-NAV) | 4 | 4 | 0 | 0 | 100% |
| Accessibility (WCAG 2.1 AA) | 1 | 1 | 0 | 0 | 100% |
| **Total** | **36** | **17** | **19** | **0** | **47%** |

---

## Detailed Traceability

### FR-AUTH: Authentication

| Req ID | Requirement | Test Type | Test File | Test Name | Tag | Status |
|--------|-------------|-----------|-----------|-----------|-----|--------|
| FR-AUTH-01 | Google Sign-In | Manual | - | Manual checklist 2.3.1-2.3.2 | - | Manual only (OAuth popup) |
| FR-AUTH-02 | Email/Password Sign-In | System | `system/budget-app.system.spec.ts` | `FR-AUTH-01: Sign-in page loads...` | @system | PASS |
| FR-AUTH-02 | Email/Password Sign-In | System | `system/budget-app.system.spec.ts` | `FR-AUTH-02: Email/password sign-in works...` | @system | PASS |
| FR-AUTH-02 | Email/Password Sign-In | Integration | `integration/budget-app.integration.spec.ts` | `Sign in and verify budget loads with data` | @integration | PASS |
| FR-AUTH-03 | Allowlist Enforcement | Manual | - | Manual checklist 2.2.2 | - | Manual only (server-side) |
| FR-AUTH-04 | Session Management | System | `system/budget-app.system.spec.ts` | `FR-AUTH-04: localStorage is cleared on sign-out` | @system | PASS |

### FR-BUD: Budget Management

| Req ID | Requirement | Test Type | Test File | Test Name | Tag | Status |
|--------|-------------|-----------|-----------|-----------|-----|--------|
| FR-BUD-01 | Multiple Budgets | Manual | - | Manual checklist 14.1-14.4 | - | Manual only |
| FR-BUD-02 | Monthly Budget Periods | Integration | `integration/budget-app.integration.spec.ts` | `Navigate between months and verify data changes` | @integration | PASS |
| FR-BUD-03 | Budget Overview | System | `system/budget-app.system.spec.ts` | `FR-BUD-03: Budget displays category groups...` | @system | PASS |
| FR-BUD-04 | Budget Settings | Manual | - | Manual checklist 13.1.1-13.1.3 | - | Manual only |

### FR-CAT: Category System

| Req ID | Requirement | Test Type | Test File | Test Name | Tag | Status |
|--------|-------------|-----------|-----------|-----------|-----|--------|
| FR-CAT-01 | Category Groups | Integration | `integration/budget-app.integration.spec.ts` | `Navigate to budget, verify category groups load, expand/collapse` | @integration | PASS |
| FR-CAT-02 | Categories (CRUD) | Manual | - | Manual checklist 4.1.1-4.1.6 | - | Manual only |
| FR-CAT-03 | Category Assignment | Integration | `integration/budget-app.integration.spec.ts` | `Edit a category assignment inline...` | @integration | SKIP (no editable rows) |
| FR-CAT-04 | Carry-Forward | Manual | - | Manual checklist 4.4.1-4.4.3 | - | Manual only |
| FR-CAT-05 | Drag-and-Drop | Manual | - | Manual checklist 4.2.1-4.2.4 | - | Manual only |

### FR-ACC: Account Management

| Req ID | Requirement | Test Type | Test File | Test Name | Tag | Status |
|--------|-------------|-----------|-----------|-----------|-----|--------|
| FR-ACC-01 | Account Types | Manual | - | Manual checklist 5.1.1-5.1.5 | - | Manual only |
| FR-ACC-02 | Account Creation | Manual | - | Manual checklist 5.1.1-5.1.8 | - | Manual only |
| FR-ACC-03 | Account Balances | System | `system/budget-app.system.spec.ts` | `FR-ACC-03: Account balances display` | @system | PASS |
| FR-ACC-04 | Balance Caching | Manual | - | - | - | Not testable in E2E |
| FR-ACC-05 | Account Closure | Manual | - | Manual checklist 5.3.1-5.3.5 | - | Manual only |
| FR-ACC-06 | Account Navigation | System | `system/budget-app.system.spec.ts` | `FR-ACC-06: Sidebar shows accounts with balances` | @system | PASS |
| FR-ACC-06 | Account Navigation | Integration | `integration/budget-app.integration.spec.ts` | `Click an account in sidebar, verify transaction register loads` | @integration | PASS |

### FR-TXN: Transaction Management

| Req ID | Requirement | Test Type | Test File | Test Name | Tag | Status |
|--------|-------------|-----------|-----------|-----------|-----|--------|
| FR-TXN-01 | Transaction Types | Integration | `integration/budget-app.integration.spec.ts` | `Add a new expense transaction...` | @integration | SOFT FAIL |
| FR-TXN-02 | Transaction Fields | Manual | - | Manual checklist 6.1.1-6.1.7 | - | Manual only |
| FR-TXN-03 | Transaction Register | System | `system/budget-app.system.spec.ts` | `FR-TXN-03: Transaction register loads with columns` | @system | PASS |
| FR-TXN-04 | Transaction Filtering | System | `system/budget-app.system.spec.ts` | `FR-TXN-04/05: Transaction filtering and search UI` | @system | PASS |
| FR-TXN-04 | Transaction Filtering | Integration | `integration/budget-app.integration.spec.ts` | `Apply a filter and verify transaction list updates` | @integration | PASS |
| FR-TXN-05 | Transaction Search | Integration | `integration/budget-app.integration.spec.ts` | `Search for a payee and verify results filter` | @integration | PASS |
| FR-TXN-06 | Pagination | Manual | - | Manual checklist 6.6.1-6.6.4 | - | Manual only |
| FR-TXN-07 | Transfer Transactions | Manual | - | Manual checklist 6.1.3-6.1.4 | - | Manual only |
| FR-TXN-08 | Recurring Transactions | Manual | - | Manual checklist 6.8.1-6.8.3 | - | Experimental |
| FR-TXN-09 | Shared Transaction Flag | Manual | - | Manual checklist 6.7.1-6.7.3 | - | Manual only |

### FR-PAY: Payee Management

| Req ID | Requirement | Test Type | Test File | Test Name | Tag | Status |
|--------|-------------|-----------|-----------|-----------|-----|--------|
| FR-PAY-01 | Payee List | Manual | - | Manual checklist 7.1-7.4 | - | Manual only |
| FR-PAY-02 | Payee Auto-Suggest | Manual | - | Manual checklist 7.5-7.7 | - | Manual only |

### FR-EXP: Data Export

| Req ID | Requirement | Test Type | Test File | Test Name | Tag | Status |
|--------|-------------|-----------|-----------|-----------|-----|--------|
| FR-EXP-01 | CSV Export | System | `system/budget-app.system.spec.ts` | `FR-EXP-01: Export page is accessible` | @system | PASS |

### FR-NAV: Navigation

| Req ID | Requirement | Test Type | Test File | Test Name | Tag | Status |
|--------|-------------|-----------|-----------|-----------|-----|--------|
| FR-NAV-01 | Application Layout | System | `system/budget-app.system.spec.ts` | `FR-NAV-01: App layout has sidebar...` | @system | PASS |
| FR-NAV-02 | Route Structure | System | `system/budget-app.system.spec.ts` | `FR-NAV-02: All major routes are accessible` | @system | PASS |
| FR-NAV-02 | Route Structure | Integration | `integration/budget-app.integration.spec.ts` | `Navigate through all settings pages` | @integration | PASS |
| FR-NAV-03 | Month Navigation | System | `system/budget-app.system.spec.ts` | `FR-NAV-03: Month navigation forward/back arrows` | @system | PASS |
| FR-NAV-03 | Month Navigation | Integration | `integration/budget-app.integration.spec.ts` | `Navigate between months and verify data changes` | @integration | PASS |
| FR-NAV-04 | Environment Banner | System | `system/budget-app.system.spec.ts` | `FR-NAV-04: Environment banner is visible on QA` | @system | PASS |

### Accessibility (WCAG 2.1 AA)

| Req ID | Requirement | Test Type | Test File | Test Name | Tag | Status |
|--------|-------------|-----------|-----------|-----------|-----|--------|
| A11Y-01 | Sign-in page a11y | System | `system/accessibility.spec.ts` | `sign-in page has no critical a11y violations` | @system | FAIL (DEF-002/003) |
| A11Y-02 | Budget page a11y | System | `system/accessibility.spec.ts` | `budget overview page has no critical a11y violations` | @system | FAIL (DEF-007/008) |
| A11Y-03 | Transaction page a11y | System | `system/accessibility.spec.ts` | `transaction register page has no critical a11y violations` | @system | FAIL (DEF-008) |
| A11Y-04 | Settings page a11y | System | `system/accessibility.spec.ts` | `settings page has no critical a11y violations` | @system | FAIL (DEF-004/008) |
| A11Y-05 | Sign-in a11y attributes | System | `system/budget-app.system.spec.ts` | `Sign-in page has proper a11y attributes` | @system | PASS |
| A11Y-06 | Budget axe-core scan | System | `system/budget-app.system.spec.ts` | `Basic a11y attributes on key elements` | @system | FAIL (DEF-007) |

### Cross-Page Consistency

| Req ID | Requirement | Test Type | Test File | Test Name | Tag | Status |
|--------|-------------|-----------|-----------|-----------|-----|--------|
| INT-01 | Sidebar balance = account page | Integration | `integration/budget-app.integration.spec.ts` | `Account balance in sidebar matches account page balance` | @integration | PASS |

---

## Defects Blocking Test Passage

| Defect | Severity | Affected Tests | PRD Ref |
|--------|----------|----------------|---------|
| DEF-002 | Medium | A11Y-01 | 11.5 |
| DEF-003 | Low | A11Y-01 | 11.5 |
| DEF-004 | Low | A11Y-04 | 11.5 |
| DEF-007 | Medium | A11Y-02, A11Y-06 | 11.5 |
| DEF-008 | Medium | A11Y-02, A11Y-03, A11Y-04 | 11.5 |

---

## Coverage Gaps - Recommended Next Automations

| Priority | Requirement | Reason |
|----------|-------------|--------|
| High | FR-TXN-01 (all 4 types) | Core CRUD - transaction creation test currently soft-fails |
| High | FR-CAT-03 (inline assignment) | Core interaction - currently skipped |
| Medium | FR-TXN-07 (transfers) | Complex paired-transaction logic |
| Medium | FR-ACC-02 (account creation) | CRUD operation |
| Low | FR-PAY-02 (auto-suggest) | UX polish |
| Low | FR-CAT-05 (drag-and-drop) | Complex interaction, flakiness risk |
