import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppContext } from '../hooks/useAppContext';
import type { Transaction } from '../types';
import { transactionSchema } from '../schemas';
import { toast } from 'sonner';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Tag,
  FileText,
  Save,
  X,
} from 'lucide-react';

interface EditTransactionModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

// Inputs text/number usan strings en el form; el schema coerce a number.
const EMPTY_DEFAULTS = {
  name: '',
  amount: '',
  date: '',
  type: 'expense' as 'income' | 'expense',
  category: '',
  description: '',
};

type TransactionInput = typeof EMPTY_DEFAULTS;

export default function EditTransactionModal({
  isOpen,
  transaction,
  onClose,
}: EditTransactionModalProps) {
  const { categories, updateTransaction } = useAppContext();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema) as never,
    defaultValues: EMPTY_DEFAULTS,
  });

  // Sincroniza el form cuando cambia la transacción recibida.
  // Mucho más limpio que el setTimeout(0) anterior: RHF expone reset()
  // que reemplaza el estado interno en un solo llamado atómico.
  useEffect(() => {
    if (transaction) {
      reset({
        name: transaction.name,
        amount: String(transaction.amount),
        date: transaction.date,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description || '',
      });
    }
  }, [transaction, reset]);

  const type = watch('type');
  const filteredCategories = categories.filter((c) => c.type === type);

  const onSubmit = async (values: TransactionInput) => {
    if (!transaction) return;
    try {
      await updateTransaction({
        ...transaction,
        name: values.name,
        amount: Number(values.amount),
        date: values.date,
        type: values.type,
        category: values.category,
        description: values.description || undefined,
      });

      toast.success('¡Actualizado! ✨', {
        description: `"${values.name}" fue modificada.`,
      });

      onClose();
    } catch {
      toast.error('Error', { description: 'No se pudo actualizar.' });
    }
  };

  if (!isOpen || !transaction) return null;

  const inputClass = (hasError: boolean) =>
    `w-full pl-10 pr-4 py-2 rounded-2xl border-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-0 focus:border-purple-400 transition-all outline-none ${
      hasError ? 'border-red-400' : 'border-gray-200'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border-2 border-purple-200 dark:border-purple-800/50">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-b border-purple-200 dark:border-purple-800/50 px-4 py-3 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Editar Transacción
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Modificá los campos ✏️</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3">
          {/* Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
              Tipo de Transacción
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setValue('type', 'expense', { shouldValidate: true });
                  setValue('category', '', { shouldValidate: true });
                }}
                className={`py-2 px-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                  type === 'expense'
                    ? 'bg-gradient-to-r from-red-400 to-orange-400 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Gasto
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('type', 'income', { shouldValidate: true });
                  setValue('category', '', { shouldValidate: true });
                }}
                className={`py-2 px-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                  type === 'income'
                    ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Ingreso
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">Nombre *</label>
            <input
              type="text"
              placeholder="Ej: Supermercado 🛒"
              className={`w-full px-4 py-2.5 rounded-2xl border-2 bg-white text-gray-900 placeholder-gray-500 focus:border-purple-400 outline-none transition-all ${
                errors.name ? 'border-red-400' : 'border-gray-200'
              }`}
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-red-400 mt-1 font-bold">{errors.name.message}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">Monto *</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="0.00" className={inputClass(!!errors.amount)} {...register('amount')} />
            </div>
            {errors.amount && <p className="text-xs text-red-400 mt-1 font-bold">{errors.amount.message}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">Fecha *</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="date" className={inputClass(!!errors.date)} {...register('date')} />
            </div>
            {errors.date && <p className="text-xs text-red-400 mt-1 font-bold">{errors.date.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">Categoría *</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select className={inputClass(!!errors.category)} {...register('category')}>
                <option value="">Seleccionar categoría</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.category && <p className="text-xs text-red-400 mt-1 font-bold">{errors.category.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
              Descripción (opcional)
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <textarea
                rows={2}
                placeholder="Detalles adicionales..."
                className="w-full pl-12 pr-4 py-2.5 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-purple-400 outline-none transition-all resize-none"
                {...register('description')}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-bold rounded-2xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-2.5 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                type === 'expense'
                  ? 'bg-gradient-to-r from-red-400 to-orange-400 hover:from-red-500 hover:to-orange-500'
                  : 'bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500'
              }`}
            >
              <Save className="w-5 h-5" />
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
