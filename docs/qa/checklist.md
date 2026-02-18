# Arctic Budget - Manual QA Checklist

**App URL**: https://arctic-budget-qa.web.app/
**Date**: _______________
**Tester**: _______________
**Browser / Version**: _______________
**Device / Resolution**: _______________

## Test Credentials

| Account | Email | Password |
|---------|-------|----------|
| Primary | qa-primary@arcticbudget.test | QaTest123! |
| Secondary | qa-secondary@arcticbudget.test | QaTest123! |

## Result Key

| Symbol | Meaning |
|--------|---------|
| [x] | Pass |
| [ ] | Not tested |
| **FAIL** | Write FAIL next to the checkbox and add details in Notes |

---

## 1. Navigation & Routing

### 1.1 Route Loading

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 1.1.1 | `/sign-in` loads | Navigate to `/sign-in` while signed out | Sign-in page renders with Google and email options | [ ] | |
| 1.1.2 | `/sign-up` loads | Navigate to `/sign-up` while signed out | Sign-up form renders | [ ] | |
| 1.1.3 | `/budget-select` loads | Sign in, navigate to `/budget-select` | Budget selection screen renders with list of budgets or create-budget option | [ ] | |
| 1.1.4 | `/budget` loads | Select a budget from budget-select | Budget overview page renders with month header and category groups | [ ] | |
| 1.1.5 | `/budget/:month` loads | Navigate to `/budget/2026-02` directly | Budget overview for February 2026 loads correctly | [ ] | |
| 1.1.6 | `/accounts` loads | Click Accounts in sidebar | Accounts list/overview page renders | [ ] | |
| 1.1.7 | `/transactions` loads | Navigate to `/transactions` | Transaction list renders | [ ] | |
| 1.1.8 | `/accounts/all/transactions` loads | Click "All Accounts" transactions view | All-accounts transaction register renders | [ ] | |
| 1.1.9 | `/accounts/:accountId/transactions` loads | Click a specific account in sidebar | Account-specific transaction register renders | [ ] | |
| 1.1.10 | `/settings/budget` loads | Navigate to Settings > Budget | Budget settings page renders | [ ] | |
| 1.1.11 | `/settings/delete-budget` loads | Navigate to Settings > Delete Budget | Delete budget confirmation page renders | [ ] | |
| 1.1.12 | `/settings/payees` loads | Navigate to Settings > Payees | Payees management page renders | [ ] | |
| 1.1.13 | `/settings/export` loads | Navigate to Settings > Export | Export page renders with CSV options | [ ] | |
| 1.1.14 | `/settings/accounts` loads | Navigate to Settings > Accounts | Account settings page renders | [ ] | |

### 1.2 Sidebar Navigation

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 1.2.1 | Sidebar renders | Sign in and select a budget | Sidebar displays with Budget, Accounts, and Settings sections | [ ] | |
| 1.2.2 | Budget link works | Click "Budget" in sidebar | Navigates to `/budget` with current month | [ ] | |
| 1.2.3 | Account links work | Click an account name in sidebar | Navigates to that account's transaction register | [ ] | |
| 1.2.4 | Active route highlighted | Navigate between pages | Current page is visually highlighted in sidebar | [ ] | |
| 1.2.5 | Environment banner visible | Load the QA app | "QA" environment banner is visible (not "DEV" or "PROD") | [ ] | |

### 1.3 Deep Links & Browser Navigation

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 1.3.1 | Deep link while authenticated | Copy a budget URL, paste into new tab (same browser, already signed in) | Page loads directly without redirect loop | [ ] | |
| 1.3.2 | Deep link while unauthenticated | Open `/budget/2026-02` in incognito | Redirects to `/sign-in` | [ ] | |
| 1.3.3 | Back button works | Navigate Budget > Accounts > Transactions, press Back | Returns to Accounts page | [ ] | |
| 1.3.4 | Forward button works | After pressing Back, press Forward | Returns to Transactions page | [ ] | |
| 1.3.5 | Month in URL updates | Navigate forward/backward months on budget page | URL updates to reflect `/budget/YYYY-MM` | [ ] | |

---

