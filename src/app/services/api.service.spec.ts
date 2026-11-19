import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { Transaction } from '../models/transaction.model';

import { API_BASE_URL } from './api.config';
import { ApiService } from './api.service';

const lunch: Transaction = {
  id: 'tx-1',
  type: 'expense',
  amount: 285,
  category: 'Food',
  date: '2026-11-15',
  note: 'Lunch',
};

describe('ApiService', () => {
  let service: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('GETs the transaction list', async () => {
    const request = service.listTransactions();
    http.expectOne(`${API_BASE_URL}/transactions`).flush([lunch]);
    await expect(request).resolves.toEqual([lunch]);
  });

  it('POSTs a new transaction', async () => {
    const request = service.createTransaction(lunch);
    const testRequest = http.expectOne(`${API_BASE_URL}/transactions`);
    expect(testRequest.request.method).toBe('POST');
    testRequest.flush(lunch);
    await expect(request).resolves.toEqual(lunch);
  });

  it('DELETEs by id', async () => {
    const request = service.deleteTransaction('tx-1');
    const testRequest = http.expectOne(`${API_BASE_URL}/transactions/tx-1`);
    expect(testRequest.request.method).toBe('DELETE');
    testRequest.flush({ ok: true });
    await expect(request).resolves.toBe(true);
  });

  it('falls back to null when the API is offline', async () => {
    const request = service.listTransactions();
    http.expectOne(`${API_BASE_URL}/transactions`).flush('offline', { status: 0, statusText: 'Offline' });
    await expect(request).resolves.toBeNull();
  });

  it('GETs and PUTs the monthly budget', async () => {
    const read = service.getMonthlyLimit();
    http.expectOne(`${API_BASE_URL}/budget`).flush({ monthlyLimit: 25000 });
    await expect(read).resolves.toBe(25000);

    const write = service.setMonthlyLimit(25000);
    const testRequest = http.expectOne(`${API_BASE_URL}/budget`);
    expect(testRequest.request.method).toBe('PUT');
    testRequest.flush({ monthlyLimit: 25000 });
    await expect(write).resolves.toBeUndefined();
  });
});
