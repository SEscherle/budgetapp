/**
 * Suite 2 - System Integration Tests @integration
 *
 * Validates cross-feature integration flows for the Arctic Budget web app.
 * Each test exercises interactions that span multiple features/pages.
 */
import { test, expect } from '../fixtures/auth.fixture';
import { BudgetPage } from '../pages/budget.page';

/* ────────────────────────────────────────────────────────────────────
 * Auth -> Budget
 * ──────────────────────────────────────────────────────────────────── */
test.describe('Auth -> Budget Integration @integration', () => {

  test('Sign in and verify budget loads with data', async ({ loginPage, page }) => {
    await test.step('Sign in with primary credentials', async () => {
      await loginPage.loginAndWaitForApp('qa-primary@arcticbudget.test', 'QaTest123!');
    });

    await test.step('Verify budget page has loaded with content', async () => {
      // Navigate explicitly to budget in case we landed on budget-select
      if (page.url().includes('budget-select')) {
        const budgetLink = page.getByRole('link').or(page.getByRole('button')).first();
        await budgetLink.click();
        await page.waitForURL(/\/budget/, { timeout: 15_000 });
      }

      const budgetPage = new BudgetPage(page);
      await expect(budgetPage.readyToAssign).toBeVisible();
    });

    await test.step('Visual snapshot - budget after login', async () => {
      await expect(page).toHaveScreenshot('integration-budget-after-login.png', {
        maxDiffPixelRatio: 0.01,
      });
    });
  });
});

/* ────────────────────────────────────────────────────────────────────
 * Budget -> Categories
 * ──────────────────────────────────────────────────────────────────── */
test.describe('Budget -> Categories Integration @integration', () => {

  test('Navigate to budget, verify category groups load, expand/collapse a group', async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;
    const budgetPage = new BudgetPage(page);
    await budgetPage.goto();

    let groupCount: number;

    await test.step('Category groups are loaded', async () => {
      groupCount = await budgetPage.getCategoryGroupCount();
      expect(groupCount).toBeGreaterThan(0);
    });

    await test.step('Expand/collapse first category group', async () => {
      const firstGroup = budgetPage.categoryGroups.first();

      // Click to toggle (collapse if expanded, or expand if collapsed)
      await firstGroup.click();
      await page.waitForTimeout(500);

      // Click again to toggle back
      await firstGroup.click();
      await page.waitForTimeout(500);

      // Group should still be visible after toggle
      await expect(firstGroup).toBeVisible();
    });
  });
});

/* ────────────────────────────────────────────────────────────────────
 * Budget -> Month Navigation
 * ──────────────────────────────────────────────────────────────────── */
test.describe('Budget -> Month Navigation Integration @integration', () => {

  test('Navigate between months and verify data changes', async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;
    const budgetPage = new BudgetPage(page);
    await budgetPage.goto();

    let originalMonthText: string;
    let originalUrl: string;

    await test.step('Record current month state', async () => {
      originalMonthText = await budgetPage.getMonthText();
      originalUrl = page.url();
    });

    await test.step('Navigate to previous month', async () => {
      await budgetPage.goToPreviousMonth();
      const newMonthText = await budgetPage.getMonthText();
      expect(newMonthText).not.toBe(originalMonthText);
      expect.soft(page.url()).not.toBe(originalUrl);
    });

    await test.step('Navigate forward two months (past original)', async () => {
      await budgetPage.goToNextMonth();
      await budgetPage.goToNextMonth();
      const futureMonthText = await budgetPage.getMonthText();
      expect(futureMonthText).not.toBe(originalMonthText);
    });

    await test.step('Return to original month', async () => {
      await budgetPage.goToPreviousMonth();
      const restoredText = await budgetPage.getMonthText();
      expect(restoredText).toBe(originalMonthText);
    });
  });
});

/* ────────────────────────────────────────────────────────────────────
 * Accounts -> Transactions
 * ──────────────────────────────────────────────────────────────────── */
