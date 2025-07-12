import React, { useState } from 'react';
import { useGameStats, achievements } from '../hooks/useGameStats.js';
import { useTheme } from '../hooks/useTheme.js';

// Componente para mostrar un logro individual
const AchievementCard = ({ achievementId, isUnlocked, theme }) => {
  const achievement = achievements[achievementId];
  if (!achievement) return null;

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'from-gray-500 to-gray-600';
      case 'uncommon': return 'from-green-500 to-emerald-600';
      case 'rare': return 'from-blue-500 to-cyan-600';
      case 'epic': return 'from-purple-500 to-pink-600';
      case 'legendary': return 'from-yellow-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className={`
      relative p-3 rounded-lg border-2 transition-all duration-300
      ${isUnlocked 
        ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} border-white/30 shadow-lg` 
        : 'bg-gray-800/50 border-gray-600/30 grayscale'
      }
    `}>
      <div className="flex items-center space-x-3">
        <div className={`text-2xl ${isUnlocked ? '' : 'opacity-30'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold text-sm ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
            {achievement.name}
          </h4>
          <p className={`text-xs ${isUnlocked ? 'text-white/80' : 'text-gray-500'}`}>
            {achievement.description}
          </p>
          <div className={`text-xs mt-1 font-semibold ${
            achievement.rarity === 'common' ? 'text-gray-300' :
            achievement.rarity === 'uncommon' ? 'text-green-300' :
            achievement.rarity === 'rare' ? 'text-blue-300' :
            achievement.rarity === 'epic' ? 'text-purple-300' :
            'text-yellow-300'
          }`}>
            {achievement.rarity.toUpperCase()}
          </div>
        </div>
      </div>
      
      {!isUnlocked && (
        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 text-xs font-bold">🔒 BLOQUEADO</span>
        </div>
      )}
    </div>
  );
};

// Panel principal de estadísticas
const StatsPanel = ({ isOpen, onClose }) => {
  const { stats, resetStats } = useGameStats();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const formatTime = (milliseconds) => {
    if (!milliseconds) return 'N/A';
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Nunca';
    return new Date(timestamp).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReset = () => {
    resetStats();
    setShowResetConfirm(false);
    if (window.showNotification) {
      window.showNotification({
        type: 'info',
        title: 'Estadísticas Reiniciadas',
        message: 'Todas las estadísticas han sido reiniciadas',
        duration: 3000
      });
    }
  };

  const unlockedAchievements = stats.achievements || [];
  const totalAchievements = Object.keys(achievements).length;
  const achievementProgress = totalAchievements > 0 ? (unlockedAchievements.length / totalAchievements * 100).toFixed(1) : 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`
        bg-gradient-to-br ${theme.primary} 
        rounded-2xl border-2 ${theme.border} shadow-2xl 
        w-full max-w-4xl max-h-[90vh] overflow-hidden
        transform transition-all duration-300
      `}>
        {/* Header */}
        <div className={`bg-gradient-to-r ${theme.secondary} p-4 border-b border-white/20`}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <span>📊</span>
              <span>Estadísticas del Oráculo</span>
            </h2>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors duration-200 text-2xl"
            >
              ✕
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 mt-4">
            {[
              { id: 'general', name: 'General', icon: '📈' },
              { id: 'achievements', name: 'Logros', icon: '🏆' },
              { id: 'settings', name: 'Configuración', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200
                  ${activeTab === tab.id 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Estadísticas principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{stats.gamesPlayed}</div>
                  <div className="text-sm text-white/70">Partidas Jugadas</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.gamesWon}</div>
                  <div className="text-sm text-white/70">Victorias</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">{stats.gamesLost}</div>
                  <div className="text-sm text-white/70">Derrotas</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{stats.winRate}%</div>
                  <div className="text-sm text-white/70">Tasa de Victoria</div>
                </div>
              </div>

              {/* Estadísticas detalladas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="text-lg font-bold text-white mb-4">🎯 Rendimiento</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Mejor Tiempo:</span>
                      <span className="text-white font-semibold">{formatTime(stats.bestTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Movimientos Totales:</span>
                      <span className="text-white font-semibold">{stats.totalMoves}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Promedio por Partida:</span>
                      <span className="text-white font-semibold">{stats.averageMovesPerGame}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Tiempo Total Jugado:</span>
                      <span className="text-white font-semibold">{formatTime(stats.totalPlayTime)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="text-lg font-bold text-white mb-4">🔥 Rachas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Racha Actual:</span>
                      <span className="text-white font-semibold">{stats.currentStreak}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Mejor Racha:</span>
                      <span className="text-white font-semibold">{stats.bestStreak}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Última Partida:</span>
                      <span className="text-white font-semibold">{formatDate(stats.lastPlayed)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Logros Desbloqueados:</span>
                      <span className="text-white font-semibold">{unlockedAchievements.length}/{totalAchievements}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progreso de logros */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-4">🏆 Progreso de Logros</h3>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${achievementProgress}%` }}
                  />
                </div>
                <div className="text-center text-white/70 text-sm">
                  {achievementProgress}% completado ({unlockedAchievements.length}/{totalAchievements} logros)
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">🏆 Logros Desbloqueados</h3>
                <p className="text-white/70">
                  {unlockedAchievements.length} de {totalAchievements} logros completados
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(achievements).map(achievementId => (
                  <AchievementCard
                    key={achievementId}
                    achievementId={achievementId}
                    isUnlocked={unlockedAchievements.includes(achievementId)}
                    theme={theme}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-4">⚙️ Configuración</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Tema Favorito:</span>
                    <span className="text-white font-semibold">{theme.name}</span>
                  </div>
                  
                  <div className="border-t border-white/20 pt-4">
                    <h4 className="text-white font-semibold mb-3">🗑️ Zona Peligrosa</h4>
                    {!showResetConfirm ? (
                      <button
                        onClick={() => setShowResetConfirm(true)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
                      >
                        Reiniciar Todas las Estadísticas
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-red-300 text-sm">
                          ⚠️ Esta acción eliminará permanentemente todas tus estadísticas y logros. ¿Estás seguro?
                        </p>
                        <div className="flex space-x-3">
                          <button
                            onClick={handleReset}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
                          >
                            Sí, Reiniciar Todo
                          </button>
                          <button
                            onClick={() => setShowResetConfirm(false)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
