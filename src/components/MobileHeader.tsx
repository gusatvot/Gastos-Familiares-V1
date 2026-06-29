import { Menu } from 'lucide-react';

interface MobileHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export default function MobileHeader({ onMenuClick, title }: MobileHeaderProps) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700 z-20 flex items-center justify-between px-4 shadow-sm">
      <button
        onClick={onMenuClick}
        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition"
      >
        <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
      </button>
      
      <h1 className="text-lg font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
        {title || 'Gastos Familiares'}
      </h1>
      
      <div className="w-10" />
    </div>
  );
}