## 2. Authentication

### 2.1 Email/Password Sign-In

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 2.1.1 | Valid sign-in | Enter qa-primary@arcticbudget.test / QaTest123! and submit | Signs in, redirects to `/budget-select` or `/budget` | [ ] | |
| 2.1.2 | Wrong password | Enter valid email with wrong password | Error message displayed, no sign-in | [ ] | |
| 2.1.3 | Non-existent email | Enter nonexistent@example.com | Error message displayed, no sign-in | [ ] | |
| 2.1.4 | Empty fields | Submit form with empty email and/or password | Validation errors shown, form not submitted | [ ] | |
| 2.1.5 | Invalid email format | Enter "notanemail" as email | Validation error for email format | [ ] | |

### 2.2 Sign-Up

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 2.2.1 | Sign-up page renders | Navigate to `/sign-up` | Registration form with email, password fields renders | [ ] | |
| 2.2.2 | Allowlist enforcement | Attempt sign-up with non-allowlisted email | Sign-up rejected with appropriate message | [ ] | |
| 2.2.3 | Link to sign-in | Click "Already have an account?" or similar | Navigates to `/sign-in` | [ ] | |

### 2.3 Google Sign-In

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 2.3.1 | Google button present | Load `/sign-in` | Google Sign-In button is displayed | [ ] | |
| 2.3.2 | Google flow initiates | Click Google Sign-In button | Google OAuth popup/redirect initiates | [ ] | |

### 2.4 Session Management

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 2.4.1 | Session persists on reload | Sign in, refresh the page | User remains signed in | [ ] | |
| 2.4.2 | Session persists across tabs | Sign in, open app in new tab | User is signed in on new tab | [ ] | |
| 2.4.3 | Sign-out works | Click sign-out button/link | User is signed out, redirected to `/sign-in` | [ ] | |
| 2.4.4 | Route guard: authenticated routes | While signed out, navigate to `/budget` | Redirected to `/sign-in` | [ ] | |
| 2.4.5 | Route guard: auth pages when signed in | While signed in, navigate to `/sign-in` | Redirected away from sign-in (to budget or budget-select) | [ ] | |

---

## 3. Budget Overview

### 3.1 Month Navigation

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 3.1.1 | Current month displays | Navigate to `/budget` | Current month (e.g., "February 2026") is displayed in header | [ ] | |
| 3.1.2 | Navigate forward | Click the forward/right month arrow | Next month loads, URL updates to `/budget/YYYY-MM` | [ ] | |
| 3.1.3 | Navigate backward | Click the backward/left month arrow | Previous month loads, URL updates | [ ] | |
| 3.1.4 | Navigate multiple months | Click forward 3 times, then backward 2 times | Correct month displays each time, no lag or flicker | [ ] | |
| 3.1.5 | Direct URL month navigation | Enter `/budget/2025-01` in address bar | January 2025 budget loads | [ ] | |

### 3.2 Ready to Assign / Header Figures

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 3.2.1 | Ready to Assign displays | Load budget overview | "Ready to Assign" amount shown in GBP (£) format | [ ] | |
| 3.2.2 | Assigned total displays | Load budget overview | "Assigned" total is visible and formatted as GBP | [ ] | |
| 3.2.3 | Activity total displays | Load budget overview | "Activity" total is visible and formatted as GBP | [ ] | |
| 3.2.4 | Available total displays | Load budget overview | "Available" total is visible and formatted as GBP | [ ] | |
| 3.2.5 | Currency formatting | Check any monetary value | Displayed with £ symbol, two decimal places (e.g., £12.34) | [ ] | |
| 3.2.6 | Figures update on assignment change | Change a category assignment amount | Ready to Assign and Assigned recalculate immediately | [ ] | |

### 3.3 Category Groups

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 3.3.1 | Groups render | Load budget overview | Category groups are listed with their names | [ ] | |
| 3.3.2 | Expand group | Click on a collapsed category group | Group expands to show categories within it | [ ] | |
| 3.3.3 | Collapse group | Click on an expanded category group header | Group collapses, hiding categories | [ ] | |
| 3.3.4 | Multiple groups state | Expand two groups, collapse one | First group collapsed, second remains expanded | [ ] | |
| 3.3.5 | Group totals | View a category group header | Group shows aggregated Assigned/Activity/Available totals | [ ] | |

