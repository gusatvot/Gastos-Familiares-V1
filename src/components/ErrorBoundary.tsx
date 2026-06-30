import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: undefined
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ Error no capturado:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-red-100">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Ups! Algo salió mal
            </h1>
            
            <p className="text-gray-600 mb-6">
              Ha ocurrido un error inesperado. No te preocupes, podés intentar recargar la página.
            </p>

            {this.state.error && (
              <details className="text-left mb-6 p-4 bg-gray-50 rounded-xl text-xs font-mono text-gray-700 max-h-40 overflow-auto">
                <summary className="cursor-pointer font-bold mb-2">Ver detalles técnicos</summary>
                {this.state.error.message}
              </details>
            )}
            
            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
