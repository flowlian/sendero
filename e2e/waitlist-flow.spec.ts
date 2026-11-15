/**
 * E2E Tests: Landing Page & Email Capture Flow
 *
 * Tests the current homepage journey: the inline "Stay informed" email capture
 * widget (BottomEmailCapture) and the standalone thank-you page.
 *
 * NOTE: The app is locale-prefixed (middleware always redirects `/` to
 * `/{locale}`, default locale is `de`), so all routes here use `/en`
 * explicitly to keep text assertions in English. The old multi-field
 * waitlist form (tour duration / interests / fitness / timeline) has been
 * replaced by a two-step email-only capture that shows an inline success
 * message instead of redirecting to `/thank-you`.
 */

import { test, expect } from '@playwright/test';

test.describe('Landing Page & Email Capture', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en');
  });

  test('should load the landing page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/cycling experiences through colombia's andean forests/i);
    await expect(page.getByText(/sendero\s*bike trails/i).first()).toBeVisible();
  });

  test('should display all landing page sections', async ({ page }) => {
    // Hero section
    await expect(page.getByRole('heading', { name: /cycling experiences through colombia's andean forests/i })).toBeVisible();

    // Hero intro section
    await expect(page.getByText(/let go\. colombia is waiting\./i)).toBeVisible();

    // Hero prompt + request-trip CTA
    await expect(page.getByText(/would you like to join us/i)).toBeVisible();

    // Next trip section: request-trip CTA + email capture
    await expect(page.getByRole('heading', { name: /your next trip/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^stay informed$/i })).toBeVisible();

    // "Request a trip" appears in the hero and in the next trip section
    const requestLinks = page.getByRole('link', { name: /^request a trip$/i });
    await expect(requestLinks).toHaveCount(2);
    for (const link of await requestLinks.all()) {
      await expect(link).toHaveAttribute('href', '/en/anfragen');
    }
  });

  test('should complete successful email signup', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/waitlist', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { message: 'Successfully added to waitlist' },
        }),
      });
    });

    // First click expands the inline email input
    await page.getByRole('button', { name: /^stay informed$/i }).click();
    await page.getByPlaceholder(/enter your email/i).fill('test@example.com');

    // Second click submits
    await page.getByRole('button', { name: /^submit$/i }).click();

    // Should show an inline success message without navigating away
    await expect(page.getByText(/thanks! we'll keep you updated when we launch/i)).toBeVisible();
    await expect(page).toHaveURL(/\/en\/?$/);
  });

  test('should show validation error for empty/invalid email', async ({ page }) => {
    // Expand, then submit without typing anything
    await page.getByRole('button', { name: /^stay informed$/i }).click();
    await page.getByRole('button', { name: /^submit$/i }).click();

    await expect(page.getByText(/please enter a valid email address/i)).toBeVisible();
  });

  test('should show error for malformed email', async ({ page }) => {
    await page.getByRole('button', { name: /^stay informed$/i }).click();
    await page.getByPlaceholder(/enter your email/i).fill('invalid-email');
    await page.getByRole('button', { name: /^submit$/i }).click();

    await expect(page.getByText(/please enter a valid email address/i)).toBeVisible();
  });

  test('should handle duplicate email error (409)', async ({ page }) => {
    await page.route('**/api/waitlist', async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'This email is already on the waitlist',
        }),
      });
    });

    await page.getByRole('button', { name: /^stay informed$/i }).click();
    await page.getByPlaceholder(/enter your email/i).fill('existing@example.com');
    await page.getByRole('button', { name: /^submit$/i }).click();

    await expect(page.getByText(/this email is already on the waitlist/i)).toBeVisible();
    await expect(page).toHaveURL(/\/en\/?$/);
  });

  test('should handle server error gracefully', async ({ page }) => {
    await page.route('**/api/waitlist', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Server error occurred',
        }),
      });
    });

    await page.getByRole('button', { name: /^stay informed$/i }).click();
    await page.getByPlaceholder(/enter your email/i).fill('test@example.com');
    await page.getByRole('button', { name: /^submit$/i }).click();

    await expect(page.getByText(/something went wrong/i)).toBeVisible();
  });

  test('should show loading state during submission', async ({ page }) => {
    await page.route('**/api/waitlist', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { message: 'Success' } }),
      });
    });

    await page.getByRole('button', { name: /^stay informed$/i }).click();
    await page.getByPlaceholder(/enter your email/i).fill('test@example.com');
    await page.getByRole('button', { name: /^submit$/i }).click();

    // Button should be disabled (and show a loading spinner) while the request is in flight
    await expect(page.getByRole('button', { name: /submit/i })).toBeDisabled();
  });
});

test.describe('Thank You Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/thank-you');
  });

  test('should display thank you message', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /you're on the list/i })).toBeVisible();
    await expect(page.getByText(/thank you for joining the sendero bike trails waitlist/i)).toBeVisible();
  });

  test('should display "what happens next" section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /what happens next/i })).toBeVisible();
  });

  test('should have share buttons', async ({ page }) => {
    await expect(page.getByText(/share|tell your friends/i).first()).toBeVisible();
  });

  test('should have back to home link', async ({ page }) => {
    const homeLink = page.getByRole('link', { name: /back to home/i });
    await expect(homeLink).toHaveAttribute('href', '/en');
  });
});

test.describe('Navigation', () => {
  test('should have working logo link to home', async ({ page }) => {
    await page.goto('/en/thank-you');

    const logoLink = page.getByRole('link', { name: /sendero/i }).first();
    await logoLink.click();

    await expect(page).toHaveURL(/\/en\/?$/);
  });
});

test.describe('Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    await page.goto('/en');

    await expect(page.getByRole('button', { name: /^stay informed$/i })).toBeVisible();
  });

  test('should be tablet responsive', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
    await page.goto('/en');

    await expect(page.getByRole('button', { name: /^stay informed$/i })).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have skip to content link', async ({ page }) => {
    await page.goto('/en');

    const skipLink = page.getByText(/skip to content/i);
    await expect(skipLink).toBeVisible();
  });

  test('should be keyboard navigable to the email input', async ({ page }) => {
    await page.goto('/en');

    const emailInput = page.getByPlaceholder(/enter your email/i);
    await emailInput.focus();
    await expect(emailInput).toBeFocused();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/en');

    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/en');

    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });
});
