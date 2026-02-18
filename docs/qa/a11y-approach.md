# Accessibility Testing Approach

## What axe-core checks

axe-core is an automated accessibility engine that evaluates rendered DOM against a subset of WCAG (Web Content Accessibility Guidelines) rules. When integrated via `@axe-core/playwright`, it scans each page after Playwright renders it in a real browser.

**What it catches (approximately 30-40% of WCAG 2.1 AA issues):**

- Missing or incorrect ARIA attributes
- Images without alt text
- Form inputs without associated labels
- Insufficient color contrast ratios (with caveats; see below)
- Incorrect heading hierarchy (e.g. skipping from h1 to h3)
- Missing landmark regions (nav, main, etc.)
- Missing document language attribute
- Focusable elements that are hidden or inaccessible
- Tables without proper header markup
- Duplicate element IDs

## What axe-core does NOT check

Automated tooling has fundamental limitations. The following categories require manual testing:

| Gap | Why automation misses it |
|---|---|
| **Keyboard-only navigation** | axe inspects DOM structure, not interactive behavior. It cannot verify that all workflows are completable without a mouse. |
| **Screen reader experience** | Correct ARIA attributes do not guarantee a coherent reading order or meaningful announcements. Only testing with VoiceOver / NVDA / JAWS reveals real user experience. |
| **Cognitive accessibility** | Plain language, consistent navigation patterns, and helpful error messages require human judgment. |
| **Dynamic content timing** | axe scans a snapshot of the DOM. Content that appears after animations, lazy loading, or user interaction may be missed unless explicitly triggered before the scan. |
| **Color contrast in dark-mode-first UI** | axe evaluates computed styles, but custom CSS properties, overlays, and transparency can produce inaccurate contrast calculations. Arctic Budget uses a dark-mode-first palette that needs manual verification with browser DevTools (Chrome > Rendering > CSS Overview, or the contrast ratio picker in the color inspector). |
| **Focus management after route changes** | SPA navigation may leave focus in unexpected places. This must be tested manually or with dedicated Playwright focus assertions. |
| **Touch target sizing** | WCAG 2.2 target size requirements (Success Criterion 2.5.8) are not fully covered by axe. |

## Manual checks still needed

At minimum, perform the following manually before each release:

1. **Keyboard walkthrough** - Tab through every page. Confirm all interactive elements are reachable, focus indicators are visible, and no keyboard traps exist.
2. **Screen reader smoke test** - Use VoiceOver (macOS) or NVDA (Windows) to navigate the primary workflows (login, create budget, add transaction, view reports).
3. **Zoom to 200%** - Verify no content is clipped or overlapping at 200% browser zoom.
4. **Color contrast spot-check** - Use Chrome DevTools on all primary text/background combinations, especially in dark mode.
5. **Error state review** - Trigger validation errors and confirm they are announced to assistive technology and visually associated with the relevant input.

## How to interpret axe violations in test output

When a test fails, the assertion message includes a formatted summary produced by the `checkA11y` helper. Example:

```
Found 2 accessibility violation(s):

  1. [SERIOUS] color-contrast
     Ensures the contrast between foreground and background colors meets WCAG 2 AA minimum ratios
     Affected elements (3): .card-title, .nav-link, .btn-secondary
     Help: https://dequeuniversity.com/rules/axe/4.x/color-contrast

  2. [CRITICAL] image-alt
     Ensures <img> elements have alternate text
     Affected elements (1): img.avatar
     Help: https://dequeuniversity.com/rules/axe/4.x/image-alt
```

**Key fields:**

- **Impact** - `critical` > `serious` > `moderate` > `minor`. Fix critical and serious first.
- **Rule ID** - The axe rule name (e.g. `color-contrast`). Use this when searching for fixes.
- **Affected elements** - CSS selectors identifying which DOM nodes failed.
- **Help URL** - Links to Deque University with a full explanation and remediation guidance.

### Handling known issues temporarily

If a violation is acknowledged and tracked (e.g. in a backlog ticket) but cannot be fixed immediately, you can exclude it for a specific scan:

```ts
const result = await checkA11y(page, {
  disableRules: ['color-contrast'], // Tracked in ARCTIC-1234
});
```

Do not leave rules disabled without a linked ticket. Review disabled rules quarterly.

## How to add a11y checks to new test files

Import the helper and call it after the page is in the desired state:

```ts
import { checkA11y } from '../helpers/a11y.helper';

test('my feature page passes a11y checks', async ({ page }) => {
  // Navigate and interact to reach the state you want to scan
  await page.goto('/some-page');
  await page.waitForLoadState('networkidle');

  const result = await checkA11y(page);
  expect(result.violations, result.summary).toEqual([]);
});
```

**Options available:**

```ts
// Scan only a specific region
await checkA11y(page, { include: '[data-testid="modal-dialog"]' });

// Exclude additional elements beyond the defaults
await checkA11y(page, { exclude: ['.third-party-chat-widget'] });

// Run a different rule set (e.g. AAA)
await checkA11y(page, { tags: ['wcag2aaa'] });

// Temporarily disable specific rules
await checkA11y(page, { disableRules: ['color-contrast'] });
```

## Running the accessibility tests

```bash
# Run only the accessibility spec
npx playwright test tests/system/accessibility.spec.ts

# Run all @system tagged tests (includes accessibility)
npx playwright test --grep @system
```
