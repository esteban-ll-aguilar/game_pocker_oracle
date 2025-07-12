import React, { useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import { useGameStats } from '../../hooks/useGameStats.js';
import { useNotifications } from '../../components/NotificationSystem.jsx';

/**
 * Componente mejorado de controles del juego
 * Incluye selector de temas, estadísticas rápidas y configuraciones avanzadas
 */
const GameControlsViewEnhanced = ({
  gameMode,
  gameSpeed,
  onStartGame,
  onResetGame,
  onSettingsChange,
  gameState,
  gameHistory = [],
  onShowStats
}) => {
  const { theme, themes, changeTheme } = useTheme();
  const { stats, sessionStats } = useGameStats();
  const { showInfo } = useNotifications();
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  // Formatear tiempo de sesión
  const formatTime = (ms) => {
    if (!ms) return '00:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Manejar cambio de tema
  const handleThemeChange = (themeName) => {
    changeTheme(themeName);
    setShowThemeSelector(false);
    showInfo(`Tema cambiado a ${themes[themeName].name}`, 'Tema Actualizado');
  };

  // Manejar cambio de configuración
  const handleConfigChange = (key, value) => {
    onSettingsChange({ [key]: value });
    showInfo(`${key === 'gameMode' ? 'Modo' : 'Velocidad'} actualizado`, 'Configuración');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Controles principales */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
        {/* Botón principal de acción */}
        {gameState === 'menu' && (
          <button
            onClick={onStartGame}
            className={`
              bg-gradient-to-r ${theme.secondary} 
              text-white px-8 py-3 rounded-xl font-bold text-lg
              hover-lift hover-glow transition-all duration-300
              shadow-2xl border-2 border-white/20
            `}
          >
            <span className="mr-2">{theme.emoji}</span>
            Iniciar Juego
          </button>
        )}

        {gameState !== 'menu' && (
          <div className="flex gap-3">
            <button
              onClick={onStartGame}
              className={`
                bg-gradient-to-r ${theme.secondary} 
                text-white px-6 py-2 rounded-lg font-semibold
                hover-lift transition-all duration-300
                shadow-lg border border-white/20
              `}
            >
              🔄 Nuevo Juego
            </button>
            
            <button
              onClick={onResetGame}
              className="
                bg-gradient-to-r from-gray-600 to-gray-700 
                text-white px-6 py-2 rounded-lg font-semibold
                hover-lift transition-all duration-300
                shadow-lg border border-white/20
              "
            >
              🏠 Menú
            </button>
          </div>
        )}

        {/* Selector de tema */}
        <div className="relative">
          <button
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            className={`
              bg-gradient-to-r ${theme.card} 
              text-white px-4 py-2 rounded-lg font-semibold
              hover-lift transition-all duration-300
              shadow-lg border border-white/20 flex items-center gap-2
            `}
          >
            <span>{theme.emoji}</span>
            <span className="hidden sm:inline">{theme.name}</span>
            <span className="text-xs">▼</span>
          </button>

          {showThemeSelector && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-black/90 backdrop-blur-sm rounded-lg border border-white/20 shadow-2xl z-50">
              <div className="p-2 space-y-1">
                {Object.entries(themes).map(([key, themeOption]) => (
                  <button
                    key={key}
                    onClick={() => handleThemeChange(key)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg transition-all duration-200
                      flex items-center gap-3
                      ${key === theme.name.toLowerCase().replace(/\s+/g, '') 
                        ? 'bg-white/20 text-white' 
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <span className="text-lg">{themeOption.emoji}</span>
                    <span className="font-medium">{themeOption.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas rápidas */}
        {onShowStats && (
          <button
            onClick={onShowStats}
            className={`
              bg-gradient-to-r ${theme.card} 
              text-white px-4 py-2 rounded-lg font-semibold
              hover-lift transition-all duration-300
              shadow-lg border border-white/20 flex items-center gap-2
            `}
          >
            <span>📊</span>
            <span className="hidden sm:inline">Estadísticas</span>
          </button>
        )}
      </div>

      {/* Información de sesión actual */}
      {gameState === 'playing' && sessionStats.gameStartTime && (
        <div className="flex justify-center mb-4">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <span>⏱️</span>
                <span>{formatTime(sessionStats.currentGameTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🎯</span>
                <span>{sessionStats.movesThisGame} movimientos</span>
              </div>
              {stats.currentStreak > 0 && (
                <div className="flex items-center gap-2">
                  <span>🔥</span>
                  <span>{stats.currentStreak} racha</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Configuraciones avanzadas */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center gap-2"
        >
          <span>⚙️</span>
          <span>Configuración Avanzada</span>
          <span className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
      </div>

      {showAdvanced && (
        <div className="mt-4 bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Modo de juego */}
            <div>
              <label className="block text-white font-semibold mb-2">Modo de Juego</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleConfigChange('gameMode', 'manual')}
                  className={`
                    flex-1 px-3 py-2 rounded-lg font-medium transition-all duration-200
                    ${gameMode === 'manual' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }
                  `}
                >
                  🖱️ Manual
                </button>
                <button
                  onClick={() => handleConfigChange('gameMode', 'automatic')}
                  className={`
                    flex-1 px-3 py-2 rounded-lg font-medium transition-all duration-200
                    ${gameMode === 'automatic' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }
                  `}
                >
                  🤖 Automático
                </button>
              </div>
            </div>

            {/* Velocidad del juego */}
            <div>
              <label className="block text-white font-semibold mb-2">Velocidad</label>
              <div className="flex gap-2">
                {[
                  { value: 2000, label: '🐌 Lento' },
                  { value: 1000, label: '⚡ Normal' },
                  { value: 500, label: '🚀 Rápido' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => handleConfigChange('gameSpeed', value)}
                    className={`
                      flex-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm
                      ${gameSpeed === value 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          {stats.gamesPlayed > 0 && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <h4 className="text-white font-semibold mb-2">📈 Resumen de Estadísticas</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="text-center">
                  <div className="text-white font-bold">{stats.gamesPlayed}</div>
                  <div className="text-gray-400">Partidas</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-bold">{stats.winRate}%</div>
                  <div className="text-gray-400">Victorias</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-400 font-bold">{stats.bestStreak}</div>
                  <div className="text-gray-400">Mejor Racha</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 font-bold">{stats.averageMovesPerGame}</div>
                  <div className="text-gray-400">Prom. Movs</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cerrar selector de tema al hacer clic fuera */}
      {showThemeSelector && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowThemeSelector(false)}
        />
      )}
    </div>
  );
};

export default GameControlsViewEnhanced;
