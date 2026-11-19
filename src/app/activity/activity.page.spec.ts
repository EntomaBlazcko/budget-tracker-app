import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import type { IonItemSliding, SegmentCustomEvent } from '@ionic/angular';

import type { Transaction } from '../models/transaction.model';
import { TransactionService } from '../services/transaction.service';
import { VibrationService } from '../services/vibration.service';

import { ActivityPage } from './activity.page';

const transactions = {
  getAll: vi.fn(),
  getById: vi.fn(),
  add: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const vibration = {
  warning: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
};

function isoOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(
    2,
    '0',
  )}`;
}

const entries: Transaction[] = [
  {
    id: 'expense-1',
    type: 'expense',
    amount: 285,
    category: 'Food',
    date: isoOffset(0),
    note: 'Lunch at Jollibee',
    receiptPhoto: 'data:image/jpeg;base64,abc123',
  },
  {
    id: 'income-1',
    type: 'income',
    amount: 42000,
    category: 'Income',
    date: isoOffset(0),
    note: 'Salary deposit',
  },
  {
    id: 'expense-2',
    type: 'expense',
    amount: 1845.5,
    category: 'Shopping',
    date: isoOffset(-2),
    note: 'SM Supermarket',
  },
];

describe('ActivityPage', () => {
  let component: ActivityPage;
  let fixture: ComponentFixture<ActivityPage>;

  beforeEach(async () => {
    vi.clearAllMocks();
    transactions.getAll.mockResolvedValue(entries);
    transactions.delete.mockResolvedValue(true);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: TransactionService, useValue: transactions },
        { provide: VibrationService, useValue: vibration },
      ],
    });

    fixture = TestBed.createComponent(ActivityPage);
    component = fixture.componentInstance;

    await component.ionViewWillEnter();
    fixture.detectChanges();
  });

  it('groups stored transactions by day, newest first', () => {
    const days = component.days();

    expect(days).toHaveLength(2);
    expect(days[0].label).toBe('TODAY');
    expect(days[0].rows.map((row) => row.title)).toEqual(['Lunch at Jollibee', 'Salary deposit']);
    expect(days[0].rows[0].amount).toBe('-₱285.00');
    expect(days[0].rows[1].amount).toBe('+₱42,000.00');
  });

  it('filters the list by transaction type', () => {
    component.setFilter({ detail: { value: 'income' } } as SegmentCustomEvent);

    const rows = component.days().flatMap((day) => day.rows);
    expect(rows).toHaveLength(1);
    expect(rows[0].income).toBe(true);

    component.setFilter({ detail: { value: 'expenses' } } as SegmentCustomEvent);
    expect(component.days().flatMap((day) => day.rows)).toHaveLength(2);
  });

  it('deletes only after the alert is confirmed', async () => {
    const row = component.days()[0].rows[0];
    component.pendingDelete.set(row);

    await component.onDeleteDismiss({ detail: { role: 'cancel' } });
    expect(transactions.delete).not.toHaveBeenCalled();
    expect(component.pendingDelete()).toBeNull();

    component.pendingDelete.set(row);
    await component.onDeleteDismiss({ detail: { role: 'destructive' } });

    expect(transactions.delete).toHaveBeenCalledWith('expense-1');
    expect(transactions.getAll).toHaveBeenCalledTimes(2);
    expect(vibration.warning).toHaveBeenCalled();
    expect(vibration.success).toHaveBeenCalled();
  });

  it('opens the form for the transaction being edited', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const sliding = { close: vi.fn().mockResolvedValue(undefined) } as unknown as IonItemSliding;

    await component.edit(component.days()[0].rows[0], sliding);

    expect(sliding.close).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/add-expense', 'expense-1']);
  });

  it('opens and closes a receipt photo', () => {
    const row = component.days()[0].rows[0];

    expect(row.receiptPhoto).toBe('data:image/jpeg;base64,abc123');

    component.viewReceipt(row);
    expect(component.photoSrc()).toBe('data:image/jpeg;base64,abc123');

    component.closeReceipt();
    expect(component.photoSrc()).toBeNull();
  });

  it('ignores rows without a receipt photo', () => {
    const row = component.days()[0].rows[1];

    component.viewReceipt(row);

    expect(component.photoSrc()).toBeNull();
  });
});
