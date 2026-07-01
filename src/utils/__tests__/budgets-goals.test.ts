import { describe, it, expect } from 'vitest';
import { calculateBudgetProgress, calculateGoalProgress } from '../finance';
import type { Transaction, Category, Budget, Goal } from '../../types';

// ============================================================
// calculateBudgetProgress
// ============================================================

describe('calculateBudgetProgress', () => {
  const category: Category = {
    id: 'cat-1',
    name: 'Comida',
    icon: '🍔',
    color: '#ef4444',
    type: 'expense',
  };

  const baseBudget: Budget = {
    id: 'bud-1',
    categoryId: 'cat-1',
    amount: 10000,
    month: '2025-01',
  };

  const makeTransactions = (amounts: number[], month = '2025-01'): Transaction[] =>
    amounts.map((amount, i) => ({
      id: `t-${i}`,
      name: `gasto ${i}`,
      amount,
      date: `${month}-15`,
      type: 'expense' as const,
      category: 'Comida',
    }));

  it('presupuesto sin gastos → 0%, status ok', () => {
    const result = calculateBudgetProgress(baseBudget, [], [category]);
    expect(result.spent).toBe(0);
    expect(result.percentage).toBe(0);
    expect(result.remaining).toBe(10000);
    expect(result.isOverBudget).toBe(false);
    expect(result.status).toBe('ok');
  });

  it('50% gastado → status ok', () => {
    const transactions = makeTransactions([5000]);
    const result = calculateBudgetProgress(baseBudget, transactions, [category]);
    expect(result.spent).toBe(5000);
    expect(result.percentage).toBe(50);
    expect(result.status).toBe('ok');
    expect(result.isOverBudget).toBe(false);
  });

  it('75% o más → status warning', () => {
    const transactions = makeTransactions([7500]);
    const result = calculateBudgetProgress(baseBudget, transactions, [category]);
    expect(result.rawPercentage).toBe(75);
    expect(result.status).toBe('warning');
  });

  it('100%+ → status over, isOverBudget true', () => {
    const transactions = makeTransactions([11000]);
    const result = calculateBudgetProgress(baseBudget, transactions, [category]);
    // toBeCloseTo para evitar el clásico 110.00000000000001 de float
    expect(result.rawPercentage).toBeCloseTo(110, 5);
    expect(result.percentage).toBe(100); // capped
    expect(result.isOverBudget).toBe(true);
    expect(result.status).toBe('over');
    expect(result.remaining).toBe(-1000);
  });

  it('ignora transacciones de otros meses', () => {
    const transactions: Transaction[] = [
      { id: 't1', name: 'a', amount: 5000, date: '2025-01-15', type: 'expense', category: 'Comida' },
      { id: 't2', name: 'b', amount: 5000, date: '2025-02-15', type: 'expense', category: 'Comida' },
    ];
    const result = calculateBudgetProgress(baseBudget, transactions, [category]);
    expect(result.spent).toBe(5000); // solo enero
  });

  it('ignora ingresos', () => {
    const transactions: Transaction[] = [
      { id: 't1', name: 'a', amount: 5000, date: '2025-01-15', type: 'income', category: 'Comida' },
    ];
    const result = calculateBudgetProgress(baseBudget, transactions, [category]);
    expect(result.spent).toBe(0);
  });

  it('ignora transacciones de otras categorías', () => {
    const transactions: Transaction[] = [
      { id: 't1', name: 'a', amount: 5000, date: '2025-01-15', type: 'expense', category: 'Transporte' },
    ];
    const result = calculateBudgetProgress(baseBudget, transactions, [category]);
    expect(result.spent).toBe(0);
  });

  it('presupuesto con amount=0 → percentage 0 (no divide por cero)', () => {
    const budget: Budget = { ...baseBudget, amount: 0 };
    const transactions = makeTransactions([1000]);
    const result = calculateBudgetProgress(budget, transactions, [category]);
    expect(result.percentage).toBe(0);
    expect(result.rawPercentage).toBe(0);
    expect(result.isOverBudget).toBe(true); // 1000 > 0
  });

  it('categoría inexistente → spent 0', () => {
    const result = calculateBudgetProgress(baseBudget, makeTransactions([1000]), []);
    expect(result.spent).toBe(0);
  });
});

// ============================================================
// calculateGoalProgress
// ============================================================

describe('calculateGoalProgress', () => {
  const baseGoal: Goal = {
    id: 'g-1',
    name: 'Vacaciones',
    icon: '✈️',
    color: '#3b82f6',
    targetAmount: 10000,
    currentAmount: 0,
    deadline: '2025-12-31',
  };

  it('meta nueva → 0%, no completada', () => {
    const result = calculateGoalProgress(baseGoal, new Date('2025-01-15'));
    expect(result.percentage).toBe(0);
    expect(result.isCompleted).toBe(false);
  });

  it('50% alcanzado → percentage 50', () => {
    const goal: Goal = { ...baseGoal, currentAmount: 5000 };
    const result = calculateGoalProgress(goal, new Date('2025-06-15'));
    expect(result.percentage).toBe(50);
    expect(result.isCompleted).toBe(false);
  });

  it('100% o más → isCompleted true, percentage capped at 100', () => {
    const goal: Goal = { ...baseGoal, currentAmount: 12000 };
    const result = calculateGoalProgress(goal, new Date('2025-06-15'));
    expect(result.rawPercentage).toBe(120);
    expect(result.percentage).toBe(100);
    expect(result.isCompleted).toBe(true);
  });

  it('deadline en el futuro → daysRemaining positivo, no overdue', () => {
    const result = calculateGoalProgress(baseGoal, new Date('2025-06-15'));
    expect(result.daysRemaining).toBeGreaterThan(0);
    expect(result.isOverdue).toBe(false);
  });

  it('deadline vencido y no completada → isOverdue true, daysRemaining negativo', () => {
    const goal: Goal = { ...baseGoal, deadline: '2025-01-01' };
    const result = calculateGoalProgress(goal, new Date('2025-06-15'));
    expect(result.daysRemaining).toBeLessThan(0);
    expect(result.isOverdue).toBe(true);
  });

  it('deadline vencido pero completada → no overdue', () => {
    const goal: Goal = { ...baseGoal, deadline: '2025-01-01', currentAmount: 10000 };
    const result = calculateGoalProgress(goal, new Date('2025-06-15'));
    expect(result.isCompleted).toBe(true);
    expect(result.isOverdue).toBe(false);
  });

  it('targetAmount=0 → 0% (no divide por cero)', () => {
    const goal: Goal = { ...baseGoal, targetAmount: 0, currentAmount: 1000 };
    const result = calculateGoalProgress(goal, new Date('2025-06-15'));
    expect(result.percentage).toBe(0);
    expect(result.rawPercentage).toBe(0);
  });

  it('daysRemaining usa medianoche para evitar off-by-one', () => {
    const goal: Goal = { ...baseGoal, deadline: '2025-06-20' };
    // 15 junio 23:59 → todavía faltan ~5 días
    const result = calculateGoalProgress(goal, new Date('2025-06-15T23:59:59'));
    expect(result.daysRemaining).toBe(5);
  });
});
