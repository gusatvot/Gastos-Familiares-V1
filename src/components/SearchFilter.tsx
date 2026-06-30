import { Search, Filter, X } from 'lucide-react';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterType: 'all' | 'income' | 'expense';
  onFilterChange: (type: 'all' | 'income' | 'expense') => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: Array<{ id: string; name: string; icon: string; type: string }>;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export default function SearchFilter({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onClear,
  hasActiveFilters
}: SearchFilterProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 space-y-3">
      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar transacciones..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-purple-400 dark:focus:border-purple-500 outline-none transition-all"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {/* Tipo */}
        <div className="flex rounded-xl overflow-hidden border-2 border-gray-200 dark:border-slate-600">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 text-sm font-bold transition-all ${
              filterType === 'all'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => onFilterChange('income')}
            className={`px-3 py-1.5 text-sm font-bold transition-all ${
              filterType === 'income'
                ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            Ingresos
          </button>
          <button
            onClick={() => onFilterChange('expense')}
            className={`px-3 py-1.5 text-sm font-bold transition-all ${
              filterType === 'expense'
                ? 'bg-gradient-to-r from-red-400 to-orange-400 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            Gastos
          </button>
        </div>

        {/* Categoría */}
        <div className="relative flex-1 min-w-[150px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-purple-400 dark:focus:border-purple-500 outline-none transition-all text-sm appearance-none cursor-pointer"
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Limpiar filtros */}
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 rounded-xl font-bold transition-all flex items-center gap-1.5 text-sm"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
