import React from 'react';

/**
 * Componente de vista para los controles del juego
 * Solo maneja la presentación de los controles, sin lógica de negocio
 */
const GameControlsView = ({ 
  gameMode, 
  gameSpeed, 
  onStartGame, 
  onResetGame, 
  onSettingsChange, 
  gameState, 
  gameHistory = [] 
}) => {
  
  const handleModeChange = (newMode) => {
    onSettingsChange({ gameMode: newMode });
  };

  const handleSpeedChange = (newSpeed) => {
    onSettingsChange({ gameSpeed: newSpeed });
  };

  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-6">
      {/* Controles principales */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Botón principal */}
        {gameState === 'menu' ? (
          <button
            onClick={onStartGame}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 text-lg"
          >
            🎮 Iniciar Juego
          </button>
        ) : (
          <button
            onClick={onResetGame}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-2 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            🔄 Nuevo Juego
          </button>
        )}
      </div>

      {/* Configuración del juego */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
        {/* Selector de modo */}
        <div className="flex items-center space-x-3">
          <span className="text-white font-semibold text-sm sm:text-base">Modo:</span>
          <div className="flex bg-white/10 rounded-full p-1">
            <button
              onClick={() => handleModeChange('manual')}
              className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                gameMode === 'manual'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              🖱️ Manual
            </button>
            <button
              onClick={() => handleModeChange('automatic')}
              className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                gameMode === 'automatic'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              🤖 Auto
            </button>
          </div>
        </div>

        {/* Selector de velocidad (solo en modo automático) */}
        {gameMode === 'automatic' && (
          <div className="flex items-center space-x-3">
            <span className="text-white font-semibold text-sm sm:text-base">Velocidad:</span>
            <div className="flex bg-white/10 rounded-full p-1">
              <button
                onClick={() => handleSpeedChange(2000)}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  gameSpeed === 2000
                    ? 'bg-yellow-500 text-white shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                🐌 Lento
              </button>
              <button
                onClick={() => handleSpeedChange(1000)}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  gameSpeed === 1000
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                🚶 Normal
              </button>
              <button
                onClick={() => handleSpeedChange(500)}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  gameSpeed === 500
                    ? 'bg-red-500 text-white shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                🏃 Rápido
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas del juego (solo durante el juego) */}
      {gameState !== 'menu' && gameHistory.length > 0 && (
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">📊</span>
              <span>Movimientos: {gameHistory.length}</span>
            </div>
            
            {gameHistory.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-green-400">🎯</span>
                <span>
                  Última carta: {gameHistory[gameHistory.length - 1].card.value}
                  {gameHistory[gameHistory.length - 1].card.suit}
                </span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <span className="text-purple-400">⚡</span>
              <span>Modo: {gameMode === 'manual' ? 'Manual' : 'Automático'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Instrucciones rápidas */}
      {gameState === 'menu' && (
        <div className="text-center max-w-md">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">📋 Instrucciones</h3>
            <ul className="text-gray-300 text-xs sm:text-sm space-y-1 text-left">
              <li>• Las cartas se organizan en 13 grupos</li>
              <li>• Cada carta debe ir a su grupo correspondiente (A=1, J=11, Q=12, K=13)</li>
              <li>• El juego comienza desde el centro (K)</li>
              <li>• ¡No dejes que una carta vuelva a su grupo original!</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameControlsView;