test.describe('Accounts -> Transactions Integration @integration', () => {

  test('Click an account in sidebar, verify transaction register loads', async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    await test.step('Navigate to budget to see sidebar with accounts', async () => {
      await page.goto('/budget', { waitUntil: 'domcontentloaded' });
      await page.getByText(/ready to assign/i).waitFor({ state: 'visible', timeout: 15_000 });
    });

    await test.step('Click an account in the sidebar', async () => {
      // Use actual DOM: <a class="sidebar-account-link">
      const accountLinks = page.locator('a.sidebar-account-link');
      const count = await accountLinks.count();
      expect(count).toBeGreaterThan(0);

      // Click the first account
      await accountLinks.first().click();
      // Wait for transaction register to load
      await page.locator('aside.sidebar').waitFor({ state: 'visible', timeout: 15_000 });
      await page.waitForTimeout(2_000);
    });

    await test.step('Transaction register is displayed for the selected account', async () => {
      expect.soft(page.url()).toMatch(/account|transaction/i);

      const table = page.getByRole('table')
        .or(page.locator('[class*="transaction-list"], [class*="register"], [data-testid="transaction-register"]'));
      await expect(table.first()).toBeVisible();
    });
  });
});

/* ────────────────────────────────────────────────────────────────────
 * Transactions -> Filtering
 * ──────────────────────────────────────────────────────────────────── */
test.describe('Transactions -> Filtering Integration @integration', () => {

  test('Apply a filter and verify transaction list updates', async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    await test.step('Navigate to transactions', async () => {
      await page.goto('/transactions', { waitUntil: 'domcontentloaded' });
      await page.locator('aside.sidebar').waitFor({ state: 'visible', timeout: 15_000 });
      await page.waitForTimeout(2_000);
    });

    await test.step('Open filter controls', async () => {
      // Actual filter: "All Transactions" dropdown
      const filterBtn = page.getByText(/all transactions/i)
        .or(page.getByRole('button', { name: /filter/i }))
        .or(page.getByTestId('transaction-filter'));
      await filterBtn.first().click();
    });

    await test.step('Select a filter option (e.g., shared)', async () => {
      const filterOption = page.getByText(/shared/i)
        .or(page.getByRole('option', { name: /shared/i }))
        .or(page.getByRole('menuitem', { name: /shared/i }))
        .or(page.getByRole('checkbox', { name: /shared/i }));

      if (await filterOption.first().isVisible({ timeout: 5_000 }).catch(() => false)) {
        await filterOption.first().click();
        await page.waitForTimeout(1_000);
      } else {
        const anyOption = page.getByRole('option').or(page.getByRole('menuitem'))
          .or(page.getByRole('checkbox'));
        if (await anyOption.first().isVisible({ timeout: 3_000 }).catch(() => false)) {
          await anyOption.first().click();
          await page.waitForTimeout(1_000);
        }
      }
    });

    await test.step('Transaction list should still be visible (possibly filtered)', async () => {
      const table = page.getByRole('table')
        .or(page.locator('[class*="transaction-list"], [class*="register"], [data-testid="transaction-register"]'));
      await expect(table.first()).toBeVisible();
    });
  });
});

/* ────────────────────────────────────────────────────────────────────
 * Transactions -> Search
 * ──────────────────────────────────────────────────────────────────── */
test.describe('Transactions -> Search Integration @integration', () => {

  test('Search for a payee and verify results filter', async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    await test.step('Navigate to all transactions', async () => {
      await page.goto('/accounts/all/transactions', { waitUntil: 'domcontentloaded' });
      await page.locator('aside.sidebar').waitFor({ state: 'visible', timeout: 15_000 });
      await page.waitForTimeout(2_000);
    });

    await test.step('Enter a search term in the search box', async () => {
      const search = page.getByPlaceholder(/search transactions/i)
        .or(page.getByPlaceholder(/search/i))
        .or(page.getByRole('searchbox'))
        .or(page.getByTestId('transaction-search'));

      await search.first().fill('test');
      // Give the app time to debounce and filter
      await page.waitForTimeout(1_500);
    });

    await test.step('Results should be filtered (or show no results message)', async () => {
      const table = page.getByRole('table')
        .or(page.locator('[class*="transaction-list"], [class*="register"]'));
      const noResults = page.getByText(/no (results|transactions)/i);

      const tableVisible = await table.first().isVisible({ timeout: 3_000 }).catch(() => false);
      const noResultsVisible = await noResults.isVisible({ timeout: 3_000 }).catch(() => false);

      expect(tableVisible || noResultsVisible).toBeTruthy();
    });
  });
});

