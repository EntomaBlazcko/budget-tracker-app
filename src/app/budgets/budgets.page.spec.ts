import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import type { SelectCustomEvent, ToggleCustomEvent } from '@ionic/angular';

import type { Transaction } from '../models/transaction.model';
import { BudgetService } from '../services/budget.service';
import { TransactionService } from '../services/transaction.service';
import { VibrationService } from '../services/vibration.service';

import { BudgetsPage } from './budgets.page';

const { charts } = vi.hoisted(() => ({
  charts: [] as { destroy: ReturnType<typeof vi.fn> }[],
}));

vi.mock('chart.js/auto', () => ({
  default: class {
    destroy = vi.fn();

    constructor() {
      charts.push(this);
    }
  },
}));

const budget = {
  getMonthlyLimit: vi.fn(),
  setMonthlyLimit: vi.fn(),
};

const transactions = {
  getAll: vi.fn(),
};

const vibration = {
  loadSetting: vi.fn(),
  setEnabled: vi.fn(),
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
  { id: 'expense-1', type: 'expense', amount: 500, category: 'Food', date: isoOffset(0), note: 'Groceries' },
  { id: 'expense-2', type: 'expense', amount: 100, category: 'Food', date: isoOffset(0), note: 'Coffee' },
  { id: 'expense-3', type: 'expense', amount: 400, category: 'Transport', date: isoOffset(0), note: 'Grab' },
  { id: 'income-1', type: 'income', amount: 5000, category: 'Income', date: isoOffset(0), note: 'Allowance' },
];

describe('BudgetsPage', () => {
  let component: BudgetsPage;
  let fixture: ComponentFixture<BudgetsPage>;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    charts.length = 0;

    budget.getMonthlyLimit.mockResolvedValue(2000);
    budget.setMonthlyLimit.mockResolvedValue(undefined);
    transactions.getAll.mockResolvedValue(entries);
    vibration.loadSetting.mockResolvedValue(true);
    vibration.setEnabled.mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        { provide: BudgetService, useValue: budget },
        { provide: TransactionService, useValue: transactions },
        { provide: VibrationService, useValue: vibration },
      ],
    });

    fixture = TestBed.createComponent(BudgetsPage);
    component = fixture.componentInstance;

    await component.ionViewWillEnter();
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds up this month's expenses and tracks the limit", () => {
    expect(component.totalSpent()).toBe(1000);
    expect(component.percent()).toBe(50);
    expect(component.status()).toBe('ok');
    expect(component.statusMessage()).toBe('₱1,000.00 left this month.');
  });

  it('switches to almost and over as the limit is used up', () => {
    component.limit.set(1250);
    expect(component.status()).toBe('almost');

    component.limit.set(1000);
    expect(component.status()).toBe('over');
    expect(component.statusMessage()).toBe('You have reached your monthly limit.');
  });

  it("groups this month's expenses by category for the chart legend", () => {
    const rows = component.chartRows();

    expect(rows.map((row) => row.name)).toEqual(['Food', 'Transport']);
    expect(rows[0].amountLabel).toBe('₱600.00');
    expect(rows[0].percentLabel).toBe('60.0%');
  });

  it('draws one chart and destroys it when the page is left', () => {
    vi.runAllTimers();

    expect(charts).toHaveLength(1);

    component.ionViewWillLeave();

    expect(charts[0].destroy).toHaveBeenCalled();
  });

  it('destroys and rebuilds the chart when the month changes', () => {
    vi.runAllTimers();
    const first = charts[0];

    component.setMonth({ detail: { value: component.selectedMonth() } } as SelectCustomEvent);
    vi.runAllTimers();

    expect(first.destroy).toHaveBeenCalled();
    expect(charts).toHaveLength(2);
  });

  it('shows the empty state when a month has no expenses', async () => {
    transactions.getAll.mockResolvedValue([]);

    await component.ionViewWillEnter();
    fixture.detectChanges();

    expect(component.chartRows()).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('.empty-title')?.textContent).toContain('No spending yet');
  });

  it('saves a valid monthly limit', async () => {
    component.onLimitInput({ detail: { value: '5000' } } as CustomEvent<{ value?: string | null }>);

    await component.saveLimit();

    expect(budget.setMonthlyLimit).toHaveBeenCalledWith(5000);
    expect(component.limit()).toBe(5000);
    expect(component.limitMessage()).toBe('Monthly limit saved.');
  });

  it('rejects a limit that is zero', async () => {
    component.onLimitInput({ detail: { value: '0' } } as CustomEvent<{ value?: string | null }>);

    await component.saveLimit();

    expect(budget.setMonthlyLimit).not.toHaveBeenCalled();
    expect(component.limitMessage()).toContain('greater');
  });

  it('loads the vibration choice and saves it when toggled', async () => {
    expect(component.vibrationOn()).toBe(true);

    await component.setVibration({ detail: { checked: false } } as ToggleCustomEvent);

    expect(component.vibrationOn()).toBe(false);
    expect(vibration.setEnabled).toHaveBeenCalledWith(false);
  });
});
