export const PEOPLE = [
  { id: 1, name: 'Alice Silva', age: 30 },
  { id: 2, name: 'Bob Junior',  age: 16 },
];

export const CATEGORIES = [
  { id: 1, name: 'Mercado',       purpose: 0 },
  { id: 2, name: 'Salário',       purpose: 1 },
  { id: 3, name: 'Transferência', purpose: 2 },
];

export const TRANSACTIONS = [
  { id: 1, description: 'Feira semanal', amount: 150.00,  type: 0, date: '2025-06-01T00:00:00', personId: 1, categoryId: 1, personName: 'Alice Silva', categoryName: 'Mercado' },
  { id: 2, description: 'Salário junho',  amount: 5000.00, type: 1, date: '2025-06-01T00:00:00', personId: 1, categoryId: 2, personName: 'Alice Silva', categoryName: 'Salário' },
];

export const REPORT = {
  details: [{ name: 'Alice Silva', totalIncome: 5000, totalExpense: 150, balance: 4850 }],
  grandTotalIncome: 5000,
  grandTotalExpense: 150,
  grandBalance: 4850,
};
