import { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
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

type TransactionType = 'income' | 'expense';

interface TransactionFormProps {
  onSuccess?: () => void;
  keepOpen?: boolean;
}

export default function TransactionForm({ onSuccess }: TransactionFormProps) {
  const { categories, addTransaction } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as TransactionType,
    category: '',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = async (e: React.FormEvent, shouldClose: boolean) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await addTransaction({
        name: formData.name,
        amount: parseFloat(formData.amount),
        date: formData.date,
        type: formData.type,
        category: formData.category,
        description: formData.description || ''
      });

      setFormData({
        name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category: '',
        description: ''
      });

      if (shouldClose && onSuccess) {
        onSuccess();
      } else if (!shouldClose) {
        toast.success('¡Registrado! 📝', {
          description: 'Seguí agregando más transacciones.'
        });
      } else {
        toast.success('¡Transacción registrada! 🎉');
      }
    } catch {
      toast.error('Error', { description: 'No se pudo guardar.' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'amount' ? value.replace(/[^0-9.]/g, '') : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const inputClass = (hasError: boolean) => `w-full pl-11 pr-4 py-2 rounded-2xl border-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-0 focus:border-purple-400 transition-all outline-none ${
    hasError ? 'border-red-400' : 'border-gray-200'
  }`;

  return (
    <div className="space-y-3">
      <form className="space-y-3">
        {/* Tipo */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-2">Tipo de Transacción</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, type: 'expense', category: '' }))}
              className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                formData.type === 'expense' 
                  ? 'bg-gradient-to-r from-red-400 to-orange-400 text-white shadow-lg scale-105' 
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              <TrendingDown className="w-4 h-4" /> Gasto
            </button>
            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, type: 'income', category: '' }))}
              className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                formData.type === 'income' 
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
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={formData.type === 'expense' ? 'Ej: Supermercado 🛒' : 'Ej: Sueldo 💼'}
            className={`w-full px-4 py-2 rounded-2xl border-2 bg-white text-gray-900 placeholder-gray-500 focus:border-purple-400 outline-none transition-all text-sm ${
              errors.name ? 'border-red-400' : 'border-gray-200'
            }`}
          />
          {errors.name && <p className="text-xs text-red-400 mt-1 font-bold">{errors.name}</p>}
        </div>

        {/* Monto */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">Monto *</label>
          <div className="relative">
            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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

        {/* Fecha */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">Fecha *</label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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

        {/* Categoría */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">Categoría *</label>
          <div className="relative">
            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={inputClass(!!errors.category)}
            >
              <option value="">Seleccionar categoría</option>
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
          {errors.category && <p className="text-xs text-red-400 mt-1 font-bold">{errors.category}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">Descripción (opcional)</label>
          <div className="relative">
            <FileText className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="Detalles adicionales..."
              className="w-full pl-11 pr-4 py-2 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-purple-400 outline-none transition-all resize-none text-sm"
            />
          </div>
        </div>

        {/* Botones de acción */}
<div className="flex gap-2 pt-1">
  <button
    type="button"
    onClick={(e) => handleSubmit(e, false)}
    className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-2xl transition shadow-md flex items-center justify-center gap-2 px-4"
  >
    <Save className="w-4 h-4 flex-shrink-0" />
    <span>Guardar y seguir</span>
  </button>
  <button
    type="button"
    onClick={(e) => handleSubmit(e, true)}
    className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-2xl transition shadow-md flex items-center justify-center gap-2 px-4"
  >
    <span>✅</span>
    <span>Guardar</span>
  </button>
</div>
      </form>
    </div>
  );
}