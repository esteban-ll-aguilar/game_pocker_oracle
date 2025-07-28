import React, { useState, useEffect } from 'react';
import CardView from './CardView.jsx';

/**
 * Modal modular para mostrar la animación de revelación de cartas
 * Muestra la carta revelada con una animación atractiva
 */
const CardRevealModal = ({ 
  isOpen, 
  card, 
  fromGroup, 
  targetGroup, 
  onClose, 
  duration = 3000 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen && card) {
      console.log('Modal abierto, iniciando timer de', duration, 'ms');
      // Mostrar inmediatamente
      setIsVisible(true);
      
      // Cerrar después de la duración
      const timer = setTimeout(() => {
        console.log('Timer completado, cerrando modal');
        setIsVisible(false);
        setTimeout(() => {
          console.log('Llamando onClose');
          onClose();
        }, 300); // Tiempo para la animación de salida
      }, duration);

      return () => {
        console.log('Limpiando timer');
        clearTimeout(timer);
      };
    } else {
      setIsVisible(false);
    }
  }, [isOpen, card, duration, onClose]);

  if (!isOpen || !card) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        // Cerrar si se hace clic fuera del modal
        if (e.target === e.currentTarget) {
          console.log('Clic fuera del modal, cerrando');
          onClose();
        }
      }}
    >
      {/* Overlay con animación */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-75' : 'opacity-0'
        }`}
      />

      {/* Contenedor del modal */}
      <div 
        className={`relative z-10 transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Efectos de partículas */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                left: `${25 + (i % 3) * 25}%`,
                top: `${25 + Math.floor(i / 3) * 25}%`,
                animationDelay: `${i * 200}ms`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>

        {/* Contenido principal */}
        <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-3xl border-4 border-yellow-400 shadow-2xl p-8 min-w-[400px] relative">
          {/* Botón de cerrar */}
          <button
            onClick={() => {
              console.log('Botón X clickeado, cerrando modal');
              onClose();
            }}
            className="absolute top-4 right-4 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center font-bold text-lg transition-colors duration-200 z-10"
            title="Cerrar"
          >
            ×
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🔮</div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-">
              ¡Carta Revelada!
            </h2>
            <p className="text-gray-300 text-sm">.
            </p>
          </div>

          {/* Carta con animación */}
          <div className="flex justify-center mb-6">
            <div className="transform scale-100 rotate-0 transition-all duration-300">
              <div className="relative">
                {/* Efectos de brillo */}
                <div className={`absolute -inset-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl blur-lg ${
                  isVisible ? 'opacity-50 animate-pulse' : 'opacity-0'
                }`} />
                
                {/* Carta principal */}
                <div className="relative transform scale-150">
                  <CardView 
                    card={card}
                    isRevealed={true}
                    isTopCard={true}
                    groupNumber={fromGroup}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Información de la carta */}
          <div className={`text-center transition-all duration-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="bg-black/30 rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-center gap-4 mb-3">
                <div className="text-center">
                  <div className="text-white font-bold text-lg">Carta</div>
                  <div className={`font-bold text-2xl ${card.isRed ? 'text-red-400' : 'text-gray-300'}`}>
                    {card.value}{card.suit}
                  </div>
                </div>
                <div className="text-yellow-400 text-2xl">→</div>
                <div className="text-center">
                  <div className="text-white font-bold text-lg">Destino</div>
                  <div className="text-green-400 font-bold text-2xl">
                    Grupo {targetGroup}
                  </div>
                </div>
              </div>
              
              <div className="text-gray-400 text-sm">
                {card.value === 'A' && 'As = 1'}
                {card.value === 'J' && 'Jota = 11'}
                {card.value === 'Q' && 'Reina = 12'}
                {card.value === 'K' && 'Rey = 13'}
                {!['A', 'J', 'Q', 'K'].includes(card.value) && `Valor = ${card.numericValue}`}
              </div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-6">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all ${
                  isVisible ? 'w-full' : 'w-0'
                }`}
                style={{
                  transitionDuration: isVisible ? `${duration}ms` : '300ms'
                }}
              />
            </div>
            <div className="text-center text-gray-400 text-xs mt-2">
              Haz clic en el grupo {targetGroup} para colocar la carta
            </div>
          </div>
        </div>

        {/* Efectos de esquinas */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
      </div>
    </div>
  );
};

export default CardRevealModal;
