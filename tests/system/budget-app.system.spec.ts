/**
 * Suite 1 - System Tests @system
 *
 * Validates individual PRD requirements for the Arctic Budget web app
 * at the system level (single-feature, isolated checks).
 */
import { test, expect } from '../fixtures/auth.fixture';
import { LoginPage } from '../pages/login.page';
import AxeBuilder from '@axe-core/playwright';

/* ────────────────────────────────────────────────────────────────────
 * FR-AUTH: Authentication
 * ──────────────────────────────────────────────────────────────────── */
test.describe('Authentication @system', () => {

  test('FR-AUTH-01: Sign-in page loads with email and password fields', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.signInButton).toBeVisible();
  });

  test('FR-AUTH-02: Email/password sign-in works and redirects to budget', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await test.step('Fill credentials and submit', async () => {
      await loginPage.signIn('qa-primary@arcticbudget.test', 'QaTest123!');
    });

    await test.step('Wait for redirect to budget area', async () => {
      await page.waitForURL(/\/(budget|budget-select)/, { timeout: 30_000 });
    });

    expect(page.url()).toMatch(/\/(budget|budget-select)/);
  });

  test('FR-AUTH-04: localStorage is cleared on sign-out', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await test.step('Verify we are authenticated', async () => {
      await expect(page).toHaveURL(/\/(budget|budget-select|accounts)/);
    });

    await test.step('Sign out via settings or menu', async () => {
      // Look for a sign-out / logout control
      const signOutBtn = page.getByRole('button', { name: /sign out|log out|logout/i })
        .or(page.getByText(/sign out|log out|logout/i));

      // If sign-out is behind a menu, try opening it first
      const menuTrigger = page.getByRole('button', { name: /menu|account|profile/i })
        .or(page.getByTestId('user-menu'));
      if (await menuTrigger.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await menuTrigger.click();
      }

      await signOutBtn.first().click();
      await page.waitForURL(/\/sign-in/, { timeout: 15_000 });
    });

    await test.step('Assert localStorage auth tokens are cleared', async () => {
      const storageKeys = await page.evaluate(() => Object.keys(localStorage));
      const authKeys = storageKeys.filter(
        (k) => /token|auth|user|session|firebase/i.test(k),
      );
      expect(authKeys.length).toBe(0);
    });
  });
});

/* ────────────────────────────────────────────────────────────────────
 * FR-NAV: Navigation & Layout
 * ──────────────────────────────────────────────────────────────────── */
test.describe('Navigation & Layout @system', () => {

  test('FR-NAV-01: App layout has sidebar with navigation and main content area', async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    await test.step('Verify sidebar is present', async () => {
      // Use the actual sidebar element: <aside class="sidebar">
      const sidebar = page.locator('aside.sidebar');
      await expect(sidebar).toBeVisible();
    });

    await test.step('Verify main navigation exists', async () => {
      // Actual DOM: <nav class="sidebar-nav"> inside the aside
      const nav = page.locator('nav.sidebar-nav');
      await expect(nav).toBeVisible();
    });

    await test.step('Verify main content area exists', async () => {
      const main = page.getByRole('main')
        .or(page.locator('main, [class*="main-content"], [class*="content-area"]'));
      await expect(main.first()).toBeVisible();
    });
  });

  test('FR-NAV-02: All major routes are accessible after auth', async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;
    const routes = [
      { path: '/budget', label: 'Budget', waitFor: /ready to assign/i },
      { path: '/accounts', label: 'Accounts', waitFor: /account/i },
      { path: '/transactions', label: 'Transactions', waitFor: /transaction|date|payee/i },
      { path: '/settings/budget', label: 'Settings - Budget', waitFor: /budget settings|budget details/i },
      { path: '/settings/accounts', label: 'Settings - Accounts', waitFor: /account/i },
      { path: '/settings/payees', label: 'Settings - Payees', waitFor: /payee/i },
      { path: '/settings/export', label: 'Settings - Export', waitFor: /export/i },
      { path: '/settings/delete-budget', label: 'Settings - Delete Budget', waitFor: /delete|danger/i },
    ];

    for (const route of routes) {
      await test.step(`Navigate to ${route.label} (${route.path})`, async () => {
        await page.goto(route.path, { waitUntil: 'domcontentloaded' });
        // Wait for route-specific content instead of networkidle
        await page.getByText(route.waitFor).first().waitFor({ state: 'visible', timeout: 15_000 });
        // Should not redirect to sign-in
        expect.soft(page.url()).not.toContain('/sign-in');
      });
    }
  });

  test('FR-NAV-03: Month navigation - forward/back arrows and month picker', async ({
    budgetPage,
    authenticatedPage,
  }) => {
    const page = authenticatedPage;
    await budgetPage.goto();

    await test.step('Verify month navigation controls are visible', async () => {
      await expect(budgetPage.prevMonthButton).toBeVisible();
      await expect(budgetPage.nextMonthButton).toBeVisible();
    });

    await test.step('Navigate to previous month', async () => {
      const initialText = await budgetPage.getMonthText();
      await budgetPage.goToPreviousMonth();
      const newText = await budgetPage.getMonthText();
      expect(newText).not.toBe(initialText);
    });

    await test.step('Navigate to next month', async () => {
      const beforeText = await budgetPage.getMonthText();
      await budgetPage.goToNextMonth();
      const afterText = await budgetPage.getMonthText();
      expect(afterText).not.toBe(beforeText);
    });
  });

  test('FR-NAV-04: Environment banner is visible on QA', async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    // Target the visible QA badge in the sidebar header (not the hidden mobile header one)
    const banner = page.locator('aside.sidebar .env-badge, .sidebar-header .env-badge');
    await expect(banner.first()).toBeVisible();
    await expect(banner.first()).toHaveText(/QA/i);
  });
});

