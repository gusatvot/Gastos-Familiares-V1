import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppContext } from '../hooks/useAppContext';
import type { Category } from '../types';
import { categorySchema, type CategoryFormValues } from '../schemas';
import { toast } from 'sonner';
import ConfirmModal from '../components/ConfirmModal';
import { Tags, Plus, Trash2, Palette, TrendingUp, TrendingDown } from 'lucide-react';

export default function CategoriesPage() {
  const { categories, addCategory, deleteCategory } = useAppContext();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'expense',
      icon: '🏷️',
      color: '#a855f7',
    },
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>('');

  const emojiOptions = ['🏷️', '🍔', '🚗', '🎬', '💳', '🏠', '👕', '🏥', '📚', '✈️', '🎮', '🎵', '💡', '🎁', '⚽', '💰', '💼', '📈'];

  const watchedType = watch('type');
  const watchedIcon = watch('icon');
  const watchedColor = watch('color');

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      await addCategory({
        name: values.name,
        type: values.type,
        icon: values.icon,
        color: values.color,
      });
      reset();
      toast.success('¡Categoría creada! 🎉');
    } catch {
      toast.error('Error', { description: 'No se pudo crear la categoría.' });
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteId(id);
    setDeleteName(name);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteCategory(deleteId);
      toast.success('Categoría eliminada');
      setDeleteId(null);
    }
  };

  // Clase base para inputs
  const inputClass = `w-full px-4 py-2.5 rounded-2xl border-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 focus:border-purple-400 outline-none transition-all`;

  const CategoryCard = ({ category }: { category: Category }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl hover:shadow-md transition-all group border border-gray-100 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
          style={{ backgroundColor: `${category.color}20`, color: category.color }}
        >
          {category.icon}
        </div>
        <div>
          <p className="font-bold text-gray-900 dark:text-white">{category.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {category.type === 'income' ? 'Ingreso' : 'Gasto'}
          </p>
        </div>
      </div>
      <button
        onClick={() => category.id && handleDeleteClick(category.id, category.name)}
        className="p-2 bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-200 dark:hover:bg-red-900/50 transition"
        title="Eliminar"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Tags className="w-8 h-8 text-purple-500" />
          Categorías
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Organizá tus movimientos con etiquetas personalizadas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lista de Categorías (Ocupa 2 columnas) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gastos */}
          <div className="card-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              Categorías de Gastos
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full ml-2">
                {expenseCategories.length}
              </span>
            </h2>
            {expenseCategories.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-gray-500 dark:text-gray-400">No hay categorías de gastos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {expenseCategories.map(cat => <CategoryCard key={cat.id} category={cat} />)}
              </div>
            )}
          </div>

          {/* Ingresos */}
          <div className="card-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Categorías de Ingresos
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full ml-2">
                {incomeCategories.length}
              </span>
            </h2>
            {incomeCategories.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-gray-500 dark:text-gray-400">No hay categorías de ingresos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {incomeCategories.map(cat => <CategoryCard key={cat.id} category={cat} />)}
              </div>
            )}
          </div>
        </div>

        {/* Formulario (Ocupa 1 columna) */}
        <div className="card-soft p-5 h-fit sticky top-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-500" />
            Nueva Categoría
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Tipo</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setValue('type', 'expense', { shouldValidate: true })}
                  className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${
                    watchedType === 'expense' 
                      ? 'bg-gradient-to-r from-red-400 to-orange-400 text-white shadow-md' 
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" /> Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setValue('type', 'income', { shouldValidate: true })}
                  className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${
                    watchedType === 'income' 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-md' 
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" /> Ingreso
                </button>
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">Nombre *</label>
              <input
                type="text"
                placeholder="Ej: Alquiler, Sueldo..."
                className={`${inputClass} ${errors.name ? 'border-red-400' : ''}`}
                {...register('name')}
              />
              {errors.name && <p className="text-xs text-red-400 mt-1 font-bold">{errors.name.message}</p>}
            </div>

            {/* Icono */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">Icono</label>
              <div className="grid grid-cols-6 gap-2 mb-2">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setValue('icon', emoji, { shouldValidate: true })}
                    className={`p-2 text-xl rounded-xl transition ${
                      watchedIcon === emoji
                        ? 'bg-purple-100 dark:bg-purple-900/40 border-2 border-purple-400 scale-110'
                        : 'bg-gray-50 dark:bg-slate-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5 flex items-center gap-2">
                <Palette className="w-4 h-4" /> Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="h-10 w-16 rounded-xl cursor-pointer border-2 border-gray-200 dark:border-slate-700 p-1"
                  {...register('color')}
                />
                <div 
                  className="flex-1 h-10 rounded-xl shadow-inner"
                  style={{ backgroundColor: watchedColor }}
                />
              </div>
              {errors.color && <p className="text-xs text-red-400 mt-1 font-bold">{errors.color.message}</p>}
            </div>

            {/* Botón Guardar */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Guardar Categoría
            </button>
          </form>
        </div>

      </div>

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={deleteId !== null}
        title="¿Eliminar categoría?"
        message={`¿Estás seguro de que querés eliminar "${deleteName}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}