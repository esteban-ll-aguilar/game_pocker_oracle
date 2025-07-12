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
  allowedGroup = null 
}) => {
  if (!group) return null;

  const { cards, revealed } = group;
  const hasCards = cards.length > 0;

  // Determinar si este grupo debe resaltarse
  const shouldHighlight = currentCard && currentCard.numericValue === groupNumber;
  
  // Determinar si este grupo está bloqueado
  const isGroupBlocked = isBlocked && allowedGroup !== null && allowedGroup !== groupNumber;
  
  // Determinar si este es el grupo objetivo
  const isTargetGroup = allowedGroup === groupNumber;

  return (
    <div className="relative w-full h-full">
      {/* Contenedor principal del grupo */}
      <div
        className={`relative w-full h-full transition-all duration-300 ${
          isClickable && hasCards
            ? 'cursor-pointer hover:scale-105 hover:shadow-2xl'
            : ''
        } ${shouldHighlight ? 'ring-4 ring-yellow-400 ring-opacity-75 animate-pulse' : ''}`}
        onClick={isClickable && hasCards ? onClick : undefined}
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
        {isClickable && hasCards && (
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
          </div>
        )}

        {/* Efectos de bloqueo */}
        {isGroupBlocked && (
          <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center z-30">
            <div className="text-center">
              <div className="text-2xl mb-1">🔒</div>
              <div className="text-xs text-gray-300 font-bold">BLOQUEADO</div>
            </div>
          </div>
        )}

        {/* Efectos de grupo objetivo */}
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

      {/* Cartas reveladas (mostradas en la parte inferior) */}
      {revealed.length > 0 && (
        <div className="absolute -bottom-16 left-0 right-0">
          <div className="text-xs text-gray-400 mb-1 text-center font-semibold">
            Reveladas ({revealed.length})
          </div>
          <div className="flex flex-wrap gap-1 justify-center">
            {revealed.slice(-3).map((card, index) => (
              <div
                key={`revealed-${card.id}-${index}`}
                className="transform scale-50 origin-center"
                style={{
                  zIndex: index
                }}
              >
                <CardView 
                  card={card} 
                  isRevealed={true}
                  isInRevealedPile={true}
                  groupNumber={groupNumber}
                />
              </div>
            ))}
            {revealed.length > 3 && (
              <div className="text-xs text-gray-400 self-center">
                +{revealed.length - 3}
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
