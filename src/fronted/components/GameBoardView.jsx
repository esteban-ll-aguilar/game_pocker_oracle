import React from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import CardGroupView from './CardGroupView.jsx';

/**
 * Componente de vista del tablero de juego
 * Solo maneja la presentación del tablero, sin lógica de negocio
 */
const GameBoardView = ({ 
  groups, 
  currentCard, 
  onGroupClick, 
  gameState, 
  gameMode, 
  boardStructure = [] 
}) => {
  const { theme } = useTheme();
  return (
    <div className="w-full max-w-6xl xl:max-w-7xl 2xl:max-w-8xl mx-auto">
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
      <div className={`relative bg-gradient-to-br ${theme.board} rounded-3xl border-4 ${theme.border} shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 hover-glow`}>
        {/* Efectos de fondo del tablero */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.board} opacity-20 rounded-3xl`}></div>
        
        {/* Cuadrícula de cartas */}
        <div className="relative grid grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10 w-full max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
          {boardStructure.length > 0 ? (
            // Usar la estructura del tablero del backend
            boardStructure.map((cell) => {
              if (cell.type === 'group') {
                const shouldHighlight = currentCard && currentCard.numericValue === cell.groupNumber;
                
                return (
                  <div
                    key={cell.key}
                    className={`relative aspect-[3/4] ${
                      shouldHighlight ? 'animate-pulse' : ''
                    } ${cell.isCenter ? 'col-span-2 row-span-2' : ''}`}
                  >
                    <CardGroupView
                      groupNumber={cell.groupNumber}
                      group={cell.group}
                      onClick={() => onGroupClick(cell.groupNumber)}
                      isClickable={gameMode === 'manual' && gameState === 'playing'}
                      isCenter={cell.isCenter}
                      currentCard={currentCard}
                      isBlocked={currentCard !== null}
                      allowedGroup={currentCard ? currentCard.numericValue : null}
                    />
                  </div>
                );
              } else if (cell.type === 'center-occupied') {
                // Esta celda es parte del grupo central pero ya fue renderizada
                return null;
              } else {
                // Celda vacía
                return (
                  <div
                    key={cell.key}
                    className="aspect-[3/4] border-2 border-dashed border-gray-600/30 rounded-xl bg-gray-800/20"
                  />
                );
              }
            })
          ) : (
            // Fallback: renderizado tradicional si no hay estructura del backend
            Array.from({ length: 16 }, (_, index) => {
              const row = Math.floor(index / 4);
              const col = index % 4;
              
              // Posiciones de los grupos en el tablero 4x4
              const getGridPosition = (groupNumber) => {
                const positions = {
                  1: { row: 0, col: 0 },
                  2: { row: 0, col: 1 },
                  3: { row: 0, col: 2 },
                  4: { row: 0, col: 3 },
                  5: { row: 1, col: 3 },
                  6: { row: 2, col: 3 },
                  7: { row: 3, col: 3 },
                  8: { row: 3, col: 2 },
                  9: { row: 3, col: 1 },
                  10: { row: 3, col: 0 },
                  11: { row: 2, col: 0 },
                  12: { row: 1, col: 0 },
                  13: { row: 1, col: 1, span: 2 }
                };
                return positions[groupNumber] || { row: 1, col: 1 };
              };

              const groupNumber = Object.keys(groups || {}).find(groupNum => {
                const pos = getGridPosition(parseInt(groupNum));
                return pos.row === row && pos.col === col;
              });

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
                    <CardGroupView
                      groupNumber={parseInt(groupNumber)}
                      group={group}
                      onClick={() => onGroupClick(parseInt(groupNumber))}
                      isClickable={gameMode === 'manual' && gameState === 'playing'}
                      isCenter={isCenter}
                      currentCard={currentCard}
                    />
                  </div>
                );
              } else if (isCenterCell && groups && groups[13]) {
                return null;
              } else {
                return (
                  <div
                    key={`empty-${row}-${col}`}
                    className="aspect-[3/4] border-2 border-dashed border-gray-600/30 rounded-xl bg-gray-800/20"
                  />
                );
              }
            })
          )}
        </div>

        {/* Efectos especiales según el estado del juego */}
        {gameState === 'won' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-4xl sm:text-6xl md:text-8xl animate-bounce">🏆</div>
          </div>
        )}

        {gameState === 'lost' && (
          <div className="absolute inset-0 bg-red-900/20 rounded-3xl flex items-center justify-center pointer-events-none">
            <div className="text-3xl sm:text-5xl md:text-6xl animate-pulse">💀</div>
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="mt-4 sm:mt-6 flex justify-center px-2">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20 max-w-full">
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-6 lg:gap-8 text-xs sm:text-sm lg:text-base text-gray-300">
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
              <div className="w-3 h-4 sm:w-4 sm:h-6 lg:w-5 lg:h-7 bg-blue-600 rounded border border-blue-400 flex-shrink-0"></div>
              <span className="whitespace-nowrap">Cartas ocultas</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
              <div className="w-3 h-4 sm:w-4 sm:h-6 lg:w-5 lg:h-7 bg-white rounded border border-gray-300 flex-shrink-0"></div>
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

export default GameBoardView;
