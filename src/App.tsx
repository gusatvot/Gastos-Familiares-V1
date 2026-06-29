import { useState, Suspense, lazy } from 'react';
import { useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import SidePanel from './components/SidePanel';
import Layout from './components/Layout';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const BudgetsPage = lazy(() => import('./pages/BudgetsPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

type Page = 'dashboard' | 'expenses' | 'income' | 'categories' | 'reports' | 'budgets' | 'goals' | 'settings';

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Cargando página...</p>
      </div>
    </div>
  );
}

function App() {
  const { user, loading, isEmailVerified } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está logueado, mostrar login
  if (!user) {
    return (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    );
  }

  // Si está logueado pero NO verificó el email
  if (!isEmailVerified) {
    return (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    );
  }

  const renderPage = () => {
    const content = (() => {
      switch (currentPage) {
        case 'dashboard':
          return <Dashboard onOpenSidePanel={() => setIsSidePanelOpen(true)} />;
        case 'expenses':
          return <TransactionsPage type="expense" />;
        case 'income':
          return <TransactionsPage type="income" />;
        case 'categories':
          return <CategoriesPage />;
        case 'reports':
          return <ReportsPage />;
        case 'budgets':
          return <BudgetsPage />;
        case 'goals':
          return <GoalsPage />;
        case 'settings':
          return <SettingsPage />;
        default:
          // Exhaustive check - this should never happen
          return (
            <div className="text-center py-20">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                {(currentPage as string).charAt(0).toUpperCase() + (currentPage as string).slice(1)}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">Esta página está en construcción 🚧</p>
            </div>
          );
      }
    })();

    return <Suspense fallback={<PageLoader />}>{content}</Suspense>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* Header móvil (solo en pantallas pequeñas) */}
      <MobileHeader 
        onMenuClick={() => setIsMobileMenuOpen(true)} 
        title="Gastos Familiares"
      />

      {/* Sidebar (responsive: fijo en desktop, deslizante en móvil) */}
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Contenido principal */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <Layout rightPanelOpen={isSidePanelOpen}>
          {renderPage()}
        </Layout>
      </div>

      {/* Panel lateral de nueva transacción */}
      <SidePanel 
        isOpen={isSidePanelOpen} 
        onClose={() => setIsSidePanelOpen(false)} 
      />

      {/* Overlay para panel lateral */}
      {isSidePanelOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:ml-64"
          style={{ marginRight: isSidePanelOpen ? '320px' : '0' }}
          onClick={() => setIsSidePanelOpen(false)}
        />
      )}
    </div>
  );
}

export default App;