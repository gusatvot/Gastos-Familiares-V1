import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppContext } from '../hooks/useAppContext';
import { calculateBudgetProgress, formatCurrency, getMonthKey } from '../utils/finance';
import { budgetSchema } from '../schemas';
import { toast } from 'sonner';
import ConfirmModal from '../components/ConfirmModal';
import {
  PiggyBank,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export default function BudgetsPage() {
  const { budgets, categories, transactions, addBudget, updateBudget, deleteBudget } = useAppContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>('');

  const BUDGET_DEFAULTS = {
    categoryId: '',
    amount: '',
  };
  type BudgetInput = typeof BUDGET_DEFAULTS;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema) as never,
    defaultValues: BUDGET_DEFAULTS,
  });

  // Mes actual
  const currentMonth = getMonthKey();
  const monthName = new Date().toLocaleString('es-AR', { month: 'long', year: 'numeric' });

  const watchedCategoryId = watch('categoryId');

  const budgetedCategoryIds = budgets.map(b => b.categoryId);
  const availableCategories = categories.filter(c => 
    c.type === 'expense' && c.id && (!budgetedCategoryIds.includes(c.id) || c.id === editingId)
  );

  const onSubmit = async (values: BudgetInput) => {
    try {
      const budgetData = {
        categoryId: values.categoryId,
        amount: Number(values.amount),
        month: currentMonth
      };

      if (editingId) {
        await updateBudget({ id: editingId, ...budgetData });
        toast.success('¡Presupuesto actualizado! ✨');
      } else {
        await addBudget(budgetData);
        toast.success('¡Presupuesto creado! 🎉');
      }

      reset(BUDGET_DEFAULTS);
      setEditingId(null);
    } catch {
      toast.error('Error', { description: 'No se pudo guardar el presupuesto.' });
    }
  };

  const handleEdit = (budget: { id: string; categoryId: string; amount: number }) => {
    setEditingId(budget.id);
    setValue('categoryId', budget.categoryId, { shouldValidate: true });
    setValue('amount', String(budget.amount), { shouldValidate: true });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset(BUDGET_DEFAULTS);
  };

  const handleDeleteClick = (id: string, categoryName: string) => {
    setDeleteId(id);
    setDeleteName(categoryName);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteBudget(deleteId);
        toast.success('Presupuesto eliminado');
        if (editingId === deleteId) handleCancelEdit();
      } catch {
        toast.error('Error al eliminar');
      }
      setDeleteId(null);
    }
  };

  const formatCurrencyLocal = (amount: number) => formatCurrency(amount, { noCents: true });

  const getProgressColor = (status: 'ok' | 'warning' | 'over') => {
    if (status === 'over') return 'from-red-400 to-rose-500';
    if (status === 'warning') return 'from-yellow-400 to-orange-400';
    return 'from-green-400 to-emerald-500';
  };

  const inputClass = `w-full px-4 py-2.5 rounded-2xl border-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 focus:border-purple-400 outline-none transition-all`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <PiggyBank className="w-8 h-8 text-pink-500" />
          Presupuestos
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1 capitalize">
          Control de gastos para {monthName}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lista de Presupuestos (2 columnas) */}
        <div className="lg:col-span-2 space-y-4">
          {budgets.length === 0 ? (
            <div className="card-soft p-12 text-center">
              <div className="text-6xl mb-4 animate-float">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sin presupuestos activos</h3>
              <p className="text-gray-500 dark:text-gray-400">Creá tu primer presupuesto para empezar a controlar tus gastos.</p>
            </div>
          ) : (
            budgets.map(budget => {
              const category = categories.find(c => c.id === budget.categoryId);
              if (!category) return null;

              const progress = calculateBudgetProgress(budget, transactions, categories);
              const { spent, budgeted, remaining, percentage, isOverBudget, status } = progress;

              return (
                <div key={budget.id} className="card-soft p-5 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{category.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          {isOverBudget ? (
                            <span className="text-red-500 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> ¡Te pasaste!
                            </span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Te queda {formatCurrencyLocal(remaining)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit({ id: budget.id || '', categoryId: budget.categoryId, amount: budget.amount })}
                        className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(budget.id!, category.name)}
                        className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-gray-700 dark:text-gray-300">{formatCurrencyLocal(spent)} gastado</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrencyLocal(budgeted)} límite</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(status)} transition-all duration-700 ease-out shadow-sm`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold ${
                        status === 'over' ? 'text-red-500' : status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                      }`}>
                        {percentage.toFixed(0)}% utilizado
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Formulario (1 columna) */}
        <div className="card-soft p-5 h-fit sticky top-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-500" />
            {editingId ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">Categoría</label>
              <select
                className={`${inputClass} ${!watchedCategoryId ? 'text-gray-400' : ''}`}
                disabled={!!editingId}
                {...register('categoryId')}
              >
                <option value="">Seleccionar categoría</option>
                {availableCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-xs text-red-400 mt-1 font-bold">{errors.categoryId.message}</p>}
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">Límite de gasto</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  className={`${inputClass} pl-11`}
                  {...register('amount')}
                />
              </div>
              {errors.amount && <p className="text-xs text-red-400 mt-1 font-bold">{errors.amount.message}</p>}
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-bold rounded-2xl transition"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={deleteId !== null}
        title="¿Eliminar presupuesto?"
        message={`¿Estás seguro de que querés eliminar el presupuesto de "${deleteName}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}