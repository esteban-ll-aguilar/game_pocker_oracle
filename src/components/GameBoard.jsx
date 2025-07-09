import React from 'react';
import CardGroup from './CardGroup';

const GameBoard = ({ groups, currentCard, onGroupClick, gameState, gameMode }) => {
  // Crear un cuadro de 4x4 con las K (grupo 13) en el centro
  const getGridPosition = (groupNumber) => {
    const positions = {
      1: { row: 0, col: 0 },   // esquina superior izquierda
      2: { row: 0, col: 1 },   // arriba izquierda
      3: { row: 0, col: 2 },   // arriba derecha
      4: { row: 0, col: 3 },   // esquina superior derecha
      5: { row: 1, col: 3 },   // derecha arriba
      6: { row: 2, col: 3 },   // derecha abajo
      7: { row: 3, col: 3 },   // esquina inferior derecha
      8: { row: 3, col: 2 },   // abajo derecha
      9: { row: 3, col: 1 },   // abajo izquierda
      10: { row: 3, col: 0 },  // esquina inferior izquierda
      11: { row: 2, col: 0 },  // izquierda abajo
      12: { row: 1, col: 0 },  // izquierda arriba
      13: { row: 1, col: 1, span: 2 }   // centro (K) - ocupa 2x2
    };
    return positions[groupNumber] || { row: 1, col: 1 };
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Información del estado actual */}
      <div className="mb-4 sm:mb-6 text-center px-2">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 mb-3 sm:mb-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 border border-white/20">
            <span className="text-white font-semibold text-sm sm:text-base">Modo: </span>
            <span className={`font-bold text-sm sm:text-base ${gameMode === 'manual' ? 'text-blue-400' : 'text-green-400'}`}>
              {gameMode === 'manual' ? '🖱️ Manual' : '🤖 Automático'}
            </span>
          </div>
          
          {currentCard && (
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg px-3 sm:px-4 py-2 border border-purple-400">
              <span className="text-white font-semibold text-sm sm:text-base">Carta Actual: </span>
              <span className={`font-bold text-lg sm:text-xl ${currentCard.isRed ? 'text-red-300' : 'text-gray-300'}`}>
                {currentCard.value}{currentCard.suit}
              </span>
              <span className="text-purple-200 ml-2 text-sm sm:text-base">→ Grupo {currentCard.numericValue}</span>
            </div>
          )}
        </div>

        {gameMode === 'manual' && gameState === 'playing' && (
          <p className="text-gray-300 text-xs sm:text-sm">
            💡 Haz clic en los grupos para revelar cartas
          </p>
        )}
      </div>

      {/* Tablero de juego - Cuadrícula 4x4 */}
      <div className="relative bg-gradient-to-br from-green-900/40 to-green-800/40 rounded-3xl border-4 border-yellow-600/50 shadow-2xl p-4 sm:p-6 md:p-8">
        {/* Efectos de fondo del tablero */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-transparent to-green-800/10 rounded-3xl"></div>
        
        {/* Cuadrícula de cartas */}
        <div className="relative grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 w-full max-w-4xl mx-auto">
          {Array.from({ length: 16 }, (_, index) => {
            const row = Math.floor(index / 4);
            const col = index % 4;
            
            // Encontrar qué grupo corresponde a esta posición
            const groupNumber = Object.keys(groups).find(groupNum => {
              const pos = getGridPosition(parseInt(groupNum));
              return pos.row === row && pos.col === col;
            });

            // Para el grupo central (13), verificar si ocupa múltiples celdas
            const centerGroup = groups[13];
            const centerPos = getGridPosition(13);
            const isCenterCell = centerPos && (
              (row === centerPos.row && col === centerPos.col) ||
              (row === centerPos.row && col === centerPos.col + 1) ||
              (row === centerPos.row + 1 && col === centerPos.col) ||
              (row === centerPos.row + 1 && col === centerPos.col + 1)
            );

            if (groupNumber) {
              const group = groups[groupNumber];
              const isCenter = parseInt(groupNumber) === 13;
              const shouldHighlight = currentCard && currentCard.numericValue === parseInt(groupNumber);
              
              return (
                <div
                  key={`grid-${row}-${col}`}
                  className={`relative aspect-[3/4] ${
                    shouldHighlight ? 'animate-pulse' : ''
                  } ${isCenter ? 'col-span-2 row-span-2' : ''}`}
                >
                  <CardGroup
                    groupNumber={parseInt(groupNumber)}
                    group={group}
                    onClick={() => onGroupClick(parseInt(groupNumber))}
                    isClickable={gameMode === 'manual' && gameState === 'playing'}
                    isCenter={isCenter}
                    currentCard={currentCard}
                  />
                </div>
              );
            } else if (isCenterCell && centerGroup) {
              // Esta celda es parte del grupo central pero ya fue renderizada
              return null;
            } else {
              // Celda vacía
              return (
                <div
                  key={`empty-${row}-${col}`}
                  className="aspect-[3/4] border-2 border-dashed border-gray-600/30 rounded-xl bg-gray-800/20"
                />
              );
            }
          })}
        </div>

        {/* Efectos especiales según el estado del juego */}
        {gameState === 'won' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-8xl animate-bounce">🏆</div>
          </div>
        )}

        {gameState === 'lost' && (
          <div className="absolute inset-0 bg-red-900/20 rounded-3xl flex items-center justify-center pointer-events-none">
            <div className="text-6xl animate-pulse">💀</div>
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="mt-4 sm:mt-6 flex justify-center px-2">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20 max-w-full">
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-300">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-3 h-4 sm:w-4 sm:h-6 bg-blue-600 rounded border border-blue-400 flex-shrink-0"></div>
              <span className="whitespace-nowrap">Cartas ocultas</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-3 h-4 sm:w-4 sm:h-6 bg-white rounded border border-gray-300 flex-shrink-0"></div>
              <span className="whitespace-nowrap">Cartas reveladas</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="flex-shrink-0">⭐</span>
              <span className="whitespace-nowrap">Grupo central</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="flex-shrink-0">🎯</span>
              <span className="whitespace-nowrap">A=1, J=11, Q=12, K=13</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
