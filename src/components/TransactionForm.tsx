import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppContext } from '../hooks/useAppContext';
import { transactionSchema } from '../schemas';
import { getDateKey } from '../utils/finance';
import { toast } from 'sonner';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Tag,
  FileText,
  Save
} from 'lucide-react';

interface TransactionFormProps {
  onSuccess?: () => void;
  keepOpen?: boolean;
}

// Los inputs tipo text/number manejan strings; el schema con z.coerce.number()
// convierte a number al validar. Usamos strings en defaults para que RHF no se
// queje con "value is number, expected string" en inputs tipo text.
const DEFAULT_VALUES = {
  name: '',
  amount: '',
  date: getDateKey(),
  type: 'expense' as 'income' | 'expense',
  category: '',
  description: '',
};

type TransactionInput = typeof DEFAULT_VALUES;

export default function TransactionForm({ onSuccess }: TransactionFormProps) {
  const { categories, addTransaction } = useAppContext();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema) as never,
    defaultValues: DEFAULT_VALUES,
  });

  const type = watch('type');
  const filteredCategories = categories.filter((c) => c.type === type);

  const submit = async (values: TransactionInput, shouldClose: boolean) => {
    try {
      await addTransaction({
        name: values.name,
        amount: Number(values.amount),
        date: values.date,
        type: values.type,
        category: values.category,
        description: values.description || '',
      });

      reset({ ...DEFAULT_VALUES, date: getDateKey() });

      if (shouldClose && onSuccess) {
        onSuccess();
      } else if (!shouldClose) {
        toast.success('¡Registrado! 📝', {
          description: 'Seguí agregando más transacciones.',
        });
      } else {
        toast.success('¡Transacción registrada! 🎉');
      }
    } catch {
      toast.error('Error', { description: 'No se pudo guardar.' });
    }
  };

  const onSubmitClose = handleSubmit((v) => submit(v, true));
  const onSubmitKeep = handleSubmit((v) => submit(v, false));

  const inputClass = (hasError: boolean) =>
    `w-full pl-11 pr-4 py-2 rounded-2xl border-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-0 focus:border-purple-400 transition-all outline-none ${
      hasError ? 'border-red-400' : 'border-gray-200'
    }`;

  return (
    <div className="space-y-3">
      <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
        {/* Tipo */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-2">
            Tipo de Transacción
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setValue('type', 'expense', { shouldValidate: true });
                setValue('category', '', { shouldValidate: true });
              }}
              className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-gradient-to-r from-red-400 to-orange-400 text-white shadow-lg scale-105'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              <TrendingDown className="w-4 h-4" /> Gasto
            </button>
            <button
              type="button"
              onClick={() => {
                setValue('type', 'income', { shouldValidate: true });
                setValue('category', '', { shouldValidate: true });
              }}
              className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg scale-105'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Ingreso
            </button>
          </div>
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">Nombre *</label>
          <input
            type="text"
            placeholder={type === 'expense' ? 'Ej: Supermercado 🛒' : 'Ej: Sueldo 💼'}
            className={`w-full px-4 py-2 rounded-2xl border-2 bg-white text-gray-900 placeholder-gray-500 focus:border-purple-400 outline-none transition-all text-sm ${
              errors.name ? 'border-red-400' : 'border-gray-200'
            }`}
            {...register('name')}
          />
          {errors.name && <p className="text-xs text-red-400 mt-1 font-bold">{errors.name.message}</p>}
        </div>

        {/* Monto */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">Monto *</label>
          <div className="relative">
            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="0.00"
              className={inputClass(!!errors.amount)}
              {...register('amount')}
            />
          </div>
          {errors.amount && <p className="text-xs text-red-400 mt-1 font-bold">{errors.amount.message}</p>}
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">Fecha *</label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="date" className={inputClass(!!errors.date)} {...register('date')} />
          </div>
          {errors.date && <p className="text-xs text-red-400 mt-1 font-bold">{errors.date.message}</p>}
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">Categoría *</label>
          <div className="relative">
            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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

        {/* Descripción */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">Descripción (opcional)</label>
          <div className="relative">
            <FileText className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <textarea
              rows={2}
              placeholder="Detalles adicionales..."
              className="w-full pl-11 pr-4 py-2 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-purple-400 outline-none transition-all resize-none text-sm"
              {...register('description')}
            />
          </div>
          {errors.description && <p className="text-xs text-red-400 mt-1 font-bold">{errors.description.message}</p>}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onSubmitKeep}
            disabled={isSubmitting}
            className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 text-white font-bold rounded-2xl transition shadow-md flex items-center justify-center gap-2 px-4"
          >
            <Save className="w-4 h-4 flex-shrink-0" />
            <span>Guardar y seguir</span>
          </button>
          <button
            type="button"
            onClick={onSubmitClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold rounded-2xl transition shadow-md flex items-center justify-center gap-2 px-4"
          >
            <span>✅</span>
            <span>Guardar</span>
          </button>
        </div>
      </form>
    </div>
  );
}
