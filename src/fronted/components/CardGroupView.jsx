import React from 'react';
import CardView from './CardView.jsx';

/**
 * Componente de vista para un grupo de cartas
 * Solo maneja la presentación visual del grupo
 */
const CardGroupView = ({ 
  groupNumber, 
  group, 
  onClick, 
  isClickable, 
  isCenter, 
  currentCard, 
  isBlocked = false, 
  allowedGroup = null,
  allGroups = {}
}) => {
  if (!group) return null;

  const { cards, revealed } = group;
  const hasCards = cards.length > 0;

  // Determinar si este grupo debe resaltarse
  const shouldHighlight = currentCard && currentCard.numericValue === groupNumber;
  
  // Determinar si este grupo está bloqueado
  let isGroupBlocked = false;
  
  if (currentCard) {
    // Si hay una carta revelada, solo permitir el grupo objetivo
    isGroupBlocked = currentCard.numericValue !== groupNumber;
  } else {
    // Si no hay carta revelada, verificar si es el inicio del juego
    // usando la información de todos los grupos
    const hasAnyRevealedCards = Object.values(allGroups).some(g => 
      g && g.revealed && g.revealed.length > 0
    );
    
    if (!hasAnyRevealedCards) {
      // Al inicio del juego, solo permitir grupo 13
      isGroupBlocked = groupNumber !== 13 && hasCards;
    } else {
      // Durante el juego, permitir cualquier grupo con cartas
      isGroupBlocked = !hasCards;
    }
  }
  
  // Determinar si este es el grupo objetivo
  const isTargetGroup = currentCard && currentCard.numericValue === groupNumber;

  return (
    <div className="relative w-full h-full">
      {/* Contenedor principal del grupo */}
      <div
        className={`relative w-full h-full transition-all duration-300 ${
          isClickable && hasCards && !isGroupBlocked
            ? 'cursor-pointer hover:scale-105 hover:shadow-2xl'
            : isGroupBlocked
            ? 'cursor-not-allowed'
            : 'cursor-default'
        } ${shouldHighlight ? 'ring-4 ring-yellow-400 ring-opacity-75 animate-pulse' : ''}`}
        onClick={() => {
          console.log(`Clic en grupo ${groupNumber}`, {
            hasCards,
            isGroupBlocked,
            isTargetGroup,
            currentCard
          });
          if (onClick) onClick();
        }}
      >
        {/* Indicador de grupo */}
        <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 z-30 ${
          isCenter 
            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-100' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-blue-100'
        } px-2 py-1 lg:px-3 lg:py-1.5 rounded-full text-xs lg:text-sm font-bold border-2 ${
          isCenter ? 'border-yellow-300' : 'border-blue-300'
        } shadow-lg`}>
          {isCenter ? '⭐' : groupNumber}
        </div>

        {/* Contador de cartas */}
        <div className="absolute -top-2 -right-2 z-30 bg-red-600 text-white text-xs lg:text-sm font-bold rounded-full w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center border-2 border-white shadow-lg">
          {cards.length}
        </div>

        {/* Pila de cartas ocultas */}
        <div className="relative w-full h-full">
          {hasCards ? (
            cards.map((card, index) => (
              <div
                key={`hidden-${card.id}-${index}`}
                className="absolute inset-0"
                style={{
                  top: `${index * -3}px`,
                  left: `${index * -2}px`,
                  zIndex: 20 - index
                }}
              >
                <CardView 
                  card={card} 
                  isRevealed={false}
                  isTopCard={index === 0}
                  groupNumber={groupNumber}
                />
              </div>
            ))
          ) : (
            // Placeholder cuando no hay cartas ocultas
            <div className="w-full h-full border-2 border-dashed border-gray-500 rounded-xl bg-gray-800/30 flex flex-col items-center justify-center">
              <span className="text-gray-500 text-xs font-semibold">VACÍO</span>
              <span className="text-green-400 text-xs">✓</span>
            </div>
          )}
        </div>

        {/* Indicador de interactividad */}
        {isClickable && hasCards && !isGroupBlocked && (
          <div className="absolute inset-0 bg-blue-400/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-25">
            <div className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
              REVELAR
            </div>
          </div>
        )}

        {/* Efectos especiales para el grupo central */}
        {isCenter && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -inset-2 border-2 border-yellow-400/40 rounded-xl animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-amber-400/10 rounded-xl"></div>
            {/* Indicador especial cuando es el único grupo disponible al inicio */}
            {!currentCard && hasCards && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-yellow-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg animate-bounce">
                  ¡EMPIEZA AQUÍ!
                </div>
              </div>
            )}
          </div>
        )}

        {/* Efectos de bloqueo - Solo si está bloqueado Y no es el grupo objetivo */}
        {isGroupBlocked && !isTargetGroup && (
          <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center z-30 pointer-events-none">
            <div className="text-center">
              <div className="text-2xl mb-1">🔒</div>
              <div className="text-xs text-gray-300 font-bold">BLOQUEADO</div>
            </div>
          </div>
        )}

        {/* Efectos de grupo objetivo - Solo efectos visuales, NO bloquea clics */}
        {isTargetGroup && currentCard && (
          <div className="absolute inset-0 pointer-events-none z-25">
            <div className="absolute -inset-2 border-4 border-green-400 rounded-xl animate-pulse shadow-lg shadow-green-400/50"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg animate-bounce">
                ¡COLOCA AQUÍ!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cartas reveladas (apiladas en el mismo lugar) */}
      {revealed.length > 0 && (
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className="text-xs text-gray-400 mb-1 text-center font-semibold">
            Reveladas: {revealed.length}
          </div>
          <div className="relative w-12 h-16">
            {/* Solo mostrar la última carta revelada con un indicador de cantidad */}
            {revealed.length > 0 && (
              <div className="absolute inset-0">
                <div className="transform scale-75 origin-center">
                  <CardView 
                    card={revealed[revealed.length - 1]} 
                    isRevealed={true}
                    isInRevealedPile={true}
                    groupNumber={groupNumber}
                  />
                </div>
                {/* Indicador de cantidad si hay más de una carta */}
                {revealed.length > 1 && (
                  <div className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white shadow-sm">
                    {revealed.length}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Indicador de estado del grupo */}
      <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold ${
        cards.length === 0 
          ? 'text-green-400' 
          : shouldHighlight 
            ? 'text-yellow-400' 
            : 'text-gray-400'
      }`}>
        {cards.length === 0 ? '✓ Completo' : `${cards.length} cartas`}
      </div>
    </div>
  );
};

export default CardGroupView;