### 3.4 Inline Assignment Editing

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 3.4.1 | Click to edit assignment | Click on a category's Assigned field | Field becomes editable (input appears) | [ ] | |
| 3.4.2 | Enter valid amount | Type "50.00" and confirm (Enter or blur) | Assignment updates to £50.00, Ready to Assign recalculates | [ ] | |
| 3.4.3 | Enter zero | Type "0" and confirm | Assignment clears to £0.00 | [ ] | |
| 3.4.4 | Cancel edit | Click to edit, press Escape | Edit cancelled, original value restored | [ ] | |
| 3.4.5 | Negative values | Enter a negative number | Behaviour as designed (verify: rejected or accepted) | [ ] | |
| 3.4.6 | Non-numeric input | Enter "abc" | Input rejected or validation error shown | [ ] | |
| 3.4.7 | Large value | Enter "999999.99" | Value accepted and formatted correctly | [ ] | |

---

## 4. Category Management

### 4.1 Category CRUD

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 4.1.1 | Create category group | Use the "Add Group" action | New category group appears in the list | [ ] | |
| 4.1.2 | Rename category group | Edit an existing group name | Group name updates | [ ] | |
| 4.1.3 | Create category | Add a new category within a group | Category appears under the correct group | [ ] | |
| 4.1.4 | Rename category | Edit an existing category name | Category name updates | [ ] | |
| 4.1.5 | Delete category group | Delete a group (with or without categories) | Group removed; verify handling of existing categories | [ ] | |
| 4.1.6 | Delete category | Delete a category | Category removed from group | [ ] | |

### 4.2 Drag-and-Drop Reorder

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 4.2.1 | Reorder categories within a group | Drag a category up or down within its group | Category moves to new position; order persists on reload | [ ] | |
| 4.2.2 | Reorder category groups | Drag a category group above or below another | Group moves; order persists on reload | [ ] | |
| 4.2.3 | Move category between groups | Drag a category from one group to another | Category appears in new group; removed from original | [ ] | |
| 4.2.4 | Drag visual feedback | Begin dragging a category | Visual indicator (ghost, highlight) shows drag in progress | [ ] | |

### 4.3 Archive / Unarchive

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 4.3.1 | Archive category | Archive an active category | Category is hidden from the main budget view | [ ] | |
| 4.3.2 | Archived category in transactions | Create a transaction with the archived category before archiving | Historical transactions still reference the archived category | [ ] | |
| 4.3.3 | Unarchive category | Unarchive a previously archived category | Category reappears in its group on the budget view | [ ] | |
| 4.3.4 | Archive group | Archive an entire group (if supported) | Group and its categories hidden | [ ] | |

### 4.4 Carry-Forward

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 4.4.1 | Positive balance carries forward | Assign £100 to a category, spend £30, navigate to next month | Available shows £70 carried forward (if carry-forward is enabled) | [ ] | |
| 4.4.2 | Negative balance carries forward | Overspend a category, navigate to next month | Negative balance carries forward as expected | [ ] | |
| 4.4.3 | Zero balance next month | Assign £50, spend £50, navigate to next month | Available shows £0.00 | [ ] | |

---

## 5. Account Management

### 5.1 Account Creation

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 5.1.1 | Create Checking account | Add new account, type = Checking, name = "Test Checking", opening balance = £100.00 | Account created, appears in sidebar with £100.00 balance | [ ] | |
| 5.1.2 | Create Savings account | Add new account, type = Savings, opening balance = £500.00 | Account created and listed | [ ] | |
| 5.1.3 | Create Credit Card account | Add new account, type = Credit, opening balance = -£250.00 | Account created with negative balance (debt) | [ ] | |
| 5.1.4 | Create Cash account | Add new account, type = Cash, opening balance = £20.00 | Account created | [ ] | |
| 5.1.5 | Create Investment account | Add new account, type = Investment, opening balance = £1000.00 | Account created | [ ] | |
| 5.1.6 | Empty name rejected | Try to create account with no name | Validation error, account not created | [ ] | |
| 5.1.7 | Zero opening balance | Create account with £0.00 opening balance | Account created with £0.00 balance | [ ] | |
| 5.1.8 | Opening balance stored as pence | Create account with £12.34 opening balance, verify in data/UI | Balance stored as 1234 (integer pence) and displayed as £12.34 | [ ] | |

