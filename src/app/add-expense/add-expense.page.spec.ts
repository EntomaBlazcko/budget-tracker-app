import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Camera } from '@capacitor/camera';
import { AlertController, ToastController } from '@ionic/angular';
import type { SegmentCustomEvent } from '@ionic/angular';

import type { Transaction } from '../models/transaction.model';
import { BudgetService } from '../services/budget.service';
import { TransactionService } from '../services/transaction.service';
import { VibrationService } from '../services/vibration.service';

import { AddExpensePage } from './add-expense.page';

vi.mock('@capacitor/camera', () => ({
  Camera: { getPhoto: vi.fn() },
  CameraResultType: { Base64: 'base64' },
  CameraSource: { Prompt: 'PROMPT' },
}));

const transactions = {
  getAll: vi.fn(),
  getById: vi.fn(),
  add: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const toast = {
  create: vi.fn().mockResolvedValue({
    present: vi.fn().mockResolvedValue(undefined),
    onDidDismiss: vi.fn().mockResolvedValue(undefined),
  }),
};

const alert = {
  create: vi.fn().mockResolvedValue({
    present: vi.fn().mockResolvedValue(undefined),
  }),
};

const budget = {
  getMonthlyLimit: vi.fn(),
  setMonthlyLimit: vi.fn(),
};

const vibration = {
  loadSetting: vi.fn(),
  setEnabled: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
  strong: vi.fn(),
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
      { provide: ToastController, useValue: toast },
      { provide: AlertController, useValue: alert },
      { provide: BudgetService, useValue: budget },
      { provide: VibrationService, useValue: vibration },
    ],
  });
}

describe('AddExpensePage (new entry)', () => {
  let component: AddExpensePage;
  let fixture: ComponentFixture<AddExpensePage>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(Camera.getPhoto).mockReset();
    transactions.add.mockResolvedValue({ ...lunch, id: 'new' });
    transactions.getAll.mockResolvedValue([]);
    budget.getMonthlyLimit.mockResolvedValue(30000);

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
    expect(toast.create).toHaveBeenCalledWith(expect.objectContaining({ message: 'Transaction saved' }));
  });

  it('saves an income entry with the Income category', async () => {
    component.setType({ detail: { value: 'income' } } as SegmentCustomEvent);
    component.form.controls.amount.setValue('5000');
    component.form.controls.note.setValue('Allowance');
    component.form.controls.date.setValue('2026-11-15');

    expect(component.form.controls.category.value).toBe('Income');

    await component.save();

    expect(transactions.add).toHaveBeenCalledWith({
      type: 'income',
      amount: 5000,
      category: 'Income',
      date: '2026-11-15',
      note: 'Allowance',
    });
  });

  it('shows an error toast when saving fails', async () => {
    transactions.add.mockRejectedValue(new Error('storage failed'));
    component.form.setValue({
      amount: '285',
      category: 'Food',
      note: 'Lunch',
      date: '2026-11-15',
    });

    await component.save();

    expect(component.saveError()).toBe('Could not save. Please try again.');
    expect(toast.create).toHaveBeenCalledWith(expect.objectContaining({ message: 'Could not save transaction' }));
    expect(vibration.error).toHaveBeenCalled();
  });

  it('attaches a receipt photo as a base64 data URL', async () => {
    vi.mocked(Camera.getPhoto).mockResolvedValue({ base64String: 'abc123', format: 'jpeg' } as never);

    await component.attachReceipt();

    expect(component.receiptPhoto()).toBe('data:image/jpeg;base64,abc123');
  });

  it('clears the receipt photo', () => {
    component.receiptPhoto.set('data:image/jpeg;base64,abc123');

    component.removePhoto();

    expect(component.receiptPhoto()).toBeNull();
  });

  it('shows an alert when photo access is denied', async () => {
    vi.mocked(Camera.getPhoto).mockRejectedValue(new Error('Permission denied'));

    await component.attachReceipt();

    expect(alert.create).toHaveBeenCalledWith(expect.objectContaining({ header: 'Camera permission needed' }));
  });

  it('stays quiet when the user cancels the picker', async () => {
    vi.mocked(Camera.getPhoto).mockRejectedValue(new Error('User cancelled photos app'));

    await component.attachReceipt();

    expect(alert.create).not.toHaveBeenCalled();
  });

  it('saves the attached receipt with the transaction', async () => {
    component.receiptPhoto.set('data:image/jpeg;base64,abc123');
    component.form.setValue({
      amount: '285',
      category: 'Food',
      note: 'Lunch',
      date: '2026-11-15',
    });

    await component.save();

    expect(transactions.add).toHaveBeenCalledWith(
      expect.objectContaining({ receiptPhoto: 'data:image/jpeg;base64,abc123' }),
    );
  });

  it('buzzes with success after saving', async () => {
    component.form.setValue({
      amount: '285',
      category: 'Food',
      note: 'Lunch',
      date: '2026-11-15',
    });

    await component.save();

    expect(vibration.success).toHaveBeenCalled();
    expect(vibration.strong).not.toHaveBeenCalled();
  });

  it('buzzes harder when a new expense goes over the monthly limit', async () => {
    budget.getMonthlyLimit.mockResolvedValue(1000);
    transactions.getAll.mockResolvedValue([
      {
        id: 'expense-1',
        type: 'expense',
        amount: 2000,
        category: 'Food',
        date: '2026-11-01',
        note: 'Big grocery run',
      },
    ]);

    component.form.setValue({
      amount: '500',
      category: 'Food',
      note: 'Dinner',
      date: '2026-11-15',
    });

    await component.save();

    expect(vibration.strong).toHaveBeenCalled();
    expect(vibration.success).not.toHaveBeenCalled();
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
