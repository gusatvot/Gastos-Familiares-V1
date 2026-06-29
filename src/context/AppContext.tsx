import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';

// Tipos
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id?: string;
  name: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: string;
  description?: string;
  userId?: string;
  createdAt?: string;
}

export interface Category {
  id?: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  userId?: string;
}

export interface Budget {
  id?: string;
  categoryId: string;
  amount: number;
  month: string;
  userId?: string;
}

export interface Goal {
  id?: string;
  name: string;
  icon: string;
  color: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  userId?: string;
  createdAt?: string;
}

export interface Contribution {
  id?: string;
  goalId: string;
  amount: number;
  date: string;
  description?: string;
  userId?: string;
}

// Helper para limpiar undefined
const cleanData = (data: Record<string, unknown>): Record<string, unknown> => {
  const cleaned: Record<string, unknown> = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) {
      cleaned[key] = data[key];
    }
  });
  return cleaned;
};

// Tipo del Contexto
interface AppContextType {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  contributions: Contribution[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'userId'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'userId'>) => Promise<void>;
  updateBudget: (budget: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'currentAmount'>) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addContribution: (contribution: Omit<Contribution, 'id' | 'userId'>) => Promise<void>;
  deleteContribution: (id: string) => Promise<void>;
  exportData: () => Promise<boolean>;
  importData: (file: File) => Promise<boolean>;
  clearAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  // Escuchar categorías
  useEffect(() => {
    if (!user) { const t = setTimeout(() => setLoading(false), 0); return () => clearTimeout(t); }
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
      setCategories(data);
      // Ya no carga datos iniciales automáticamente
      setLoading(false);
    }, (error) => { console.error('Error categorías:', error); setLoading(false); });
    return () => unsubscribe();
  }, [user]);

  // Escuchar transacciones
  useEffect(() => {
    if (!user) return;
    const transactionsRef = collection(db, 'transactions');
    const q = query(transactionsRef, where('userId', '==', user.uid), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[];
      setTransactions(data);
    }, (error) => { console.error('Error transacciones:', error); });
    return () => unsubscribe();
  }, [user]);

  // Escuchar presupuestos
  useEffect(() => {
    if (!user) return;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const budgetsRef = collection(db, 'budgets');
    const q = query(budgetsRef, where('userId', '==', user.uid), where('month', '==', currentMonth));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Budget[];
      setBudgets(data);
    }, (error) => { console.error('Error presupuestos:', error); });
    return () => unsubscribe();
  }, [user]);

  // Escuchar metas
  useEffect(() => {
    if (!user) return;
    const goalsRef = collection(db, 'goals');
    const q = query(goalsRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Goal[];
      setGoals(data);
    }, (error) => { console.error('Error metas:', error); });
    return () => unsubscribe();
  }, [user]);

  // Escuchar contribuciones
  useEffect(() => {
    if (!user) return;
    const contributionsRef = collection(db, 'contributions');
    const q = query(contributionsRef, where('userId', '==', user.uid), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Contribution[];
      setContributions(data);
    }, (error) => { console.error('Error contribuciones:', error); });
    return () => unsubscribe();
  }, [user]);

  // ========== TRANSACCIONES ==========
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) throw new Error('Usuario no autenticado');
    try {
      await addDoc(collection(db, 'transactions'), cleanData({ ...transaction, userId: user.uid, createdAt: new Date().toISOString() }));
    } catch (error) { console.error('Error addTransaction:', error); throw error; }
  };

  const updateTransaction = async (transaction: Transaction) => {
    if (!user) throw new Error('Usuario no autenticado');
    try {
      await updateDoc(doc(db, 'transactions', transaction.id!), cleanData({ ...transaction, userId: user.uid }));
    } catch (error) { console.error('Error updateTransaction:', error); throw error; }
  };

  const deleteTransaction = async (id: string) => {
    try { await deleteDoc(doc(db, 'transactions', id)); }
    catch (error) { console.error('Error deleteTransaction:', error); throw error; }
  };

  // ========== CATEGORÍAS ==========
  const addCategory = async (category: Omit<Category, 'id' | 'userId'>) => {
    if (!user) throw new Error('Usuario no autenticado');
    try { await addDoc(collection(db, 'categories'), cleanData({ ...category, userId: user.uid })); }
    catch (error) { console.error('Error addCategory:', error); throw error; }
  };

  const updateCategory = async (category: Category) => {
    if (!user) throw new Error('Usuario no autenticado');
    try { await updateDoc(doc(db, 'categories', category.id!), cleanData({ ...category, userId: user.uid })); }
    catch (error) { console.error('Error updateCategory:', error); throw error; }
  };

  const deleteCategory = async (id: string) => {
    try { await deleteDoc(doc(db, 'categories', id)); }
    catch (error) { console.error('Error deleteCategory:', error); throw error; }
  };

  // ========== PRESUPUESTOS ==========
  const addBudget = async (budget: Omit<Budget, 'id' | 'userId'>) => {
    if (!user) throw new Error('Usuario no autenticado');
    try { await addDoc(collection(db, 'budgets'), cleanData({ ...budget, userId: user.uid })); }
    catch (error) { console.error('Error addBudget:', error); throw error; }
  };

  const updateBudget = async (budget: Budget) => {
    if (!user) throw new Error('Usuario no autenticado');
    try { await updateDoc(doc(db, 'budgets', budget.id!), cleanData({ ...budget, userId: user.uid })); }
    catch (error) { console.error('Error updateBudget:', error); throw error; }
  };

  const deleteBudget = async (id: string) => {
    try { await deleteDoc(doc(db, 'budgets', id)); }
    catch (error) { console.error('Error deleteBudget:', error); throw error; }
  };

  // ========== METAS ==========
  const addGoal = async (goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'currentAmount'>) => {
    if (!user) throw new Error('Usuario no autenticado');
    try {
      await addDoc(collection(db, 'goals'), cleanData({ ...goal, currentAmount: 0, userId: user.uid, createdAt: new Date().toISOString() }));
    } catch (error) { console.error('Error addGoal:', error); throw error; }
  };

  const updateGoal = async (goal: Goal) => {
    if (!user) throw new Error('Usuario no autenticado');
    try {
      await updateDoc(doc(db, 'goals', goal.id!), cleanData({ ...goal, userId: user.uid }));
    } catch (error) { console.error('Error updateGoal:', error); throw error; }
  };

  const deleteGoal = async (id: string) => {
    try { await deleteDoc(doc(db, 'goals', id)); }
    catch (error) { console.error('Error deleteGoal:', error); throw error; }
  };

  // ========== CONTRIBUCIONES ==========
  const addContribution = async (contribution: Omit<Contribution, 'id' | 'userId'>) => {
    if (!user) throw new Error('Usuario no autenticado');
    try {
      await addDoc(collection(db, 'contributions'), cleanData({ ...contribution, userId: user.uid }));
      const goal = goals.find(g => g.id === contribution.goalId);
      if (goal) {
        const newAmount = goal.currentAmount + contribution.amount;
        await updateDoc(doc(db, 'goals', goal.id!), { currentAmount: newAmount });
      }
    } catch (error) { console.error('Error addContribution:', error); throw error; }
  };

  const deleteContribution = async (id: string) => {
    try {
      const contribution = contributions.find(c => c.id === id);
      if (contribution) {
        const goal = goals.find(g => g.id === contribution.goalId);
        if (goal) {
          const newAmount = Math.max(0, goal.currentAmount - contribution.amount);
          await updateDoc(doc(db, 'goals', goal.id!), { currentAmount: newAmount });
        }
        await deleteDoc(doc(db, 'contributions', id));
      }
    } catch (error) { console.error('Error deleteContribution:', error); throw error; }
  };

  // ========== LIMPIAR DATOS ==========
  const clearAllData = async () => {
    if (!user) throw new Error('Usuario no autenticado');
    const batchDelete = async (collectionName: string, items: Array<{id?: string}>) => {
      for (const item of items) {
        if (item.id) {
          await deleteDoc(doc(db, collectionName, item.id));
        }
      }
    };
    await batchDelete('transactions', transactions);
    await batchDelete('contributions', contributions);
    await batchDelete('budgets', budgets);
    await batchDelete('goals', goals);
    await batchDelete('categories', categories);
  };

  // ========== BACKUP ==========
  const exportData = async () => {
    if (!user) throw new Error('Usuario no autenticado');
    try {
      const backupData = {
        version: '2.1',
        exportDate: new Date().toISOString(),
        userId: user.uid,
        userEmail: user.email,
        data: {
          transactions,
          categories,
          budgets,
          goals,
          contributions
        }
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `gastos-familiares-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error al exportar datos:', error);
      throw error;
    }
  };

  const importData = async (file: File) => {
    if (!user) throw new Error('Usuario no autenticado');
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      if (!backupData.data || !backupData.version) {
        throw new Error('Archivo de backup inválido');
      }

      const { 
        transactions: importedTransactions, 
        categories: importedCategories, 
        budgets: importedBudgets, 
        goals: importedGoals, 
        contributions: importedContributions 
      } = backupData.data;

      // Limpiar datos existentes del usuario
      const batchDelete = async (collectionName: string, items: Array<{id?: string}>) => {
        for (const item of items) {
          if (item.id) {
            await deleteDoc(doc(db, collectionName, item.id));
          }
        }
      };

      await batchDelete('transactions', transactions);
      await batchDelete('categories', categories);
      await batchDelete('budgets', budgets);
      await batchDelete('goals', goals);
      await batchDelete('contributions', contributions);

      // Importar nuevos datos
      const importCollection = async (collectionName: string, items: Array<{id?: string; [key: string]: unknown}>) => {
        for (const item of items) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...data } = item;
          await addDoc(collection(db, collectionName), {
            ...data,
            userId: user.uid
          });
        }
      };

      if (importedCategories) await importCollection('categories', importedCategories);
      if (importedTransactions) await importCollection('transactions', importedTransactions);
      if (importedBudgets) await importCollection('budgets', importedBudgets);
      if (importedGoals) await importCollection('goals', importedGoals);
      if (importedContributions) await importCollection('contributions', importedContributions);

      return true;
    } catch (error) {
      console.error('Error al importar datos:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{ 
      transactions, categories, budgets, goals, contributions, loading,
      addTransaction, updateTransaction, deleteTransaction,
      addCategory, updateCategory, deleteCategory,
      addBudget, updateBudget, deleteBudget,
      addGoal, updateGoal, deleteGoal,
      addContribution, deleteContribution,
      exportData,
      importData,
      clearAllData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export { AppContext };