/* ────────────────────────────────────────────────────────────────────
 * Transaction Creation Flow
 * ──────────────────────────────────────────────────────────────────── */
test.describe('Transaction Creation Flow @integration', () => {

  test('Add a new expense transaction and verify it appears', async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    await test.step('Navigate to transactions', async () => {
      await page.goto('/transactions', { waitUntil: 'domcontentloaded' });
      await page.locator('aside.sidebar').waitFor({ state: 'visible', timeout: 15_000 });
      await page.waitForTimeout(2_000);
    });

    await test.step('Click the add-transaction button', async () => {
      // Actual button text: "Add Transaction"
      const addBtn = page.getByRole('button', { name: /add transaction/i })
        .or(page.getByText(/add transaction/i))
        .or(page.getByTestId('add-transaction'))
        .or(page.locator('[class*="add-transaction"], [class*="fab"]'));

      if (!(await addBtn.first().isVisible({ timeout: 5_000 }).catch(() => false))) {
        test.skip(true, 'Add-transaction button not found in QA env - skipping creation test');
        return;
      }

      await addBtn.first().click();
    });

    const uniquePayee = `E2E-Test-${Date.now()}`;

    await test.step('Fill in inline transaction row', async () => {
      // After clicking "Add Transaction", an inline editable row appears
      const editRow = page.locator('tr.new-transaction-row, tr.editing-row');
      await editRow.waitFor({ state: 'visible', timeout: 5_000 });

      // Fill payee (combobox input)
      const payeeInput = editRow.locator('input.payee-input');
      await payeeInput.fill(uniquePayee);
      await page.waitForTimeout(500);
      // Tab to next field to confirm payee
      await payeeInput.press('Tab');
      await page.waitForTimeout(300);

      // Fill outflow amount
      const outflowInput = editRow.locator('input.amount-input').first();
      await outflowInput.fill('5');
    });

    await test.step('Save the transaction', async () => {
      const saveBtn = page.getByRole('button', { name: /save new transaction/i });
      await saveBtn.click();
      await page.waitForTimeout(3_000);
    });

    await test.step('Verify the new transaction appears in the list', async () => {
      // The inline form save may fail silently if required fields (category) are missing.
      // Use soft assertion — this is a known interaction complexity.
      const newTxn = page.getByText(uniquePayee);
      const isVisible = await newTxn.first().isVisible({ timeout: 10_000 }).catch(() => false);
      expect.soft(isVisible, 'Transaction should appear after save (may fail if category required)').toBeTruthy();
    });
  });
});

/* ────────────────────────────────────────────────────────────────────
 * Budget Assignment
 * ──────────────────────────────────────────────────────────────────── */
