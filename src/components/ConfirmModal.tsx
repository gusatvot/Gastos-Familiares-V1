interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  danger = true 
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay oscuro */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Contenido del modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Icono de advertencia */}
        <div className="flex justify-center pt-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            danger ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            <svg 
              className={`w-8 h-8 ${danger ? 'text-red-600' : 'text-yellow-600'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
        </div>

        {/* Texto */}
        <div className="px-6 py-6 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm">{message}</p>
        </div>

        {/* Botones */}
        <div className="flex border-t border-gray-200">
          <button
            onClick={onCancel}
            className="flex-1 py-4 px-6 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-4 px-6 font-medium text-white transition ${
              danger 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}