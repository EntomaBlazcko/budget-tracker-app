import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowForward,
  carOutline,
  cartOutline,
  cashOutline,
  fastFoodOutline,
  flashOutline,
  medicalOutline,
  playCircleOutline,
  receiptOutline,
} from 'ionicons/icons';

import { categoryStyle } from '../models/category.model';
import type { Transaction } from '../models/transaction.model';
import { TransactionService } from '../services/transaction.service';

interface RecentTransaction {
  id: string;
  title: string;
  category: string;
  categoryClass: string;
  icon: string;
  date: string;
  amount: string;
  income: boolean;
}

const MONTHS = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
];

const peso = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatPeso(amount: number): string {
  return `₱${peso.format(amount)}`;
}

function formatSignedPeso(amount: number, income: boolean): string {
  return `${income ? '+' : '-'}${formatPeso(amount)}`;
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

  return `${MONTHS[month - 1].slice(0, 3)} ${day}`;
}

function toRecent(transaction: Transaction): RecentTransaction {
  const style = categoryStyle(transaction.category);
  const income = transaction.type === 'income';

  return {
    id: transaction.id,
    title: transaction.note.trim() || transaction.category,
    category: transaction.category,
    categoryClass: style.colorClass,
    icon: style.icon,
    date: dayLabel(transaction.date),
    amount: formatSignedPeso(transaction.amount, income),
    income,
  };
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonTitle,
    RouterLink,
  ],
})
export class HomePage {
  private readonly transactions = inject(TransactionService);

  readonly entries = signal<Transaction[]>([]);
  readonly loaded = signal(false);

  get monthLabel(): string {
    const now = new Date();
    return `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  }

  // Only the current month counts toward the dashboard totals.
  private get monthKey(): string {
    return isoDate(new Date()).slice(0, 7);
  }

  private readonly monthEntries = computed(() =>
    this.entries().filter((transaction) => transaction.date.startsWith(this.monthKey)),
  );

  readonly incomeTotal = computed(() =>
    this.monthEntries()
      .filter((transaction) => transaction.type === 'income')
      .reduce((total, transaction) => total + transaction.amount, 0),
  );

  readonly expenseTotal = computed(() =>
    this.monthEntries()
      .filter((transaction) => transaction.type === 'expense')
      .reduce((total, transaction) => total + transaction.amount, 0),
  );

  readonly balance = computed(() => this.incomeTotal() - this.expenseTotal());

  readonly balanceNegative = computed(() => this.balance() < 0);
  readonly balanceNumber = computed(() => peso.format(Math.abs(this.balance())));
  readonly incomeLabel = computed(() => formatSignedPeso(this.incomeTotal(), true));
  readonly expenseLabel = computed(() => formatSignedPeso(this.expenseTotal(), false));

  readonly hasEntries = computed(() => this.entries().length > 0);
  readonly recent = computed(() => this.entries().slice(0, 5).map(toRecent));

  constructor() {
    addIcons({
      arrowForward,
      fastFoodOutline,
      carOutline,
      cartOutline,
      playCircleOutline,
      cashOutline,
      flashOutline,
      medicalOutline,
      receiptOutline,
    });
  }

  async ionViewWillEnter(): Promise<void> {
    this.entries.set(await this.transactions.getAll());
    this.loaded.set(true);
  }
}
