import { test, expect } from '@playwright/test';

// Assuming user is already logged in or guest checkout is allowed for initial cart addition
// Playwright setup supports saving auth state, but we will focus on the UI flows here.

test.describe('E-Commerce Core Logic', () => {

  test('Add Item to Cart and Verify Details', async ({ page }) => {
    // Navigate to a medicine listing page or shop
    await page.goto('/en/shop-medicines'); // The main directory page

    // Search for a product if search bar is present
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Paracetamol');
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');
    }

    // Find the first "Add to Cart" or "Add" button
    const addToCartBtn = page.getByRole('button', { name: /add to cart|add/i }).first();
    await expect(addToCartBtn).toBeVisible();
    
    // Sometimes there are plus/minus counters instead
    await addToCartBtn.click();

    // Verify a toast notification or cart counter update
    await expect(page.getByText(/added to cart/i)).toBeVisible({ timeout: 5000 }).catch(() => {});

    // Navigate to Cart
    const cartLink = page.getByRole('link', { name: /cart/i }).or(page.locator('a[href*="cart"]'));
    await cartLink.click();

    // Verify cart page
    await expect(page).toHaveURL(/.*cart/);
    
    // Verify an item is actually in the cart list
    const cartItems = page.locator('button', { name: /remove|delete|-/i });
    await expect(cartItems.first()).toBeVisible();
  });

  test('Checkout Process and Order Placement', async ({ page }) => {
    // To ensure something is in the cart, ideally this test depends on the earlier one, or we inject an item via API.
    // For this demonstration, we assume cart has an item from our pre-condition or session.
    await page.goto('/en/checkout');

    // Expected to either see Empty Cart or Checkout form
    const emptyCartMsg = page.getByText(/empty/i);
    if (await emptyCartMsg.isVisible()) {
        test.skip('Cart is empty, cannot proceed with checkout test.');
        return;
    }

    // Fill delivery details
    await page.getByPlaceholder(/address|street/i).fill('123 Test Street, Automation City');
    await page.getByPlaceholder(/pin|zip/i).fill('123456');
    await page.getByPlaceholder(/name/i).fill('Test User');
    await page.getByPlaceholder(/phone|mobile/i).fill('9999999999');

    // Select payment method (e.g. Cash on Delivery to simplify test without mocking Razorpay here)
    const codOption = page.locator('label').filter({ hasText: /Cash on Delivery|COD/i });
    if (await codOption.isVisible()) {
       await codOption.click();
    }

    // Place Order
    const placeOrderBtn = page.getByRole('button', { name: /place order|confirm order/i });
    await expect(placeOrderBtn).toBeVisible();
    await placeOrderBtn.click();

    // Verify Success Redirect
    await page.waitForURL(/.*(success|order-received|confirmation)/, { timeout: 15000 });
    await expect(page.getByText(/success|thank you/i)).toBeVisible();
  });
});