### 5.2 Balance Displays

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 5.2.1 | Current balance | View account balance after transactions | Current balance = cleared + uncleared | [ ] | |
| 5.2.2 | Cleared balance | Mark some transactions as cleared | Cleared balance reflects only cleared transactions | [ ] | |
| 5.2.3 | Uncleared balance | View account with mix of cleared/uncleared | Uncleared balance shows sum of uncleared transactions | [ ] | |
| 5.2.4 | Balance updates on new transaction | Add a new expense transaction | All three balances update accordingly | [ ] | |

### 5.3 Soft-Close / Reopen

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 5.3.1 | Soft-close account | Close an account via settings/actions | Account marked as closed; still visible but distinguished (greyed out or labelled) | [ ] | |
| 5.3.2 | Closed account in sidebar | View sidebar after closing account | Closed account is either hidden or visually distinguished | [ ] | |
| 5.3.3 | Cannot add transactions to closed account | Attempt to add transaction to closed account | Action prevented or warning shown | [ ] | |
| 5.3.4 | Reopen account | Reopen a previously closed account | Account returns to active status, fully usable | [ ] | |
| 5.3.5 | Historical data preserved | Close and reopen account | All previous transactions and balances intact | [ ] | |

---

## 6. Transaction Management

### 6.1 Transaction Creation (All 4 Types)

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 6.1.1 | Create expense | Add transaction: date, payee, category, outflow amount | Expense saved; account balance decreases; category activity updates | [ ] | |
| 6.1.2 | Create income | Add transaction: date, payee, category (income), inflow amount | Income saved; account balance increases; "Ready to Assign" updates | [ ] | |
| 6.1.3 | Create transfer | Add transfer between two accounts | Both accounts update: source decreases, destination increases | [ ] | |
| 6.1.4 | Transfer paired transaction | After creating a transfer, check the destination account | Paired/mirror transaction exists in destination account register | [ ] | |
| 6.1.5 | Create adjustment | Add an adjustment transaction | Account balance adjusts accordingly | [ ] | |
| 6.1.6 | Required fields validation | Submit a transaction with missing required fields | Validation errors shown for each missing field | [ ] | |
| 6.1.7 | Amount formatting | Enter "12.5" as amount | Stored as 1250 pence, displayed as £12.50 | [ ] | |

### 6.2 Inline Editing

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 6.2.1 | Edit payee inline | Click on a transaction's payee in the register, change it | Payee updates; saved on blur/Enter | [ ] | |
| 6.2.2 | Edit category inline | Click on category field, select a different category | Category updates; budget figures recalculate | [ ] | |
| 6.2.3 | Edit amount inline | Click on amount, change value | Amount updates; balances recalculate | [ ] | |
| 6.2.4 | Edit date inline | Click on date, change to a different date | Date updates; transaction may re-sort by date | [ ] | |
| 6.2.5 | Edit memo inline | Click on memo field, type new memo | Memo updates | [ ] | |
| 6.2.6 | Cancel inline edit | Start editing a field, press Escape | Original value restored | [ ] | |
| 6.2.7 | Edit transfer transaction | Edit the amount on one side of a transfer | Paired transaction in other account also updates | [ ] | |

### 6.3 Transaction Deletion

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 6.3.1 | Delete expense | Delete an expense transaction | Transaction removed; account balance and category figures update | [ ] | |
| 6.3.2 | Delete transfer | Delete one side of a transfer | Both paired transactions removed; both account balances update | [ ] | |
| 6.3.3 | Delete confirmation | Attempt to delete a transaction | Confirmation prompt appears before deletion | [ ] | |

