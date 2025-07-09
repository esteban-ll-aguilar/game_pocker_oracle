import React from 'react';

const Card = ({ card, isRevealed, isTopCard, isInRevealedPile, groupNumber }) => {
  if (!card) return null;

  const { suit, value, isRed } = card;
  const isFaceCard = ['J', 'Q', 'K', 'A'].includes(value);

  // Estilos para carta oculta (dorso)
  if (!isRevealed) {
    return (
      <div className={`w-12 h-18 sm:w-14 sm:h-20 md:w-16 md:h-24 rounded-lg border-2 border-blue-400 bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg relative overflow-hidden ${
        isTopCard ? 'shadow-xl' : 'shadow-md'
      }`}>
        {/* Patrón del dorso */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-blue-900/30"></div>
        
        {/* Diseño del dorso */}
        <div className="absolute inset-2 border border-blue-300/50 rounded-md bg-gradient-to-br from-blue-400/20 to-blue-600/20">
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-blue-200 text-lg">🎴</div>
          </div>
        </div>

        {/* Patrón decorativo */}
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '8px 8px'
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
    <div className={`w-12 h-18 sm:w-14 sm:h-20 md:w-16 md:h-24 rounded-lg border-2 border-gray-300 bg-gradient-to-br from-white to-gray-50 shadow-lg relative overflow-hidden ${
      isInRevealedPile ? 'shadow-md' : 'shadow-xl'
    }`}>
      {/* Fondo de la carta */}
      <div className={`absolute inset-0 ${
        isFaceCard 
          ? 'bg-gradient-to-br from-yellow-50 to-yellow-100' 
          : 'bg-gradient-to-br from-white to-gray-50'
      }`}></div>

      {/* Contenido de la carta */}
      <div className="absolute inset-1 rounded-md">
        {/* Esquina superior izquierda */}
        <div className={`absolute top-1 left-1 text-center ${isRed ? 'text-red-600' : 'text-black'} font-bold leading-none`}>
          <div className="text-xs">{value}</div>
          <div className="text-sm">{suit}</div>
        </div>
        
        {/* Centro */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center ${isRed ? 'text-red-600' : 'text-black'}`}>
          <div className={`${isFaceCard ? 'text-lg' : 'text-base'}`}>
            {suit}
          </div>
          {isFaceCard && (
            <div className="text-xs font-bold text-gray-700 mt-0.5">
              {value === 'J' ? 'J' : value === 'Q' ? 'Q' : value === 'K' ? 'K' : 'A'}
            </div>
          )}
        </div>
        
        {/* Esquina inferior derecha (rotada) */}
        <div className={`absolute bottom-1 right-1 text-center transform rotate-180 ${isRed ? 'text-red-600' : 'text-black'} font-bold leading-none`}>
          <div className="text-xs">{value}</div>
          <div className="text-sm">{suit}</div>
        </div>
      </div>

      {/* Efectos especiales para cartas de figura */}
      {isFaceCard && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 via-transparent to-purple-200/20 rounded-lg"></div>
      )}

      {/* Brillo sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-lg"></div>

      {/* Indicador de grupo de destino (solo si no está en pila revelada) */}
      {!isInRevealedPile && (
        <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white shadow-sm">
          {card.numericValue}
        </div>
      )}
    </div>
  );
};

export default Card;
