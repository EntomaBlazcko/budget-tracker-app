import { TestBed } from '@angular/core/testing';

import type { Transaction } from '../models/transaction.model';

import { ApiService } from './api.service';
import { TransactionService } from './transaction.service';

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

describe('TransactionService', () => {
  let service: TransactionService;

  const lunch = {
    type: 'expense' as const,
    amount: 285,
    category: 'Food',
    date: '2026-11-15',
    note: 'Lunch at Jollibee',
    location: 'Jollibee, Manila',
  };

  beforeEach(() => {
    storage.clear();
    // Pretend the app has already run once, so the sample seeding does not
    // affect the CRUD tests below.
    storage.set('tally.transactions', '[]');
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ApiService,
          useValue: {
            listTransactions: async () => null,
            getTransaction: async () => null,
            createTransaction: async () => null,
            updateTransaction: async () => null,
            deleteTransaction: async () => null,
            getMonthlyLimit: async () => null,
            setMonthlyLimit: async () => null,
          },
        },
      ],
    });
    service = TestBed.inject(TransactionService);
  });

  it('seeds two sample transactions on first run', async () => {
    storage.clear();

    const all = await service.getAll();

    expect(all).toHaveLength(2);
    expect(all.map((transaction) => transaction.type).sort()).toEqual(['expense', 'income']);
  });

  it('does not reseed samples after the ledger is emptied', async () => {
    await expect(service.getAll()).resolves.toEqual([]);
  });

  it('adds a transaction with a generated id', async () => {
    const created = await service.add(lunch);

    expect(created.id).toBeTruthy();
    expect(created).toMatchObject(lunch);
    await expect(service.getAll()).resolves.toEqual([created]);
  });

  it('finds a transaction by id', async () => {
    const created = await service.add(lunch);

    await expect(service.getById(created.id)).resolves.toEqual(created);
    await expect(service.getById('missing')).resolves.toBeUndefined();
  });

  it('updates an existing transaction', async () => {
    const created = await service.add(lunch);
    const edited: Transaction = { ...created, amount: 310, note: 'Lunch + coffee' };

    await expect(service.update(edited)).resolves.toBe(true);
    await expect(service.getById(created.id)).resolves.toEqual(edited);
  });

  it('returns false when updating an unknown transaction', async () => {
    const missing: Transaction = { id: 'missing', ...lunch };

    await expect(service.update(missing)).resolves.toBe(false);
  });

  it('deletes a transaction', async () => {
    const created = await service.add(lunch);

    await expect(service.delete(created.id)).resolves.toBe(true);
    await expect(service.getAll()).resolves.toEqual([]);
    await expect(service.delete(created.id)).resolves.toBe(false);
  });

  it('returns transactions newest first', async () => {
    const older = await service.add({ ...lunch, date: '2026-11-11', note: 'Salary lunch' });
    const newer = await service.add({ ...lunch, date: '2026-11-15' });

    const all = await service.getAll();
    expect(all.map((transaction) => transaction.id)).toEqual([newer.id, older.id]);
  });

  it('treats corrupted storage as an empty ledger', async () => {
    storage.set('tally.transactions', 'not-json');

    await expect(service.getAll()).resolves.toEqual([]);
  });

  it('drops entries that do not match the Transaction shape', async () => {
    storage.set('tally.transactions', JSON.stringify([{ id: 'broken' }, { ...lunch, id: 'valid' }]));

    const all = await service.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('valid');
  });
});
