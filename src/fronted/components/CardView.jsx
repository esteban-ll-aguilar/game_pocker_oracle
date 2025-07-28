import React from 'react';

/**
 * Componente de vista para una carta individual
 * Solo maneja la presentación visual de la carta
 */
const CardView = ({ card, isRevealed, isTopCard, isInRevealedPile, groupNumber }) => {
  if (!card) return null;

  const { suit, value, isRed } = card;
  const isFaceCard = ['J', 'Q', 'K', 'A'].includes(value);

  // Estilos para carta oculta (dorso)
  if (!isRevealed) {
    return (
      <div className={`w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32 lg:w-28 lg:h-36 xl:w-32 xl:h-40 rounded-xl border-3 border-blue-400 bg-gradient-to-br from-blue-600 to-blue-800 shadow-xl relative overflow-hidden ${
        isTopCard ? 'shadow-2xl ring-2 ring-blue-300/50' : 'shadow-lg'
      } transition-all duration-300 hover:scale-105`}>
        {/* Patrón del dorso */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-blue-900/30"></div>
        
        {/* Diseño del dorso */}
        <div className="absolute inset-2 border border-blue-300/50 rounded-md bg-gradient-to-br from-blue-400/20 to-blue-600/20">
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-blue-200 text-sm sm:text-base md:text-lg">🎴</div>
          </div>
        </div>

        {/* Patrón decorativo */}
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '6px 6px'
          }}></div>
        </div>

        {/* Brillo en la carta superior */}
        {isTopCard && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-lg"></div>
        )}
      </div>
    );
  }

  // Estilos para carta revelada (frente)
  return (
    <div className={`w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32 lg:w-28 lg:h-36 xl:w-32 xl:h-40 rounded-xl border-3 border-gray-300 bg-gradient-to-br from-white to-gray-50 shadow-xl relative overflow-hidden ${
      isInRevealedPile ? 'shadow-lg scale-90' : 'shadow-2xl ring-2 ring-white/50'
    } transition-all duration-300`}>
      {/* Fondo de la carta */}
      <div className={`absolute inset-0 ${
        isFaceCard 
          ? 'bg-gradient-to-br from-yellow-50 to-yellow-100' 
          : 'bg-gradient-to-br from-white to-gray-50'
      }`}></div>

      {/* Contenido de la carta */}
      <div className="absolute inset-1 rounded-md">
        {/* Esquina superior izquierda */}
        <div className={`absolute top-0.5 left-0.5 sm:top-1 sm:left-1 md:top-1.5 md:left-1.5 lg:top-2 lg:left-2 text-center ${isRed ? 'text-red-600' : 'text-black'} font-bold leading-none`}>
          <div className="text-xs sm:text-sm md:text-base lg:text-lg">{value}</div>
          <div className="text-xs sm:text-sm md:text-base lg:text-lg">{suit}</div>
        </div>
        
        {/* Centro */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center ${isRed ? 'text-red-600' : 'text-black'}`}>
          <div className={`${isFaceCard ? 'text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl' : 'text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl'}`}>
            {suit}
          </div>
          {isFaceCard && (
            <div className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-700 mt-0.5">
              {value === 'J' ? 'J' : value === 'Q' ? 'Q' : value === 'K' ? 'K' : 'A'}
            </div>
          )}
        </div>
        
        {/* Esquina inferior derecha (rotada) */}
        <div className={`absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 md:bottom-1.5 md:right-1.5 lg:bottom-2 lg:right-2 text-center transform rotate-180 ${isRed ? 'text-red-600' : 'text-black'} font-bold leading-none`}>
          <div className="text-xs sm:text-sm md:text-base lg:text-lg">{value}</div>
          <div className="text-xs sm:text-sm md:text-base lg:text-lg">{suit}</div>
        </div>
      </div>

      {/* Efectos especiales para cartas de figura */}
      {isFaceCard && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 via-transparent to-purple-200/20 rounded-lg"></div>
      )}

      {/* Brillo sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-lg"></div>
    </div>
  );
};

export default CardView;