/* ────────────────────────────────────────────────────────────────────
 * FR-BUD: Budget Overview
 * ──────────────────────────────────────────────────────────────────── */
test.describe('Budget Overview @system', () => {

  test('FR-BUD-03: Budget displays category groups with Assigned/Activity/Available and Ready to Assign', async ({
    budgetPage,
    authenticatedPage,
  }) => {
    await budgetPage.goto();

    await test.step('Ready to Assign is visible', async () => {
      await expect(budgetPage.readyToAssign).toBeVisible();
    });

    await test.step('Column headers are visible', async () => {
      await expect(budgetPage.assignedColumn).toBeVisible();
      await expect(budgetPage.activityColumn).toBeVisible();
      await expect(budgetPage.availableColumn).toBeVisible();
    });

    await test.step('At least one category group is present', async () => {
      const count = await budgetPage.getCategoryGroupCount();
      expect(count).toBeGreaterThan(0);
    });

    await test.step('Visual snapshot of budget overview', async () => {
      await expect(authenticatedPage).toHaveScreenshot('budget-overview.png', {
        maxDiffPixelRatio: 0.01,
      });
    });
  });
});

/* ────────────────────────────────────────────────────────────────────
 * FR-ACC: Accounts
 * ──────────────────────────────────────────────────────────────────── */
test.describe('Accounts @system', () => {

  test('FR-ACC-03: Account balances display (current/cleared/uncleared)', async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;
    await page.goto('/accounts', { waitUntil: 'domcontentloaded' });
    // Wait for accounts content to load
    await page.locator('aside.sidebar').waitFor({ state: 'visible', timeout: 15_000 });
    await page.waitForTimeout(2_000);

    await test.step('Account balance indicators are visible', async () => {
      const balanceEl = page.getByText(/balance|cleared|uncleared|current/i)
        .or(page.locator('[class*="balance"], [data-testid*="balance"]'));
      await expect(balanceEl.first()).toBeVisible();
    });
  });

  test('FR-ACC-06: Sidebar shows accounts with balances', async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    await test.step('Sidebar contains at least one account entry', async () => {
      // Use the actual DOM selector: <nav class="sidebar-accounts-nav"> > <a class="sidebar-account-link">
      const accountLinks = page.locator('a.sidebar-account-link');
      const count = await accountLinks.count();
      expect(count).toBeGreaterThan(0);
    });

    await test.step('Account entries show a currency value (GBP)', async () => {
      const balances = page.locator('[data-testid="sidebar-account-balance"]');
      const count = await balances.count();
      expect.soft(count).toBeGreaterThan(0);

      if (count > 0) {
        const firstBalance = await balances.first().textContent();
        expect.soft(firstBalance).toMatch(/£/);
      }
    });
  });
});

/* ────────────────────────────────────────────────────────────────────
 * FR-TXN: Transactions
 * ──────────────────────────────────────────────────────────────────── */
