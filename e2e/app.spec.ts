import { expect, test } from '@playwright/test';

test('visits the app root url', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole('heading', { name: 'Hi there' })).toBeVisible();
  await expect(page.getByRole('tab')).toHaveCount(3);
});
