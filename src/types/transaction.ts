export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}