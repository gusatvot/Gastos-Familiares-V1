import { describe, it, expect } from 'vitest';
import {
  summarizeTransactions,
  filterByType,
  filterByMonth,
  averageExpense,
  largestExpense,
  expenseToIncomeRatio,
  recentTransactions,
  formatCurrency,
  formatDate,
  getMonthKey,
  hexToRgba,
} from '../finance';
import type { Transaction } from '../../types';

const tx = (overrides: Partial<Transaction> & { type: 'income' | 'expense' }): Transaction => ({
  id: overrides.id ?? Math.random().toString(36).slice(2),
  name: overrides.name ?? 'test',
  amount: overrides.amount ?? 100,
  date: overrides.date ?? '2025-01-15',
  type: overrides.type,
  category: overrides.category ?? 'General',
  description: overrides.description,
});

describe('formatCurrency', () => {
  it('formatea enteros como pesos argentinos', () => {
    expect(formatCurrency(1000)).toMatch(/\$/);
    expect(formatCurrency(1000)).toMatch(/1\.000/);
  });

  it('maneja valores no finitos devolviendo $0,00', () => {
    expect(formatCurrency(NaN)).toBe('$0,00');
    expect(formatCurrency(Infinity)).toBe('$0,00');
  });

  it('sin decimales cuando se pide noCents', () => {
    const result = formatCurrency(1234.56, { noCents: true });
    expect(result).not.toMatch(/,56/);
  });
});

describe('formatDate', () => {
  it('devuelve string vacío para fecha inválida', () => {
    expect(formatDate('')).toBe('');
  });

  it('formatea con año cuando se pide', () => {
    const result = formatDate('2025-01-15', { withYear: true });
    expect(result).toMatch(/2025/);
  });

  it('omite año cuando no se pide', () => {
    const result = formatDate('2025-01-15');
    expect(result).not.toMatch(/2025/);
  });
});

describe('getMonthKey', () => {
  it('devuelve YYYY-MM para una fecha dada', () => {
    expect(getMonthKey(new Date('2025-03-15T10:00:00Z'))).toMatch(/^\d{4}-\d{2}$/);
    expect(getMonthKey(new Date('2025-03-15T10:00:00Z'))).toHaveLength(7);
  });
});

describe('hexToRgba', () => {
  it('convierte hex válido a rgba', () => {
    expect(hexToRgba('#a855f7', 0.2)).toBe('rgba(168, 85, 247, 0.2)');
  });

  it('devuelve el input si el hex es inválido', () => {
    expect(hexToRgba('not-a-color')).toBe('not-a-color');
    expect(hexToRgba('#abc')).toBe('#abc'); // demasiado corto
  });
});

describe('summarizeTransactions', () => {
  it('devuelve ceros para array vacío', () => {
    const result = summarizeTransactions([]);
    expect(result).toEqual({
      income: 0,
      expense: 0,
      balance: 0,
      incomeCount: 0,
      expenseCount: 0,
    });
  });

  it('suma ingresos y gastos por separado', () => {
    const transactions = [
      tx({ type: 'income', amount: 1000 }),
      tx({ type: 'income', amount: 500 }),
      tx({ type: 'expense', amount: 300 }),
    ];
    const result = summarizeTransactions(transactions);
    expect(result.income).toBe(1500);
    expect(result.expense).toBe(300);
    expect(result.balance).toBe(1200);
    expect(result.incomeCount).toBe(2);
    expect(result.expenseCount).toBe(1);
  });

  it('balance negativo cuando expense > income', () => {
    const transactions = [
      tx({ type: 'income', amount: 100 }),
      tx({ type: 'expense', amount: 250 }),
    ];
    expect(summarizeTransactions(transactions).balance).toBe(-150);
  });
});

describe('filterByType', () => {
  it('filtra solo ingresos', () => {
    const transactions = [
      tx({ type: 'income', name: 'sueldo' }),
      tx({ type: 'expense', name: 'alquiler' }),
      tx({ type: 'income', name: 'freelance' }),
    ];
    const incomes = filterByType(transactions, 'income');
    expect(incomes).toHaveLength(2);
    expect(incomes.every((t) => t.type === 'income')).toBe(true);
  });
});

