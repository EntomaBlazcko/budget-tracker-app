import { Injectable, inject } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

import { ApiService } from './api.service';

const MONTHLY_LIMIT_KEY = 'tally.budget.monthly';

export const DEFAULT_MONTHLY_LIMIT = 30000;

@Injectable({ providedIn: 'root' })
export class BudgetService {
  readonly defaultMonthlyLimit = DEFAULT_MONTHLY_LIMIT;

  private readonly api = inject(ApiService);

  /** REST first, then the offline cache, then the default limit. */
  async getMonthlyLimit(): Promise<number> {
    const remote = await this.api.getMonthlyLimit();
    if (remote !== null) {
      await this.write(remote);
      return remote;
    }

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

    await this.api.setMonthlyLimit(limit);
    await this.write(limit);
  }

  private async write(limit: number): Promise<void> {
    await Preferences.set({
      key: MONTHLY_LIMIT_KEY,
      value: String(limit),
    });
  }
}
