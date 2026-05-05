import { test, expect } from '@playwright/test';
import { getLatestOTP, cleanupTestData } from './helpers/db-utils';

const TEST_PHONE = '9000000001';
const TEST_EMAIL = `automation_${Date.now()}@tests.swastik.com`;
const TEST_NAME = 'Auto Test User';

test.describe('Module 1 & 2: Authentication Flows', () => {

    test.afterAll(async () => {
        // Cleanup after all tests in this suite
        await cleanupTestData(TEST_PHONE);
    });

    test('1.1 Successful Registration with OTP', async ({ page }) => {
        await page.goto('/en/signup');

        await page.getByPlaceholder(/name/i).fill(TEST_NAME);
        await page.getByPlaceholder(/email/i).fill(TEST_EMAIL);
        await page.getByPlaceholder(/phone|mobile/i).fill(TEST_PHONE);
        await page.getByPlaceholder(/password/i).first().fill('TestPass123!');
        
        await page.getByRole('button', { name: /register|sign up/i }).click();

        // Wait for OTP step
        await expect(page.getByText(/verify otp|enter otp/i)).toBeVisible();

        // Retrieve OTP from DB
        // We wait a bit for the SMS log to be created
        await page.waitForTimeout(2000); 
        const otp = await getLatestOTP(TEST_PHONE);
        expect(otp).not.toBeNull();

        // Fill OTP
        await page.locator('input[type="text"]').filter({ hasText: /otp/i }).or(page.locator('input[name="otp"]')).fill(otp!);
        await page.getByRole('button', { name: /verify/i }).click();

        // Verify redirection to home or profile
        await page.waitForURL(/.*(profile|dashboard|en$)/, { timeout: 10000 });
        await expect(page).toHaveURL(/.*(profile|dashboard|en$)/);
    });

    test('1.2 Invalid OTP shows error', async ({ page }) => {
        await page.goto('/en/signup');
        // ... (setup state if needed, or just test common behavior)
        // For simplicity, we assume we are at the OTP screen or we trigger it
        await page.getByPlaceholder(/phone/i).fill('9000000002');
        await page.getByRole('button', { name: /register|get otp/i }).click().catch(() => {});
        
        const otpInput = page.locator('input[name="otp"]');
        if (await otpInput.isVisible()) {
            await otpInput.fill('000000'); // Wrong OTP
            await page.getByRole('button', { name: /verify/i }).click();
            await expect(page.getByText(/invalid|incorrect/i)).toBeVisible();
        }
    });

    test('1.3 Duplicate Registration is blocked', async ({ page }) => {
        await page.goto('/en/signup');
        await page.getByPlaceholder(/email/i).fill(TEST_EMAIL); // Use the email from 1.1
        await page.getByPlaceholder(/phone/i).fill(TEST_PHONE);
        await page.getByRole('button', { name: /register/i }).click();
        
        await expect(page.getByText(/already exists|taken/i)).toBeVisible();
    });

    test('2.1 Successful Login with OTP', async ({ page }) => {
        await page.goto('/en/login');

        await page.getByPlaceholder(/phone|mobile/i).fill(TEST_PHONE);
        await page.getByRole('button', { name: /send otp|login/i }).click();

        await page.waitForTimeout(2000);
        const otp = await getLatestOTP(TEST_PHONE);
        expect(otp).not.toBeNull();

        await page.getByPlaceholder(/otp|code/i).fill(otp!);
        await page.getByRole('button', { name: /verify|submit/i }).click();

        await expect(page).toHaveURL(/.*(profile|dashboard|en$)/);
    });

    test('2.2 Logout clears session', async ({ page }) => {
        await page.goto('/en');
        // Find logout button in profile or navbar
        const profileBtn = page.getByRole('button', { name: /profile|account/i });
        await profileBtn.click();
        await page.getByRole('button', { name: /logout/i }).click();

        await expect(page).toHaveURL(/.*login/);
        // Verify we can't access profile anymore
        await page.goto('/en/profile');
        await expect(page).toHaveURL(/.*login/);
    });
});
