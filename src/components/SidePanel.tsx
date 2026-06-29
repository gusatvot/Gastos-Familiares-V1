import TransactionForm from './TransactionForm';
import { X } from 'lucide-react';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SidePanel({ isOpen, onClose }: SidePanelProps) {
  if (!isOpen) return null;

  return (
    <aside className="fixed right-0 top-0 h-screen w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl z-40 overflow-y-auto border-l-2 border-purple-200 dark:border-purple-800/50">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-b border-purple-200 dark:border-purple-800/50 px-4 py-3 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Nueva Transacción
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            Agregá un nuevo movimiento ✨
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Formulario */}
      <div className="p-4">
        <TransactionForm onSuccess={onClose} />
      </div>
    </aside>
  );
}