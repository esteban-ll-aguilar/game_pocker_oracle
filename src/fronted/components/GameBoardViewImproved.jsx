import React from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import CardGroupView from './CardGroupView.jsx';

/**
 * Componente mejorado de vista del tablero de juego
 * Presenta el juego de manera más clara y atractiva
 */
const GameBoardViewImproved = ({ 
  groups, 
  currentCard, 
  onGroupClick, 
  gameState, 
  gameMode, 
  boardStructure = []  
}) => {
  const { theme } = useTheme();

  // Calcular estadísticas del juego
  const totalCards = Object.values(groups || {}).reduce((sum, group) => sum + group.cards.length, 0);
  // const totalRevealed = Object.values(groups || {}).reduce((sum, group) => sum + group.revealed.length, 0);
  const progress = totalCards > 0 ? ((52 - totalCards) / 52 * 100).toFixed(1) : 0;

  // Indicador de modo de juego
  const getModeIndicator = () => {
    if (gameMode === 'automatic') {
      return {
        icon: '🤖',
        title: 'Modo Automático',
        description: 'El juego se ejecuta automáticamente',
        color: 'from-green-600 to-green-400',
        border: 'border-green-400'
      };
    } else {
      return {
        icon: '🖱️',
        title: 'Modo Manual',
        description: 'Haz clic para revelar cartas',
        color: 'from-blue-600 to-blue-400',
        border: 'border-blue-400'
      };
    }
  };

  const modeInfo = getModeIndicator();

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Indicador persistente de modo flotante */}
      <div className={`fixed top-4 right-4 z-30 
                     bg-gradient-to-r ${modeInfo.color} 
                     px-3 py-2 rounded-full shadow-lg 
                     border ${modeInfo.border} 
                     flex items-center gap-2
                     animate-pulse-slow`}>
        <span className="text-lg">{modeInfo.icon}</span>
        <span className="font-bold text-white">{modeInfo.title}</span>
      </div>

      {/* Header del juego con información clara */}
      <div className="mb-6">
        {/* Información principal */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 border border-white/20 mb-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Estado del juego */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{modeInfo.icon}</span>
                <div>
                  <div className="text-white font-bold">{modeInfo.title}</div>
                  <div className="text-gray-300 text-sm">
                    {modeInfo.description}
                  </div>
                </div>
              </div>
            </div>

            {/* Progreso del juego */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-white font-bold text-lg">{totalCards}</div>
                <div className="text-gray-300 text-xs">Cartas restantes</div>
              </div>
              <div className="w-32 bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-center">
                <div className="text-green-400 font-bold text-lg">{progress}%</div>
                <div className="text-gray-300 text-xs">Completado</div>
              </div>
            </div>
          </div>

          {/* Carta actual */}
          {currentCard && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center justify-center gap-4">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl px-6 py-3 border border-purple-400">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <div className="text-white font-bold">Carta Revelada:</div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xl ${currentCard.isRed ? 'text-red-300' : 'text-gray-300'}`}>
                          {currentCard.value}{currentCard.suit}
                        </span>
                        <span className="text-purple-200">→</span>
                        <span className="text-yellow-300 font-bold">Grupo {currentCard.numericValue}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {gameMode === 'manual' && (
                  <div className="bg-yellow-600/20 border border-yellow-400/50 rounded-lg px-4 py-2">
                    <div className="text-yellow-300 font-semibold text-sm">
                      💡 Haz clic en el grupo {currentCard.numericValue} para colocar la carta
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tablero principal */}
      <div className={`relative bg-gradient-to-br ${theme.board} rounded-3xl border-4 ${theme.border} shadow-2xl p-6 lg:p-8`}>
        {/* Efectos de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
        
        {/* Título del tablero */}
        <div className="text-center mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            🔮 Tablero del Oráculo
          </h2>
          <p className="text-gray-300 text-sm lg:text-base">
            Organiza las cartas en sus grupos correspondientes (A=1, J=11, Q=12, K=13)
          </p>
        </div>

        {/* Layout del tablero en cuadrícula 4x4 */}
        <div className="relative">
          <div className="grid grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10 w-full max-w-4xl md:max-w-5xl lg:max-w-6xl mx-auto">
            {/* Fila 1 */}
            <div className="aspect-[3/4]">
              {groups[1] && (
                <CardGroupView
                  groupNumber={1}
                  group={groups[1]}
                  onClick={() => onGroupClick(1)}
                  isClickable={(gameMode || 'manual') === 'manual' && gameState === 'playing'}
                  isCenter={false}
                  currentCard={currentCard}
                  isBlocked={currentCard !== null}
                  allowedGroup={currentCard ? currentCard.numericValue : null}
                  allGroups={groups}
                />
              )}
            </div>
            <div className="aspect-[3/4]">
              {groups[2] && (
                <CardGroupView
                  groupNumber={2}
                  group={groups[2]}
                  onClick={() => onGroupClick(2)}
                  isClickable={(gameMode || 'manual') === 'manual' && gameState === 'playing'}
                  isCenter={false}
                  currentCard={currentCard}
                  isBlocked={currentCard !== null}
                  allowedGroup={currentCard ? currentCard.numericValue : null}
                  allGroups={groups}
                />
              )}
            </div>
            <div className="aspect-[3/4]">
              {groups[3] && (
                <CardGroupView
                  groupNumber={3}
                  group={groups[3]}
                  onClick={() => onGroupClick(3)}
                  isClickable={(gameMode || 'manual') === 'manual' && gameState === 'playing'}
                  isCenter={false}
                  currentCard={currentCard}
                  isBlocked={currentCard !== null}
                  allowedGroup={currentCard ? currentCard.numericValue : null}
                  allGroups={groups}
                />
              )}
              
            </div>
            <div className="aspect-[3/4]">
              {groups[4] && (
                <CardGroupView
                  groupNumber={4}
                  group={groups[4]}
                  onClick={() => onGroupClick(4)}
                  isClickable={(gameMode || 'manual') === 'manual' && gameState === 'playing'}
                  isCenter={false}
                  currentCard={currentCard}
                  isBlocked={currentCard !== null}
                  allowedGroup={currentCard ? currentCard.numericValue : null}
                />
              )}
            </div>

            {/* Fila 2 */}
            <div className="aspect-[3/4]">
              {groups[12] && (
                <CardGroupView
                  groupNumber={12}
                  group={groups[12]}
                  onClick={() => onGroupClick(12)}
                  isClickable={(gameMode || 'manual') === 'manual' && gameState === 'playing'}
                  isCenter={false}
                  currentCard={currentCard}
                  isBlocked={currentCard !== null}
                  allowedGroup={currentCard ? currentCard.numericValue : null}
                />
              )}
            </div>
            {/* Grupo central (13) - K - ocupa 2x2 */}
            <div className="col-span-2 row-span-2 aspect-square">
              {groups[13] && (
                <CardGroupView
                  groupNumber={13}
                  group={groups[13]}
                  onClick={() => onGroupClick(13)}
                  isClickable={(gameMode || 'manual') === 'manual' && gameState === 'playing'}
                  isCenter={true}
                  currentCard={currentCard}
                  isBlocked={currentCard !== null}
                  allowedGroup={currentCard ? currentCard.numericValue : null}
                />
              )}
            </div>
            <div className="aspect-[3/4]">
              {groups[5] && (
                <CardGroupView
                  groupNumber={5}
                  group={groups[5]}
                  onClick={() => onGroupClick(5)}
                  isClickable={(gameMode || 'manual') === 'manual' && gameState === 'playing'}
                  isCenter={false}
                  currentCard={currentCard}
                  isBlocked={currentCard !== null}
                  allowedGroup={currentCard ? currentCard.numericValue : null}
                />
              )}
            </div>

            {/* Fila 3 */}
            <div className="aspect-[3/4]">
              {groups[11] && (
                <CardGroupView
                  groupNumber={11}
                  group={groups[11]}
                  onClick={() => onGroupClick(11)}
                  isClickable={gameMode === 'manual' && gameState === 'playing'}
                  isCenter={false}
                  currentCard={currentCard}
                  isBlocked={currentCard !== null}
                  allowedGroup={currentCard ? currentCard.numericValue : null}
                />
              )}
            </div>
            {/* El centro ya está ocupado por el grupo 13 */}
            <div className="aspect-[3/4]">
              {groups[6] && (
                <CardGroupView
                  groupNumber={6}
                  group={groups[6]}
                  onClick={() => onGroupClick(6)}
                  isClickable={gameMode === 'manual' && gameState === 'playing'}
                  isCenter={false}
                  currentCard={currentCard}
                  isBlocked={currentCard !== null}
                  allowedGroup={currentCard ? currentCard.numericValue : null}
                />
              )}
            </div>

            {/* Fila 4 */}
            <div className="aspect-[3/4]">
              {groups[10] && (
                <CardGroupView
                  groupNumber={10}
                  group={groups[10]}
                  onClick={() => onGroupClick(10)}
                  isClickable={gameMode === 'manual' && gameState === 'playing'}
                  isCenter={false}
                  currentCard={currentCard}
                  isBlocked={currentCard !== null}
                  allowedGroup={currentCard ? currentCard.numericValue : null}
                />
              )}
            </div>
            <div className="aspect-[3/4]">
              {groups[9] && (
                <CardGroupView
                  groupNumber={9}
                  group={groups[9]}
                  onClick={() => onGroupClick(9)}
                  isClickable={gameMode === 'manual' && gameState === 'playing'}
                  isCenter={false}
                  currentCard={currentCard}
                  isBlocked={currentCard !== null}
                  allowedGroup={currentCard ? currentCard.numericValue : null}
                />
              )}
            </div>
            <div className="aspect-[3/4]">
              {groups[8] && (
                <CardGroupView
                  groupNumber={8}
                  group={groups[8]}
                  onClick={() => onGroupClick(8)}
                  isClickable={gameMode === 'manual' && gameState === 'playing'}
                  isCenter={false}
                  currentCard={currentCard}
                  isBlocked={currentCard !== null}
                  allowedGroup={currentCard ? currentCard.numericValue : null}
                />
              )}
            </div>
            <div className="aspect-[3/4]">
              {groups[7] && (
                <CardGroupView
                  groupNumber={7}
                  group={groups[7]}
                  onClick={() => onGroupClick(7)}
                  isClickable={gameMode === 'manual' && gameState === 'playing'}
                  isCenter={false}
                  currentCard={currentCard}
                  isBlocked={currentCard !== null}
                  allowedGroup={currentCard ? currentCard.numericValue : null}
                />
              )}
            </div>
          </div>
        </div>

        {/* Efectos especiales según el estado del juego */}
        {gameState === 'won' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-6xl lg:text-8xl animate-bounce mb-4">🏆</div>
              <div className="text-2xl lg:text-4xl font-bold text-yellow-400 animate-pulse">
                ¡VICTORIA!
              </div>
            </div>
          </div>
        )}

        {gameState === 'lost' && (
          <div className="absolute inset-0 bg-red-900/40 rounded-3xl flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-6xl lg:text-8xl animate-pulse mb-4">💀</div>
              <div className="text-2xl lg:text-4xl font-bold text-red-400">
                Derrota
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leyenda mejorada */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Información de cartas */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span>🃏</span>
            Tipos de Cartas
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-4 h-5 bg-blue-600 rounded border border-blue-400"></div>
              <span className="text-gray-300">Cartas ocultas</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-5 bg-white rounded border border-gray-300"></div>
              <span className="text-gray-300">Cartas reveladas</span>
            </div>
          </div>
        </div>

        {/* Valores de cartas */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span>🔢</span>
            Valores
          </h3>
          <div className="text-sm text-gray-300 space-y-1">
            <div>A = 1, 2-10 = Valor facial</div>
            <div>J = 11, Q = 12, K = 13</div>
            <div className="text-yellow-300">⭐ = Grupo central (K)</div>
          </div>
        </div>

        {/* Controles */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span>🎮</span>
            Controles
          </h3>
          <div className="text-sm text-gray-300 space-y-1">
            {gameMode === 'manual' ? (
              <>
                <div>• Haz clic para revelar cartas</div>
                <div>• Coloca en el grupo correcto</div>
              </>
            ) : (
              <>
                <div>• Juego automático</div>
                <div>• Observa la estrategia</div>
              </>
            )}
            <div className="text-green-300">🔒 = Grupo bloqueado</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoardViewImproved;
