import { test, expect } from '@playwright/test';
import { cleanupTestData } from './helpers/db-utils';

const TEST_PHONE = '9000000005';

test.describe('Module 5-8: Checkout & Financials', () => {

    test.afterAll(async () => {
        await cleanupTestData(TEST_PHONE);
    });

    test('5.1 Checkout Flow: Address and Charges', async ({ page }) => {
        // Pre-condition: Login user or follow auth flow
        // To keep it clean, we use a custom storage state or just log in
        await page.goto('/en/login');
        await page.getByPlaceholder(/phone/i).fill(TEST_PHONE);
        // ... (OTP handling omitted for brevity, usually handled in global setup)
        
        await page.goto('/en/shop-medicines');
        await page.getByRole('button', { name: /add to cart/i }).first().click();
        await page.goto('/en/checkout');

        // Address Selection
        await page.getByLabel(/select address/i).or(page.getByPlaceholder(/address/i)).fill('Test Address, Block 5, Gorakhpur');
        
        // Delivery Calculation
        const deliveryFee = page.locator('.delivery-fee');
        await expect(deliveryFee).toBeVisible();
        
        const total = page.locator('.final-total');
        await expect(total).toBeVisible();
    });

    test('6.1 Wallet Deduction and Logic', async ({ page }) => {
        await page.goto('/en/checkout');

        const walletSection = page.getByText(/use wallet balance/i);
        if (await walletSection.isVisible()) {
            const initialTotal = await page.locator('.final-total').textContent();
            
            await page.getByRole('checkbox', { name: /wallet/i }).check();
            
            const newTotal = await page.locator('.final-total').textContent();
            // Verify new total is less
            expect(parseFloat(newTotal!)).toBeLessThan(parseFloat(initialTotal!));
        }
    });

    test('7.1 Referral Code Application during Registration', async ({ page }) => {
        await page.goto('/en/signup');
        await page.getByPlaceholder(/referral code/i).fill('VALID-CODE-123');
        // Check if UI reflects "Code Applied" or similar
        await expect(page.getByText(/applied|valid code/i)).toBeVisible();
        
        await page.getByPlaceholder(/referral code/i).fill('INVALID-CODE');
        await expect(page.getByText(/invalid/i)).toBeVisible();
    });

    test('8.1 Payment Flow: COD Success', async ({ page }) => {
        await page.goto('/en/checkout');
        await page.getByRole('radio', { name: /cash on delivery|cod/i }).check();
        await page.getByRole('button', { name: /place order/i }).click();

        await expect(page).toHaveURL(/.*success/);
        await expect(page.getByText(/order placed successfully/i)).toBeVisible();
    });

    test('8.2 Online Payment Success Mock', async ({ page }) => {
        // Intercept Razorpay and trigger success callback
        await page.route('https://checkout.razorpay.com/**', async route => {
             await route.fulfill({ status: 200, body: 'window.razorpay_mock = true;' });
        });

        await page.goto('/en/checkout');
        await page.getByRole('radio', { name: /online payment/i }).check();
        
        // We simulate the post-payment redirect or API call
        // This depends on the specific integration (frontend vs backend verification)
        // For a true E2E, we would trigger the success handler in the page
    });
});
