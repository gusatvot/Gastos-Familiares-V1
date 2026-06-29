import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

type AuthMode = 'login' | 'register' | 'verify';

export default function LoginPage() {
  const { 
    loginWithGoogle, 
    loginWithEmail, 
    registerWithEmail, 
    resendVerification,
    user,
    isEmailVerified 
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Si el usuario está logueado pero no verificó el email
  if (user && !isEmailVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="blob bg-purple-300 w-64 h-64 top-10 left-10"></div>
        <div className="blob bg-pink-300 w-80 h-80 bottom-10 right-10" style={{animationDelay: '2s'}}></div>
        
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-white/50 dark:border-slate-700/50 text-center">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📧</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Verificá tu correo</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Te enviamos un enlace de verificación a <strong>{user.email}</strong>. 
              Revisá tu bandeja de entrada y hacé clic en el enlace.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={async () => {
                  try {
                    await resendVerification();
                    toast.success('Correo reenviado', { description: 'Revisá tu bandeja.' });
                  } catch {
                    toast.error('Error al reenviar');
                  }
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-2xl transition shadow-lg"
              >
                Reenviar correo
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-bold py-3 px-6 rounded-2xl transition"
              >
                Ya verifiqué mi correo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(formData.email, formData.password);
        toast.success('¡Bienvenido de vuelta! 🎉');
      } else {
        await registerWithEmail(formData.name, formData.email, formData.password);
        setMode('verify');
        toast.success('¡Cuenta creada! ✨', { description: 'Revisá tu correo para verificar.' });
      }
    } catch {
      toast.error('Error', { description: 'Ocurrió un error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast.success('¡Bienvenido! 🎉');
    } catch {
      toast.error('Error al iniciar sesión con Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Blobs decorativos */}
      <div className="blob bg-purple-300 w-64 h-64 top-10 left-10"></div>
      <div className="blob bg-pink-300 w-80 h-80 bottom-10 right-10" style={{animationDelay: '2s'}}></div>
      <div className="blob bg-blue-300 w-72 h-72 top-1/2 right-1/3" style={{animationDelay: '4s'}}></div>
      
      {/* Contenido */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-white/50 dark:border-slate-700/50">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce-soft">
              <span className="text-4xl">💰</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Gastos Familiares
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">V2.1 - Control de finanzas ✨</p>
          </div>

          {/* Pestañas */}
          {mode !== 'verify' && (
            <div className="flex bg-gray-100 dark:bg-slate-700 rounded-2xl p-1 mb-6">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition ${
                  mode === 'login' ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-300 shadow-md' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition ${
                  mode === 'register' ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-300 shadow-md' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                Registrarse
              </button>
            </div>
          )}

          {/* Modo Verificación */}
          {mode === 'verify' ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-soft">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">¡Casi listo!</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Te enviamos un enlace a <strong>{formData.email}</strong>. 
                Hacé clic en el enlace para activar tu cuenta.
              </p>
              <button
                onClick={() => setMode('login')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-2xl transition shadow-lg"
              >
                Volver al inicio de sesión
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Formulario */}
              <div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Nombre</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="input-soft w-full"
                        placeholder="Tu nombre"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Correo electrónico</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="input-soft w-full"
                      placeholder="tu@correo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Contraseña</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="input-soft w-full"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 rounded-2xl transition shadow-lg btn-soft"
                  >
                    {isLoading ? 'Procesando...' : mode === 'login' ? 'Iniciar Sesión 🚀' : 'Crear Cuenta ✨'}
                  </button>
                </form>
              </div>

              {/* Columna derecha - Google y descripción */}
              <div className="flex flex-col justify-center space-y-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-5 rounded-2xl border-2 border-purple-100 dark:border-purple-800/30">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-2 text-sm">
                    {mode === 'login' ? '👋 ¡Bienvenido de vuelta!' : '🎉 ¡Creá tu cuenta!'}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                    {mode === 'login' 
                      ? 'Accedé a tus finanzas y seguí controlando tus gastos e ingresos.'
                      : 'Empezá a organizar tus finanzas familiares de forma simple y segura.'}
                  </p>
                  <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                    <li className="flex items-center gap-1">
                      <span className="text-green-500">✓</span> Datos seguros en la nube
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-green-500">✓</span> Control de presupuestos
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-green-500">✓</span> Metas de ahorro
                    </li>
                  </ul>
                </div>

                {/* Separador */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-slate-600"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">O continuar con</span>
                  </div>
                </div>

                {/* Botón Google */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-500 text-gray-700 dark:text-gray-200 font-bold py-3 px-6 rounded-2xl transition shadow-soft"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}