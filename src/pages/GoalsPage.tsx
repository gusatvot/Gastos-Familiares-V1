import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppContext } from '../hooks/useAppContext';
import type { Goal } from '../types';
import { calculateGoalProgress, formatCurrency as formatCurrencyUtil, formatDate as formatDateUtil, getDateKey } from '../utils/finance';
import { goalSchema, contributionSchema } from '../schemas';
import { toast } from 'sonner';
import ConfirmModal from '../components/ConfirmModal';
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit2, 
  Calendar, 
  Coins, 
  TrendingUp,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react';

export default function GoalsPage() {
  const { goals, contributions, addGoal, updateGoal, deleteGoal, addContribution, deleteContribution } = useAppContext();
  
  const GOAL_DEFAULTS = {
    name: '',
    icon: '🎯',
    color: '#a855f7',
    targetAmount: '',
    deadline: '',
  };
  type GoalInput = typeof GOAL_DEFAULTS;

  const CONTRIBUTION_DEFAULTS = {
    amount: '',
    date: getDateKey(),
    description: '',
  };
  type ContributionInput = typeof CONTRIBUTION_DEFAULTS;

  const goalForm = useForm<GoalInput>({
    resolver: zodResolver(goalSchema) as never,
    defaultValues: GOAL_DEFAULTS,
  });

  const contributionForm = useForm<ContributionInput>({
    resolver: zodResolver(contributionSchema) as never,
    defaultValues: CONTRIBUTION_DEFAULTS,
  });

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>('');
  const [deleteType, setDeleteType] = useState<'goal' | 'contribution'>('goal');

  const emojiOptions = ['🎯', '🚗', '🏠', '💻', '📱', '👶', '💍', '🛥️', '🎓', '🎸', '🎮', '✈️'];

  const handleSubmitGoal = goalForm.handleSubmit(async (values: GoalInput) => {
    try {
      const goalData = {
        name: values.name,
        icon: values.icon,
        color: values.color,
        targetAmount: Number(values.targetAmount),
        deadline: values.deadline
      };

      if (editingGoal) {
        await updateGoal({ id: editingGoal.id, ...goalData, currentAmount: editingGoal.currentAmount });
        toast.success('¡Meta actualizada! ✨');
      } else {
        await addGoal(goalData);
        toast.success('¡Meta creada! 🎉');
      }

      goalForm.reset(GOAL_DEFAULTS);
      setShowForm(false);
      setEditingGoal(null);
    } catch {
      toast.error('Error', { description: 'No se pudo guardar la meta.' });
    }
  });

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    goalForm.reset({
      name: goal.name,
      icon: goal.icon,
      color: goal.color,
      targetAmount: String(goal.targetAmount),
      deadline: goal.deadline
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingGoal(null);
    goalForm.reset(GOAL_DEFAULTS);
    setShowForm(false);
  };

  const handleDeleteClick = (id: string, name: string, type: 'goal' | 'contribution') => {
    setDeleteId(id);
    setDeleteName(name);
    setDeleteType(type);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      if (deleteType === 'goal') {
        await deleteGoal(deleteId);
        toast.success('Meta eliminada');
        if (selectedGoal?.id === deleteId) setSelectedGoal(null);
      } else {
        await deleteContribution(deleteId);
        toast.success('Aporte eliminado');
      }
    } catch {
      toast.error('Error al eliminar');
    }
    setDeleteId(null);
  };

  const handleAddContribution = contributionForm.handleSubmit(async (values: ContributionInput) => {
    if (!selectedGoal) return;

    try {
      await addContribution({
        goalId: selectedGoal.id || '',
        amount: Number(values.amount),
        date: values.date,
        description: values.description
      });
      
      toast.success('¡Aporte registrado! 💰');
      contributionForm.reset(CONTRIBUTION_DEFAULTS);
    } catch {
      toast.error('Error', { description: 'No se pudo registrar el aporte.' });
    }
  });

  const formatCurrency = (amount: number) => formatCurrencyUtil(amount, { noCents: true });

  const formatDate = (dateStr: string) => formatDateUtil(dateStr, { withYear: true });

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'from-green-400 to-emerald-500';
    if (percentage >= 75) return 'from-yellow-400 to-orange-400';
    return 'from-blue-400 to-purple-500';
  };

  const inputClass = `w-full px-4 py-2.5 rounded-2xl border-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 focus:border-purple-400 outline-none transition-all`;

  const selectedGoalContributions = useMemo(() => {
    if (!selectedGoal) return [];
    return contributions.filter(c => c.goalId === selectedGoal.id);
  }, [selectedGoal, contributions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-8 h-8 text-purple-500" />
            Metas de Ahorro
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Definí tus objetivos y alcanzalos paso a paso
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingGoal(null); goalForm.reset(GOAL_DEFAULTS); }}
          className="btn-soft bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Meta
        </button>
      </div>

      {/* Modal de formulario de meta */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCancelEdit} />
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border-2 border-purple-200 dark:border-purple-800/50 overflow-hidden">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 px-5 py-4 flex justify-between items-center border-b border-purple-200 dark:border-purple-800/50">
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {editingGoal ? 'Editar Meta' : 'Nueva Meta'}
              </h2>
              <button onClick={handleCancelEdit} className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition">
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitGoal} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">Nombre</label>
                <input type="text" placeholder="Ej: Vacaciones, Auto nuevo..." className={inputClass} {...goalForm.register('name')} />
                {goalForm.formState.errors.name && <p className="text-xs text-red-400 mt-1 font-bold">{goalForm.formState.errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">Ícono</label>
                <div className="grid grid-cols-6 gap-2">
                  {emojiOptions.map((emoji) => (
                    <button key={emoji} type="button" onClick={() => goalForm.setValue('icon', emoji, { shouldValidate: true })}
                      className={`p-2 text-xl rounded-xl transition ${
                        goalForm.watch('icon') === emoji ? 'bg-purple-100 dark:bg-purple-900/40 border-2 border-purple-400 scale-110' : 'bg-gray-50 dark:bg-slate-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">Color</label>
                <input type="color" className="w-full h-10 rounded-xl cursor-pointer border-2 border-gray-200 dark:border-slate-700 p-1" {...goalForm.register('color')} />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">Monto objetivo</label>
                <input type="number" placeholder="0" min="0" className={inputClass} {...goalForm.register('targetAmount')} />
                {goalForm.formState.errors.targetAmount && <p className="text-xs text-red-400 mt-1 font-bold">{goalForm.formState.errors.targetAmount.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">Fecha límite</label>
                <input type="date" className={inputClass} {...goalForm.register('deadline')} />
                {goalForm.formState.errors.deadline && <p className="text-xs text-red-400 mt-1 font-bold">{goalForm.formState.errors.deadline.message}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={handleCancelEdit} className="flex-1 py-2.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-bold rounded-2xl transition">
                  Cancelar
                </button>
                <button type="submit" disabled={goalForm.formState.isSubmitting} className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg">
                  {editingGoal ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid de metas */}
      {goals.length === 0 ? (
        <div className="card-soft p-12 text-center">
          <div className="text-6xl mb-4 animate-float">🎯</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sin metas definidas</h3>
          <p className="text-gray-500 dark:text-gray-400">Creá tu primera meta de ahorro para empezar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(goal => {
            const progress = calculateGoalProgress(goal);
            const percentage = progress.percentage;
            const daysLeft = progress.daysRemaining;
            const isCompleted = progress.isCompleted;

            return (
              <div 
                key={goal.id} 
                onClick={() => setSelectedGoal(goal)}
                className={`card-soft p-5 cursor-pointer hover:scale-[1.02] transition-all border-2 ${
                  selectedGoal?.id === goal.id ? 'border-purple-400 dark:border-purple-500' : 'border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                      style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                    >
                      {goal.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{goal.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        {isCompleted ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Clock className="w-3 h-3" />}
                        {isCompleted ? 'Completada' : `${daysLeft} días restantes`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEditGoal(goal); }}
                    className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-gray-900 dark:text-white">{formatCurrency(goal.currentAmount)}</span>
                    <span className="text-gray-500 dark:text-gray-400">de {formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(percentage)} transition-all duration-700 ease-out shadow-sm`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{percentage.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Panel de detalle de meta seleccionada */}
      {selectedGoal && (
        <div className="card-soft p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-sm"
                style={{ backgroundColor: `${selectedGoal.color}20`, color: selectedGoal.color }}
              >
                {selectedGoal.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedGoal.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Límite: {formatDate(selectedGoal.deadline)}
                </p>
              </div>
            </div>
            <button
              onClick={() => selectedGoal.id && handleDeleteClick(selectedGoal.id, selectedGoal.name, 'goal')}
              className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Formulario de aporte */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-5 rounded-2xl mb-6 border-2 border-purple-100 dark:border-purple-800/30">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Coins className="w-5 h-5 text-purple-500" /> Agregar aporte
            </h3>
            <form onSubmit={handleAddContribution} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative md:col-span-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input type="number" placeholder="Monto" min="1" className={`${inputClass} pl-8`} {...contributionForm.register('amount')} />
                {contributionForm.formState.errors.amount && <p className="text-xs text-red-400 mt-1 font-bold col-span-full">{contributionForm.formState.errors.amount.message}</p>}
              </div>
              <input type="date" className={inputClass} {...contributionForm.register('date')} />
              <input type="text" placeholder="Descripción (opcional)" className={inputClass} {...contributionForm.register('description')} />
              <button type="submit" disabled={contributionForm.formState.isSubmitting} className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-2xl transition shadow-md flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Aportar
              </button>
            </form>
          </div>

          {/* Historial de aportes */}
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" /> Historial de aportes ({selectedGoalContributions.length})
          </h3>
          {selectedGoalContributions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-6 bg-gray-50 dark:bg-slate-800 rounded-2xl">Aún no hay aportes registrados</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {selectedGoalContributions.map(contrib => (
                <div key={contrib.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-700 transition group border border-gray-100 dark:border-slate-700">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(contrib.amount)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(contrib.date)} {contrib.description && `• ${contrib.description}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(contrib.id!, `aporte de ${formatCurrency(contrib.amount)}`, 'contribution')}
                    className="p-2 bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={deleteId !== null}
        title={deleteType === 'goal' ? '¿Eliminar meta?' : '¿Eliminar aporte?'}
        message={deleteType === 'goal' 
          ? `¿Estás seguro de eliminar la meta "${deleteName}"? Se perderá todo el historial.`
          : `¿Estás seguro de eliminar este aporte? Se descontará del total.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}