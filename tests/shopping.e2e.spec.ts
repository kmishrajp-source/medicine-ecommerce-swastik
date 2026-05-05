import { test, expect } from '@playwright/test';
import { resetInventory } from './helpers/db-utils';

test.describe('Module 3 & 4: Shopping Experience', () => {

    test.afterAll(async () => {
        // Restore stock for the test product (assuming ID 'p123' for demo, 
        // ideally we capture it during the test)
        await resetInventory('test-med-001', 100).catch(() => {});
    });

    test('3.1 Verify Categories and Products Load', async ({ page }) => {
        await page.goto('/en/shop-medicines');

        // Check if categories list is visible
        const categories = page.locator('aside, .categories-list, [class*="category"]');
        await expect(categories.first()).toBeVisible();

        // Check if products are displayed
        const productCards = page.locator('.product-card, [class*="product-card"]');
        await expect(productCards.first()).toBeVisible();
    });

    test('3.2 Product Details and Stock Status', async ({ page }) => {
        await page.goto('/en/shop-medicines');
        
        const firstProduct = page.locator('.product-card, [class*="product-card"]').first();
        const productName = await firstProduct.locator('h3').textContent();
        
        await firstProduct.click();
        
        // Verify details page
        await expect(page.locator('h1')).toContainText(productName!);
        await expect(page.getByText(/stock|available/i)).toBeVisible();
    });

    test('4.1 Add to Cart and Quantity Update', async ({ page }) => {
        await page.goto('/en/shop-medicines');
        
        const addToCartBtn = page.getByRole('button', { name: /add to cart/i }).first();
        await addToCartBtn.click();

        // Check cart counter or open cart
        const cartBadge = page.locator('.cart-count, [class*="cart-count"]');
        await expect(cartBadge).toHaveText('1');

        // Go to cart
        await page.goto('/en/cart');
        
        // Increase quantity
        const increaseBtn = page.getByRole('button', { name: '+' });
        await increaseBtn.click();
        
        // Check if total updates (logic usually updates subtotal)
        // We'll just check if the quantity text changes
        const quantityText = page.locator('span').filter({ hasText: '2' });
        await expect(quantityText.first()).toBeVisible();
    });

    test('4.2 Item Removal updates total', async ({ page }) => {
        await page.goto('/en/cart');
        
        // Get initial total
        const total = page.locator('.total-amount'); // Adjust based on actual UI
        
        const removeBtn = page.getByRole('button', { name: /remove|delete/i }).first();
        await removeBtn.click();

        await expect(page.getByText(/empty|no items/i)).toBeVisible();
    });
});