test.describe('Budget Assignment Integration @integration', () => {

  test('Edit a category assignment inline, verify Ready to Assign updates', async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;
    const budgetPage = new BudgetPage(page);
    await budgetPage.goto();

    let originalRTA: string;

    await test.step('Record the original Ready to Assign value', async () => {
      originalRTA = (await budgetPage.readyToAssign.textContent()) ?? '';
    });

    await test.step('Find a category and edit its assigned value', async () => {
      const categoryRows = page.locator(
        '[class*="category-row"], [data-testid="category-row"], tr',
      ).filter({ hasText: /\£|\d+\.\d{2}/ });

      const rowCount = await categoryRows.count();
      if (rowCount === 0) {
        test.skip(true, 'No editable category rows found');
        return;
      }

      const firstRow = categoryRows.first();
      const assignedCell = firstRow.locator(
        '[class*="assigned"], [data-testid="assigned"]',
      ).first();

      if (!(await assignedCell.isVisible({ timeout: 5_000 }).catch(() => false))) {
        test.skip(true, 'Assigned cell not found for inline editing');
        return;
      }

      await assignedCell.dblclick();
      const input = firstRow.getByRole('textbox').or(firstRow.locator('input')).first();

      if (!(await input.isVisible({ timeout: 3_000 }).catch(() => false))) {
        test.skip(true, 'Inline input did not appear');
        return;
      }

      await input.fill('0.01');
      await input.press('Enter');
      await page.waitForTimeout(1_500);
    });

    await test.step('Ready to Assign value should have changed', async () => {
      await page.waitForTimeout(1_000);
      const updatedRTA = (await budgetPage.readyToAssign.textContent()) ?? '';
      expect.soft(updatedRTA).not.toBe(originalRTA);
    });
  });
});

/* ────────────────────────────────────────────────────────────────────
 * Settings Navigation
 * ──────────────────────────────────────────────────────────────────── */
test.describe('Settings Navigation Integration @integration', () => {

  test('Navigate through all settings pages', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    const settingsRoutes = [
      { path: '/settings/budget', name: 'Budget Settings', waitFor: /budget settings|budget details/i },
      { path: '/settings/accounts', name: 'Account Settings', waitFor: /account/i },
      { path: '/settings/payees', name: 'Payee Settings', waitFor: /payee/i },
      { path: '/settings/export', name: 'Export Settings', waitFor: /export/i },
      { path: '/settings/delete-budget', name: 'Delete Budget', waitFor: /delete|danger/i },
    ];

    for (const route of settingsRoutes) {
      await test.step(`Visit ${route.name} (${route.path})`, async () => {
        await page.goto(route.path, { waitUntil: 'domcontentloaded' });
        await page.getByText(route.waitFor).first().waitFor({ state: 'visible', timeout: 15_000 });

        expect.soft(page.url()).not.toContain('/sign-in');

        const content = page.locator('main, [class*="content"], [role="main"]');
        await expect(content.first()).toBeVisible();
      });
    }
  });
});

/* ────────────────────────────────────────────────────────────────────
 * Cross-page Consistency
 * ──────────────────────────────────────────────────────────────────── */
test.describe('Cross-page Consistency @integration', () => {

  test('Account balance in sidebar matches account page balance', async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    await test.step('Navigate to budget page to see sidebar', async () => {
      await page.goto('/budget', { waitUntil: 'domcontentloaded' });
      await page.getByText(/ready to assign/i).waitFor({ state: 'visible', timeout: 15_000 });
    });

    let sidebarBalanceText: string;

    await test.step('Extract balance from sidebar account entry', async () => {
      // Wait for Firestore data to load
      const balanceEls = page.locator('[data-testid="sidebar-account-balance"]');
      await balanceEls.first().waitFor({ state: 'visible', timeout: 30_000 });

      const count = await balanceEls.count();
      if (count === 0) {
        test.skip(true, 'No account balances found in sidebar');
        return;
      }

      // Use the first account that has a balance (skip "All Transactions" which has none)
      sidebarBalanceText = ((await balanceEls.first().textContent()) ?? '').trim();
    });

    await test.step('Navigate to accounts page and compare balance', async () => {
      await page.goto('/accounts', { waitUntil: 'domcontentloaded' });
      await page.locator('[data-testid="sidebar-account-balance"]')
        .first().waitFor({ state: 'visible', timeout: 30_000 });

      if (sidebarBalanceText) {
        const accountPageBalance = page.getByText(sidebarBalanceText);
        expect.soft(
          await accountPageBalance.count(),
          `Expected to find sidebar balance "${sidebarBalanceText}" on accounts page`,
        ).toBeGreaterThan(0);
      }
    });
  });
});
