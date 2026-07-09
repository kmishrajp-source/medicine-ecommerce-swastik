import { test, expect } from '@playwright/test';

test.describe('PHASE 2: Limited Dry Run (Registration & Login)', () => {

    test.beforeEach(async ({ page }) => {
        // Mocking the Backend APIs for Zero Risk
        await page.route('**/api/auth/send-otp', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, message: 'Mock OTP sent' })
            });
        });

        await page.route('**/api/auth/verify-otp', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, message: 'Mock Phone verified' })
            });
        });

        await page.route('**/api/register', async route => {
            await route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({ message: "User created successfully", user: { id: 'mock-id', email: 'mock@test.com' } })
            });
        });
        
         await page.route('**/api/auth/signin/**', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ url: 'http://localhost:3000/en' })
            });
        });
    });

    test('2.1 User Registration Flow (Mocked)', async ({ page }) => {
        // Extend timeout — WebKit is slower under parallel load (6 browsers)
        test.setTimeout(60000);

        // Use 'load' instead of 'networkidle' — faster for all browsers
        await page.goto('/en/signup', { waitUntil: 'load' });

        // Wait for form to be fully interactive
        const form = page.locator('form');
        await form.waitFor({ state: 'visible', timeout: 10000 });

        // Small pause to let any Fast Refresh complete before interacting
        await page.waitForTimeout(500);

        await form.locator('input[type="text"]').first().fill('Dry Run User');
        await form.locator('input[type="email"]').fill('automation_dryrun@tests.swastik.com');
        await form.locator('input[type="password"]').fill('DryRunPass123!');

        // Click submit and wait for navigation — 25s covers WebKit's slower pace
        await Promise.all([
          page.waitForURL(/.*login.*/, { timeout: 25000 }),
          page.getByRole('button', { name: /sign up/i }).click(),
        ]);

        await expect(page).toHaveURL(/.*login/);
    });

    test('2.2 User Login Flow (Mocked)', async ({ page }) => {
        await page.goto('/en/login');

        await page.getByPlaceholder('9876543210').fill('9000000000');
        await page.getByRole('button', { name: /send/i }).click();

        await expect(page.getByPlaceholder('6-digit code')).toBeVisible();

        await page.getByPlaceholder('6-digit code').fill('123456');
        await page.getByRole('button', { name: /verify/i }).click();
    });
});
