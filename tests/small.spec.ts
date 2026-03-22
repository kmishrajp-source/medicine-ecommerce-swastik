import { test, expect } from '@playwright/test';

const urlsToTest = [
  '/en/ai-assistant',
  '/en/signup'
];

test.describe('Failing Pages Load Verification', () => {
  for (const url of urlsToTest) {
    test(`Should load page: ${url}`, async ({ page }) => {
      const fullUrl = `http://localhost:3000${url}`;
      const response = await page.goto(fullUrl);
      
      expect(response?.status()).toBeLessThan(400);

      const bodyText = await page.textContent('body');
      expect(bodyText).not.toContain('Application error: a client-side exception has occurred');
      
      await page.waitForTimeout(500);
    });
  }
});
