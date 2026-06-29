import { useAppContext } from '../hooks/useAppContext';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Tag,
  Clock
} from 'lucide-react';

interface DashboardProps {
  onOpenSidePanel: () => void;
}

export default function Dashboard({ onOpenSidePanel }: DashboardProps) {
  const { transactions } = useAppContext();

  // Calcular totales
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Últimas 5 transacciones
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            ¡Hola! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Este es tu resumen financiero
          </p>
        </div>
        <button
          onClick={onOpenSidePanel}
          className="btn-soft bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          <span>Nueva Transacción</span>
        </button>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance */}
        <div className="card-soft p-6 gradient-lavender dark:opacity-90 relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-white dark:text-gray-100">Balance Total</p>
              <div className="icon-3d bg-white/60 backdrop-blur-sm">
                <Wallet className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(balance)}
            </p>
            <p className="text-xs text-gray-300 dark:text-gray-300 mt-2 font-medium">
              {balance >= 0 ? ' Vas bien' : '📉 Cuidado'}
            </p>
          </div>
        </div>
        
        {/* Ingresos */}
        <div className="card-soft p-6 gradient-mint dark:opacity-90 relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-white dark:text-gray-100">Ingresos</p>
              <div className="icon-3d bg-white/60 backdrop-blur-sm">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-green-700 dark:text-green-300">
              +{formatCurrency(totalIncome)}
            </p>
            <p className="text-xs text-gray-300 dark:text-gray-300 mt-2 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              {transactions.filter(t => t.type === 'income').length} transacciones
            </p>
          </div>
        </div>
        
        {/* Gastos */}
        <div className="card-soft p-6 gradient-peach dark:opacity-90 relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-white dark:text-gray-100">Gastos</p>
              <div className="icon-3d bg-white/60 backdrop-blur-sm">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-red-600 dark:text-red-300">
              -{formatCurrency(totalExpense)}
            </p>
            <p className="text-xs text-gray-300 dark:text-gray-300 mt-2 font-medium flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3" />
              {transactions.filter(t => t.type === 'expense').length} transacciones
            </p>
          </div>
        </div>
      </div>

      {/* Gráficos y Últimas Transacciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas Transacciones */}
        <div className="card-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              Últimas Transacciones
            </h2>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full">
              {recentTransactions.length} recientes
            </span>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3 animate-float">📭</div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No hay transacciones aún
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                ¡Agregá tu primera transacción!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((t) => (
                <div 
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                      t.type === 'income' 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {t.type === 'income' ? (
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {t.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(t.date)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {t.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className={`font-bold text-sm ${
                    t.type === 'income' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen Rápido */}
        <div className="card-soft p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-500" />
            Resumen Rápido
          </h2>

          <div className="space-y-4">
            {/* Porcentaje de gastos vs ingresos */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-100 dark:border-purple-800/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  Gastos vs Ingresos
                </span>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-full">
                  {totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-white dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-500"
                  style={{ width: `${Math.min((totalExpense / totalIncome) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {totalExpense > totalIncome 
                  ? '⚠️ Estás gastando más de lo que ganás' 
                  : '✅ Estás ahorrando este mes'}
              </p>
            </div>

            {/* Promedio de gastos */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-100 dark:border-blue-800/30">
              <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                Promedio por gasto
              </p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {transactions.filter(t => t.type === 'expense').length > 0
                  ? formatCurrency(totalExpense / transactions.filter(t => t.type === 'expense').length)
                  : formatCurrency(0)}
              </p>
            </div>

            {/* Mayor gasto */}
            {transactions.filter(t => t.type === 'expense').length > 0 && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-100 dark:border-orange-800/30">
                <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  Mayor gasto
                </p>
                <p className="text-lg font-bold text-orange-700 dark:text-orange-300 truncate">
                  {transactions
                    .filter(t => t.type === 'expense')
                    .sort((a, b) => b.amount - a.amount)[0].name}
                </p>
                <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(
                    transactions
                      .filter(t => t.type === 'expense')
                      .sort((a, b) => b.amount - a.amount)[0].amount
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}