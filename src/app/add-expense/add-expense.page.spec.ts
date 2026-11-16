import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';

import type { Transaction } from '../models/transaction.model';
import { TransactionService } from '../services/transaction.service';

import { AddExpensePage } from './add-expense.page';

const transactions = {
  getAll: vi.fn(),
  getById: vi.fn(),
  add: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const lunch: Transaction = {
  id: 'tx-1',
  type: 'expense',
  amount: 1234.5,
  category: 'Transport',
  date: '2026-11-01',
  note: 'Grab ride',
  location: 'Makati',
};

function configure(route: object = { snapshot: { paramMap: convertToParamMap({}) } }): void {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: TransactionService, useValue: transactions },
      { provide: ActivatedRoute, useValue: route },
    ],
  });
}

describe('AddExpensePage (new entry)', () => {
  let component: AddExpensePage;
  let fixture: ComponentFixture<AddExpensePage>;

  beforeEach(async () => {
    vi.clearAllMocks();
    transactions.add.mockResolvedValue({ ...lunch, id: 'new' });

    configure();

    fixture = TestBed.createComponent(AddExpensePage);
    component = fixture.componentInstance;
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.isEditing).toBe(false);
  });

  it('blocks saving when the amount is missing', async () => {
    component.form.controls.category.setValue('Food');

    await component.save();

    expect(transactions.add).not.toHaveBeenCalled();
    expect(component.amountError).toBe('Enter an amount');
  });

  it('rejects an amount of zero', async () => {
    component.form.controls.amount.setValue('0');
    component.form.controls.category.setValue('Food');

    await component.save();

    expect(transactions.add).not.toHaveBeenCalled();
    expect(component.amountError).toBe('Amount must be more than ₱0');
  });

  it('requires a category', async () => {
    component.form.controls.amount.setValue('285');

    await component.save();

    expect(transactions.add).not.toHaveBeenCalled();
    expect(component.categoryError).toBe('Pick a category');
  });

  it('saves a valid expense through the service', async () => {
    component.form.setValue({
      amount: '285',
      category: 'Food',
      note: '  Lunch at Jollibee  ',
      date: '2026-11-15',
    });

    await component.save();

    expect(transactions.add).toHaveBeenCalledWith({
      type: 'expense',
      amount: 285,
      category: 'Food',
      date: '2026-11-15',
      note: 'Lunch at Jollibee',
    });
  });
});

describe('AddExpensePage (editing)', () => {
  let component: AddExpensePage;
  let fixture: ComponentFixture<AddExpensePage>;

  beforeEach(async () => {
    vi.clearAllMocks();
    transactions.getById.mockResolvedValue(lunch);
    transactions.update.mockResolvedValue(true);

    configure({ snapshot: { paramMap: convertToParamMap({ id: 'tx-1' }) } });

    fixture = TestBed.createComponent(AddExpensePage);
    component = fixture.componentInstance;
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('prefills the form from the stored transaction', () => {
    expect(component.isEditing).toBe(true);
    expect(component.form.getRawValue()).toEqual({
      amount: '1234.50',
      category: 'Transport',
      note: 'Grab ride',
      date: '2026-11-01',
    });
  });

  it('updates the existing transaction instead of adding a new one', async () => {
    component.form.controls.amount.setValue('1300');

    await component.save();

    expect(transactions.update).toHaveBeenCalledWith({
      id: 'tx-1',
      type: 'expense',
      amount: 1300,
      category: 'Transport',
      date: '2026-11-01',
      note: 'Grab ride',
    });
    expect(transactions.add).not.toHaveBeenCalled();
  });
});
