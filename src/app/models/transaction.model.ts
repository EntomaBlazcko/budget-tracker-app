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
  /** Base64 data URL of the attached receipt photo, when there is one. */
  receiptPhoto?: string;
}

/** Everything needed to create a transaction; the service assigns the id. */
export type NewTransaction = Omit<Transaction, 'id'>;

/** Runtime guard shared by local storage and the REST client. */
export function isTransaction(value: unknown): value is Transaction {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const transaction = value as Partial<Transaction>;
  return (
    typeof transaction.id === 'string' &&
    (transaction.type === 'expense' || transaction.type === 'income') &&
    typeof transaction.amount === 'number' &&
    Number.isFinite(transaction.amount) &&
    transaction.amount >= 0 &&
    typeof transaction.category === 'string' &&
    typeof transaction.date === 'string' &&
    typeof transaction.note === 'string' &&
    (transaction.location === undefined || typeof transaction.location === 'string') &&
    (transaction.receiptPhoto === undefined || typeof transaction.receiptPhoto === 'string')
  );
}
