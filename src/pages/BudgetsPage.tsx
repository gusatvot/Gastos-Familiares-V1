import { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
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

  // Formulario
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: ''
  });

  // Mes actual
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthName = new Date().toLocaleString('es-AR', { month: 'long', year: 'numeric' });

  // Calcular gastos del mes actual por categoría
  const spentByCategory = useMemo(() => {
    const spent: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
      .forEach(t => {
        const cat = categories.find(c => c.name === t.category);
        if (cat && cat.id) {
          spent[cat.id] = (spent[cat.id] || 0) + t.amount;
        }
      });
    return spent;
  }, [transactions, categories, currentMonth]);

  const budgetedCategoryIds = budgets.map(b => b.categoryId);
  const availableCategories = categories.filter(c => 
    c.type === 'expense' && c.id && (!budgetedCategoryIds.includes(c.id) || c.id === editingId)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId || !formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Datos inválidos', { description: 'Seleccioná una categoría y un monto válido.' });
      return;
    }

    try {
      const budgetData = {
        categoryId: formData.categoryId,
        amount: parseFloat(formData.amount),
        month: currentMonth
      };

      if (editingId) {
        await updateBudget({ id: editingId, ...budgetData });
        toast.success('¡Presupuesto actualizado! ✨');
      } else {
        await addBudget(budgetData);
        toast.success('¡Presupuesto creado! 🎉');
      }

      setFormData({ categoryId: '', amount: '' });
      setEditingId(null);
    } catch {
      toast.error('Error', { description: 'No se pudo guardar el presupuesto.' });
    }
  };

  const handleEdit = (budget: { id: string; categoryId: string; amount: number }) => {
    setEditingId(budget.id);
    setFormData({
      categoryId: budget.categoryId,
      amount: budget.amount.toString()
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ categoryId: '', amount: '' });
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'from-red-400 to-rose-500';
    if (percentage >= 75) return 'from-yellow-400 to-orange-400';
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

              const spent = spentByCategory[budget.categoryId] || 0;
              const percentage = Math.min((spent / budget.amount) * 100, 100);
              const remaining = budget.amount - spent;
              const isOverBudget = spent > budget.amount;

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
                              <CheckCircle2 className="w-3 h-3" /> Te queda {formatCurrency(remaining)}
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
                      <span className="text-gray-700 dark:text-gray-300">{formatCurrency(spent)} gastado</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(budget.amount)} límite</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(percentage)} transition-all duration-700 ease-out shadow-sm`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold ${
                        percentage >= 100 ? 'text-red-500' : percentage >= 75 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
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
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">Categoría</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className={`${inputClass} ${!formData.categoryId ? 'text-gray-400' : ''}`}
                disabled={!!editingId}
              >
                <option value="">Seleccionar categoría</option>
                {availableCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">Límite de gasto</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0"
                  min="0"
                  className={`${inputClass} pl-11`}
                />
              </div>
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
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
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