### 6.4 Filtering

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 6.4.1 | Filter by account | Select a specific account filter | Only transactions for that account shown | [ ] | |
| 6.4.2 | Filter by category | Select a specific category filter | Only transactions with that category shown | [ ] | |
| 6.4.3 | Filter by shared flag | Toggle the shared filter | Only shared-flagged transactions shown | [ ] | |
| 6.4.4 | Combine filters | Apply account + category filter | Results match both filter criteria | [ ] | |
| 6.4.5 | Clear filters | Clear all active filters | Full transaction list restored | [ ] | |
| 6.4.6 | Filter persistence on navigation | Apply filter, navigate away, come back | Verify filter state (reset or persisted, per design) | [ ] | |

### 6.5 Search

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 6.5.1 | Search by payee | Type a payee name in search box | Transactions matching that payee appear | [ ] | |
| 6.5.2 | Search by memo | Type a memo keyword in search box | Transactions matching that memo appear | [ ] | |
| 6.5.3 | Partial match | Type partial payee name (e.g., "Tes" for "Tesco") | Matching transactions appear | [ ] | |
| 6.5.4 | No results | Search for a string with no matches | Empty state message displayed | [ ] | |
| 6.5.5 | Clear search | Clear the search input | Full transaction list restored | [ ] | |
| 6.5.6 | Case insensitivity | Search "tesco" vs "Tesco" | Same results returned regardless of case | [ ] | |

### 6.6 Pagination / Infinite Scroll

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 6.6.1 | Initial page load | Open account with 200+ transactions | First 200 transactions load | [ ] | |
| 6.6.2 | Scroll to load more | Scroll to bottom of transaction list | Next batch of transactions loads seamlessly | [ ] | |
| 6.6.3 | All transactions loaded | Keep scrolling until all loaded | Loading indicator disappears; all transactions visible | [ ] | |
| 6.6.4 | Scroll performance | Scroll rapidly through hundreds of transactions | No visible jank or frame drops | [ ] | |

### 6.7 Shared Flag

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 6.7.1 | Mark transaction as shared | Toggle the shared flag on a transaction | Shared indicator visible on the transaction | [ ] | |
| 6.7.2 | Unmark shared | Toggle shared flag off | Shared indicator removed | [ ] | |
| 6.7.3 | Filter by shared | Apply shared filter | Only shared transactions shown | [ ] | |

### 6.8 Recurring Transactions (Experimental)

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 6.8.1 | Create recurring transaction | Set up a recurring expense (if feature is available) | Recurring indicator shown; future instances generated or scheduled | [ ] | |
| 6.8.2 | Edit recurring transaction | Edit a recurring transaction | Verify whether edit applies to single or all instances | [ ] | |
| 6.8.3 | Delete recurring transaction | Delete a recurring transaction | Verify scope of deletion (single vs. series) | [ ] | |

---

## 7. Payee Management

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 7.1 | Payees page loads | Navigate to `/settings/payees` | List of existing payees rendered | [ ] | |
| 7.2 | Create payee | Add a new payee (e.g., "QA Test Payee") | Payee appears in the list | [ ] | |
| 7.3 | Rename payee | Edit an existing payee name | Name updates in list and in existing transactions | [ ] | |
| 7.4 | Delete payee | Delete a payee | Payee removed from list; verify transaction handling | [ ] | |
| 7.5 | Auto-suggest in transaction | Start typing a payee name when adding a transaction | Dropdown shows matching payees | [ ] | |
| 7.6 | Auto-suggest selects payee | Click a suggestion from the dropdown | Payee field populated with selected name | [ ] | |
| 7.7 | New payee from transaction | Type a payee name that does not exist, save transaction | New payee auto-created and appears in payees list | [ ] | |

---

