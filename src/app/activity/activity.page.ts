// Activity page - lists, edits and deletes transactions.
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonAlert,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular';
import type { AlertButton, SegmentCustomEvent } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  carOutline,
  cashOutline,
  cartOutline,
  createOutline,
  fastFoodOutline,
  flashOutline,
  medicalOutline,
  playCircleOutline,
  receiptOutline,
  trashOutline,
} from 'ionicons/icons';

import { categoryStyle } from '../models/category.model';
import type { Transaction } from '../models/transaction.model';
import { TransactionService } from '../services/transaction.service';
import { VibrationService } from '../services/vibration.service';

type TransactionFilter = 'all' | 'expenses' | 'income';

interface TransactionRow {
  id: string;
  title: string;
  category: string;
  categoryClass: string;
  icon: string;
  location?: string;
  receiptPhoto?: string;
  amount: string;
  income: boolean;
}

interface TransactionDay {
  date: string;
  label: string;
  rows: TransactionRow[];
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const peso = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatAmount(transaction: Transaction): string {
  const sign = transaction.type === 'income' ? '+' : '-';
  return `${sign}₱${peso.format(transaction.amount)}`;
}

function toRow(transaction: Transaction): TransactionRow {
  const style = categoryStyle(transaction.category);

  return {
    id: transaction.id,
    title: transaction.note.trim() || transaction.category,
    category: transaction.category,
    categoryClass: style.colorClass,
    icon: style.icon,
    location: transaction.location?.trim() || undefined,
    receiptPhoto: transaction.receiptPhoto,
    amount: formatAmount(transaction),
    income: transaction.type === 'income',
  };
}

function isoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(
    2,
    '0',
  )}`;
}

function dayLabel(date: string, now = new Date()): string {
  if (date === isoDate(now)) {
    return 'TODAY';
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date === isoDate(yesterday)) {
    return 'YESTERDAY';
  }

  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) {
    return date;
  }

  const label = `${MONTHS[month - 1]} ${day}`;
  return year === now.getFullYear() ? label : `${label}, ${year}`;
}

function formatMonth(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function groupByDay(transactions: Transaction[], filter: TransactionFilter): TransactionDay[] {
  const groups = new Map<string, TransactionRow[]>();

  for (const transaction of transactions) {
    if (filter === 'expenses' && transaction.type !== 'expense') {
      continue;
    }
    if (filter === 'income' && transaction.type !== 'income') {
      continue;
    }

    const row = toRow(transaction);
    const rows = groups.get(transaction.date);
    if (rows) {
      rows.push(row);
    } else {
      groups.set(transaction.date, [row]);
    }
  }

  return [...groups.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([date, rows]) => ({ date, label: dayLabel(date), rows }));
}

@Component({
  selector: 'app-activity',
  templateUrl: 'activity.page.html',
  styleUrls: ['activity.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonNote,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonCard,
    IonCardContent,
    IonList,
    IonItemSliding,
    IonItem,
    IonItemOptions,
    IonItemOption,
    IonIcon,
    IonAlert,
    IonToast,
    IonButton,
    IonButtons,
    IonModal,
  ],
})
export class ActivityPage {
  private readonly transactions = inject(TransactionService);
  private readonly vibration = inject(VibrationService);
  private readonly router = inject(Router);

  readonly filter = signal<TransactionFilter>('all');
  readonly entries = signal<Transaction[]>([]);
  readonly loaded = signal(false);
  readonly pendingDelete = signal<TransactionRow | null>(null);
  readonly toastOpen = signal(false);
  readonly toastMessage = signal('');
  readonly photoSrc = signal<string | null>(null);

  readonly monthLabel = formatMonth(new Date());
  readonly deleteButtons: AlertButton[] = [
    { text: 'Keep', role: 'cancel' },
    { text: 'Delete', role: 'destructive' },
  ];

  readonly days = computed(() => groupByDay(this.entries(), this.filter()));

  readonly deleteMessage = computed(() => {
    const row = this.pendingDelete();
    return row ? `${row.title} · ${row.amount} will be removed from the ledger.` : '';
  });

  readonly emptyTitle = computed(() =>
    this.entries().length === 0 ? 'No transactions yet' : 'Nothing in this filter',
  );

  readonly emptyCopy = computed(() =>
    this.entries().length === 0
      ? 'Tap the + button to write the first line in your ledger.'
      : 'Try another segment above.',
  );

  constructor() {
    addIcons({
      fastFoodOutline,
      carOutline,
      cashOutline,
      cartOutline,
      createOutline,
      flashOutline,
      medicalOutline,
      playCircleOutline,
      receiptOutline,
      trashOutline,
    });
  }

  async ionViewWillEnter(): Promise<void> {
    await this.reload();
  }

  setFilter(event: SegmentCustomEvent): void {
    const value = event.detail.value;
    if (value === 'all' || value === 'expenses' || value === 'income') {
      this.filter.set(value);
    }
  }

  async edit(row: TransactionRow, sliding: IonItemSliding): Promise<void> {
    await sliding.close();
    await this.router.navigate(['/add-expense', row.id]);
  }

  askDelete(row: TransactionRow, sliding: IonItemSliding): void {
    void sliding.close();
    this.pendingDelete.set(row);
  }

  async onDeleteDismiss(event: { detail: { role?: string } }): Promise<void> {
    const row = this.pendingDelete();
    this.pendingDelete.set(null);

    if (!row || event.detail.role !== 'destructive') {
      return;
    }

    await this.vibration.warning();

    const deleted = await this.transactions.delete(row.id);
    await this.reload();

    if (!deleted) {
      await this.vibration.error();
      this.notify('That entry is already gone');
      return;
    }

    await this.vibration.success();
    this.notify('Deleted from the ledger');
  }

  hideToast(): void {
    this.toastOpen.set(false);
  }

  viewReceipt(row: TransactionRow): void {
    if (row.receiptPhoto) {
      this.photoSrc.set(row.receiptPhoto);
    }
  }

  closeReceipt(): void {
    this.photoSrc.set(null);
  }

  private async reload(): Promise<void> {
    this.entries.set(await this.transactions.getAll());
    this.loaded.set(true);
  }

  private notify(message: string): void {
    this.toastMessage.set(message);
    this.toastOpen.set(true);
  }
}
