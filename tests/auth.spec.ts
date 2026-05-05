import { test, expect } from '@playwright/test';

// Use a consistent phone number for testing
const TEST_PHONE = '9999999999';
const TEST_OTP = '123456'; // Assuming a static bypass or dev OTP

test.describe('Authentication and Registration Flows', () => {

  test('User Registration Flow', async ({ page }) => {
    await page.goto('/en/signup');

    // Assuming standard registration fields, using generic locators
    await page.getByPlaceholder(/name|full name/i).fill('Test Automation User');
    await page.getByPlaceholder(/mobile|phone/i).fill(TEST_PHONE);
    await page.getByPlaceholder(/email/i).fill('test.user.playwright@swastik.com');
    
    // Sometimes there are dropdowns or roles to select
    const roleSelect = page.getByRole('combobox');
    if (await roleSelect.isVisible()) {
      await roleSelect.selectOption({ label: 'Customer' });
    }

    const agreeTerms = page.getByRole('checkbox', { name: /terms|agree/i });
    if (await agreeTerms.isVisible()) {
      await agreeTerms.check();
    }

    const submitBtn = page.getByRole('button', { name: /register|sign up|create/i });
    await submitBtn.click();

    // Verify successful routing or OTP prompt
    await expect(page).toHaveURL(/.*(otp|verify|login|dashboard)/);
  });

  test('User Login and OTP Flow', async ({ page }) => {
    await page.goto('/en/login');

    // Step 1: Request OTP
    await page.getByPlaceholder(/phone|mobile/i).fill(TEST_PHONE);
    
    // Might be 'Send OTP', 'Login with OTP', etc.
    const sendOtpBtn = page.getByRole('button', { name: /send.*otp|login|get.*otp/i });
    await sendOtpBtn.click();

    // Step 2: Ensure OTP input is visible and fill
    // We wait for some UI state change, like the input appearing
    const otpInput = page.locator('input[type="text"]').filter({ hasText: /otp/i }).first();
    // Sometimes it's a numeric input or separated inputs
    if (await page.getByPlaceholder(/otp|code/i).isVisible()) {
        await page.getByPlaceholder(/otp|code/i).fill(TEST_OTP);
    } else {
        // Just fill the first available numeric/text input that isn't phone
         await page.locator('input[type="text"], input[type="number"], input[type="tel"]').nth(1).fill(TEST_OTP);
    }

    const verifyBtn = page.getByRole('button', { name: /verify|submit|confirm/i });
    await verifyBtn.click();

    // Step 3: Verify successful login (dashboard or home page redirect)
    // Wait for network idle or for specific authenticated element
    await page.waitForURL(/.*(dashboard|\/en$|\/en\/profile)/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*(dashboard|\/en$|\/en\/profile)/);
  });
});
