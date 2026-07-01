import { useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

function AppShell() {
  const location = useLocation();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cerrar el panel lateral al navegar
  // (no usamos useEffect para evitar parpadeo; solo cerramos cuando cambia la ruta)
  const handleNavigate = () => {
    setIsSidePanelOpen(false);
    setIsMobileMenuOpen(false);
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
        currentPath={location.pathname}
        onNavigate={handleNavigate}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Contenido principal */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <Layout rightPanelOpen={isSidePanelOpen}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Dashboard onOpenSidePanel={() => setIsSidePanelOpen(true)} />} />
              <Route path="/expenses" element={<TransactionsPage type="expense" />} />
              <Route path="/income" element={<TransactionsPage type="income" />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/budgets" element={<BudgetsPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* Fallback: redirige a dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
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

function App() {
  const { user, loading, isEmailVerified } = useAuth();

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

  // Si no está logueado o no verificó el email → mostrar login/verify
  if (!user || !isEmailVerified) {
    return (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    );
  }

  return <AppShell />;
}

export default App;
