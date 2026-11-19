import { Injectable, inject } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

import { isTransaction } from '../models/transaction.model';
import type { NewTransaction, Transaction } from '../models/transaction.model';

import { ApiService } from './api.service';

const TRANSACTIONS_KEY = 'tally.transactions';

/** Two example entries so a brand-new install does not open on a blank list. */
const SAMPLE_TRANSACTIONS: NewTransaction[] = [
  {
    type: 'expense',
    amount: 285,
    category: 'Food',
    date: isoDateOffset(0),
    note: 'Lunch at Jollibee',
  },
  {
    type: 'income',
    amount: 42000,
    category: 'Income',
    date: isoDateOffset(-2),
    note: 'Salary deposit',
  },
];

function isoDateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(
    2,
    '0',
  )}`;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly api = inject(ApiService);

  // Makes sure the samples are only added once, even if two pages load together.
  private seedOnce: Promise<void> | null = null;

  /** Newest first. Reads the REST API when available, otherwise the local cache. */
  async getAll(): Promise<Transaction[]> {
    const remote = await this.api.listTransactions();
    if (remote) {
      await this.write(remote);
      return this.newestFirst(remote);
    }

    await this.ensureSamples();
    return this.newestFirst(await this.read());
  }

  async getById(id: string): Promise<Transaction | undefined> {
    const remote = await this.api.getTransaction(id);
    if (remote) {
      await this.upsertLocal(remote);
      return remote;
    }

    await this.ensureSamples();
    return (await this.read()).find((transaction) => transaction.id === id);
  }

  async add(input: NewTransaction): Promise<Transaction> {
    const transaction: Transaction = { ...input, id: createId() };
    const remote = await this.api.createTransaction(transaction);
    const saved = remote ?? transaction;

    const transactions = await this.read();
    transactions.push(saved);
    await this.write(transactions);
    return saved;
  }

  /** Replaces the stored transaction with the same id. Returns false if it no longer exists. */
  async update(transaction: Transaction): Promise<boolean> {
    const transactions = await this.read();
    let index = transactions.findIndex((item) => item.id === transaction.id);
    if (index === -1) {
      const remote = await this.api.getTransaction(transaction.id);
      if (!remote) {
        return false;
      }
      transactions.push(remote);
      index = transactions.length - 1;
    }

    const remote = await this.api.updateTransaction(transaction);
    const saved = remote ?? transaction;
    transactions[index] = saved;
    await this.write(transactions);
    return true;
  }

  /** Returns false when the id was not found. */
  async delete(id: string): Promise<boolean> {
    const transactions = await this.read();
    const existing = transactions.some((transaction) => transaction.id === id);
    await this.api.deleteTransaction(id);

    const remaining = transactions.filter((transaction) => transaction.id !== id);
    if (!existing && remaining.length === transactions.length) {
      return false;
    }

    await this.write(remaining);
    return true;
  }

  private newestFirst(transactions: Transaction[]): Transaction[] {
    return [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  }

  private ensureSamples(): Promise<void> {
    this.seedOnce ??= this.seedSamplesIfFirstRun();
    return this.seedOnce;
  }

  /** Adds the samples only when the key has never been written before. */
  private async seedSamplesIfFirstRun(): Promise<void> {
    const { value } = await Preferences.get({ key: TRANSACTIONS_KEY });
    if (value !== null) {
      return;
    }

    const samples: Transaction[] = SAMPLE_TRANSACTIONS.map((sample) => ({
      ...sample,
      id: createId(),
    }));
    await this.write(samples);
  }

  private async read(): Promise<Transaction[]> {
    const { value } = await Preferences.get({ key: TRANSACTIONS_KEY });
    if (!value) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(isTransaction) : [];
    } catch {
      // Corrupted JSON should behave like an empty ledger, not crash the app.
      return [];
    }
  }

  private async write(transactions: Transaction[]): Promise<void> {
    await Preferences.set({
      key: TRANSACTIONS_KEY,
      value: JSON.stringify(transactions),
    });
  }

  private async upsertLocal(transaction: Transaction): Promise<void> {
    const transactions = await this.read();
    const index = transactions.findIndex((item) => item.id === transaction.id);
    if (index === -1) {
      transactions.push(transaction);
    } else {
      transactions[index] = transaction;
    }
    await this.write(transactions);
  }
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
