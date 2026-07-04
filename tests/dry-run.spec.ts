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
        page.on('console', msg => {
          if (!msg.text().includes('tailwind') && !msg.text().includes('React DevTools') && !msg.text().includes('Glyph bbox')) {
            console.log('PAGE LOG:', msg.text());
          }
        });

        await page.goto('/en/signup');

        // Locating by order since labels aren't associated with IDs
        const form = page.locator('form');
        await form.locator('input[type="text"]').first().fill('Dry Run User');
        await form.locator('input[type="email"]').fill('automation_dryrun@tests.swastik.com');
        await form.locator('input[type="password"]').fill('DryRunPass123!');
        
        // Click submit and wait for navigation (handles both /login and /en/login with locale prefix)
        await Promise.all([
          page.waitForURL(/.*login.*/, { timeout: 8000 }),
          page.getByRole('button', { name: /sign up/i }).click(),
        ]);

        // Should be on login page after successful mocked registration
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
