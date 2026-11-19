// Budgets page - monthly limit, progress and spending chart.
import { Component, ViewChild, computed, inject, signal } from '@angular/core';
import type { ElementRef, OnDestroy } from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonProgressBar,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular';
import type { SelectCustomEvent, ToggleCustomEvent } from '@ionic/angular';
import Chart from 'chart.js/auto';
import { addIcons } from 'ionicons';
import { calendarOutline, pieChartOutline, pulseOutline } from 'ionicons/icons';

import type { Transaction } from '../models/transaction.model';
import { BudgetService, DEFAULT_MONTHLY_LIMIT } from '../services/budget.service';
import { TransactionService } from '../services/transaction.service';
import { VibrationService } from '../services/vibration.service';

type BudgetStatus = 'ok' | 'almost' | 'over';

interface MonthOption {
  value: string;
  label: string;
}

interface CategoryRow {
  name: string;
  amount: number;
  amountLabel: string;
  percentLabel: string;
  color: string;
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

// Same colors the rest of the app uses for each category.
const CATEGORY_COLORS: Record<string, string> = {
  Food: '#ff5a36',
  Transport: '#4d7cfe',
  Bills: '#8e6cef',
  Fun: '#ffd166',
  Health: '#2fbf9b',
  Shopping: '#ff8fb1',
  Income: '#2fbf9b',
};

const FALLBACK_COLOR = '#7a7f73';

const peso = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatPeso(amount: number): string {
  return `₱${peso.format(amount)}`;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function buildMonthOptions(count: number): MonthOption[] {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    return {
      value: monthKey(date),
      label: `${MONTHS[date.getMonth()]} ${date.getFullYear()}`,
    };
  });
}

@Component({
  selector: 'app-budgets',
  templateUrl: 'budgets.page.html',
  styleUrls: ['budgets.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonNote,
    IonContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardContent,
    IonIcon,
    IonProgressBar,
    IonBadge,
    IonInput,
    IonButton,
    IonToggle,
  ],
})
export class BudgetsPage implements OnDestroy {
  private readonly budget = inject(BudgetService);
  private readonly transactions = inject(TransactionService);
  private readonly vibration = inject(VibrationService);

  @ViewChild('chartCanvas') private chartCanvas?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  private viewActive = false;

  readonly monthOptions = buildMonthOptions(12);
  readonly selectedMonth = signal(monthKey(new Date()));
  readonly entries = signal<Transaction[]>([]);
  readonly limit = signal(DEFAULT_MONTHLY_LIMIT);
  readonly limitDraft = signal(String(DEFAULT_MONTHLY_LIMIT));
  readonly limitMessage = signal('');
  readonly vibrationOn = signal(true);

  readonly selectedMonthLabel = computed(
    () => this.monthOptions.find((option) => option.value === this.selectedMonth())?.label ?? this.selectedMonth(),
  );

  private readonly monthExpenses = computed(() =>
    this.entries().filter(
      (transaction) => transaction.type === 'expense' && transaction.date.startsWith(this.selectedMonth()),
    ),
  );

  readonly totalSpent = computed(() =>
    this.monthExpenses().reduce((total, transaction) => total + transaction.amount, 0),
  );

  readonly spentLabel = computed(() => formatPeso(this.totalSpent()));
  readonly limitLabel = computed(() => formatPeso(this.limit()));

  readonly percent = computed(() => {
    if (this.limit() <= 0) {
      return this.totalSpent() > 0 ? 100 : 0;
    }

    return (this.totalSpent() / this.limit()) * 100;
  });

  readonly percentLabel = computed(() => `${Math.round(this.percent())}%`);
  readonly barValue = computed(() => Math.min(this.percent() / 100, 1));

  readonly status = computed<BudgetStatus>(() => {
    if (this.percent() >= 100) {
      return 'over';
    }

    return this.percent() >= 80 ? 'almost' : 'ok';
  });

  readonly statusMessage = computed(() => {
    if (this.limit() <= 0) {
      return 'Set a monthly limit to start tracking your spending.';
    }

    const remaining = this.limit() - this.totalSpent();

    if (this.percent() >= 100) {
      return remaining < 0
        ? `You are over your limit by ${formatPeso(Math.abs(remaining))}.`
        : 'You have reached your monthly limit.';
    }

    if (this.percent() >= 80) {
      return `Only ${formatPeso(remaining)} left. Slow down a little.`;
    }

    return `${formatPeso(remaining)} left this month.`;
  });

  readonly chartRows = computed<CategoryRow[]>(() => {
    const totals = new Map<string, number>();

    for (const transaction of this.monthExpenses()) {
      totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + transaction.amount);
    }

    const total = this.totalSpent();

    return [...totals.entries()]
      .sort(([, left], [, right]) => right - left)
      .map(([name, amount]) => {
        const percent = total > 0 ? (amount / total) * 100 : 0;

        return {
          name,
          amount,
          amountLabel: formatPeso(amount),
          percentLabel: `${percent.toFixed(1)}%`,
          color: CATEGORY_COLORS[name] ?? FALLBACK_COLOR,
        };
      });
  });

  constructor() {
    addIcons({ calendarOutline, pieChartOutline, pulseOutline });
  }

  async ionViewWillEnter(): Promise<void> {
    this.viewActive = true;

    const [limit, entries, vibrationOn] = await Promise.all([
      this.budget.getMonthlyLimit(),
      this.transactions.getAll(),
      this.vibration.loadSetting(),
    ]);

    this.limit.set(limit);
    this.limitDraft.set(String(limit));
    this.entries.set(entries);
    this.vibrationOn.set(vibrationOn);

    // Let Angular render the canvas before Chart.js looks for it.
    setTimeout(() => this.drawChart());
  }

  ionViewWillLeave(): void {
    this.viewActive = false;
    this.destroyChart();
  }

  ngOnDestroy(): void {
    this.viewActive = false;
    this.destroyChart();
  }

  setMonth(event: SelectCustomEvent): void {
    const value = event.detail.value;

    if (typeof value !== 'string' || !value) {
      return;
    }

    this.selectedMonth.set(value);
    this.limitMessage.set('');
    setTimeout(() => this.drawChart());
  }

  async setVibration(event: ToggleCustomEvent): Promise<void> {
    const enabled = event.detail.checked;
    this.vibrationOn.set(enabled);
    await this.vibration.setEnabled(enabled);
  }

  onLimitInput(event: CustomEvent<{ value?: string | null }>): void {
    this.limitDraft.set(event.detail.value ?? '');
  }

  async saveLimit(): Promise<void> {
    const amount = Number(this.limitDraft().replace(/,/g, '').trim());

    if (!Number.isFinite(amount) || amount <= 0) {
      this.limitMessage.set('Enter a limit greater than ₱0.');
      return;
    }

    try {
      await this.budget.setMonthlyLimit(amount);
      this.limit.set(amount);
      this.limitDraft.set(String(amount));
      this.limitMessage.set('Monthly limit saved.');
    } catch {
      this.limitMessage.set('Could not save the limit.');
    }
  }

  private drawChart(): void {
    if (!this.viewActive) {
      return;
    }

    this.destroyChart();

    const canvas = this.chartCanvas?.nativeElement;
    const rows = this.chartRows();

    if (!canvas || rows.length === 0) {
      return;
    }

    this.chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: rows.map((row) => row.name),
        datasets: [
          {
            data: rows.map((row) => row.amount),
            backgroundColor: rows.map((row) => row.color),
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${formatPeso(Number(context.raw))}`,
            },
          },
        },
      },
    });
  }

  private destroyChart(): void {
    this.chart?.destroy();
    this.chart = undefined;
  }
}
