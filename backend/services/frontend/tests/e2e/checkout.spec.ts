import { test, expect } from '@playwright/test';

test.describe('Customer Super-App Flows', () => {
  test('E2E: Add Grocery to Cart, Checkout, and Track Order', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'priya.sharma@nestigo.com');
    await page.fill('input[type="password"]', 'Demo@123');
    await page.click('button[type="submit"]');

    // 2. Add to Cart
    await page.goto('/catalog/grocery');
    await page.click('button:has-text("ADD") >> nth=0');
    
    // 3. Validate Cart Store
    await page.goto('/cart');
    await expect(page.locator('text=Order Summary')).toBeVisible();
    await page.click('button:has-text("Checkout")');

    // 4. Complete Payment (Mocks Payment Webhook via API Gateway)
    await page.click('button:has-text("Pay")');

    // 5. Assert Redirect to Tracking Socket Page
    await expect(page).toHaveURL(/\/orders\/ORD-.*\/track/);
    
    // 6. Assert Socket.IO connection success
    await expect(page.locator('text=Order Confirmed')).toBeVisible();
  });
});