## 8. Data Export

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 8.1 | Export page loads | Navigate to `/settings/export` | Export page renders with CSV download option | [ ] | |
| 8.2 | Export all transactions | Click export with no filters | CSV file downloads containing all transactions | [ ] | |
| 8.3 | CSV format valid | Open downloaded CSV in a text editor or spreadsheet | Valid CSV with headers; amounts in correct format | [ ] | |
| 8.4 | Export respects account filter | Filter by a specific account, then export | CSV contains only transactions from that account | [ ] | |
| 8.5 | Export respects category filter | Filter by category, then export | CSV contains only matching transactions | [ ] | |
| 8.6 | Export respects date range | If date filter exists, apply it and export | CSV contains only transactions within the date range | [ ] | |
| 8.7 | GBP amounts in export | Check monetary values in CSV | Amounts correctly formatted (verify pence vs. pounds convention) | [ ] | |
| 8.8 | Empty export | Export with filters that match zero transactions | Empty CSV (headers only) downloads without error | [ ] | |

---

## 9. Responsive Design

### 9.1 Desktop (1024px+)

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 9.1.1 | Full layout renders | View app at 1280px+ width | Sidebar visible alongside main content; no horizontal scroll | [ ] | |
| 9.1.2 | Budget table columns | View budget overview at desktop width | All columns (Category, Assigned, Activity, Available) visible without truncation | [ ] | |
| 9.1.3 | Transaction register columns | View transaction register at desktop width | All columns visible (Date, Payee, Category, Memo, Amount, etc.) | [ ] | |

### 9.2 Tablet (768px - 1023px)

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 9.2.1 | Sidebar collapses | Resize to 768px or use tablet viewport | Sidebar collapses or becomes a hamburger menu | [ ] | |
| 9.2.2 | Sidebar toggle works | Tap hamburger/toggle icon | Sidebar opens as overlay; tap again or outside to close | [ ] | |
| 9.2.3 | Content reflows | View budget page at tablet width | Content reflows without horizontal scroll; no overlapping elements | [ ] | |
| 9.2.4 | Touch targets adequate | Tap buttons, links, and form fields on tablet | All interactive elements have minimum 44x44px touch targets | [ ] | |
| 9.2.5 | Transaction register on tablet | View register at tablet width | Columns adjust or become scrollable; data remains readable | [ ] | |
| 9.2.6 | Inline editing on tablet | Tap to edit a transaction field | Keyboard appears; editing works as expected | [ ] | |

### 9.3 Dark Mode

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 9.3.1 | Dark theme applied by default | Load the app fresh | Dark background, light text throughout; no white "flashes" on load | [ ] | |
| 9.3.2 | All pages use dark theme | Navigate through every major page | Consistent dark theme; no unstyled/white sections | [ ] | |
| 9.3.3 | Text readability | Review all text across pages | Sufficient contrast between text and background | [ ] | |
| 9.3.4 | Input fields styled | Click into input fields (forms, inline edits) | Inputs have visible borders/backgrounds in dark theme; no invisible text | [ ] | |
| 9.3.5 | Modals/dialogs styled | Open any modal or confirmation dialog | Dark theme applied; no bright/white dialogs | [ ] | |

---

## 10. Accessibility Basics

### 10.1 Keyboard Navigation

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 10.1.1 | Tab through sign-in form | On `/sign-in`, press Tab repeatedly | Focus moves logically: email > password > sign-in button > Google button | [ ] | |
| 10.1.2 | Tab through sidebar | Focus on sidebar, Tab through items | Each sidebar link receives focus in order | [ ] | |
| 10.1.3 | Tab through budget table | Focus on budget overview, Tab through categories | Focus visits each editable assignment field in order | [ ] | |
| 10.1.4 | Tab through transaction register | Focus on register, Tab through fields | Focus visits each field of each transaction row | [ ] | |
| 10.1.5 | Enter/Space activates buttons | Focus a button, press Enter or Space | Button action triggers | [ ] | |
| 10.1.6 | Escape closes modals | Open a modal/dialog, press Escape | Modal closes, focus returns to trigger element | [ ] | |
| 10.1.7 | No keyboard traps | Tab through the entire app | Focus never gets stuck; can always Tab away from any element | [ ] | |

### 10.2 Focus Indicators

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 10.2.1 | Focus ring visible on buttons | Tab to a button | Clear visible focus ring/outline around the button | [ ] | |
| 10.2.2 | Focus ring visible on inputs | Tab to an input field | Clear visible focus ring | [ ] | |
| 10.2.3 | Focus ring visible on links | Tab to a navigation link | Clear visible focus indicator | [ ] | |
| 10.2.4 | Focus ring visible in dark mode | Tab through elements in dark theme | Focus indicators contrast sufficiently against dark background | [ ] | |