describe('filterByMonth', () => {
  it('filtra transacciones por mes YYYY-MM', () => {
    const transactions = [
      tx({ type: 'expense', date: '2025-01-05' }),
      tx({ type: 'expense', date: '2025-01-31' }),
      tx({ type: 'expense', date: '2025-02-10' }),
      tx({ type: 'income', date: '2025-01-15' }),
    ];
    expect(filterByMonth(transactions, '2025-01')).toHaveLength(3);
    expect(filterByMonth(transactions, '2025-02')).toHaveLength(1);
    expect(filterByMonth(transactions, '2025-03')).toHaveLength(0);
  });
});

describe('averageExpense', () => {
  it('devuelve 0 si no hay gastos', () => {
    expect(averageExpense([tx({ type: 'income', amount: 1000 })])).toBe(0);
    expect(averageExpense([])).toBe(0);
  });

  it('calcula el promedio correctamente', () => {
    const transactions = [
      tx({ type: 'expense', amount: 300 }),
      tx({ type: 'expense', amount: 100 }),
      tx({ type: 'expense', amount: 200 }),
    ];
    expect(averageExpense(transactions)).toBe(200);
  });

  it('ignora los ingresos', () => {
    const transactions = [
      tx({ type: 'expense', amount: 100 }),
      tx({ type: 'income', amount: 1000000 }),
    ];
    expect(averageExpense(transactions)).toBe(100);
  });
});

describe('largestExpense', () => {
  it('devuelve null si no hay gastos', () => {
    expect(largestExpense([])).toBeNull();
    expect(largestExpense([tx({ type: 'income', amount: 100 })])).toBeNull();
  });

  it('encuentra el gasto máximo', () => {
    const transactions = [
      tx({ type: 'expense', amount: 100, name: 'chico' }),
      tx({ type: 'expense', amount: 5000, name: 'grande' }),
      tx({ type: 'expense', amount: 200, name: 'mediano' }),
    ];
    const largest = largestExpense(transactions);
    expect(largest?.name).toBe('grande');
    expect(largest?.amount).toBe(5000);
  });
});

describe('expenseToIncomeRatio', () => {
  it('devuelve 0 si no hay ingresos', () => {
    const transactions = [tx({ type: 'expense', amount: 1000 })];
    expect(expenseToIncomeRatio(transactions)).toBe(0);
  });

  it('calcula el porcentaje correctamente', () => {
    const transactions = [
      tx({ type: 'income', amount: 1000 }),
      tx({ type: 'expense', amount: 750 }),
    ];
    expect(expenseToIncomeRatio(transactions)).toBe(75);
  });

  it('puede pasar del 100% si se gasta más de lo que ingresa', () => {
    const transactions = [
      tx({ type: 'income', amount: 1000 }),
      tx({ type: 'expense', amount: 1500 }),
    ];
    expect(expenseToIncomeRatio(transactions)).toBe(150);
  });
});

describe('recentTransactions', () => {
  it('devuelve las N más recientes por fecha', () => {
    const transactions = [
      tx({ type: 'expense', date: '2025-01-10' }),
      tx({ type: 'expense', date: '2025-03-15' }),
      tx({ type: 'expense', date: '2025-02-20' }),
      tx({ type: 'expense', date: '2025-04-01' }),
    ];
    const recent = recentTransactions(transactions, 2);
    expect(recent).toHaveLength(2);
    expect(recent[0].date).toBe('2025-04-01');
    expect(recent[1].date).toBe('2025-03-15');
  });

  it('no falla si pide más de las que hay', () => {
    const transactions = [tx({ type: 'expense', date: '2025-01-10' })];
    expect(recentTransactions(transactions, 10)).toHaveLength(1);
  });

  it('no muta el array original', () => {
    const transactions = [
      tx({ type: 'expense', date: '2025-01-10' }),
      tx({ type: 'expense', date: '2025-03-15' }),
    ];
    const original = [...transactions];
    recentTransactions(transactions, 1);
    expect(transactions.map((t) => t.date)).toEqual(original.map((t) => t.date));
  });
});
