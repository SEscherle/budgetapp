import { test, expect } from '../fixtures/auth.fixture';
import { checkA11y } from '../helpers/a11y.helper';
import { LoginPage } from '../pages/login.page';

test.describe('Accessibility scans @system', () => {
  // ---------------------------------------------------------------
  // Unauthenticated page
  // ---------------------------------------------------------------

  test('sign-in page has no critical a11y violations', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    const result = await checkA11y(page);

    expect(result.violations, result.summary).toEqual([]);
  });

  // ---------------------------------------------------------------
  // Authenticated pages - use the authenticatedPage fixture
  // ---------------------------------------------------------------

  test('budget overview page has no critical a11y violations', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto('/budget', { waitUntil: 'domcontentloaded' });
    await authenticatedPage.getByText(/ready to assign/i).waitFor({ state: 'visible', timeout: 15_000 });

    const result = await checkA11y(authenticatedPage);

    expect(result.violations, result.summary).toEqual([]);
  });

  test('transaction register page has no critical a11y violations', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto('/transactions', { waitUntil: 'domcontentloaded' });
    await authenticatedPage.locator('aside.sidebar').waitFor({ state: 'visible', timeout: 15_000 });
    await authenticatedPage.waitForTimeout(2_000);

    const result = await checkA11y(authenticatedPage);

    expect(result.violations, result.summary).toEqual([]);
  });

  test('settings page has no critical a11y violations', async ({
    authenticatedPage,
  }) => {
    // /settings is a 404 — the actual route is /settings/budget
    await authenticatedPage.goto('/settings/budget', { waitUntil: 'domcontentloaded' });
    await authenticatedPage.locator('aside.sidebar').waitFor({ state: 'visible', timeout: 15_000 });
    await authenticatedPage.waitForTimeout(2_000);

    const result = await checkA11y(authenticatedPage);

    expect(result.violations, result.summary).toEqual([]);
  });
});
