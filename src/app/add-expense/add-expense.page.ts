import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonChip,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonModal,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { calendarOutline, cameraOutline } from 'ionicons/icons';

import { CATEGORIES, categoryStyle, isCategory } from '../models/category.model';
import type { NewTransaction, TransactionType } from '../models/transaction.model';
import { TransactionService } from '../services/transaction.service';

/** Empty is left to Validators.required; anything else must parse above zero. */
const positiveAmountValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const raw = String(control.value ?? '')
    .replace(/,/g, '')
    .trim();
  if (raw === '') {
    return null;
  }

  const amount = Number(raw);
  return Number.isFinite(amount) && amount > 0 ? null : { amount: true };
};

function isoToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(
    2,
    '0',
  )}`;
}

@Component({
  selector: 'app-add-expense',
  templateUrl: 'add-expense.page.html',
  styleUrls: ['add-expense.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonNote,
    IonContent,
    IonCard,
    IonCardContent,
    IonInput,
    IonChip,
    IonDatetime,
    IonDatetimeButton,
    IonIcon,
    IonModal,
    IonButton,
  ],
})
export class AddExpensePage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly transactions = inject(TransactionService);

  readonly editingId = signal<string | null>(null);
  readonly extraCategory = signal<string | null>(null);
  readonly transactionType = signal<TransactionType>('expense');
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    amount: ['', [Validators.required, positiveAmountValidator]],
    category: ['', Validators.required],
    note: [''],
    date: [isoToday(), Validators.required],
  });

  constructor() {
    addIcons({ calendarOutline, cameraOutline });
    void this.load();
  }

  get isEditing(): boolean {
    return this.editingId() !== null;
  }

  get pageTitle(): string {
    if (!this.isEditing) {
      return 'New expense';
    }

    return this.transactionType() === 'income' ? 'Edit income' : 'Edit expense';
  }

  get saveLabel(): string {
    if (this.isEditing) {
      return 'Save changes';
    }

    return this.transactionType() === 'income' ? 'Save income' : 'Save expense';
  }

  get backHref(): string {
    return this.isEditing ? '/activity' : '/home';
  }

  /** Keeps an unusual stored category selectable when editing. */
  get categoryOptions(): string[] {
    const extra = this.extraCategory();
    return extra ? [...CATEGORIES, extra] : [...CATEGORIES];
  }

  get amountError(): string | null {
    const control = this.form.controls.amount;
    if (!control.invalid || !(control.touched || this.submitted())) {
      return null;
    }

    return control.hasError('required') ? 'Enter an amount' : 'Amount must be more than ₱0';
  }

  get categoryError(): string | null {
    const control = this.form.controls.category;
    if (!control.invalid || !(control.touched || this.submitted())) {
      return null;
    }

    return 'Pick a category';
  }

  chipClass(category: string): string {
    const selected = this.form.controls.category.value === category ? ' selected' : '';
    return `stamp-chip ${categoryStyle(category).colorClass}${selected}`;
  }

  selectCategory(category: string, event?: Event): void {
    event?.preventDefault();
    this.form.controls.category.setValue(category);
    this.form.controls.category.markAsTouched();
  }

  onDateChange(event: CustomEvent<{ value?: string | string[] | null }>): void {
    const value = event.detail.value;
    if (typeof value === 'string' && value) {
      this.form.controls.date.setValue(value.slice(0, 10));
    }
  }

  markAmountTouched(): void {
    this.form.controls.amount.markAsTouched();
  }

  async save(): Promise<void> {
    this.submitted.set(true);
    this.saveError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.loading() || this.submitting()) {
      return;
    }

    const value = this.form.getRawValue();
    const payload: NewTransaction = {
      type: this.transactionType(),
      amount: Number(value.amount.replace(/,/g, '')),
      category: value.category,
      date: value.date,
      note: value.note.trim(),
    };

    this.submitting.set(true);
    try {
      const id = this.editingId();
      if (id) {
        const updated = await this.transactions.update({ id, ...payload });
        if (!updated) {
          this.saveError.set('This entry is no longer in the ledger.');
          return;
        }
      } else {
        await this.transactions.add(payload);
      }

      await this.router.navigateByUrl('/activity', { replaceUrl: true });
    } catch {
      this.saveError.set('Could not save. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }

  private async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.loading.set(true);
    try {
      const transaction = await this.transactions.getById(id);
      if (!transaction) {
        await this.router.navigateByUrl('/activity', { replaceUrl: true });
        return;
      }

      this.editingId.set(transaction.id);
      this.transactionType.set(transaction.type);

      if (!isCategory(transaction.category)) {
        this.extraCategory.set(transaction.category);
      }

      this.form.setValue({
        amount: transaction.amount.toFixed(2),
        category: transaction.category,
        note: transaction.note,
        date: transaction.date,
      });
    } finally {
      this.loading.set(false);
    }
  }
}
