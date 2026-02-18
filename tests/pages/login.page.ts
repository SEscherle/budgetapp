import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object for the Sign-In page (/sign-in).
 * Encapsulates authentication interactions so tests stay DRY.
 */
export class LoginPage {
  /* ── Locators ── */
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly signUpLink: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.signInButton = page.getByRole('button', { name: /sign in/i });
    this.signUpLink = page.getByRole('link', { name: /sign up/i });
    this.errorMessage = page.locator('[role="alert"], .error-message, .mat-mdc-snack-bar-container');
  }

  /* ── Actions ── */

  /** Navigate to the sign-in page and wait for it to be interactive. */
  async goto() {
    await this.page.goto('/sign-in', { waitUntil: 'domcontentloaded' });
    await this.signInButton.waitFor({ state: 'visible', timeout: 15_000 });
  }

  /** Fill in credentials and click "Sign In". */
  async signIn(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  /**
   * Full login flow: navigate, authenticate, and wait until redirected
   * away from /sign-in (typically to /budget-select or /budget).
   */
  async loginAndWaitForApp(email: string, password: string) {
    await this.goto();
    await this.signIn(email, password);
    // Wait for navigation away from sign-in
    await this.page.waitForURL(/\/(budget|budget-select)/, { timeout: 30_000 });
  }
}