test.describe('Transactions @system', () => {

  test('FR-TXN-03: Transaction register loads with columns', async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;
    await page.goto('/transactions', { waitUntil: 'domcontentloaded' });
    // Wait for sidebar (app shell loaded) then give transaction data time to render
    await page.locator('aside.sidebar').waitFor({ state: 'visible', timeout: 15_000 });
    await page.waitForTimeout(2_000);

    await test.step('Transaction table/list is visible', async () => {
      const table = page.getByRole('table')
        .or(page.locator('[class*="transaction-list"], [class*="register"], [data-testid="transaction-register"]'));
      await expect(table.first()).toBeVisible();
    });

    await test.step('Expected column headers are present', async () => {
      // Actual columns: DATE, ACCOUNT, PAYEE, CATEGORY, MEMO, OUTFLOW, INFLOW, SHARED
      const expectedColumns = ['date', 'payee', 'category', 'outflow', 'inflow'];
      for (const col of expectedColumns) {
        const header = page.getByText(new RegExp(col, 'i')).first();
        expect.soft(await header.isVisible(), `Column "${col}" should be visible`).toBeTruthy();
      }
    });

    await test.step('Visual snapshot of transaction register', async () => {
      await expect(page).toHaveScreenshot('transaction-register.png', {
        maxDiffPixelRatio: 0.01,
      });
    });
  });

  test('FR-TXN-04/05: Transaction filtering and search UI elements are present', async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;
    await page.goto('/transactions', { waitUntil: 'domcontentloaded' });
    await page.locator('aside.sidebar').waitFor({ state: 'visible', timeout: 15_000 });
    await page.waitForTimeout(2_000);

    await test.step('Search input is available', async () => {
      // Actual placeholder: "Search transactions..."
      const search = page.getByPlaceholder(/search transactions/i)
        .or(page.getByPlaceholder(/search/i))
        .or(page.getByRole('searchbox'))
        .or(page.getByTestId('transaction-search'));
      await expect(search.first()).toBeVisible();
    });

    await test.step('Filter controls are available', async () => {
      // Actual filter: "All Transactions" dropdown / "Add Transaction" button area
      const filter = page.getByText(/all transactions/i)
        .or(page.getByRole('button', { name: /filter/i }))
        .or(page.getByTestId('transaction-filter'));
      await expect(filter.first()).toBeVisible();
    });
  });
});

/* ────────────────────────────────────────────────────────────────────
 * FR-EXP: Export
 * ──────────────────────────────────────────────────────────────────── */
test.describe('Export @system', () => {

  test('FR-EXP-01: Export page is accessible', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await page.goto('/settings/export', { waitUntil: 'domcontentloaded' });
    await page.locator('aside.sidebar').waitFor({ state: 'visible', timeout: 15_000 });
    await page.waitForTimeout(2_000);

    expect(page.url()).toContain('/settings/export');
    const exportContent = page.getByText(/export/i);
    await expect(exportContent.first()).toBeVisible();
  });
});

/* ────────────────────────────────────────────────────────────────────
 * Accessibility
 * ──────────────────────────────────────────────────────────────────── */
test.describe('Accessibility @system', () => {

  test('Basic a11y attributes on key elements (axe-core scan)', async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;
    await page.goto('/budget', { waitUntil: 'domcontentloaded' });
    await page.getByText(/ready to assign/i).waitFor({ state: 'visible', timeout: 15_000 });

    await test.step('Run axe-core accessibility scan on budget page', async () => {
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .disableRules(['color-contrast']) // dark-mode themes often flag contrast in CI
        .analyze();

      expect.soft(results.violations.length, `axe violations: ${JSON.stringify(results.violations.map(v => v.id))}`).toBe(0);
    });
  });

  test('Sign-in page has proper a11y attributes', async ({ page }) => {
    await page.goto('/sign-in', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /sign in/i }).waitFor({ state: 'visible', timeout: 10_000 });

    await test.step('Email input has accessible label', async () => {
      const email = page.getByLabel('Email');
      await expect(email).toBeVisible();
    });

    await test.step('Password input has accessible label', async () => {
      const password = page.getByLabel('Password');
      await expect(password).toBeVisible();
    });

    await test.step('Sign-in button has accessible role', async () => {
      const btn = page.getByRole('button', { name: /sign in/i });
      await expect(btn).toBeVisible();
    });
  });
});
