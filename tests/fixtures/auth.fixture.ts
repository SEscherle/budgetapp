import { test as base, expect, type Page, type BrowserContext } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { BudgetPage } from '../pages/budget.page';
import * as path from 'path';
import * as fs from 'fs';

/* ── Credentials (from env or defaults) ── */
const PRIMARY_EMAIL = process.env.QA_PRIMARY_EMAIL ?? 'qa-primary@arcticbudget.test';
const PRIMARY_PASSWORD = process.env.QA_PRIMARY_PASSWORD ?? 'QaTest123!';
const SECONDARY_EMAIL = process.env.QA_SECONDARY_EMAIL ?? 'qa-secondary@arcticbudget.test';
const SECONDARY_PASSWORD = process.env.QA_SECONDARY_PASSWORD ?? 'QaTest123!';

/* ── Storage-state cache path ── */
const STORAGE_DIR = path.resolve(__dirname, '..', '.auth');
const PRIMARY_STATE_PATH = path.join(STORAGE_DIR, 'primary-user.json');
const SECONDARY_STATE_PATH = path.join(STORAGE_DIR, 'secondary-user.json');

/**
 * Wait for the app to be ready after login/navigation.
 * Uses element-based waits instead of networkidle (Firestore keeps connections open).
 */
async function waitForAppReady(page: Page) {
  // Wait for either the budget page or budget-select page to render
  const budgetReady = page.getByText(/ready to assign/i);
  const budgetSelect = page.getByText(/select.*budget|choose.*budget/i);
  const sidebar = page.locator('aside.sidebar');

  // Wait for any of these signals that the app has loaded
  await Promise.race([
    budgetReady.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
    budgetSelect.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
    sidebar.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {}),
  ]);
}

/**
 * Ensure we're on the QA Test Budget and Firestore data has loaded.
 *
 * The primary test user has one budget ("QA Test Budget") with categories
 * and accounts. After login the app shell renders instantly (Ready to Assign
 * shows £0.00) but Firestore data arrives asynchronously. We must wait for
 * real data before proceeding — otherwise tests see an empty budget.
 */
async function ensureBudgetSelected(page: Page) {
  // Handle /budget-select page (shown when multiple budgets exist)
  if (page.url().includes('budget-select')) {
    const qaOption = page.getByText(/QA Test Budget/i).first();
    if (await qaOption.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await qaOption.click();
    } else {
      await page.getByRole('button').first().click();
    }
    await page.waitForURL(/\/budget/, { timeout: 15_000 });
  }

  // Wait for the app shell
  await page.getByText(/ready to assign/i).waitFor({ state: 'visible', timeout: 15_000 });

  // Wait for Firestore data to arrive — account balances appear only once
  // real data loads (the "All Transactions" link has no balance testid).
  await page.locator('[data-testid="sidebar-account-balance"]')
    .first().waitFor({ state: 'visible', timeout: 30_000 });
}

/**
 * Authenticate a page with the given credentials and persist storage state.
 */
async function authenticateAndSave(
  page: Page,
  email: string,
  password: string,
  statePath: string,
) {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }

  const loginPage = new LoginPage(page);
  await loginPage.loginAndWaitForApp(email, password);
  await waitForAppReady(page);
  await ensureBudgetSelected(page);

  // Persist storage state for reuse
  await page.context().storageState({ path: statePath });
}

/* ── Fixture type declarations ── */
type AuthFixtures = {
  authenticatedPage: Page;
  secondaryAuthPage: Page;
  loginPage: LoginPage;
  budgetPage: BudgetPage;
};

export const test = base.extend<AuthFixtures>({
  /* ---------- authenticatedPage ---------- */
  authenticatedPage: async ({ browser }, use) => {
    let context: BrowserContext;

    // Try reusing stored state
    if (fs.existsSync(PRIMARY_STATE_PATH)) {
      try {
        context = await browser.newContext({ storageState: PRIMARY_STATE_PATH });
        const page = await context.newPage();

        // Quick validation: navigate and see if we're still authed
        await page.goto('/budget', { waitUntil: 'domcontentloaded' });
        await waitForAppReady(page);
        const url = page.url();

        if (!url.includes('/sign-in') && !url.includes('/sign-up')) {
          await ensureBudgetSelected(page);
          await use(page);
          await context.close();
          return;
        }
        // Session expired, fall through to fresh login
        await context.close();
      } catch {
        // Corrupted state file – ignore and re-login
      }
    }

    // Fresh login
    context = await browser.newContext();
    const page = await context.newPage();
    await authenticateAndSave(page, PRIMARY_EMAIL, PRIMARY_PASSWORD, PRIMARY_STATE_PATH);
    await use(page);
    await context.close();
  },

  /* ---------- secondaryAuthPage ---------- */
  secondaryAuthPage: async ({ browser }, use) => {
    let context: BrowserContext;

    if (fs.existsSync(SECONDARY_STATE_PATH)) {
      try {
        context = await browser.newContext({ storageState: SECONDARY_STATE_PATH });
        const page = await context.newPage();
        await page.goto('/budget', { waitUntil: 'domcontentloaded' });
        await waitForAppReady(page);
        const url = page.url();
        if (!url.includes('/sign-in') && !url.includes('/sign-up')) {
          await ensureBudgetSelected(page);
          await use(page);
          await context.close();
          return;
        }
        await context.close();
      } catch {
        // fall through
      }
    }

    context = await browser.newContext();
    const page = await context.newPage();
    await authenticateAndSave(page, SECONDARY_EMAIL, SECONDARY_PASSWORD, SECONDARY_STATE_PATH);
    await use(page);
    await context.close();
  },

  /* ---------- loginPage (unauthenticated) ---------- */
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  /* ---------- budgetPage (on authenticatedPage) ---------- */
  budgetPage: async ({ authenticatedPage }, use) => {
    await use(new BudgetPage(authenticatedPage));
  },
});

export { expect };
