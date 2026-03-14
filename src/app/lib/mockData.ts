export interface Transaction {
  id: string;
  date: Date;
  merchant: string;
  amount: number;
  category: string;
  balance: number;
  type: 'debit' | 'credit';
}

export interface SpendingPattern {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: new Date('2026-03-13T09:30:00'),
    merchant: 'Amazon',
    amount: 89.99,
    category: 'Shopping',
    balance: 1250.45,
    type: 'debit'
  },
  {
    id: '2',
    date: new Date('2026-03-12T14:20:00'),
    merchant: 'Starbucks',
    amount: 12.50,
    category: 'Food & Dining',
    balance: 1340.44,
    type: 'debit'
  },
  {
    id: '3',
    date: new Date('2026-03-12T10:15:00'),
    merchant: 'Uber',
    amount: 25.30,
    category: 'Transportation',
    balance: 1352.94,
    type: 'debit'
  },
  {
    id: '4',
    date: new Date('2026-03-11T16:45:00'),
    merchant: 'Netflix',
    amount: 15.99,
    category: 'Entertainment',
    balance: 1378.24,
    type: 'debit'
  },
  {
    id: '5',
    date: new Date('2026-03-10T12:30:00'),
    merchant: 'Whole Foods',
    amount: 67.85,
    category: 'Groceries',
    balance: 1394.23,
    type: 'debit'
  },
  {
    id: '6',
    date: new Date('2026-03-10T09:00:00'),
    merchant: 'Salary Deposit',
    amount: 2500.00,
    category: 'Income',
    balance: 1462.08,
    type: 'credit'
  },
  {
    id: '7',
    date: new Date('2026-03-09T18:20:00'),
    merchant: 'Target',
    amount: 45.60,
    category: 'Shopping',
    balance: 1037.92,
    type: 'debit'
  },
  {
    id: '8',
    date: new Date('2026-03-08T20:10:00'),
    merchant: 'DoorDash',
    amount: 32.40,
    category: 'Food & Dining',
    balance: 1083.52,
    type: 'debit'
  },
  {
    id: '9',
    date: new Date('2026-03-07T11:00:00'),
    merchant: 'Apple Store',
    amount: 149.00,
    category: 'Shopping',
    balance: 1115.92,
    type: 'debit'
  },
  {
    id: '10',
    date: new Date('2026-03-06T15:30:00'),
    merchant: 'Shell Gas Station',
    amount: 55.00,
    category: 'Transportation',
    balance: 1264.92,
    type: 'debit'
  },
];

export const spendingByCategory: SpendingPattern[] = [
  { category: 'Shopping', amount: 284.59, percentage: 35, trend: 'up' },
  { category: 'Food & Dining', amount: 196.75, percentage: 24, trend: 'stable' },
  { category: 'Groceries', amount: 135.50, percentage: 17, trend: 'down' },
  { category: 'Transportation', amount: 80.30, percentage: 10, trend: 'up' },
  { category: 'Entertainment', amount: 47.99, percentage: 6, trend: 'stable' },
  { category: 'Bills & Utilities', amount: 65.00, percentage: 8, trend: 'stable' },
];

export const dailySpending = [
  { date: 'Mar 6', amount: 55 },
  { date: 'Mar 7', amount: 149 },
  { date: 'Mar 8', amount: 32 },
  { date: 'Mar 9', amount: 46 },
  { date: 'Mar 10', amount: 2568 },
  { date: 'Mar 11', amount: 16 },
  { date: 'Mar 12', amount: 38 },
  { date: 'Mar 13', amount: 90 },
];

export const encouragementMessages = [
  "🎉 Yesss queen/king! Your wallet is gonna love you for this!",
  "💪 That's giving financially responsible bestie energy!",
  "⭐ Slay! Future you is literally screaming thank you rn!",
  "🌟 Not the financial flex we expected but we're here for it!",
  "🎯 Period! This is how you become THAT person!",
  "💰 The way you just saved money? *chef's kiss* immaculate!",
  "✨ Main character energy right there! You're doing amazing sweetie!",
  "🔥 No literally you're eating this budget thing up!",
];

export const warningMessages = [
  "🤔 Do you really need this right now?",
  "⚠️ Your balance is getting low. Maybe save this for later?",
  "💭 Take a moment to think this through...",
  "🛑 You've spent a lot on this category this month.",
  "📊 This purchase will put you over your weekly budget.",
];

export const highSpendApps = [
  { name: 'Amazon', icon: '🛒', avgSpend: 145.50 },
  { name: 'DoorDash', icon: '🍔', avgSpend: 87.30 },
  { name: 'Uber', icon: '🚗', avgSpend: 65.20 },
  { name: 'Target', icon: '🎯', avgSpend: 54.10 },
];