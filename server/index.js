/**
 * Tally REST backend.
 * Simple Express API with JSON-file persistence for the school demo.
 * Run with: npm run start:api
 */
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
const BUDGET_FILE = path.join(DATA_DIR, 'budget.json');
const DEFAULT_MONTHLY_LIMIT = 30000;

function isoDateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function seedTransactions() {
  return [
    {
      id: randomUUID(),
      type: 'expense',
      amount: 285,
      category: 'Food',
      date: isoDateOffset(0),
      note: 'Lunch at Jollibee',
    },
    {
      id: randomUUID(),
      type: 'income',
      amount: 42000,
      category: 'Income',
      date: isoDateOffset(-2),
      note: 'Salary deposit',
    },
  ];
}

function readJson(file, fallback) {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

function isValidTransaction(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    (value.type === 'expense' || value.type === 'income') &&
    typeof value.amount === 'number' &&
    Number.isFinite(value.amount) &&
    value.amount >= 0 &&
    typeof value.category === 'string' &&
    typeof value.date === 'string' &&
    typeof value.note === 'string'
  );
}

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(TRANSACTIONS_FILE)) {
  writeJson(TRANSACTIONS_FILE, seedTransactions());
}
if (!fs.existsSync(BUDGET_FILE)) {
  writeJson(BUDGET_FILE, { monthlyLimit: DEFAULT_MONTHLY_LIMIT });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '8mb' })); // receipt photos are base64 data URLs

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'tally-api' });
});

app.get('/api/transactions', (_req, res) => {
  res.json(readJson(TRANSACTIONS_FILE, []));
});

app.get('/api/transactions/:id', (req, res) => {
  const transaction = readJson(TRANSACTIONS_FILE, []).find((item) => item.id === req.params.id);
  if (!transaction) {
    res.status(404).json({ error: 'Transaction not found' });
    return;
  }
  res.json(transaction);
});

app.post('/api/transactions', (req, res) => {
  if (!isValidTransaction(req.body)) {
    res.status(400).json({ error: 'Invalid transaction' });
    return;
  }

  const transactions = readJson(TRANSACTIONS_FILE, []);
  const transaction = { ...req.body, id: req.body.id || randomUUID() };
  transactions.push(transaction);
  writeJson(TRANSACTIONS_FILE, transactions);
  res.status(201).json(transaction);
});

app.put('/api/transactions/:id', (req, res) => {
  if (!isValidTransaction(req.body)) {
    res.status(400).json({ error: 'Invalid transaction' });
    return;
  }

  const transactions = readJson(TRANSACTIONS_FILE, []);
  const index = transactions.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Transaction not found' });
    return;
  }

  const transaction = { ...req.body, id: req.params.id };
  transactions[index] = transaction;
  writeJson(TRANSACTIONS_FILE, transactions);
  res.json(transaction);
});

app.delete('/api/transactions/:id', (req, res) => {
  const transactions = readJson(TRANSACTIONS_FILE, []);
  const remaining = transactions.filter((item) => item.id !== req.params.id);
  if (remaining.length === transactions.length) {
    res.status(404).json({ error: 'Transaction not found' });
    return;
  }

  writeJson(TRANSACTIONS_FILE, remaining);
  res.json({ ok: true });
});

app.get('/api/budget', (_req, res) => {
  res.json(readJson(BUDGET_FILE, { monthlyLimit: DEFAULT_MONTHLY_LIMIT }));
});

app.put('/api/budget', (req, res) => {
  const limit = req.body && req.body.monthlyLimit;
  if (typeof limit !== 'number' || !Number.isFinite(limit) || limit < 0) {
    res.status(400).json({ error: 'Monthly limit must be a non-negative number' });
    return;
  }

  const budget = { monthlyLimit: limit };
  writeJson(BUDGET_FILE, budget);
  res.json(budget);
});

app.listen(PORT, () => {
  console.log(`Tally API listening on http://localhost:${PORT}/api`);
});
