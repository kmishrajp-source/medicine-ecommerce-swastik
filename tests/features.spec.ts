import { test, expect } from '@playwright/test';

const urlsToTest = [
  '/',
  '/en',
  '/en/refer',
  '/en/doctors',
  '/en/ambulance',
  '/en/labs',
  '/en/ai-assistant',
  '/en/symptom-checker',
  '/en/prescription-analyzer',
  '/en/drug-interaction-checker',
  '/en/support',
  '/en/partner',
  '/en/login',
  '/en/signup',
  '/en/contact',
  '/en/policy',
  '/en/delivery'
];

test.describe('Feature Pages Load Verification', () => {
  for (const url of urlsToTest) {
    test(`Should load page: ${url}`, async ({ page }) => {
      const fullUrl = `http://localhost:3000${url}`;
      const response = await page.goto(fullUrl);
      
      // Page should load successful, maybe 200 or 304.
      // Or if it redirects to login, it should be 307 or 302 then 200.
      expect(response?.status()).toBeLessThan(400);

      // Simple assertion to ensure page doesn't show standard Next.js 500 or 404
      const bodyText = await page.textContent('body');
      expect(bodyText).not.toContain('Application error: a client-side exception has occurred');
      
      // Wait a moment for dynamic rendering
      await page.waitForTimeout(500);
    });
  }
});
