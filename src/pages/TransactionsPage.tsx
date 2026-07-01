import { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import type { Transaction, TransactionType } from '../types';
import ConfirmModal from '../components/ConfirmModal';
import EditTransactionModal from '../components/EditTransactionModal';
import { toast } from 'sonner';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Tag,
  Edit2,
  Trash2,
  Wallet
} from 'lucide-react';

interface TransactionsPageProps {
  type: TransactionType;
}

export default function TransactionsPage({ type }: TransactionsPageProps) {
  const { transactions, deleteTransaction } = useAppContext();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>('');
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredTransactions = transactions.filter(t => t.type === type);
  const totalAmount = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteId(id);
    setDeleteName(name);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteTransaction(deleteId);
      toast.success('Eliminado', {
        description: `"${deleteName}" fue eliminada.`,
      });
      setDeleteId(null);
      setDeleteName('');
    }
  };

  const handleCancelDelete = () => {
    setDeleteId(null);
    setDeleteName('');
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditTransaction(transaction);
  };

  const handleCloseEdit = () => {
    setEditTransaction(null);
  };

  const pageTitle = type === 'expense' ? '💸 Mis Gastos' : '💰 Mis Ingresos';
  const emptyMessage = type === 'expense' 
    ? 'No hay gastos registrados' 
    : 'No hay ingresos registrados';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{pageTitle}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {filteredTransactions.length} transacciones encontradas
          </p>
        </div>
        
        {/* Total */}
        <div className={`card-soft p-6 ${
          type === 'income' 
            ? 'gradient-mint dark:opacity-90' 
            : 'gradient-peach dark:opacity-90'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {type === 'income' ? (
              <TrendingUp className="w-5 h-5 text-green-700 dark:text-green-800" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-700" />
            )}
            <p className="text-sm font-bold text-gray-700 dark:text-gray-800">Total</p>
          </div>
          <p className={`text-3xl font-bold ${
            type === 'income' 
              ? 'text-green-700 dark:text-green-800' 
              : 'text-red-600 dark:text-red-700'
          }`}>
            {type === 'income' ? '+' : '-'}{formatCurrency(totalAmount)}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="card-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b-2 border-purple-100 dark:border-purple-800/30">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Nombre
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Categoría
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Fecha
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200">
                  Descripción
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-200">
                  Monto
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-200">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="text-6xl mb-4 animate-float">📭</div>
                    <p className="text-gray-600 dark:text-gray-300 text-lg font-bold mb-2">
                      {emptyMessage}
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">
                      ¡Agregá tu primera transacción desde el Dashboard!
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr 
                    key={t.id} 
                    className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/10 dark:hover:to-pink-900/10 transition-all group"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {t.name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50">
                        <Tag className="w-3 h-3" />
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(t.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate" title={t.description}>
                        {t.description || <span className="text-gray-400 italic">Sin descripción</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={`font-bold text-base ${
                        t.type === 'income' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => t.id && handleEditClick({ ...t, id: t.id })}
                          className="p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => t.id && handleDeleteClick(t.id, t.name)}
                          className="p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={deleteId !== null}
        title="¿Eliminar transacción?"
        message={`¿Estás seguro de que querés eliminar "${deleteName}"? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Modal de edición */}
      <EditTransactionModal
        isOpen={editTransaction !== null}
        transaction={editTransaction}
        onClose={handleCloseEdit}
      />
    </div>
  );
}