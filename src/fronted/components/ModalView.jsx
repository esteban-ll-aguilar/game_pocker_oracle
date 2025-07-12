import React from 'react';

/**
 * Componente de vista para modales
 * Solo maneja la presentación del modal, sin lógica de negocio
 */
const ModalView = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-600 max-w-md w-full mx-4 sm:mx-0">
        {/* Efectos de brillo */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-2xl"></div>
        
        {/* Contenido */}
        <div className="relative">
          {children}
        </div>
        
        {/* Botón de cerrar (opcional, solo si onClose está definido) */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200 text-xl"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default ModalView;
