import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

/**
 * Options for the checkA11y helper.
 */
export interface A11yCheckOptions {
  /** Override which axe tags (rule sets) to run. Defaults to WCAG 2.1 AA. */
  tags?: string[];
  /** CSS selectors to exclude from the scan (e.g. third-party widgets). */
  exclude?: string[];
  /** CSS selector to limit the scan to a specific region of the page. */
  include?: string;
  /** Individual axe rule IDs to disable for this scan. */
  disableRules?: string[];
}

/**
 * A single formatted violation returned by checkA11y.
 */
export interface A11yViolation {
  id: string;
  impact: string;
  description: string;
  helpUrl: string;
  nodes: number;
  targets: string[];
}

/**
 * Result object returned by checkA11y.
 */
export interface A11yResult {
  violations: A11yViolation[];
  violationCount: number;
  /** Human-readable summary suitable for test failure messages. */
  summary: string;
}

// CSS selectors for third-party widgets that commonly produce a11y noise.
// Add selectors here as the app integrates external components.
const DEFAULT_EXCLUDES: string[] = [
  // Firebase Auth UI emitted iframe, if present
  'iframe[src*="firebaseapp"]',
  // reCAPTCHA widget
  'iframe[src*="recaptcha"]',
];

const DEFAULT_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/**
 * Run an axe-core accessibility scan on the current page state.
 *
 * Defaults to WCAG 2.1 Level AA rules and excludes known third-party widgets
 * that are outside the app's control.
 *
 * @example
 * ```ts
 * const result = await checkA11y(page);
 * expect(result.violations).toEqual([]);
 * ```
 */
export async function checkA11y(
  page: Page,
  options: A11yCheckOptions = {},
): Promise<A11yResult> {
  const tags = options.tags ?? DEFAULT_TAGS;
  const excludes = options.exclude
    ? [...DEFAULT_EXCLUDES, ...options.exclude]
    : DEFAULT_EXCLUDES;
  const disableRules = options.disableRules ?? [];

  let builder = new AxeBuilder({ page }).withTags(tags);

  for (const selector of excludes) {
    builder = builder.exclude(selector);
  }

  if (options.include) {
    builder = builder.include(options.include);
  }

  if (disableRules.length > 0) {
    builder = builder.disableRules(disableRules);
  }

  const axeResults = await builder.analyze();

  const violations: A11yViolation[] = axeResults.violations.map((v) => ({
    id: v.id,
    impact: v.impact ?? 'unknown',
    description: v.description,
    helpUrl: v.helpUrl,
    nodes: v.nodes.length,
    targets: v.nodes.map((n) => n.target.join(' ')),
  }));

  const summary = formatSummary(violations);

  return {
    violations,
    violationCount: violations.length,
    summary,
  };
}

/**
 * Build a human-readable summary of violations for test output.
 */
function formatSummary(violations: A11yViolation[]): string {
  if (violations.length === 0) {
    return 'No accessibility violations found.';
  }

  const header = `Found ${violations.length} accessibility violation(s):\n`;
  const details = violations
    .map((v, i) => {
      const lines = [
        `  ${i + 1}. [${v.impact.toUpperCase()}] ${v.id}`,
        `     ${v.description}`,
        `     Affected elements (${v.nodes}): ${v.targets.join(', ')}`,
        `     Help: ${v.helpUrl}`,
      ];
      return lines.join('\n');
    })
    .join('\n\n');

  return header + details;
}
