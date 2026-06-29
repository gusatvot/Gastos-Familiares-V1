import { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Tag,
  FileText,
  Save,
  X
} from 'lucide-react';

type TransactionType = 'income' | 'expense';

interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: string;
  description?: string;
}

interface EditTransactionModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

export default function EditTransactionModal({ isOpen, transaction, onClose }: EditTransactionModalProps) {
  const { categories, updateTransaction } = useAppContext();
  
  const [formData, setFormData] = useState(() => {
  if (transaction) {
    return {
      name: transaction.name,
      amount: transaction.amount.toString(),
      date: transaction.date,
      type: transaction.type,
      category: transaction.category,
      description: transaction.description || ''
    };
  }
  return {
    name: '',
    amount: '',
    date: '',
    type: 'expense' as TransactionType,
    category: '',
    description: ''
  };
});

// Agregá una key al componente padre para reinicializar

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Only update form when transaction id changes to avoid cascading renders
    if (transaction) {
      const t = setTimeout(() => {
        setFormData({
          name: transaction.name,
          amount: transaction.amount.toString(),
          date: transaction.date,
          type: transaction.type,
          category: transaction.category,
          description: transaction.description || ''
        });
        setErrors({});
      }, 0);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction?.id]);

  const filteredCategories = categories.filter(c => c.type === formData.type);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Monto inválido';
    if (!formData.date) newErrors.date = 'La fecha es obligatoria';
    if (!formData.category) newErrors.category = 'Seleccioná una categoría';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !transaction) return;

    try {
      await updateTransaction({
        ...transaction,
        name: formData.name,
        amount: parseFloat(formData.amount),
        date: formData.date,
        type: formData.type,
        category: formData.category,
        description: formData.description || undefined
      });

      toast.success('¡Actualizado! ✨', {
        description: `"${formData.name}" fue modificada.`,
      });

      onClose();
    } catch {
      toast.error('Error', { description: 'No se pudo actualizar.' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? value.replace(/[^0-9.]/g, '') : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen || !transaction) return null;

  const inputClass = (hasError: boolean) => `w-full pl-10 pr-4 py-2 rounded-2xl border-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-0 focus:border-purple-400 transition-all outline-none ${
    hasError ? 'border-red-400' : 'border-gray-200'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border-2 border-purple-200 dark:border-purple-800/50">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-b border-purple-200 dark:border-purple-800/50 px-4 py-3 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Editar Transacción
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Modificá los campos ✏️
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
              Tipo de Transacción
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category: '' }))}
                className={`py-2 px-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                  formData.type === 'expense'
                    ? 'bg-gradient-to-r from-red-400 to-orange-400 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Gasto
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: '' }))}
                className={`py-2 px-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                  formData.type === 'income'
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
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Supermercado 🛒"
              className={`w-full px-4 py-2.5 rounded-2xl border-2 bg-white text-gray-900 placeholder-gray-500 focus:border-purple-400 outline-none transition-all ${
                errors.name ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.name && <p className="text-xs text-red-400 mt-1 font-bold">{errors.name}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
              Monto *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                className={inputClass(!!errors.amount)}
              />
            </div>
            {errors.amount && <p className="text-xs text-red-400 mt-1 font-bold">{errors.amount}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
              Fecha *
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={inputClass(!!errors.date)}
              />
            </div>
            {errors.date && <p className="text-xs text-red-400 mt-1 font-bold">{errors.date}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
              Categoría *
            </label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={inputClass(!!errors.category)}
              >
                <option value="">Seleccionar categoría</option>
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.category && <p className="text-xs text-red-400 mt-1 font-bold">{errors.category}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
              Descripción (opcional)
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                placeholder="Detalles adicionales..."
                className="w-full pl-12 pr-4 py-2.5 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-purple-400 outline-none transition-all resize-none"
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
              className={`flex-1 py-2.5 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                formData.type === 'expense'
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