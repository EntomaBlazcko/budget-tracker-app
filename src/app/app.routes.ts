import type { Routes } from '@angular/router';

export const routes: Routes = [
  // Add/Edit lives outside the tabs, so it opens as a full-screen page.
  {
    path: 'transactions/new',
    loadComponent: () => import('./transaction-form/transaction-form.page').then((m) => m.TransactionFormPage),
  },
  {
    path: 'transactions/:id/edit',
    loadComponent: () => import('./transaction-form/transaction-form.page').then((m) => m.TransactionFormPage),
  },

  // Tab shell: Dashboard, Transactions, Budget.
  {
    path: '',
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'transactions',
        loadComponent: () => import('./transactions/transactions.page').then((m) => m.TransactionsPage),
      },
      {
        path: 'budget',
        loadComponent: () => import('./budget/budget.page').then((m) => m.BudgetPage),
      },
    ],
  },

  {
    path: '**',
    redirectTo: '',
  },
];
