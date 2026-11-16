export type TransactionType = 'expense' | 'income';

/**
 * A single ledger entry.
 *
 * `date` is an ISO 8601 calendar date string (YYYY-MM-DD), which keeps it easy
 * to sort and display with ion-datetime.
 */
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note: string;
  location?: string;
}

/** Everything needed to create a transaction; the service assigns the id. */
export type NewTransaction = Omit<Transaction, 'id'>;
