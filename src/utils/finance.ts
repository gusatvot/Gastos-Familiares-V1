/**
 * Utilidades puras de cálculo financiero.
 *
 * Sin dependencias de React ni Firebase — totalmente testeables.
 * Todos los componentes deberían usar estas funciones en lugar de
 * recalcular inline con `.filter().reduce()`.
 */

import type { Transaction, Budget, Category, Goal } from '../types';

// ============================================================
// Formato
// ============================================================

const ARS_FORMATTER = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
});

const ARS_FORMATTER_NO_CENTS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

/** $1.234,56 (pesos argentinos con decimales). */
export function formatCurrency(amount: number, opts?: { noCents?: boolean }): string {
  if (!Number.isFinite(amount)) return '$0,00';
  return opts?.noCents
    ? ARS_FORMATTER_NO_CENTS.format(amount)
    : ARS_FORMATTER.format(amount);
}

/** 1 may 2025 — formato corto en español argentino. */
export function formatDate(dateStr: string, opts?: { withYear?: boolean }): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: opts?.withYear ? 'numeric' : undefined,
  });
}

/** Devuelve YYYY-MM para un Date (usado por budgets). */
export function getMonthKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 7);
}

/** Devuelve YYYY-MM-DD para un Date (usado por transactions y goals). */
export function getDateKey(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

// ============================================================
// Agregaciones de transacciones
// ============================================================

export interface TransactionSummary {
  income: number;
  expense: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
}

export function summarizeTransactions(transactions: Transaction[]): TransactionSummary {
  let income = 0;
  let expense = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  for (const t of transactions) {
    if (t.type === 'income') {
      income += t.amount;
      incomeCount++;
    } else {
      expense += t.amount;
      expenseCount++;
    }
  }

  return {
    income,
    expense,
    balance: income - expense,
    incomeCount,
    expenseCount,
  };
}

export function filterByType(transactions: Transaction[], type: Transaction['type']): Transaction[] {
  return transactions.filter((t) => t.type === type);
}

/** Transacciones del mes YYYY-MM dado. */
export function filterByMonth(transactions: Transaction[], monthKey: string): Transaction[] {
  return transactions.filter((t) => t.date.startsWith(monthKey));
}

/** Promedio aritmético del monto de gastos. 0 si no hay gastos. */
export function averageExpense(transactions: Transaction[]): number {
  const expenses = filterByType(transactions, 'expense');
  if (expenses.length === 0) return 0;
  const total = expenses.reduce((acc, t) => acc + t.amount, 0);
  return total / expenses.length;
}

/** El gasto de mayor monto, o null si no hay gastos. */
export function largestExpense(transactions: Transaction[]): Transaction | null {
  const expenses = filterByType(transactions, 'expense');
  if (expenses.length === 0) return null;
  return expenses.reduce((max, t) => (t.amount > max.amount ? t : max), expenses[0]);
}

/** 0-100+. Si no hay ingresos, devuelve 0. */
export function expenseToIncomeRatio(transactions: Transaction[]): number {
  const { income, expense } = summarizeTransactions(transactions);
  if (income <= 0) return 0;
  return (expense / income) * 100;
}

/** Las N transacciones más recientes por fecha. */
export function recentTransactions(transactions: Transaction[], n: number): Transaction[] {
  return [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, n);
}

// ============================================================
// Presupuestos
// ============================================================

export interface BudgetProgress {
  spent: number;
  budgeted: number;
  remaining: number;
  percentage: number; // 0-100 capped at 100
  rawPercentage: number; // puede pasar 100
  isOverBudget: boolean;
  status: 'ok' | 'warning' | 'over';
}

/**
 * Calcula el progreso de un presupuesto.
 *
 * @param budget el presupuesto
 * @param transactions todas las transacciones del usuario (se filtra por mes/categoría)
 * @param categories catálogo de categorías para mapear categoryId → name
 */
export function calculateBudgetProgress(
  budget: Budget,
  transactions: Transaction[],
  categories: Category[]
): BudgetProgress {
  const monthKey = budget.month;
  const category = categories.find((c) => c.id === budget.categoryId);

  // Las transacciones guardan el NOMBRE de la categoría, no el ID.
  // Para comparar, necesitamos resolver el nombre.
  const spent = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(monthKey))
    .filter((t) => category && t.category === category.name)
    .reduce((acc, t) => acc + t.amount, 0);

  const budgeted = budget.amount;
  const remaining = budgeted - spent;
  const rawPercentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;
  const percentage = Math.min(rawPercentage, 100);
  const isOverBudget = spent > budgeted;

  let status: BudgetProgress['status'] = 'ok';
  if (isOverBudget) status = 'over';
  else if (rawPercentage >= 75) status = 'warning';

  return {
    spent,
    budgeted,
    remaining,
    percentage,
    rawPercentage,
    isOverBudget,
    status,
  };
}

// ============================================================
// Metas
// ============================================================

export interface GoalProgress {
  percentage: number; // 0-100 capped
  rawPercentage: number;
  isCompleted: boolean;
  daysRemaining: number; // puede ser negativo si venció
  isOverdue: boolean;
}

export function calculateGoalProgress(goal: Goal, now: Date = new Date()): GoalProgress {
  const target = goal.targetAmount;
  const rawPercentage = target > 0 ? (goal.currentAmount / target) * 100 : 0;
  const percentage = Math.min(rawPercentage, 100);
  const isCompleted = rawPercentage >= 100;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(goal.deadline);
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysRemaining = Math.ceil((end.getTime() - today.getTime()) / msPerDay);

  return {
    percentage,
    rawPercentage,
    isCompleted,
    daysRemaining,
    isOverdue: daysRemaining < 0 && !isCompleted,
  };
}

// ============================================================
// Color util
// ============================================================

/** Hex (#RRGGBB) → rgba con alpha. Útil para backgrounds de iconos. */
export function hexToRgba(hex: string, alpha: number = 0.2): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
