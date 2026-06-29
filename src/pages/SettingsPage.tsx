import { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAppContext } from '../hooks/useAppContext';
import { toast } from 'sonner';
import ConfirmModal from '../components/ConfirmModal';
import { 
  Settings, 
  Download, 
  Upload, 
  User, 
  LogOut,
  AlertTriangle,
  Shield,
  Trash2
} from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { exportData, importData, clearAllData } = useAppContext();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportData();
      toast.success('¡Backup exportado! 📦', {
        description: 'Tus datos se descargaron correctamente.'
      });
    } catch {
      toast.error('Error al exportar', {
        description: 'No se pudo crear el backup.'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        toast.error('Archivo inválido', {
          description: 'Solo se aceptan archivos JSON.'
        });
        return;
      }
      setSelectedFile(file);
      setShowImportConfirm(true);
    }
  };

  const handleImportConfirm = async () => {
    if (!selectedFile) return;
    
    setIsImporting(true);
    try {
      await importData(selectedFile);
      toast.success('¡Datos importados! 🎉', {
        description: 'Tus datos se restauraron correctamente.'
      });
      setShowImportConfirm(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch {
      toast.error('Error al importar', {
        description: 'No se pudo restaurar el backup.'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada', { description: 'Hasta pronto 👋' });
    } catch {
      toast.error('Error al cerrar sesión');
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await clearAllData();
      toast.success('¡Datos eliminados! 🗑️', {
        description: 'Todos los ingresos, gastos y datos fueron borrados.'
      });
      setShowClearConfirm(false);
    } catch {
      toast.error('Error al limpiar datos', {
        description: 'No se pudieron eliminar los datos.'
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="w-8 h-8 text-purple-500" />
          Configuración
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Gestioná tu cuenta y tus datos
        </p>
      </div>

      {/* Perfil de Usuario */}
      <div className="card-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-purple-500" />
          Perfil de Usuario
        </h2>
        
        {user && (
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'Usuario'}
                className="w-16 h-16 rounded-2xl border-2 border-purple-300"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-md">
                <span className="text-2xl font-bold text-white">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <p className="font-bold text-gray-900 dark:text-white text-lg">
                {user.displayName || 'Usuario'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
              {user.emailVerified && (
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                  ✓ Email verificado
                </span>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="mt-4 w-full md:w-auto px-6 py-3 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-bold rounded-2xl transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>

      {/* Backup de Datos */}
      <div className="card-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-500" />
          Backup de Datos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Exportar */}
          <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border-2 border-blue-100 dark:border-blue-800/30">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-3">
              <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              Exportar Datos
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Descargá un archivo JSON con todos tus datos (transacciones, categorías, presupuestos, metas y contribuciones).
            </p>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-2xl transition shadow-md flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exportando...' : 'Exportar Backup'}
            </button>
          </div>

          {/* Importar */}
          <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-100 dark:border-green-800/30">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              Importar Datos
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Restaurá tus datos desde un archivo JSON. <strong className="text-red-600 dark:text-red-400">⚠️ Reemplazará tus datos actuales.</strong>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              {isImporting ? 'Importando...' : 'Seleccionar Archivo'}
            </label>
          </div>
        </div>
      </div>

      {/* Zona de peligro */}
      <div className="card-soft p-6 border-2 border-red-200 dark:border-red-800/40">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Zona de Peligro
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Esta acción eliminará <strong>permanentemente</strong> todos los ingresos, gastos, presupuestos, metas, contribuciones y categorías de tu cuenta. No se puede deshacer.
        </p>
        <button
          onClick={() => setShowClearConfirm(true)}
          disabled={isClearing}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold rounded-2xl transition shadow-md flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          {isClearing ? 'Eliminando...' : 'Limpiar todos los datos'}
        </button>
      </div>

      {/* Información */}
      <div className="card-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Información Importante
        </h2>
        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <li className="flex items-start gap-3">
            <span className="text-blue-500 mt-0.5 text-lg">•</span>
            <span>Tus datos se sincronizan automáticamente con Firebase en la nube.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-500 mt-0.5 text-lg">•</span>
            <span>Hacé backups regularmente para tener una copia de seguridad local en tu computadora.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-red-500 mt-0.5 text-lg">•</span>
            <span><strong>Importar datos reemplazará TODA tu información actual.</strong> Asegurate de exportar antes de importar.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-500 mt-0.5 text-lg">•</span>
            <span>Los archivos de backup son específicos de tu cuenta y no se pueden compartir con otros usuarios.</span>
          </li>
        </ul>
      </div>

      {/* Modal de confirmación de importación */}
      <ConfirmModal
        isOpen={showImportConfirm}
        title="¿Importar datos?"
        message={`¿Estás seguro de que querés importar "${selectedFile?.name}"? Esto reemplazará TODOS tus datos actuales y no se puede deshacer.`}
        onConfirm={handleImportConfirm}
        onCancel={() => {
          setShowImportConfirm(false);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
      />

      <ConfirmModal
        isOpen={showClearConfirm}
        title="⚠️ ¿Eliminar todos los datos?"
        message="Esto borrará permanentemente todos tus ingresos, gastos, categorías, presupuestos, metas y contribuciones. Esta acción NO se puede deshacer."
        onConfirm={handleClearData}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}