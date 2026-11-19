import { TestBed } from '@angular/core/testing';

import { ApiService } from './api.service';
import { BudgetService, DEFAULT_MONTHLY_LIMIT } from './budget.service';

const { storage } = vi.hoisted(() => ({
  storage: new Map<string, string>(),
}));

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: async ({ key }: { key: string }) => ({ value: storage.get(key) ?? null }),
    set: async ({ key, value }: { key: string; value: string }) => {
      storage.set(key, value);
    },
  },
}));

describe('BudgetService', () => {
  let service: BudgetService;

  beforeEach(() => {
    storage.clear();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ApiService,
          useValue: {
            getMonthlyLimit: async () => null,
            setMonthlyLimit: async () => null,
          },
        },
      ],
    });
    service = TestBed.inject(BudgetService);
  });

  it('returns the default limit when nothing is stored', async () => {
    await expect(service.getMonthlyLimit()).resolves.toBe(DEFAULT_MONTHLY_LIMIT);
  });

  it('stores and reads a monthly limit', async () => {
    await service.setMonthlyLimit(24500);

    await expect(service.getMonthlyLimit()).resolves.toBe(24500);
  });

  it('rejects invalid limits', async () => {
    await expect(service.setMonthlyLimit(-1)).rejects.toThrow();
    await expect(service.setMonthlyLimit(Number.NaN)).rejects.toThrow();
  });

  it('falls back to the default for corrupted values', async () => {
    storage.set('tally.budget.monthly', 'not-a-number');

    await expect(service.getMonthlyLimit()).resolves.toBe(DEFAULT_MONTHLY_LIMIT);
  });
});
