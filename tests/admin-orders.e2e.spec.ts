import { test, expect } from '@playwright/test';

test.describe('Module 9 & 10: Operations and Admin', () => {

    test('9.1 Order appears in user history', async ({ page }) => {
        await page.goto('/en/profile/orders');
        
        const latestOrder = page.locator('.order-card').first();
        await expect(latestOrder).toBeVisible();
    });

    test('10.1 Admin Validation: Order Visibility', async ({ page }) => {
        // Log in as admin
        await page.goto('/en/admin/login');
        await page.getByPlaceholder(/email|phone/i).fill('admin@swastik.com'); // Mock admin
        await page.getByPlaceholder(/password/i).fill('admin123');
        await page.getByRole('button', { name: /login/i }).click();

        await page.goto('/en/admin/orders');
        
        // Search for the latest order
        const orderRow = page.locator('table tr').filter({ hasText: /Processing|Paid/i }).first();
        await expect(orderRow).toBeVisible();
    });

    test('10.2 Admin Validation: Ledger Updates', async ({ page }) => {
        await page.goto('/en/admin/finance/ledger');
        
        // Check for latest wallet/referral entries
        const lastEntry = page.locator('.ledger-entry').first();
        await expect(lastEntry).toBeVisible();
    });
});