### 10.3 Screen Reader

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 10.3.1 | Page titles announced | Navigate between pages with VoiceOver/NVDA | Each page has a descriptive title read aloud | [ ] | |
| 10.3.2 | Form labels read | Focus each form field | Screen reader announces the field label/purpose | [ ] | |
| 10.3.3 | Button labels read | Focus each button | Screen reader announces button purpose (not just "button") | [ ] | |
| 10.3.4 | Table headers read | Navigate budget or transaction table | Column headers are announced when entering table cells | [ ] | |
| 10.3.5 | Error messages announced | Trigger a validation error | Screen reader announces the error message | [ ] | |
| 10.3.6 | ARIA landmarks | Inspect page structure | Main, navigation, and complementary landmarks present | [ ] | |

### 10.4 Color Contrast

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 10.4.1 | Normal text contrast | Use a contrast checker on body text | Meets WCAG AA (4.5:1 ratio minimum) | [ ] | |
| 10.4.2 | Large text contrast | Check headings and large text | Meets WCAG AA (3:1 ratio minimum) | [ ] | |
| 10.4.3 | Interactive element contrast | Check buttons, links, inputs | Meets WCAG AA contrast requirements | [ ] | |
| 10.4.4 | Error/warning text contrast | Check error messages and warnings | Readable with sufficient contrast in dark mode | [ ] | |

### 10.5 Semantic HTML

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 10.5.1 | Heading hierarchy | Inspect page headings (H1-H6) | Logical hierarchy: one H1, followed by H2/H3 as needed; no skipped levels | [ ] | |
| 10.5.2 | Lists use list elements | Inspect sidebar and category lists | Uses `<ul>`/`<ol>`/`<li>` appropriately | [ ] | |
| 10.5.3 | Tables use table elements | Inspect budget and transaction tables | Uses `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>` | [ ] | |
| 10.5.4 | Forms use form elements | Inspect sign-in and other forms | Uses `<form>`, `<label>`, `<input>` with proper associations | [ ] | |

---

## 11. Error Handling & Edge Cases

### 11.1 Network Errors

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 11.1.1 | Offline indicator | Disconnect network (DevTools > Network > Offline) | App shows an offline indicator or error message | [ ] | |
| 11.1.2 | Save while offline | Edit a transaction while offline | Error message shown; data not silently lost | [ ] | |
| 11.1.3 | Reconnection recovery | Go offline, then reconnect | App recovers; pending changes sync or user is prompted | [ ] | |

### 11.2 Invalid Input

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 11.2.1 | Extremely long text | Enter 500+ character payee name | Input is truncated or rejected with max-length validation | [ ] | |
| 11.2.2 | Special characters | Enter `<script>alert('xss')</script>` as payee | Input is sanitized; no script execution | [ ] | |
| 11.2.3 | Unicode/emoji input | Enter emoji or unicode characters in text fields | Handled gracefully (either accepted or rejected cleanly) | [ ] | |
| 11.2.4 | Decimal precision | Enter £10.999 as a transaction amount | Rounded or rejected; stored correctly as pence | [ ] | |
| 11.2.5 | Negative amounts | Enter negative values in inflow/outflow fields | Handled as designed (rejected or treated as opposite flow) | [ ] | |

### 11.3 Empty States

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 11.3.1 | No budgets | Sign in with user that has no budgets | Empty state with prompt to create a budget | [ ] | |
| 11.3.2 | No transactions | View account with zero transactions | Empty state message (e.g., "No transactions yet") | [ ] | |
| 11.3.3 | No categories | View budget with no category groups | Empty state with prompt to add categories | [ ] | |
| 11.3.4 | No accounts | View accounts page with none created | Empty state with prompt to create an account | [ ] | |
| 11.3.5 | No payees | View `/settings/payees` with none | Empty state message | [ ] | |
| 11.3.6 | No search results | Search for a string with zero matches | "No results" message displayed | [ ] | |

