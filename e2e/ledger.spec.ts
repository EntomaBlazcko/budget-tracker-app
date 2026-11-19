import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function fillAmount(page: Page, amount: string): Promise<void> {
  await page.getByRole('textbox', { name: 'Expense amount' }).fill(amount);
}

test('shows two sample transactions on first run', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto('/activity');

  await expect(page.locator('ion-item.tx-item:visible')).toHaveCount(2);
  await expect(page.getByText('Lunch at Jollibee')).toBeVisible();
  await expect(page.getByText('Salary deposit')).toBeVisible();
});

test('adds, edits, and deletes a ledger entry', async ({ page }) => {
  // Start with a saved empty ledger so the first-run samples do not appear.
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem('CapacitorStorage.tally.transactions', '[]');
  });
  await page.goto('/activity');

  await expect(page.getByRole('heading', { name: 'No transactions yet' })).toBeVisible();

  // --- Add ---------------------------------------------------------------
  await page.getByRole('link', { name: 'Add expense' }).click();
  await expect(page).toHaveURL(/\/add-expense$/);
  await expect(page.locator('ion-title', { hasText: 'New expense' })).toBeVisible();

  await page.getByText('Save expense').click();
  await expect(page.getByText('Enter an amount')).toBeVisible();

  await fillAmount(page, '0');
  await page.getByText('Save expense').click();
  await expect(page.getByText('Amount must be more than ₱0')).toBeVisible();

  await fillAmount(page, '285');
  await page.getByText('Save expense').click();
  await expect(page.getByText('Pick a category')).toBeVisible();

  await page.getByRole('button', { name: 'Food' }).click();
  await page.getByRole('textbox', { name: 'Note' }).fill('Lunch at Jollibee');
  await page.getByText('Save expense').click();

  await expect(page).toHaveURL(/\/activity$/);
  const row = page.locator('ion-item.tx-item:visible').first();
  await expect(row).toContainText('Lunch at Jollibee');
  await expect(row).toContainText('-₱285.00');

  // --- Edit --------------------------------------------------------------
  await row.getByRole('button', { name: 'Edit transaction' }).click();

  await expect(page).toHaveURL(/\/add-expense\/.+/);
  await expect(page.locator('ion-title', { hasText: 'Edit expense' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Expense amount' })).toHaveValue('285.00');
  await expect(page.getByRole('textbox', { name: 'Note' })).toHaveValue('Lunch at Jollibee');

  await fillAmount(page, '300.50');
  await page.getByText('Save changes').click();

  await expect(page).toHaveURL(/\/activity$/);
  await expect(page.locator('ion-item.tx-item:visible').first()).toContainText('-₱300.50');

  // --- Delete: cancel first ----------------------------------------------
  const editedRow = page.locator('ion-item.tx-item:visible').first();
  await test.step('click delete', () => editedRow.getByRole('button', { name: 'Delete transaction' }).click());

  const alert = page.locator('ion-alert');
  await expect(alert).toBeVisible();
  await test.step('wait for alert', () => expect(alert).toContainText('Delete this entry?'));
  await test.step('keep entry', () => alert.getByRole('button', { name: 'Keep' }).click());
  await expect(alert).toBeHidden();
  await expect(page.locator('ion-item.tx-item:visible').first()).toContainText('Lunch at Jollibee');

  // --- Delete: confirm ---------------------------------------------------
  await test.step('click delete again', () =>
    page.locator('ion-item.tx-item:visible').first().getByRole('button', { name: 'Delete transaction' }).click());
  await expect(alert).toBeVisible();
  await test.step('wait for alert again', () => expect(alert).toContainText('Delete this entry?'));
  await alert.getByRole('button', { name: 'Delete', exact: true }).click();

  await expect(page.locator('ion-toast')).toContainText('Deleted from the ledger');
  await expect(page.getByRole('heading', { name: 'No transactions yet' })).toBeVisible();
});
