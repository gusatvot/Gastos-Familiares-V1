import { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { 
  BarChart3, 
  Search, 
  Calendar, 
  Tag, 
  TrendingUp, 
  TrendingDown,
  Filter,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const { transactions } = useAppContext();
  
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const [filters, setFilters] = useState({
    startDate: lastMonth.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
    searchQuery: '',
    category: '',
    type: '' as 'income' | 'expense' | ''
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      
      const matchDate = transactionDate >= start && transactionDate <= end;
      const matchCategory = !filters.category || t.category === filters.category;
      const matchType = !filters.type || t.type === filters.type;
      const matchSearch = !filters.searchQuery || 
        t.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(filters.searchQuery.toLowerCase()));
      
      return matchDate && matchCategory && matchType && matchSearch;
    });
  }, [transactions, filters]);

  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    
    return {
      income,
      expense,
      balance: income - expense
    };
  }, [filteredTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const resetFilters = () => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    setFilters({
      startDate: lastMonth.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      searchQuery: '',
      category: '',
      type: ''
    });
  };

  // Exportar a Excel
  const exportToExcel = () => {
    const data = filteredTransactions.map(t => ({
      Fecha: formatDate(t.date),
      Nombre: t.name,
      Categoría: t.category,
      Tipo: t.type === 'income' ? 'Ingreso' : 'Gasto',
      Monto: t.amount,
      Descripción: t.description || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

    // Agregar totales
    const totalsData = [
      [],
      ['RESUMEN'],
      ['Total Ingresos:', formatCurrency(totals.income)],
      ['Total Gastos:', formatCurrency(totals.expense)],
      ['Balance:', formatCurrency(totals.balance)]
    ];
    XLSX.utils.sheet_add_aoa(ws, totalsData, { origin: -1 });

    XLSX.writeFile(wb, `reporte-gastos-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.setTextColor(139, 92, 246); // Morado
    doc.text('Reporte de Gastos Familiares', 14, 20);
    
    // Fecha del reporte
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, 14, 30);
    
    // Período
    doc.text(`Período: ${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`, 14, 38);
    
    // Tabla de transacciones
    const tableData = filteredTransactions.map(t => [
      formatDate(t.date),
      t.name,
      t.category,
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      formatCurrency(t.amount)
    ]);

    // Usar autoTable como función independiente
    autoTable(doc, {
      startY: 45,
      head: [['Fecha', 'Nombre', 'Categoría', 'Tipo', 'Monto']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: [139, 92, 246], // Morado
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [245, 240, 255] // Morado muy claro
      },
      columnStyles: {
        4: { halign: 'right' } // Alinear monto a la derecha
      }
    });

    // Totales (después de la tabla)
    const finalY = (doc as {lastAutoTable?: {finalY?: number}}).lastAutoTable?.finalY ?? 0 + 10;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(14, finalY - 5, 196, finalY - 5);
    
    doc.setTextColor(16, 185, 129); // Verde
    doc.text(`Total Ingresos: ${formatCurrency(totals.income)}`, 14, finalY);
    
    doc.setTextColor(239, 68, 68); // Rojo
    doc.text(`Total Gastos: ${formatCurrency(totals.expense)}`, 14, finalY + 7);
    
    doc.setTextColor(139, 92, 246); // Morado
    doc.text(`Balance: ${formatCurrency(totals.balance)}`, 14, finalY + 14);

    doc.save(`reporte-gastos-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const uniqueCategories = Array.from(new Set(transactions.map(t => t.category)));

  const inputClass = `w-full px-4 py-2.5 rounded-2xl border-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 focus:border-purple-400 outline-none transition-all`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-purple-500" />
            Reportes
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Analizá tus finanzas con filtros avanzados
          </p>
        </div>
        
        {/* Botones de exportación */}
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            disabled={filteredTransactions.length === 0}
            className="btn-soft bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold shadow-lg flex items-center gap-2 px-4 py-2"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span className="hidden md:inline">Excel</span>
          </button>
          <button
            onClick={exportToPDF}
            disabled={filteredTransactions.length === 0}
            className="btn-soft bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold shadow-lg flex items-center gap-2 px-4 py-2"
          >
            <FileText className="w-5 h-5" />
            <span className="hidden md:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-soft p-6 gradient-lavender dark:opacity-90">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-white dark:text-gray-100">Balance del Período</p>
            <div className="icon-3d bg-white/60">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white dark:text-white">
            {formatCurrency(totals.balance)}
          </p>
        </div>
        
        <div className="card-soft p-6 gradient-mint dark:opacity-90">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-white dark:text-gray-100">Total Ingresos</p>
            <div className="icon-3d bg-white/60">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-700 dark:text-green-300">
            +{formatCurrency(totals.income)}
          </p>
        </div>
        
        <div className="card-soft p-6 gradient-peach dark:opacity-90">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-white dark:text-gray-100">Total Gastos</p>
            <div className="icon-3d bg-white/60">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-300">
            -{formatCurrency(totals.expense)}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card-soft p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-500" />
            Filtros
          </h2>
          <button
            onClick={resetFilters}
            className="text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition"
          >
            Limpiar filtros
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">
              <Search className="w-4 h-4 inline mr-1" />
              Buscar
            </label>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Ej: Uber, Supermercado..."
              className={inputClass}
            />
          </div>

          {/* Fecha Desde */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1" />
              Desde
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className={inputClass}
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1" />
              Hasta
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className={inputClass}
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">Tipo</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' | '' }))}
              className={inputClass}
            >
              <option value="">Todos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
            </select>
          </div>

          {/* Categoría */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">
              <Tag className="w-4 h-4 inline mr-1" />
              Categoría
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className={inputClass}
            >
              <option value="">Todas</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Botón Últimos 30 días */}
          <div className="lg:col-span-2 flex items-end">
            <button
              onClick={() => {
                const today = new Date();
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                setFilters(prev => ({
                  ...prev,
                  startDate: lastMonth.toISOString().split('T')[0],
                  endDate: today.toISOString().split('T')[0]
                }));
              }}
              className="w-full py-2.5 px-4 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-bold rounded-2xl transition"
            >
              Últimos 30 días
            </button>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Mostrando <span className="font-bold text-gray-900 dark:text-white">{filteredTransactions.length}</span> transacciones
            {filters.searchQuery && <span> que coinciden con "<span className="font-medium">{filters.searchQuery}</span>"</span>}
          </p>
        </div>
      </div>

      {/* Tabla de Transacciones */}
      <div className="card-soft overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-purple-100 dark:border-purple-800/30 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            Transacciones ({filteredTransactions.length})
          </h2>
        </div>
        
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4 animate-float">📭</div>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-bold mb-2">
              No hay transacciones
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Probá con otros filtros o agregá nuevas transacciones
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {filteredTransactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((t) => (
                    <tr key={t.id} className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/10 dark:hover:to-pink-900/10 transition-all">
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(t.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</p>
                        {t.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50">
                          <Tag className="w-3 h-3" />
                          {t.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          t.type === 'income' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}>
                          {t.type === 'income' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {t.type === 'income' ? 'Ingreso' : 'Gasto'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm font-bold text-right ${
                        t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}