import type { Routes } from '@angular/router';

export const routes: Routes = [
  // Add expense sits outside the tab shell so it opens full-screen.
  {
    path: 'add-expense',
    loadComponent: () => import('./add-expense/add-expense.page').then((m) => m.AddExpensePage),
  },

  // Same form, prefilled, when editing an existing transaction.
  {
    path: 'add-expense/:id',
    loadComponent: () => import('./add-expense/add-expense.page').then((m) => m.AddExpensePage),
  },

  // Tab shell: Home, Activity, Budgets, Insights.
  {
    path: '',
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'activity',
        loadComponent: () => import('./activity/activity.page').then((m) => m.ActivityPage),
      },
      {
        path: 'budgets',
        loadComponent: () => import('./budgets/budgets.page').then((m) => m.BudgetsPage),
      },
      {
        path: 'insights',
        loadComponent: () => import('./insights/insights.page').then((m) => m.InsightsPage),
      },
    ],
  },

  {
    path: '**',
    redirectTo: '',
  },
];
