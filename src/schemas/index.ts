/**
 * Esquemas Zod para validación de formularios.
 *
 * Una sola fuente de verdad para las reglas de validación:
 *   - Los forms las usan vía react-hook-form + @hookform/resolvers/zod
 *   - Podrían reutilizarse en el backend (Cloud Functions) si fuera necesario
 *
 * Las regex y mensajes están en español argentino para consistencia con la UI.
 */

import { z } from 'zod';

// ============================================================
// Constantes
// ============================================================

const MAX_NAME = 100;
const MAX_DESCRIPTION = 500;
const MAX_AMOUNT = 1_000_000_000; // mil millones ARS
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// ============================================================
// Transacción
// ============================================================

export const transactionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(MAX_NAME, `Máximo ${MAX_NAME} caracteres`),
  amount: z.coerce
    .number({ message: 'Monto inválido' })
    .positive('El monto debe ser mayor a 0')
    .max(MAX_AMOUNT, 'Monto demasiado grande'),
  date: z
    .string()
    .min(1, 'La fecha es obligatoria')
    .regex(ISO_DATE_REGEX, 'Formato de fecha inválido'),
  type: z.enum(['income', 'expense']),
  category: z
    .string()
    .min(1, 'Seleccioná una categoría'),
  description: z
    .string()
    .max(MAX_DESCRIPTION, `Máximo ${MAX_DESCRIPTION} caracteres`)
    .optional()
    .or(z.literal('')),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

// ============================================================
// Categoría
// ============================================================

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(MAX_NAME, `Máximo ${MAX_NAME} caracteres`),
  type: z.enum(['income', 'expense']),
  icon: z
    .string()
    .min(1, 'Seleccioná un ícono'),
  color: z
    .string()
    .regex(HEX_COLOR_REGEX, 'Color inválido (formato #RRGGBB)'),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// ============================================================
// Presupuesto
// ============================================================

export const budgetSchema = z.object({
  categoryId: z
    .string()
    .min(1, 'Seleccioná una categoría'),
  amount: z.coerce
    .number({ message: 'Monto inválido' })
    .positive('El monto debe ser mayor a 0')
    .max(MAX_AMOUNT, 'Monto demasiado grande'),
});

export type BudgetFormValues = z.infer<typeof budgetSchema>;

// ============================================================
// Meta
// ============================================================

export const goalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(MAX_NAME, `Máximo ${MAX_NAME} caracteres`),
  icon: z
    .string()
    .min(1, 'Seleccioná un ícono'),
  color: z
    .string()
    .regex(HEX_COLOR_REGEX, 'Color inválido (formato #RRGGBB)'),
  targetAmount: z.coerce
    .number({ message: 'Monto inválido' })
    .positive('El objetivo debe ser mayor a 0')
    .max(MAX_AMOUNT, 'Monto demasiado grande'),
  deadline: z
    .string()
    .min(1, 'La fecha límite es obligatoria')
    .regex(ISO_DATE_REGEX, 'Formato de fecha inválido'),
});

export type GoalFormValues = z.infer<typeof goalSchema>;

// ============================================================
// Contribución
// ============================================================

export const contributionSchema = z.object({
  amount: z.coerce
    .number({ message: 'Monto inválido' })
    .positive('El aporte debe ser mayor a 0')
    .max(MAX_AMOUNT, 'Monto demasiado grande'),
  date: z
    .string()
    .min(1, 'La fecha es obligatoria')
    .regex(ISO_DATE_REGEX, 'Formato de fecha inválido'),
  description: z
    .string()
    .max(MAX_DESCRIPTION, `Máximo ${MAX_DESCRIPTION} caracteres`)
    .optional()
    .or(z.literal('')),
});

export type ContributionFormValues = z.infer<typeof contributionSchema>;

// ============================================================
// Backup (importData)
// ============================================================

export const backupSchema = z.object({
  version: z.string(),
  exportDate: z.string(),
  userId: z.string().optional(),
  userEmail: z.string().email().optional(),
  data: z.object({
    transactions: z.array(z.any()).optional(),
    categories: z.array(z.any()).optional(),
    budgets: z.array(z.any()).optional(),
    goals: z.array(z.any()).optional(),
    contributions: z.array(z.any()).optional(),
  }),
});

export type BackupData = z.infer<typeof backupSchema>;
