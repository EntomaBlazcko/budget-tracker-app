import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import type { Transaction } from '../models/transaction.model';
import { TransactionService } from '../services/transaction.service';

import { HomePage } from './home.page';

const transactions = {
  getAll: vi.fn(),
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
    amount: 1000,
    category: 'Bills',
    date: isoOffset(0),
    note: 'Electric bill',
  },
  {
    id: 'expense-3',
    type: 'expense',
    amount: 500,
    category: 'Fun',
    date: isoOffset(0),
    note: 'Cinema',
  },
  {
    id: 'expense-4',
    type: 'expense',
    amount: 300,
    category: 'Transport',
    date: isoOffset(0),
    note: 'Grab ride',
  },
  {
    id: 'expense-5',
    type: 'expense',
    amount: 200,
    category: 'Health',
    date: isoOffset(0),
    note: 'Medicine',
  },
  {
    id: 'old-1',
    type: 'expense',
    amount: 9999,
    category: 'Shopping',
    date: isoOffset(-60),
    note: 'Old purchase',
  },
];

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    vi.clearAllMocks();
    transactions.getAll.mockResolvedValue(entries);

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: TransactionService, useValue: transactions }],
    });

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;

    await component.ionViewWillEnter();
    fixture.detectChanges();
  });

  it('adds up only the current month', () => {
    expect(component.incomeTotal()).toBe(42000);
    expect(component.expenseTotal()).toBe(2285);
    expect(component.balance()).toBe(39715);
  });

  it('shows the five most recent transactions', () => {
    const recent = component.recent();

    expect(recent).toHaveLength(5);
    expect(recent[0].title).toBe('Lunch at Jollibee');
    expect(recent[0].amount).toBe('-₱285.00');
    expect(recent[1].amount).toBe('+₱42,000.00');
  });

  it('shows the empty state when there are no transactions', async () => {
    transactions.getAll.mockResolvedValue([]);

    await component.ionViewWillEnter();
    fixture.detectChanges();

    expect(component.hasEntries()).toBe(false);
    expect(fixture.nativeElement.querySelector('.empty-title')?.textContent).toContain('No transactions yet');
  });
});