### 11.4 Concurrent / Multi-Tab

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 11.4.1 | Edit in two tabs | Open app in two tabs, edit same transaction in both | No data corruption; last write wins or conflict detected | [ ] | |
| 11.4.2 | Delete in another tab | Delete a transaction in Tab A while Tab B has it visible | Tab B handles the deletion gracefully (removes row or shows error) | [ ] | |

### 11.5 Invalid Routes

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 11.5.1 | Non-existent route | Navigate to `/nonexistent` | 404 page or redirect to a valid page | [ ] | |
| 11.5.2 | Invalid month format | Navigate to `/budget/13-2026` | Handled gracefully (redirect or error message) | [ ] | |
| 11.5.3 | Invalid account ID | Navigate to `/accounts/fakeid123/transactions` | Error message or redirect; no blank screen | [ ] | |

---

## 12. Performance Red Flags

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 12.1 | Initial load time | Clear cache, navigate to app, measure load time (DevTools > Performance) | Page interactive in < 2 seconds on broadband | [ ] | |
| 12.2 | Budget page load | Navigate to budget overview with 20+ categories | Renders in < 1 second; no visible loading jank | [ ] | |
| 12.3 | Transaction register load | Open account with 200+ transactions | First page of transactions renders in < 1 second | [ ] | |
| 12.4 | Scroll performance | Scroll through long transaction list | 60fps; no dropped frames visible in DevTools Performance tab | [ ] | |
| 12.5 | Month navigation speed | Click forward/back month arrows rapidly | Each month loads within 500ms; no stacking/queuing of requests | [ ] | |
| 12.6 | Memory on navigation | Navigate between pages 20+ times; check DevTools > Memory | Heap size remains stable; no unbounded growth (memory leak) | [ ] | |
| 12.7 | No console errors | Open DevTools Console, navigate through all pages | No JavaScript errors logged (warnings acceptable) | [ ] | |

---

## 13. Settings

### 13.1 Budget Settings

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 13.1.1 | Budget settings load | Navigate to `/settings/budget` | Budget name and settings displayed | [ ] | |
| 13.1.2 | Rename budget | Change budget name, save | Budget name updates throughout the app (sidebar, header) | [ ] | |
| 13.1.3 | Budget settings persist | Change a setting, reload page | Setting retained after reload | [ ] | |

### 13.2 Delete Budget

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 13.2.1 | Delete budget page loads | Navigate to `/settings/delete-budget` | Confirmation page renders with warning text | [ ] | |
| 13.2.2 | Confirmation required | Click delete without confirming | Deletion blocked; confirmation step enforced | [ ] | |
| 13.2.3 | Budget deleted | Confirm deletion | Budget removed; user redirected to `/budget-select` | [ ] | |
| 13.2.4 | Deleted budget gone | After deletion, check budget-select list | Deleted budget no longer listed | [ ] | |

### 13.3 Account Settings

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 13.3.1 | Account settings load | Navigate to `/settings/accounts` | List of accounts with edit options displayed | [ ] | |
| 13.3.2 | Rename account | Change an account name, save | Account name updates in sidebar and transaction register | [ ] | |
| 13.3.3 | Change account type | Change account type (if supported) | Type updates; behaviour adjusts accordingly | [ ] | |

---

## 14. Multi-Budget Support

| # | Test | Steps | Expected | Pass/Fail | Notes |
|---|------|-------|----------|-----------|-------|
| 14.1 | Create second budget | From `/budget-select`, create a new budget | New budget appears in selection list | [ ] | |
| 14.2 | Switch between budgets | Select a different budget from budget-select | New budget loads with its own data; no data bleed from other budget | [ ] | |
| 14.3 | Data isolation | Add transaction in Budget A, switch to Budget B | Transaction does not appear in Budget B | [ ] | |
| 14.4 | Return to budget-select | Navigate back to budget selection | Both budgets listed; can switch freely | [ ] | |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Tester | | | |
| Dev Lead | | | |
| Product Owner | | | |

---

**Total test cases**: 156
**Passed**: _____ / 156
**Failed**: _____
**Not tested**: _____
**Notes / Blockers**:

---

*Last updated: 2026-02-17*
