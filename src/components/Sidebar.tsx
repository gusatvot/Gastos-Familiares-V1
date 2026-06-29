import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { toast } from 'sonner';
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  Tags, 
  BarChart3, 
  PiggyBank, 
  Target, 
  Settings,
  LogOut,
  Sun,
  Moon,
  X
} from 'lucide-react';

type Page = 'dashboard' | 'expenses' | 'income' | 'categories' | 'reports' | 'budgets' | 'goals' | 'settings';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: { id: Page; label: string; icon: React.ComponentType<{className?: string}>; color: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'bg-purple-200' },
  { id: 'expenses', label: 'Gastos', icon: Wallet, color: 'bg-red-200' },
  { id: 'income', label: 'Ingresos', icon: TrendingUp, color: 'bg-green-200' },
  { id: 'categories', label: 'Categorías', icon: Tags, color: 'bg-yellow-200' },
  { id: 'reports', label: 'Reportes', icon: BarChart3, color: 'bg-blue-200' },
  { id: 'budgets', label: 'Presupuestos', icon: PiggyBank, color: 'bg-pink-200' },
  { id: 'goals', label: 'Metas', icon: Target, color: 'bg-indigo-200' },
  { id: 'settings', label: 'Configuración', icon: Settings, color: 'bg-gray-200' },
];

export default function Sidebar({ currentPage, onPageChange, isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePageChange = (page: Page) => {
    onPageChange(page);
    if (isMobile) {
      onClose(); // Cerrar menú en móvil al seleccionar
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('¡Hasta pronto! 👋');
    } catch {
      toast.error('Error al cerrar sesión');
    }
  };

  // En móvil: sidebar deslizante
  if (isMobile) {
    return (
      <>
        {/* Overlay oscuro */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
        
        {/* Sidebar móvil */}
        <aside 
          className={`fixed left-0 top-0 h-screen w-72 bg-white dark:bg-slate-900 shadow-2xl z-50 transition-transform duration-300 lg:hidden ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header móvil */}
          <div className="p-5 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                Gastos Familiares
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">V2.1 ✨</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Menú móvil */}
          <nav className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    currentPage === item.id
                      ? `${item.color} dark:opacity-80 text-gray-800 shadow-md`
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer móvil */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950">
            {/* Botón de tema */}
            <button
              onClick={toggleTheme}
              className="w-full mb-3 flex items-center justify-between px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-500 transition"
            >
              <div className="flex items-center gap-2">
                {theme === 'light' ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-purple-400" />
                )}
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {theme === 'light' ? 'Modo claro ☀️' : 'Modo oscuro '}
                </span>
              </div>
            </button>

            {/* Info usuario */}
            {user && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'Usuario'}
                    className="w-11 h-11 rounded-2xl flex-shrink-0 border-2 border-purple-300"
                  />
                ) : (
                  <div className="w-11 h-11 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-white">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">
                    {user.displayName || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition text-gray-500 dark:text-gray-400 hover:text-red-500"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </aside>
      </>
    );
  }

  // En desktop: sidebar fijo (versión original simplificada)
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-white/20 dark:border-slate-700/50 z-30 hidden lg:block">
      {/* Header desktop */}
      <div className="p-6 border-b border-gray-200/50 dark:border-slate-700/50">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
          Gastos Familiares
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">V2.1 </p>
      </div>

      {/* Menú desktop */}
      <nav className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                currentPage === item.id
                  ? `${item.color} dark:opacity-80 text-gray-800 shadow-lg scale-105`
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer desktop */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50 dark:border-slate-700/50 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-slate-950/50">
        <button
          onClick={toggleTheme}
          className="w-full mb-3 flex items-center justify-between px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-500 transition"
        >
          <div className="flex items-center gap-2">
            {theme === 'light' ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-purple-400" />
            )}
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {theme === 'light' ? 'Modo claro ☀️' : 'Modo oscuro 🌙'}
            </span>
          </div>
        </button>

        {user && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'Usuario'}
                className="w-11 h-11 rounded-2xl flex-shrink-0 border-2 border-purple-300"
              />
            ) : (
              <div className="w-11 h-11 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-white">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">
                {user.displayName || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition text-gray-500 dark:text-gray-400 hover:text-red-500"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}