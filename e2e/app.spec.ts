import { expect, test } from '@playwright/test';

test('visits the app root url', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.locator('ion-header ion-title').first()).toContainText('Dashboard');
  await expect(page.getByRole('tab')).toHaveCount(3);
});
