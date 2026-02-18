import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object for the Budget view (/budget, /budget/:month).
 * Covers month navigation, category groups, assignments, and Ready to Assign.
 */
export class BudgetPage {
  /* ── Locators ── */
  readonly readyToAssign: Locator;
  readonly categoryGroups: Locator;
  readonly monthLabel: Locator;
  readonly prevMonthButton: Locator;
  readonly nextMonthButton: Locator;
  readonly monthPicker: Locator;
  readonly assignedColumn: Locator;
  readonly activityColumn: Locator;
  readonly availableColumn: Locator;

  constructor(private readonly page: Page) {
    // Ready to Assign header/banner
    this.readyToAssign = page.getByText(/ready to assign/i);

    // Category group rows — actual DOM: <tr class="group-row">
    // Text is title case (e.g. "Essentials") with CSS text-transform: uppercase
    this.categoryGroups = page.locator('tr.group-row');

    // Month navigation — actual DOM: <div class="month-selector">
    //   <button class="btn btn-ghost"> (SVG chevron-left) </button>
    //   <button class="current-month-btn"> February 2026 </button>
    //   <button class="btn btn-ghost"> (SVG chevron-right) </button>
    this.monthLabel = page.locator('button.current-month-btn');
    this.prevMonthButton = page.locator('.month-selector button:first-child');
    this.nextMonthButton = page.locator('.month-selector button:last-child');
    this.monthPicker = page.locator('button.current-month-btn');

    // Column headers
    this.assignedColumn = page.getByText(/assigned/i).first();
    this.activityColumn = page.getByText(/activity/i).first();
    this.availableColumn = page.getByText(/available/i).first();
  }

  /* ── Navigation ── */

  /** Go to the default budget page and wait for Firestore data to load. */
  async goto() {
    await this.page.goto('/budget', { waitUntil: 'domcontentloaded' });
    await this.readyToAssign.waitFor({ state: 'visible', timeout: 15_000 });
    // Wait for Firestore data — category groups appear once real data arrives
    await this.page.locator('[data-testid="sidebar-account-balance"]')
      .first().waitFor({ state: 'visible', timeout: 30_000 });
  }

  /** Go to a specific month (format: YYYY-MM, e.g. "2026-02"). */
  async gotoMonth(yearMonth: string) {
    await this.page.goto(`/budget/${yearMonth}`, { waitUntil: 'domcontentloaded' });
    await this.readyToAssign.waitFor({ state: 'visible', timeout: 15_000 });
  }

  /** Click the previous-month arrow. */
  async goToPreviousMonth() {
    await this.prevMonthButton.click();
    // Wait for the budget content to stabilize after navigation
    await this.page.waitForTimeout(1_000);
  }

  /** Click the next-month arrow. */
  async goToNextMonth() {
    await this.nextMonthButton.click();
    await this.page.waitForTimeout(1_000);
  }

  /* ── Queries ── */

  /** Return the visible month text (e.g. "February 2026"). */
  async getMonthText(): Promise<string> {
    return (await this.monthLabel.textContent()) ?? '';
  }

  /** Return the number of visible category groups. */
  async getCategoryGroupCount(): Promise<number> {
    return this.categoryGroups.count();
  }

  /** Click on a category group header to expand / collapse it. */
  async toggleCategoryGroup(groupName: string) {
    const group = this.page.getByText(groupName, { exact: false });
    await group.click();
  }

  /**
   * Edit the "Assigned" value for a category inline.
   * Clicks the cell, clears it, types the new value, and presses Enter.
   */
  async editAssignment(categoryName: string, amountPence: string) {
    const row = this.page.locator(`[class*="category-row"], tr, [data-testid="category-row"]`)
      .filter({ hasText: categoryName });
    const assignedCell = row.locator('[class*="assigned"], [data-testid="assigned"]').first();
    await assignedCell.dblclick();
    const input = row.getByRole('textbox').or(row.locator('input')).first();
    await input.fill(amountPence);
    await input.press('Enter');
    await this.page.waitForTimeout(1_000);
  }
}
