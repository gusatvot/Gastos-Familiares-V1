/**
 * Tipos canónicos del dominio de Gastos Familiares.
 *
 * Todos los componentes y contexts DEBEN importar los tipos desde aquí.
 * No redefinir interfaces localmente.
 *
 * Convención de opcionabilidad:
 *   - `id?`        : ausente antes de persistir en Firestore, presente tras el primer write
 *   - `userId?`    : ausente en tipos "puros" del dominio; lo agrega AppContext antes de persistir
 *   - `createdAt?` : lo gestiona AppContext, no el consumidor
 */

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id?: string;
  name: string;
  amount: number;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: string; // nombre de la categoría (denormalizado para reports)
  description?: string;
  userId?: string;
  createdAt?: string; // ISO
}

export interface Category {
  id?: string;
  name: string;
  icon: string; // emoji
  color: string; // #RRGGBB
  type: TransactionType;
  userId?: string;
}

export interface Budget {
  id?: string;
  categoryId: string;
  amount: number;
  month: string; // YYYY-MM
  userId?: string;
}

export interface Goal {
  id?: string;
  name: string;
  icon: string;
  color: string; // #RRGGBB
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  userId?: string;
  createdAt?: string; // ISO
}

export interface Contribution {
  id?: string;
  goalId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  description?: string;
  userId?: string;
}

/** DTO para crear una transacción: omite campos gestionados por la capa de datos. */
export type NewTransaction = Omit<Transaction, 'id' | 'createdAt' | 'userId'>;
export type NewCategory = Omit<Category, 'id' | 'userId'>;
export type NewBudget = Omit<Budget, 'id' | 'userId'>;
export type NewGoal = Omit<Goal, 'id' | 'userId' | 'createdAt' | 'currentAmount'>;
export type NewContribution = Omit<Contribution, 'id' | 'userId'>;
