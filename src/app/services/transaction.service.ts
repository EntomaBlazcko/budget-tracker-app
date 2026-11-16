import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

import type { NewTransaction, Transaction } from '../models/transaction.model';

const TRANSACTIONS_KEY = 'tally.transactions';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  /** Newest first. Returns an empty list if nothing is stored yet. */
  async getAll(): Promise<Transaction[]> {
    const transactions = await this.read();
    return transactions.sort((a, b) => b.date.localeCompare(a.date));
  }

  async getById(id: string): Promise<Transaction | undefined> {
    const transactions = await this.read();
    return transactions.find((transaction) => transaction.id === id);
  }

  async add(input: NewTransaction): Promise<Transaction> {
    const transaction: Transaction = { ...input, id: createId() };
    const transactions = await this.read();
    transactions.push(transaction);
    await this.write(transactions);
    return transaction;
  }

  /** Replaces the stored transaction with the same id. Returns false if it no longer exists. */
  async update(transaction: Transaction): Promise<boolean> {
    const transactions = await this.read();
    const index = transactions.findIndex((item) => item.id === transaction.id);
    if (index === -1) {
      return false;
    }

    transactions[index] = { ...transaction };
    await this.write(transactions);
    return true;
  }

  /** Returns false when the id was not found. */
  async delete(id: string): Promise<boolean> {
    const transactions = await this.read();
    const remaining = transactions.filter((transaction) => transaction.id !== id);
    if (remaining.length === transactions.length) {
      return false;
    }

    await this.write(remaining);
    return true;
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
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isTransaction(value: unknown): value is Transaction {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const transaction = value as Partial<Transaction>;
  return (
    typeof transaction.id === 'string' &&
    (transaction.type === 'expense' || transaction.type === 'income') &&
    typeof transaction.amount === 'number' &&
    Number.isFinite(transaction.amount) &&
    transaction.amount >= 0 &&
    typeof transaction.category === 'string' &&
    typeof transaction.date === 'string' &&
    typeof transaction.note === 'string' &&
    (transaction.location === undefined || typeof transaction.location === 'string')
  );
}
