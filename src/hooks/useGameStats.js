import { useState, useEffect, useCallback } from 'react';

// Hook personalizado para estadísticas del juego
export const useGameStats = () => {
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    totalMoves: 0,
    bestTime: null,
    currentStreak: 0,
    bestStreak: 0,
    achievements: [],
    totalPlayTime: 0,
    averageMovesPerGame: 0,
    winRate: 0,
    favoriteTheme: 'mystic',
    lastPlayed: null
  });

  const [sessionStats, setSessionStats] = useState({
    startTime: Date.now(),
    movesThisGame: 0,
    gameStartTime: null,
    currentGameTime: 0
  });

  // Cargar estadísticas guardadas
  useEffect(() => {
    const savedStats = localStorage.getItem('oracle-stats');
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats);
        setStats(prevStats => ({ ...prevStats, ...parsedStats }));
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      }
    }
  }, []);

  // Guardar estadísticas
  const saveStats = useCallback((newStats) => {
    try {
      localStorage.setItem('oracle-stats', JSON.stringify(newStats));
    } catch (error) {
      console.error('Error al guardar estadísticas:', error);
    }
  }, []);

  // Iniciar nuevo juego
  const startGame = useCallback(() => {
    setSessionStats(prev => ({
      ...prev,
      gameStartTime: Date.now(),
      movesThisGame: 0,
      currentGameTime: 0
    }));
  }, []);

  // Registrar movimiento
  const recordMove = useCallback(() => {
    setSessionStats(prev => ({
      ...prev,
      movesThisGame: prev.movesThisGame + 1
    }));
  }, []);

  // Finalizar juego
  const endGame = useCallback((won) => {
    const gameTime = Date.now() - sessionStats.gameStartTime;
    const newStats = {
      ...stats,
      gamesPlayed: stats.gamesPlayed + 1,
      gamesWon: won ? stats.gamesWon + 1 : stats.gamesWon,
      gamesLost: won ? stats.gamesLost : stats.gamesLost + 1,
      totalMoves: stats.totalMoves + sessionStats.movesThisGame,
      totalPlayTime: stats.totalPlayTime + gameTime,
      lastPlayed: Date.now(),
      currentStreak: won ? stats.currentStreak + 1 : 0,
      bestStreak: won && stats.currentStreak + 1 > stats.bestStreak 
        ? stats.currentStreak + 1 
        : stats.bestStreak,
      bestTime: won && (stats.bestTime === null || gameTime < stats.bestTime) 
        ? gameTime 
        : stats.bestTime
    };

    // Calcular estadísticas derivadas
    newStats.winRate = newStats.gamesPlayed > 0 
      ? (newStats.gamesWon / newStats.gamesPlayed * 100).toFixed(1)
      : 0;
    
    newStats.averageMovesPerGame = newStats.gamesPlayed > 0 
      ? (newStats.totalMoves / newStats.gamesPlayed).toFixed(1)
      : 0;

    // Verificar logros
    const newAchievements = checkAchievements(newStats, won, sessionStats.movesThisGame, gameTime);
    newStats.achievements = [...new Set([...stats.achievements, ...newAchievements])];

    setStats(newStats);
    saveStats(newStats);

    return {
      gameTime,
      moves: sessionStats.movesThisGame,
      newAchievements
    };
  }, [stats, sessionStats, saveStats]);

  // Verificar logros
  const checkAchievements = (newStats, won, moves, gameTime) => {
    const achievements = [];

    if (won) {
      if (newStats.gamesWon === 1) achievements.push('first_win');
      if (newStats.gamesWon === 10) achievements.push('veteran');
      if (newStats.gamesWon === 50) achievements.push('master');
      if (newStats.currentStreak === 5) achievements.push('streak_5');
      if (newStats.currentStreak === 10) achievements.push('streak_10');
      if (moves <= 20) achievements.push('efficient');
      if (moves <= 15) achievements.push('perfectionist');
      if (gameTime < 60000) achievements.push('speed_demon'); // menos de 1 minuto
      if (newStats.winRate >= 80 && newStats.gamesPlayed >= 10) achievements.push('consistent');
    }

    if (newStats.gamesPlayed === 1) achievements.push('first_game');
    if (newStats.gamesPlayed === 100) achievements.push('dedicated');
    if (newStats.totalPlayTime > 3600000) achievements.push('time_invested'); // más de 1 hora

    return achievements;
  };

  // Actualizar tiempo de juego actual
  useEffect(() => {
    if (sessionStats.gameStartTime) {
      const interval = setInterval(() => {
        setSessionStats(prev => ({
          ...prev,
          currentGameTime: Date.now() - prev.gameStartTime
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [sessionStats.gameStartTime]);

  // Resetear estadísticas
  const resetStats = useCallback(() => {
    const defaultStats = {
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      totalMoves: 0,
      bestTime: null,
      currentStreak: 0,
      bestStreak: 0,
      achievements: [],
      totalPlayTime: 0,
      averageMovesPerGame: 0,
      winRate: 0,
      favoriteTheme: 'mystic',
      lastPlayed: null
    };
    setStats(defaultStats);
    saveStats(defaultStats);
  }, [saveStats]);

  // Actualizar tema favorito
  const updateFavoriteTheme = useCallback((theme) => {
    const newStats = { ...stats, favoriteTheme: theme };
    setStats(newStats);
    saveStats(newStats);
  }, [stats, saveStats]);

  return {
    stats,
    sessionStats,
    startGame,
    recordMove,
    endGame,
    resetStats,
    updateFavoriteTheme
  };
};

// Definiciones de logros
export const achievements = {
  first_game: {
    id: 'first_game',
    name: 'Primer Paso',
    description: 'Juega tu primera partida',
    icon: '🎮',
    rarity: 'common'
  },
  first_win: {
    id: 'first_win',
    name: 'Primera Victoria',
    description: 'Gana tu primera partida',
    icon: '🏆',
    rarity: 'common'
  },
  veteran: {
    id: 'veteran',
    name: 'Veterano',
    description: 'Gana 10 partidas',
    icon: '⭐',
    rarity: 'uncommon'
  },
  master: {
    id: 'master',
    name: 'Maestro del Oráculo',
    description: 'Gana 50 partidas',
    icon: '👑',
    rarity: 'rare'
  },
  streak_5: {
    id: 'streak_5',
    name: 'Racha Dorada',
    description: 'Gana 5 partidas consecutivas',
    icon: '🔥',
    rarity: 'uncommon'
  },
  streak_10: {
    id: 'streak_10',
    name: 'Imparable',
    description: 'Gana 10 partidas consecutivas',
    icon: '💫',
    rarity: 'epic'
  },
  efficient: {
    id: 'efficient',
    name: 'Eficiente',
    description: 'Gana con 20 movimientos o menos',
    icon: '⚡',
    rarity: 'uncommon'
  },
  perfectionist: {
    id: 'perfectionist',
    name: 'Perfeccionista',
    description: 'Gana con 15 movimientos o menos',
    icon: '💎',
    rarity: 'rare'
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Demonio de la Velocidad',
    description: 'Gana en menos de 1 minuto',
    icon: '🚀',
    rarity: 'rare'
  },
  consistent: {
    id: 'consistent',
    name: 'Consistente',
    description: 'Mantén 80% de victorias en 10+ partidas',
    icon: '🎯',
    rarity: 'epic'
  },
  dedicated: {
    id: 'dedicated',
    name: 'Dedicado',
    description: 'Juega 100 partidas',
    icon: '🏅',
    rarity: 'epic'
  },
  time_invested: {
    id: 'time_invested',
    name: 'Inversor de Tiempo',
    description: 'Juega por más de 1 hora total',
    icon: '⏰',
    rarity: 'uncommon'
  }
};
