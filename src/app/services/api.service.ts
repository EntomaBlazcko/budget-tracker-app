import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { isTransaction } from '../models/transaction.model';
import type { Transaction } from '../models/transaction.model';

import { API_BASE_URL } from './api.config';

/**
 * Thin REST client. Every method returns `null` on network/server failure so
 * the calling service can fall back to the offline Preferences cache.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  async listTransactions(): Promise<Transaction[] | null> {
    try {
      const data: unknown = await firstValueFrom(this.http.get<unknown>(`${API_BASE_URL}/transactions`));
      return Array.isArray(data) ? data.filter(isTransaction) : null;
    } catch {
      return null;
    }
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    try {
      const data: unknown = await firstValueFrom(this.http.get<unknown>(`${API_BASE_URL}/transactions/${id}`));
      return isTransaction(data) ? data : null;
    } catch {
      return null;
    }
  }

  async createTransaction(transaction: Transaction): Promise<Transaction | null> {
    try {
      const data: unknown = await firstValueFrom(this.http.post<unknown>(`${API_BASE_URL}/transactions`, transaction));
      return isTransaction(data) ? data : null;
    } catch {
      return null;
    }
  }

  async updateTransaction(transaction: Transaction): Promise<Transaction | null> {
    try {
      const data: unknown = await firstValueFrom(
        this.http.put<unknown>(`${API_BASE_URL}/transactions/${transaction.id}`, transaction),
      );
      return isTransaction(data) ? data : null;
    } catch {
      return null;
    }
  }

  async deleteTransaction(id: string): Promise<boolean | null> {
    try {
      await firstValueFrom(this.http.delete<unknown>(`${API_BASE_URL}/transactions/${id}`));
      return true;
    } catch {
      return null;
    }
  }

  async getMonthlyLimit(): Promise<number | null> {
    try {
      const data: unknown = await firstValueFrom(this.http.get<unknown>(`${API_BASE_URL}/budget`));
      if (typeof data !== 'object' || data === null) {
        return null;
      }
      const limit = (data as { monthlyLimit?: unknown }).monthlyLimit;
      return typeof limit === 'number' && Number.isFinite(limit) && limit >= 0 ? limit : null;
    } catch {
      return null;
    }
  }

  async setMonthlyLimit(limit: number): Promise<void | null> {
    try {
      await firstValueFrom(this.http.put<unknown>(`${API_BASE_URL}/budget`, { monthlyLimit: limit }));
      return undefined;
    } catch {
      return null;
    }
  }
}
