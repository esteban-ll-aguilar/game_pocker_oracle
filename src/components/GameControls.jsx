import React, { useState } from 'react';

const GameControls = ({ 
  gameMode, 
  setGameMode, 
  gameSpeed, 
  setGameSpeed, 
  onStartGame, 
  onResetGame, 
  gameState, 
  gameHistory = [] 
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const speedOptions = [
    { value: 2000, label: '🐌 Muy Lento', color: 'text-red-400' },
    { value: 1500, label: '🚶 Lento', color: 'text-orange-400' },
    { value: 1000, label: '🏃 Normal', color: 'text-yellow-400' },
    { value: 700, label: '🏃‍♂️ Rápido', color: 'text-green-400' },
    { value: 400, label: '⚡ Muy Rápido', color: 'text-blue-400' }
  ];

  const currentSpeedOption = speedOptions.find(option => option.value === gameSpeed);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Controles principales */}
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
        <div className="flex flex-wrap items-center justify-center gap-4">
          
          {/* Botón principal */}
          {gameState === 'menu' && (
            <button
              onClick={onStartGame}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <span>🎮</span>
              <span>Iniciar Juego</span>
            </button>
          )}

          {gameState !== 'menu' && (
            <button
              onClick={onResetGame}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <span>🔄</span>
              <span>Nuevo Juego</span>
            </button>
          )}

          {/* Selector de modo */}
          <div className="flex items-center space-x-2 bg-white/10 rounded-xl p-2">
            <span className="text-white font-semibold text-sm">Modo:</span>
            <button
              onClick={() => setGameMode('manual')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                gameMode === 'manual'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/20 text-gray-300 hover:bg-white/30'
              }`}
            >
              🖱️ Manual
            </button>
            <button
              onClick={() => setGameMode('automatic')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                gameMode === 'automatic'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white/20 text-gray-300 hover:bg-white/30'
              }`}
            >
              🤖 Automático
            </button>
          </div>

          {/* Control de velocidad (solo para modo automático) */}
          {gameMode === 'automatic' && (
            <div className="flex items-center space-x-2 bg-white/10 rounded-xl p-2">
              <span className="text-white font-semibold text-sm">Velocidad:</span>
              <select
                value={gameSpeed}
                onChange={(e) => setGameSpeed(parseInt(e.target.value))}
                className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm font-semibold border border-gray-600 focus:border-blue-400 focus:outline-none"
              >
                {speedOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className={`text-sm font-bold ${currentSpeedOption?.color || 'text-gray-400'}`}>
                {currentSpeedOption?.label || 'Normal'}
              </span>
            </div>
          )}

          {/* Botón de reglas */}
          <button
            onClick={() => setShowRules(!showRules)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
          >
            <span>📖</span>
            <span>Reglas</span>
          </button>

          {/* Botón de historial (solo durante el juego) */}
          {gameState !== 'menu' && gameHistory.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <span>📜</span>
              <span>Historial ({gameHistory.length})</span>
            </button>
          )}
        </div>

        {/* Información del estado actual */}
        {gameState !== 'menu' && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-4 bg-white/10 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  gameState === 'playing' ? 'bg-green-400 animate-pulse' :
                  gameState === 'won' ? 'bg-yellow-400' :
                  gameState === 'lost' ? 'bg-red-400' :
                  'bg-gray-400'
                }`}></div>
                <span className="text-white font-semibold">
                  {gameState === 'playing' && 'Jugando'}
                  {gameState === 'won' && '¡Victoria!'}
                  {gameState === 'lost' && 'Derrota'}
                  {gameState === 'shuffling' && 'Barajando...'}
                </span>
              </div>
              
              {gameMode === 'automatic' && gameState === 'playing' && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300">Velocidad:</span>
                  <span className={`font-bold ${currentSpeedOption?.color || 'text-gray-400'}`}>
                    {currentSpeedOption?.label || 'Normal'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Panel de reglas */}
      {showRules && (
        <div className="mt-4 bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-purple-300">📖 Reglas del Oráculo de la Suerte</h3>
            <button
              onClick={() => setShowRules(false)}
              className="text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>
          
          <div className="text-gray-300 space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-yellow-400 mb-2">🎯 Objetivo</h4>
              <p>Ordenar todas las 52 cartas (sin jokers) en sus grupos correspondientes del 1 al 13.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-yellow-400 mb-2">🎴 Preparación</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Las cartas se barajan de forma realista (no perfecta)</li>
                <li>Se forman 13 grupos: 12 grupos de 4 cartas + 1 grupo central de 4 cartas</li>
                <li>Los grupos se disponen en cuadrado con el grupo 13 en el centro</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-yellow-400 mb-2">🎮 Cómo Jugar</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Siempre se comienza por el grupo central (13)</li>
                <li>Se revela la primera carta del grupo</li>
                <li>La carta se mueve al grupo correspondiente a su valor (A=1, J=11, Q=12, K=13)</li>
                <li>Se continúa desde el grupo donde se movió la carta</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-red-400 mb-2">💀 Reglas de Pérdida</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Bloqueo:</strong> Si un grupo no tiene más cartas para revelar</li>
                <li><strong>Mismo grupo:</strong> Si la carta pertenece al mismo grupo y no quedan más cartas</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-green-400 mb-2">👑 Victoria</h4>
              <p>Se gana cuando todas las cartas han sido ordenadas en sus grupos correspondientes sin caer en las reglas de bloqueo.</p>
            </div>
            
            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
              <h4 className="text-lg font-semibold text-purple-300 mb-2">🔮 Modos de Juego</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Manual:</strong> Haces clic en los grupos para revelar cartas</li>
                <li><strong>Automático:</strong> El juego se desarrolla automáticamente a la velocidad seleccionada</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Panel de historial */}
      {showHistory && gameHistory.length > 0 && (
        <div className="mt-4 bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-yellow-300">📜 Historial de Movimientos</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-2">
            {gameHistory.map((move, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white/10 rounded-lg p-3 border border-white/20"
              >
                <div className="flex items-center space-x-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className={`font-bold text-lg ${move.card.isRed ? 'text-red-400' : 'text-gray-300'}`}>
                    {move.card.value}{move.card.suit}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <span>Grupo {move.fromGroup}</span>
                  <span>→</span>
                  <span>Grupo {move.toGroup}</span>
                </div>
                
                <div className="text-xs text-gray-500">
                  {new Date(move.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center text-gray-400 text-sm">
            Total de movimientos: {gameHistory.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameControls;
