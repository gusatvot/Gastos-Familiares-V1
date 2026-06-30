import { z } from 'zod';

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

// Schema de validación para transacciones usando Zod
export const transactionSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(100, 'Nombre demasiado largo'),
  amount: z.string().min(1, 'Monto obligatorio').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'Monto inválido'
  ),
  date: z.string().min(1, 'La fecha es obligatoria'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Seleccioná una categoría'),
  description: z.string().max(500, 'Descripción demasiado larga').optional()
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
