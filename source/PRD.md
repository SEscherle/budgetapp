# Arctic Budget - Product Requirements Document

**Version**: 1.0
**Last Updated**: 8 February 2026
**Author**: Arctic Budget Team
**Status**: Living Document

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Problem Statement](#2-problem-statement)
3. [Goals and Objectives](#3-goals-and-objectives)
4. [Target Users](#4-target-users)
5. [Platform Strategy](#5-platform-strategy)
6. [Core Concepts](#6-core-concepts)
7. [Feature Requirements](#7-feature-requirements)
8. [Data Model](#8-data-model)
9. [Technical Architecture](#9-technical-architecture)
10. [Security and Access Control](#10-security-and-access-control)
11. [Design System](#11-design-system)
12. [Performance Requirements](#12-performance-requirements)
13. [Deployment and Environments](#13-deployment-and-environments)
14. [Future Roadmap](#14-future-roadmap)
15. [Appendices](#15-appendices)

---

## 1. Product Overview

**Arctic Budget** is a personal and household finance management application built on the envelope budgeting methodology, inspired by YNAB (You Need A Budget). It provides a web application for full budget management and plans for a native iOS companion app for quick transaction capture.

The application enables users to allocate every pound of income to specific spending categories ("envelopes"), track spending against those allocations, and maintain visibility of their financial position across multiple accounts.

### 1.1 Product Vision

Provide a streamlined, privacy-focused envelope budgeting tool that works across web and mobile, giving users complete control over their finances through manual transaction entry and real-time budget visibility.

### 1.2 Key Differentiators

- **Manual entry by design** - Encourages mindful spending through deliberate transaction recording rather than automated bank imports
- **Household expense tracking** - Built-in "shared" transaction flag for couples or housemates to reconcile shared costs
- **Multi-platform** - Web app for comprehensive budget management, iOS app for on-the-go transaction capture
- **Dark-mode-first** - Purpose-built dark UI with multiple theme options
- **Self-hosted data** - Runs on the user's own Firebase project, giving full data ownership

---

## 2. Problem Statement

Managing household finances with envelope budgeting requires constant attention to where money is allocated and how it is spent. Existing solutions are either overly complex, rely on bank import automation that encourages passive tracking, or lack support for household expense sharing.

### 2.1 User Pain Points

| Pain Point | Description |
|------------|-------------|
| **Passive tracking** | Automated bank imports reduce financial awareness |
| **No shared expense support** | Couples must use spreadsheets or external tools to split costs |
| **Vendor lock-in** | Cloud-only SaaS tools hold user data hostage |
| **Complexity** | Full-featured budgeting tools have steep learning curves |
| **Platform gaps** | Web-only tools are inconvenient for on-the-go capture; mobile-only tools lack full management capabilities |

---

## 3. Goals and Objectives

### 3.1 Product Goals

| Goal | Measure of Success |
|------|--------------------|
| Enable envelope budgeting | Users can assign income to categories and track available balances |
| Support manual transaction entry | All transaction types (income, expense, transfer, adjustment) can be created and edited |
| Provide household expense tracking | Shared transactions can be flagged and filtered |
| Maintain data accuracy | All monetary calculations use integer minor units; balances are consistent |
| Deliver a responsive web experience | Pages load within 2 seconds; interactions feel immediate |

### 3.2 Non-Goals (Current Scope)

- Automated bank imports or Open Banking integration
- Budgeting advice or AI-driven insights
- Multi-currency support
- Reporting and analytics dashboards
- Debt payoff planning tools

---

## 4. Target Users

### 4.1 Primary Persona: Budget-Conscious Individual

- Wants to actively manage finances using envelope budgeting
- Prefers manual transaction entry for spending awareness
- Comfortable with technology; uses web and mobile daily
- Manages 2-6 financial accounts (current, savings, credit card, cash)

### 4.2 Secondary Persona: Household/Couple

- Two people sharing a budget
- Need to track which expenses are shared vs personal
- Want a single source of truth for household finances
- One person typically manages the budget; both record transactions

### 4.3 User Roles

| Role | Permissions |
|------|-------------|
| **Owner** | Full control: delete budget, manage members, all admin + member permissions |
| **Admin** | Manage categories, accounts, invite members, all member permissions |
| **Member** | Add/edit transactions, assign money to categories, view data, export CSV |

---

## 5. Platform Strategy

### 5.1 Web Application (Primary - Active)

- **Purpose**: Full budget management - planning, reviewing, and configuration
- **Framework**: Angular 21 (standalone components, signals)
- **Access**: Any modern browser (desktop and tablet)
- **Key Activities**: Monthly budget planning, category management, account setup, transaction review, data export, settings

### 5.2 iOS Application (Companion - Planned)

- **Purpose**: Quick transaction capture on the go
- **Framework**: Swift + SwiftUI (iOS 17+)
- **Key Activities**: Record transactions, view account balances, mark transactions as shared
- **Offline**: Firestore offline persistence for transaction entry without connectivity

### 5.3 Shared Infrastructure

Both clients connect to the same Firebase backend:
- Cloud Firestore for data storage and real-time sync
- Firebase Authentication for identity
- Shared domain logic via the `/libs/domain` library

---

## 6. Core Concepts

### 6.1 Envelope Budgeting Method

The application implements zero-based budgeting where every unit of income is assigned to a spending category:

1. **Income arrives** - Money enters the budget through income transactions
2. **Assign to categories** - User distributes income across categories (envelopes)
3. **Spend from categories** - Expenses reduce the available balance in their category
4. **Track and adjust** - Available balances carry forward month to month; users can re-assign as needed

### 6.2 Key Financial Metrics

| Metric | Formula | Description |
|--------|---------|-------------|
| **Ready to Assign** | `totalInflows + priorMonthCarry - totalAssigned` | Unallocated income available to budget |
| **Category Activity** | `sum(expenses in category for month)` | Total spending in a category for the current month |
| **Category Available** | `previousMonth.available + assigned - activity` | Remaining balance in a category envelope |
| **Account Balance** | `openingBalance + sum(all transactions)` | Current account balance |
| **Cleared Balance** | `openingBalance + sum(cleared transactions)` | Balance of reconciled transactions only |
| **Uncleared Balance** | `sum(uncleared transactions)` | Balance of pending transactions |

### 6.3 Money Representation

All monetary values are stored as **integer minor units (pence)** to eliminate floating-point precision errors. Conversion functions handle display formatting:

- Storage: `1050` (pence)
- Display: `£10.50`
- Input: User enters `10.50`, stored as `1050`

### 6.4 Month Keys

Budget periods use the format `YYYY-MM` (e.g., `2026-02`). Transactions are partitioned by month in the database to optimise queries and enable incremental loading.

---

## 7. Feature Requirements

### 7.1 Authentication

#### FR-AUTH-01: Google Sign-In
- Users can sign in using their Google account via OAuth popup
- Web application only

#### FR-AUTH-02: Email/Password Sign-In
- Users can register and sign in with email and password
- Email must be on the server-side allowlist (enforced via Cloud Function)

#### FR-AUTH-03: Allowlist Enforcement
- A Cloud Function (`checkAllowlist`) validates new registrations
- Unauthorised email addresses are rejected at sign-up time
- Allowlist is maintained server-side

#### FR-AUTH-04: Session Management
- Active budget selection persisted in `localStorage`
- Cleared on sign-out to prevent data leakage
- Route guards protect authenticated and unauthenticated routes

---

### 7.2 Budget Management

#### FR-BUD-01: Multiple Budgets
- Users can create and manage multiple independent budgets
- Each budget has a name and owner
- Budget selection screen presented when multiple budgets exist

#### FR-BUD-02: Monthly Budget Periods
- Budgets are organised into monthly periods (YYYY-MM)
- Users navigate between months using forward/back controls
- Year-month picker provides quick navigation to any month

#### FR-BUD-03: Budget Overview
- Main budget view displays all category groups and categories
- Each category shows: Assigned, Activity, Available for the selected month
- Group rows show subtotals
- "Ready to Assign" displayed prominently

#### FR-BUD-04: Budget Settings
- Budget name can be edited
- Budget can be deleted (owner only, with confirmation)

---

### 7.3 Category System

#### FR-CAT-01: Category Groups
- Categories are organised into collapsible groups (e.g., "Bills", "Living Expenses")
- Groups can be created, renamed, and reordered via drag-and-drop
- Group rows display subtotals for Assigned, Activity, and Available

#### FR-CAT-02: Categories
- Categories belong to a single group
- Can be created, renamed, and reordered within their group
- Support archive/unarchive to hide unused categories without deletion

#### FR-CAT-03: Category Assignment
- Users assign money to categories for a given month
- Inline editing of the "Assigned" field on the budget view
- Changes update "Ready to Assign" in real time
- Assigned amounts are stored per category per month

#### FR-CAT-04: Category Carry-Forward
- Unspent "Available" balances carry forward to the next month automatically
- Overspent categories carry forward negative balances
- Carry-forward calculated recursively up to 12 months back

#### FR-CAT-05: Drag-and-Drop Reordering
- Categories can be reordered within a group
- Groups can be reordered relative to each other
- Implemented using Angular CDK drag-and-drop

---

### 7.4 Account Management

#### FR-ACC-01: Account Types
The following account types are supported:
- **Checking** - Current/everyday accounts
- **Savings** - Savings and deposit accounts
- **Credit** - Credit cards and lines of credit
- **Cash** - Physical cash tracking
- **Investment** - Investment and brokerage accounts

#### FR-ACC-02: Account Creation
- Name, type, institution (optional), opening balance, and opening balance date required
- Opening balance stored in pence (integer minor units)
- Opening balance date determines the earliest month with possible transactions

#### FR-ACC-03: Account Balances
Each account displays three balance figures:
- **Current Balance**: Opening balance + all transactions
- **Cleared Balance**: Opening balance + cleared transactions only
- **Uncleared Balance**: Sum of uncleared transactions

#### FR-ACC-04: Balance Caching
- Accounts maintain a `cachedBalance` and `cachedBalanceDate` for performance
- Cache updated daily via `syncAccountCachesForToday()`
- Legacy accounts without cache are migrated automatically on first load

#### FR-ACC-05: Account Closure
- Accounts can be soft-closed (marked as closed, not deleted)
- Closed accounts hidden from active lists but data preserved
- Closed accounts can be reopened

#### FR-ACC-06: Account Navigation
- Sidebar displays all active accounts with current balances
- Clicking an account navigates to its transaction register
- "All Accounts" view shows transactions across all accounts

---

### 7.5 Transaction Management

#### FR-TXN-01: Transaction Types

| Type | Description | Amount Sign | Requirements |
|------|-------------|-------------|--------------|
| **Expense** | Spending money from an account | Negative | Category required |
| **Income** | Money received into an account | Positive | Category required |
| **Transfer** | Move money between accounts | Signed (out=negative, in=positive) | Transfer account required; creates paired transactions |
| **Adjustment** | Balance reconciliation | Signed | No category required |

#### FR-TXN-02: Transaction Fields

| Field | Required | Description |
|-------|----------|-------------|
| Account | Yes | The account this transaction belongs to |
| Date | Yes | Transaction date (YYYY-MM-DD format) |
| Payee | No | Who the payment was made to/from |
| Category | Conditional | Required for expense and income; not for transfers/adjustments |
| Memo | No | Free-text note |
| Amount | Yes | Signed integer in pence |
| Shared | No | Boolean flag for household expense tracking |
| Cleared | No | Boolean flag for reconciliation status |

#### FR-TXN-03: Transaction Register
- Tabular list of transactions with sortable columns
- Inline editing - click a transaction row to edit in place
- New transaction row at the top of the register
- Account-specific and "All Accounts" views available

#### FR-TXN-04: Transaction Filtering
- Filter by account
- Filter by category
- Filter by shared status (shared/personal/all)
- Filters combine (AND logic)

#### FR-TXN-05: Transaction Search
- Free-text search across payee and memo fields
- Real-time filtering as the user types
- Search combines with active filters

#### FR-TXN-06: Transaction Pagination
- Transactions loaded in pages of 200
- Infinite scroll using IntersectionObserver
- Smooth loading with no full-page refreshes

#### FR-TXN-07: Transfer Transactions
- Creating a transfer generates paired transactions:
  - Source account: negative amount, payee = `transfer:{destinationAccountName}`
  - Destination account: positive amount, payee = `transfer:{sourceAccountName}`
- Transfers use the special category "Payments and Transfers"
- Editing or deleting one side should update both

#### FR-TXN-08: Recurring Transactions (Experimental)
- Transactions can be linked in a recurring series via `recurringId`
- `recurringDay` specifies the day of the month
- Currently processed client-side on app load
- **Known limitation**: Transactions only created when the client is opened

#### FR-TXN-09: Shared Transaction Flag
- Any transaction can be marked as "shared" for household expense tracking
- Shared transactions are visually distinguished in the register
- Filterable by shared status

---

### 7.6 Payee Management

#### FR-PAY-01: Payee List
- Payees are stored as a collection within each budget
- Managed via the Settings > Payees page

#### FR-PAY-02: Payee Auto-Suggest
- Transaction entry provides auto-complete suggestions from existing payees
- Virtual transfer payees (prefixed with `transfer:`) shown when transfer type selected

---

### 7.7 Data Export

#### FR-EXP-01: CSV Export
- Export transaction register to CSV format
- Client-side generation (no server round-trip)
- Respects current filter state (exports only filtered transactions)
- Available from Settings > Export

---

### 7.8 Navigation and Layout

#### FR-NAV-01: Application Layout
- Left sidebar with navigation links and account list
- Main content area with route-dependent views
- Responsive layout suitable for desktop and tablet

#### FR-NAV-02: Route Structure

| Route | View |
|-------|------|
| `/sign-in` | Sign-in page |
| `/sign-up` | Registration page |
| `/budget-select` | Budget selection (if multiple budgets) |
| `/budget` | Budget overview (current month) |
| `/budget/:month` | Budget overview (specific month) |
| `/accounts` | Account management |
| `/transactions` | All-accounts transaction register |
| `/accounts/all/transactions` | All-accounts transaction register |
| `/accounts/:accountId/transactions` | Account-specific transaction register |
| `/settings/budget` | Budget settings |
| `/settings/delete-budget` | Delete budget (owner only) |
| `/settings/payees` | Payee management |
| `/settings/export` | CSV export |
| `/settings/accounts` | Account settings |

#### FR-NAV-03: Month Navigation
- Forward/back arrow buttons for sequential month navigation
- Year-month picker for direct navigation to any month
- Current month indicator

#### FR-NAV-04: Environment Banner
- Development and QA environments display a visible banner
- Banner indicates the current environment (dev/qa)
- Not displayed in production

---

## 8. Data Model

### 8.1 Firestore Collection Structure

```
budgets/{budgetId}/
  ├── accounts/{accountId}
  ├── categories/{categoryId}
  ├── categoryGroups/{groupId}
  ├── payees/{payeeId}
  └── months/{monthKey}/
        ├── transactions/{txId}
        └── categoryStates/{categoryId}
```

### 8.2 Entity Definitions

#### Budget
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Document ID |
| `name` | string | Budget display name |
| `ownerUid` | string | Firebase Auth UID of the budget owner |
| `createdAt` | Timestamp | Creation timestamp |
| `updatedAt` | Timestamp | Last modification timestamp |

#### Account
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Document ID |
| `name` | string | Account display name |
| `type` | enum | `checking`, `savings`, `credit`, `cash`, `investment` |
| `institution` | string? | Bank or institution name |
| `isClosed` | boolean | Whether the account is soft-closed |
| `openingBalance` | number | Opening balance in pence (integer) |
| `openingBalanceDate` | string | Date of opening balance (YYYY-MM-DD) |
| `cachedBalance` | number | Cached running balance in pence |
| `cachedBalanceDate` | string | Date the cache is valid through (YYYY-MM-DD) |
| `createdAt` | Timestamp | Creation timestamp |
| `updatedAt` | Timestamp | Last modification timestamp |

#### Category Group
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Document ID |
| `name` | string | Group display name |
| `sortOrder` | number | Display order position |
| `isArchived` | boolean | Whether the group is archived |
| `createdAt` | Timestamp | Creation timestamp |
| `updatedAt` | Timestamp | Last modification timestamp |

#### Category
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Document ID |
| `groupId` | string | Parent category group ID |
| `name` | string | Category display name |
| `sortOrder` | number | Display order within group |
| `isArchived` | boolean | Whether the category is archived |
| `createdAt` | Timestamp | Creation timestamp |
| `updatedAt` | Timestamp | Last modification timestamp |

#### Transaction
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Document ID |
| `accountId` | string | Parent account ID |
| `date` | string | Transaction date (YYYY-MM-DD) |
| `payee` | string? | Payee name |
| `memo` | string? | Free-text memo |
| `amount` | number | Signed integer in pence (expense=negative, income=positive) |
| `categoryId` | string? | Category ID (required for expense/income) |
| `type` | enum | `expense`, `income`, `transfer`, `adjustment` |
| `transferAccountId` | string? | Destination account (required for transfers) |
| `shared` | boolean | Household shared expense flag |
| `createdBy` | string | Firebase Auth UID of creator |
| `recurringId` | string? | Links transactions in a recurring series |
| `recurringDay` | number? | Day of month for recurring schedule (1-31) |
| `createdAt` | Timestamp | Creation timestamp |
| `updatedAt` | Timestamp | Last modification timestamp |

#### Category State (Budget Assignment)
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Same as `categoryId` |
| `categoryId` | string | Reference to category |
| `assigned` | number | Amount budgeted in pence for this month |
| `activity` | number | Calculated sum of transactions (stored for caching) |
| `available` | number | Calculated available balance (stored for caching) |
| `updatedAt` | Timestamp | Last modification timestamp |

#### Budget Month
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Month key (YYYY-MM) |
| `month` | string | Month key (YYYY-MM) |
| `readyToAssign` | number | Unallocated income in pence |
| `totalAssigned` | number | Sum of all category assignments in pence |
| `totalActivity` | number | Sum of all category activity in pence |
| `totalAvailable` | number | Sum of all category available in pence |
| `updatedAt` | Timestamp | Last modification timestamp |

#### Payee
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Document ID |
| `name` | string | Payee display name |
| `createdAt` | Timestamp | Creation timestamp |
| `updatedAt` | Timestamp | Last modification timestamp |

### 8.3 Firestore Indexes

| Collection | Fields | Order |
|------------|--------|-------|
| Transactions | `accountId`, `date` | Ascending, Descending |
| Transactions | `shared`, `date` | Ascending, Descending |
| Transactions | `categoryId`, `date` | Ascending, Descending |
| Categories | `groupId`, `sortOrder` | Ascending, Ascending |
| Category Groups | `isArchived`, `sortOrder` | Ascending, Ascending |

---

## 9. Technical Architecture

### 9.1 Monorepo Structure

The project uses an **Nx workspace** to manage multiple applications and shared libraries:

```
arctic-budget/
├── apps/
│   ├── web-budget/              # Angular 21 web application
│   ├── web-budget-e2e/          # Playwright E2E tests
│   └── ios-budget/              # iOS SwiftUI application (planned)
├── libs/
│   ├── shared-types/            # TypeScript interfaces for Firestore documents
│   ├── firebase/                # Firebase configuration and initialisation
│   ├── ui-tokens/               # CSS design tokens (colours, typography, spacing)
│   └── domain/                  # Framework-agnostic budget calculation functions
├── functions/                   # Firebase Cloud Functions (Node.js 22)
└── tools/scripts/               # Deployment, seeding, and utility scripts
```

### 9.2 Frontend Architecture

#### Component Architecture
- **Standalone components** (no NgModules)
- **OnPush change detection** on all components
- **Angular signals** for reactive state
- **New control flow syntax** (`@if`, `@for`, `@switch`)

#### State Management
- **NgRx SignalStore** with feature-based decomposition
- Main `BudgetStore` composed of modular features:
  - `account.feature.ts` - Account CRUD
  - `account-balance-cache.feature.ts` - Balance caching
  - `category.feature.ts` - Category and group management
  - `transaction.feature.ts` - Transaction state
  - `transaction-crud.feature.ts` - Transaction CRUD operations
  - `transaction-filter.feature.ts` - Filtering, search, pagination
  - `transaction-transfer.feature.ts` - Transfer operations
  - `transaction-recurring.feature.ts` - Recurring transactions
  - `budget-assignment.feature.ts` - Category assignment logic
  - `payee.feature.ts` - Payee management

#### Data Loading Strategy
- **Real-time subscriptions** for accounts, categories, category groups (small, always-loaded collections)
- **Month-partitioned loading** for transactions (loaded per month as needed)
- **Lazy loading** - only current and adjacent months loaded initially; historical months loaded based on account opening dates
- **Subscription management** - explicit cleanup on budget change to prevent memory leaks

### 9.3 Backend Architecture

#### Firebase Services
| Service | Purpose |
|---------|---------|
| **Cloud Firestore** | Primary database with real-time sync |
| **Firebase Authentication** | User identity (Google OAuth, email/password) |
| **Firebase Hosting** | Web application hosting (SPA) |
| **Cloud Functions** | Server-side logic (Node.js 22, europe-west2) |

#### Cloud Functions (Current)
| Function | Type | Description |
|----------|------|-------------|
| `checkAllowlist` | Blocking Auth | Validates new user emails against allowlist |

#### Cloud Functions (Planned)
| Function | Type | Description |
|----------|------|-------------|
| `processRecurringTransactions` | Scheduled (daily) | Create recurring transactions server-side |
| `dailyCacheSync` | Scheduled (daily) | Sync account balance caches |
| `onTransactionWrite` | Firestore trigger | Update account cache on transaction changes |
| `updateCategoryActivity` | Firestore trigger | Recalculate category activity on transaction changes |
| `createTransfer` | Callable | Atomic transfer creation (paired transactions) |
| `assignCategories` | Callable | Atomic batch category assignment |

### 9.4 Domain Library

The `/libs/domain` library contains pure, framework-agnostic functions shared across clients and server:

- **Money conversion**: `toMinorUnits()`, `fromMinorUnits()`, `formatCurrency()`
- **Date utilities**: `getMonthKey()`, `getCurrentMonthKey()`, `getPreviousMonthKey()`, `getNextMonthKey()`, `formatMonthDisplay()`
- **Budget calculations**: `calculateActivity()`, `calculateAvailable()`, `calculateReadyToAssign()`, `calculateAccountBalance()`
- **Validation**: `isOverspent()`, `isOverassigned()`, `isValidDateFormat()`, `isValidMonthKey()`

---

## 10. Security and Access Control

### 10.1 Authentication

- **Firebase Authentication** handles all identity management
- **Supported providers**: Google OAuth (web), Apple Sign-In (iOS, planned), email/password
- **Allowlist enforcement**: Cloud Function blocks registration for non-allowlisted emails
- **Route guards**: `authGuard` protects authenticated routes; `noAuthGuard` redirects authenticated users away from sign-in

### 10.2 Firestore Security Rules

All data access is governed by Firestore security rules:

| Rule | Description |
|------|-------------|
| **Authentication required** | All reads and writes require a valid Firebase Auth token |
| **Budget ownership** | Users can only access budgets they own |
| **Data validation on write** | Types, required fields, and formats validated server-side |
| **Transaction validation** | Transfers require `transferAccountId`; non-transfers require `categoryId`; amounts must be integers; dates must be YYYY-MM-DD |
| **Creator tracking** | `createdBy` field must match the authenticated user's UID |

### 10.3 Client-Side Security

- No secrets stored in client code
- Firebase configuration is public (security enforced by rules)
- `localStorage` cleared on sign-out
- Mock auth mode available for development only (disabled in production)

---

## 11. Design System

### 11.1 Visual Design

- **Dark-mode-first** design with no light mode
- **Custom CSS** design system (no third-party UI library)
- **Component-scoped SCSS** with global design tokens

### 11.2 Themes

| Theme | Description |
|-------|-------------|
| **Default** | Blue and grey palette |
| **Olive** | 1970s avocado and harvest gold tones |
| **Ocean** | Deep sea blues and cyan |
| **Forest** | Rich greens and earth tones |
| **Claude** | Neutral greys with terracotta accents |

### 11.3 Design Tokens

#### Colour Tokens (Semantic)
```
--bg          Background
--surface     Card/panel backgrounds
--surface-2   Elevated surfaces
--border      Borders and dividers
--text        Primary text
--primary     Interactive elements, links
--danger      Destructive actions, negative amounts
--warning     Caution states
--success     Positive amounts, confirmations
```

#### Typography
- System font stack (no custom web fonts)
- 8 size scales: 12px, 14px, 16px, 18px, 20px, 24px, 28px, 33px
- Rem-based sizing for accessibility

#### Spacing
- 14 spacing scales from 0 to 48px
- Consistent spacing tokens across all components

#### Elevation
- 5 shadow levels for visual depth hierarchy

### 11.4 Custom Icon System

Over 30 custom SVG icon components built as Angular standalone components, avoiding external icon library dependencies.

### 11.5 Accessibility

| Feature | Implementation |
|---------|---------------|
| **Focus indicators** | 2px solid outline with 2px offset on `:focus-visible` |
| **Colour contrast** | WCAG AA compliant (minimum 4.5:1 ratio) |
| **Screen readers** | `.sr-only` utility class for visually hidden labels |
| **Semantic HTML** | Correct heading hierarchy, ARIA attributes |
| **Keyboard navigation** | All interactive elements keyboard-accessible |

---

## 12. Performance Requirements

### 12.1 Bundle Size

| Metric | Warning | Error |
|--------|---------|-------|
| Initial bundle | 500 KB | 1 MB |
| Component styles | 8 KB | 16 KB |

### 12.2 Loading Strategy

- **Lazy-loaded routes** for code splitting
- **Tree-shaking** enabled in production builds
- **Month-partitioned data** to avoid loading full transaction history
- **Pagination** (200 transactions per page) with infinite scroll

### 12.3 Reactivity

- **Angular signals** for fine-grained reactivity (no unnecessary re-renders)
- **OnPush change detection** on all components
- **Computed values** memoised automatically by the signals framework

### 12.4 Data Optimisation

- **Real-time Firestore subscriptions** (no polling)
- **Account balance caching** reduces need for historical transaction queries
- **Subscription deduplication** - tracks loaded months to prevent duplicate fetches
- **Explicit subscription cleanup** on budget change

---

## 13. Deployment and Environments

### 13.1 Environments

| Environment | Firebase Project | Purpose |
|-------------|-----------------|---------|
| **Development** | `arctic-budget-dev` | Local development with emulators |
| **QA** | `arctic-budget-qa` | Pre-production testing |
| **Production** | `arctic-budget` | Live application |

### 13.2 Firebase Emulators

| Service | Port |
|---------|------|
| Firestore | 8080 |
| Authentication | 9099 |
| Emulator UI | 4000 |

### 13.3 CI/CD

- **GitHub Actions** for continuous integration and deployment
- `ci.yml` - Lint and test on pull request and push
- `deploy-prod.yml` - Deploy to production (manual trigger)
- `deploy-qa.yml` - Deploy to QA
- `seed-qa.yml` - Seed QA database with test data

### 13.4 Deployment Script

The `tools/scripts/deploy.sh` script supports:
- Environment selection (`--env=dev|qa|prod`)
- Selective deployment (`--only=rules,indexes,hosting,functions`)
- Confirmation prompts (skippable with `--yes` for CI)

### 13.5 Testing

| Type | Framework | Command |
|------|-----------|---------|
| Unit tests | Vitest | `npx nx test web-budget` |
| E2E tests | Playwright | `npx nx e2e web-budget-e2e` |
| Linting | ESLint + Angular ESLint | `npx nx lint web-budget` |

---

## 14. Future Roadmap

### 14.1 Server-Side Migration (Planned)

The current architecture is largely client-driven. A phased migration to Cloud Functions is planned:

| Phase | Scope | Priority |
|-------|-------|----------|
| **Phase 1** | Cloud Functions infrastructure; server-side recurring transactions | High |
| **Phase 2** | Server-side account balance cache management | Medium |
| **Phase 3** | Atomic operations (transfers, batch assignments) | Medium |
| **Phase 4** | Pre-computed budget aggregates (activity, ready-to-assign) | Low |

### 14.2 iOS Application

- Native SwiftUI application for transaction capture
- Firestore SDK with offline persistence
- Apple Sign-In authentication
- Minimal feature set: record transactions, view balances, mark shared

### 14.3 Known Limitations

| Limitation | Impact | Planned Resolution |
|------------|--------|--------------------|
| Recurring transactions only process on client load | Missed transactions if app not opened | Phase 1: Server-side scheduled function |
| Balance cache requires client to be open for date transitions | Stale caches if app not used daily | Phase 2: Server-side daily sync |
| Transfers are not atomic | Potential orphaned paired transactions | Phase 3: Callable Cloud Function |
| Budget calculations are client-side | Potential inconsistency across clients | Phase 4: Server-side aggregation |

---

## 15. Appendices

### Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Envelope budgeting** | Budgeting method where income is allocated to specific spending categories |
| **Ready to Assign** | Income that has not yet been allocated to any category |
| **Category State** | The assignment, activity, and available balance for a category in a specific month |
| **Month Key** | A string in YYYY-MM format identifying a budget month (e.g., `2026-02`) |
| **Minor Units** | Integer representation of currency (pence for GBP); avoids floating-point errors |
| **Shared Transaction** | A transaction flagged as a household/shared expense for reconciliation |
| **Soft Close** | Marking an account as closed without deleting it; data is preserved |
| **Transfer** | A paired set of transactions moving money between two accounts |

### Appendix B: Key File References

| File | Purpose |
|------|---------|
| `apps/web-budget/src/app/budget/store/budget.store.ts` | Main budget store definition |
| `apps/web-budget/src/app/budget/store/budget-store.utils.ts` | Store utility functions |
| `libs/shared-types/src/lib/models.ts` | All Firestore document interfaces |
| `libs/domain/src/lib/calculations.ts` | Budget calculation functions |
| `libs/ui-tokens/src/lib/tokens.scss` | Design token definitions |
| `apps/web-budget/src/app/app.routes.ts` | Application route configuration |
| `firestore.rules` | Firestore security rules |
| `functions/src/index.ts` | Cloud Functions entry point |

### Appendix C: External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| Angular | 21.0.0 | Frontend framework |
| @ngrx/signals | 19.0.0 | Signal-based state management |
| @angular/fire | - | Firebase SDK for Angular |
| Firebase Functions | 6.3.0 | Cloud Functions runtime |
| Vitest | - | Unit testing framework |
| Playwright | - | E2E testing framework |
| Nx | 22.3.3 | Monorepo build system |

---

*This document is maintained alongside the codebase and should be updated as features are added or requirements change.*
