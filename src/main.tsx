import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProvider } from './context/AppContext.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { Toaster } from 'sonner'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <App />
            <Toaster 
              position="top-right" 
              richColors 
              closeButton 
              duration={3000} 
            />
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)