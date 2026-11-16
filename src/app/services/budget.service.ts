import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const MONTHLY_LIMIT_KEY = 'tally.budget.monthly';

export const DEFAULT_MONTHLY_LIMIT = 30000;

@Injectable({ providedIn: 'root' })
export class BudgetService {
  readonly defaultMonthlyLimit = DEFAULT_MONTHLY_LIMIT;

  /** Falls back to the default limit when nothing valid has been saved. */
  async getMonthlyLimit(): Promise<number> {
    const { value } = await Preferences.get({ key: MONTHLY_LIMIT_KEY });
    if (value === null) {
      return DEFAULT_MONTHLY_LIMIT;
    }

    const limit = Number(value);
    return Number.isFinite(limit) && limit >= 0 ? limit : DEFAULT_MONTHLY_LIMIT;
  }

  async setMonthlyLimit(limit: number): Promise<void> {
    if (!Number.isFinite(limit) || limit < 0) {
      throw new Error('Monthly limit must be a non-negative number.');
    }

    await Preferences.set({
      key: MONTHLY_LIMIT_KEY,
      value: String(limit),
    });
  }
}
