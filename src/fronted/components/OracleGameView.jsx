import React, { useState, useEffect } from 'react';
import { GameAPI } from '../../backend/index.js';
import { useTheme } from '../../hooks/useTheme.js';
import { useGameStats } from '../../hooks/useGameStats.js';
import { useNotifications } from '../../components/NotificationSystem.jsx';
import { achievements } from '../../hooks/useGameStats.js';
import GameBoardViewImproved from './GameBoardViewImproved.jsx';
import OracleView from './OracleView.jsx';
import GameControlsViewEnhanced from './GameControlsViewEnhanced.jsx';
import ModalView from './ModalView.jsx';
import RiffleShuffleView from './RiffleShuffleView.jsx';
import CardRevealModal from './CardRevealModal.jsx';
import StatsPanel from '../../components/StatsPanel.jsx';
import GenieChat from '../../components/GenieChat.jsx';

/**
 * Componente principal de la vista del juego
 * Integra temas, estadísticas, notificaciones y toda la lógica del juego
 */
const OracleGameView = () => {
  // Hooks personalizados
  const { theme, isAnimating } = useTheme();
  const { startGame, recordMove, endGame, } = useGameStats();
  const { showSuccess, showError, showAchievement, showInfo, showWarning } = useNotifications();

  // Estado de la vista (solo UI)
  const [gameState, setGameState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [showGenieChat, setShowGenieChat] = useState(false);
  
  // Estado del modal de revelación
  const [showCardReveal, setShowCardReveal] = useState(false);
  const [revealedCardInfo, setRevealedCardInfo] = useState(null);

  // Inicializar el juego al montar el componente
  useEffect(() => {
    initializeGame();
  }, []);

  /**
   * Inicializa el juego usando el backend
   */
  const initializeGame = async () => {
    try {
      setIsLoading(true);
      const initialState = GameAPI.initialize();
      setGameState(initialState);
    } catch (error) {
      console.error('Error al inicializar el juego:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Inicia un nuevo juego
   */
  const handleStartGame = async () => {
    try {
      const newGameState = GameAPI.startGame();
      setGameState(newGameState);
      
      // Iniciar seguimiento de estadísticas
      startGame();
      showInfo('¡Nuevo juego iniciado! Que la suerte te acompañe.', 'Juego Iniciado');
      
      // Simular el tiempo de barajado (reducido para modo automático)
      const shuffleTime = newGameState.gameMode === 'automatic' ? 4000 : 8000;
      setTimeout(() => {
        const readyState = GameAPI.finishShuffle();
        setGameState(readyState);
        
        // El juego está listo, si está en modo automático iniciar automáticamente
        if (readyState.gameMode === 'automatic') {
          setTimeout(() => {
            console.log("Iniciando juego automáticamente desde grupo central");
            // Comenzar el juego automáticamente revelando del grupo central (13)
            const clickResult = GameAPI.clickGroup(13);
            if (clickResult.success) {
              handleGameStateUpdate(clickResult);
            } else {
              console.error("Error al iniciar automáticamente:", clickResult.message);
              // Intentar otro enfoque si falla
              const state = GameAPI.getCurrentState();
              handleGameStateUpdate({
                ...state,
                nextAction: 'waitForClick',
                gameMode: 'automatic'
              });
            }
          }, 500);
        }
        // En modo manual, el usuario debe hacer clic en el grupo 13 para empezar
      }, shuffleTime);
    } catch (error) {
      console.error('Error al iniciar el juego:', error);
      showError('Error al iniciar el juego. Inténtalo de nuevo.');
    }
  };

  /**
   * Reinicia el juego
   */
  const handleResetGame = async () => {
    try {
      const resetState = GameAPI.resetGame();
      setGameState(resetState);
    } catch (error) {
      console.error('Error al reiniciar el juego:', error);
    }
  };

  /**
   * Maneja el clic en un grupo
   */
  const handleGroupClick = async (groupNumber) => {
    try {
      console.log("Clic en grupo:", groupNumber);
      const clickResult = GameAPI.clickGroup(groupNumber);
      
      if (clickResult.success) {
        console.log("Clic exitoso en grupo:", groupNumber);
        recordMove(); // Registrar movimiento para estadísticas
        handleGameStateUpdate(clickResult);
      } else {
        // Si hay información de estado en el resultado, actualizar el estado
        if (clickResult.groups && clickResult.gameState) {
          setGameState(prevState => ({
            ...prevState,
            ...clickResult
          }));
        }
        
        // Si estamos en modo automático y el clic no es válido, intentar con otro grupo
        if (gameState && gameState.gameMode === 'automatic') {
          console.log("Clic no válido en modo automático, buscando otro grupo");
          setTimeout(() => {
            // Buscar otro grupo con cartas disponibles
            const availableGroups = Object.keys(gameState.groups || {})
              .filter(gNum => parseInt(gNum) !== groupNumber) // Excluir el grupo actual
              .filter(gNum => {
                const group = gameState.groups[gNum];
                return group && group.cards && group.cards.length > 0;
              });
            
            console.log("Grupos disponibles:", availableGroups);
            
            if (availableGroups.length > 0) {
              // Intentar con otro grupo
              const nextGroup = parseInt(availableGroups[0]);
              console.log("Intentando con grupo alternativo:", nextGroup);
              handleGroupClick(nextGroup);
            } else {
              console.log("No hay grupos disponibles, terminando juego");
              // Si no hay grupos disponibles, manejar fin de juego
              handleGameStateUpdate({
                ...gameState,
                nextAction: 'gameEnd',
                message: 'No hay más grupos con cartas disponibles.'
              });
            }
          }, 500);
        } else {
          console.warn('Clic no válido:', clickResult.message);
          showWarning(clickResult.message || 'Movimiento no válido');
        }
      }
    } catch (error) {
      console.error('Error al hacer clic en el grupo:', error);
      showError('Error al procesar el movimiento');
    }
  };

  /**
   * Actualiza el estado del juego y maneja las acciones siguientes
   */
  const handleGameStateUpdate = (newState) => {
    console.log("Actualización de estado:", newState.nextAction, "Modo:", newState.gameMode);
    setGameState(newState);
    
    // Mostrar modal de revelación si hay una carta revelada (solo una vez por carta)
    if (newState.currentCard && newState.nextAction === 'moveCard' && !showCardReveal) {
      console.log("Mostrando modal de revelación para carta:", newState.currentCard.card);
      setRevealedCardInfo({
        card: newState.currentCard,
        fromGroup: newState.gameHistory && newState.gameHistory.length > 0 
          ? newState.gameHistory[newState.gameHistory.length - 1].fromGroup 
          : 13,
        targetGroup: newState.currentCard.numericValue
      });
      setShowCardReveal(true);
      
      // En modo automático, cerrar el modal después de un tiempo
      if (newState.gameMode === 'automatic') {
        setTimeout(() => {
          console.log("Cerrando automáticamente modal de revelación");
          setShowCardReveal(false);
          setRevealedCardInfo(null);
        }, 1500);
      }
    }
    
    // Verificar si el juego terminó
    if (newState.gameState === 'won') {
      const gameResult = endGame(true);
      showSuccess('¡Felicitaciones! Has completado el Oráculo de la Suerte', '🏆 Victoria');
      
      // Mostrar logros desbloqueados
      if (gameResult.newAchievements && gameResult.newAchievements.length > 0) {
        gameResult.newAchievements.forEach(achievementId => {
          const achievement = achievements[achievementId];
          if (achievement) {
            setTimeout(() => {
              showAchievement(achievement);
            }, 1000);
          }
        });
      }
      
      return;
    } else if (newState.gameState === 'lost') {
     // const gameResult = endGame(false);
      showError('El Oráculo ha decidido tu destino. ¡Inténtalo de nuevo!', '💀 Derrota');
      return;
    }
    
    // Manejar acciones automáticas basadas en el estado
    if (newState.nextAction === 'moveCard') {
      recordMove(); // Registrar movimiento
      
      // En modo automático, mover inmediatamente
      if (newState.gameMode === 'automatic') {
        // Si hay un modal de revelación abierto, cerrarlo automáticamente
        if (showCardReveal) {
          setTimeout(() => {
            setShowCardReveal(false);
            setRevealedCardInfo(null);
          }, 1000);
        }
        
        setTimeout(() => {
          const moveResult = GameAPI.moveCard(
            newState.currentCard, 
            newState.targetGroup || newState.currentCard.numericValue
          );
          handleGameStateUpdate(moveResult);
        }, showCardReveal ? 1200 : 800); // Ajuste del tiempo basado en si hay modal visible
      }
      // En modo manual, NO mover automáticamente - esperar clic del usuario
    } else if (newState.nextAction === 'waitForNextTurn') {
      const delayTime = newState.gameMode === 'automatic' ? 700 : (newState.continueDelay || 1000);
      setTimeout(() => {
        const nextTurnState = GameAPI.prepareNextTurn(
          newState.targetGroup, 
          newState.gameMode || 'manual'
        );
        handleGameStateUpdate(nextTurnState);
      }, delayTime);
    } else if (newState.nextAction === 'autoReveal') {
      // En modo automático, continuar automáticamente
      setTimeout(() => {
        const autoRevealResult = GameAPI.revealCard(newState.targetGroup);
        handleGameStateUpdate(autoRevealResult);
      }, 800); // Tiempo más corto para modo automático
    } else if (newState.nextAction === 'waitForClick' && newState.gameMode === 'automatic') {
      // Si está en modo automático pero esperando clic, continuar automáticamente
      setTimeout(() => {
        // Usar el targetGroup sugerido por el backend o buscar uno disponible
        let targetGroup = newState.targetGroup;
        
        if (!targetGroup) {
          // Buscar un grupo con cartas para revelar
          const availableGroups = Object.keys(newState.groups || {}).filter(groupNum => {
            const group = newState.groups[groupNum];
            return group && group.cards && group.cards.length > 0;
          });
          
          if (availableGroups.length > 0) {
            // Preferir grupos con más cartas para maximizar opciones
            const sortedGroups = availableGroups.sort((a, b) => {
              return newState.groups[b].cards.length - newState.groups[a].cards.length;
            });
            targetGroup = parseInt(sortedGroups[0]);
          }
        }
        
        if (targetGroup) {
          console.log("Revelando automáticamente del grupo:", targetGroup);
          const autoRevealResult = GameAPI.revealCard(targetGroup);
          handleGameStateUpdate(autoRevealResult);
        } else {
          // Si no hay grupos disponibles, intentar verificar si el juego ha terminado
          console.log("No hay grupos disponibles para revelar, finalizando juego");
          const updatedState = {...newState, nextAction: 'gameEnd'};
          handleGameStateUpdate(updatedState);
        }
      }, 800); // Tiempo más corto para flujo continuo
    } else if (newState.nextAction === 'revealFromTarget') {
      // Debe revelar automáticamente del grupo donde se colocó la carta
      const delayTime = newState.gameMode === 'automatic' ? 800 : (newState.continueDelay || 1500);
      setTimeout(() => {
        console.log("Revelando del grupo target:", newState.nextRevealGroup);
        const revealResult = GameAPI.revealCard(newState.nextRevealGroup);
        handleGameStateUpdate(revealResult);
      }, delayTime);
    } else if (newState.nextAction === 'gameEnd') {
      // El juego ha terminado sin victoria explícita
      const resultMessage = newState.message || 'El juego ha terminado. No hay más movimientos posibles.';
      showInfo(resultMessage, 'Fin del Juego');
      
      // Si estamos en modo automático, podemos mostrar la opción de reiniciar
      if (newState.gameMode === 'automatic') {
        setTimeout(() => {
          // Opcional: mostrar un mensaje sugiriendo reiniciar
          showWarning('Puedes iniciar un nuevo juego para intentarlo de nuevo.', 'Sugerencia');
        }, 3000);
      }
    }
  };

  /**
   * Actualiza la configuración del juego
   */
  const handleSettingsUpdate = (newSettings) => {
    try {
      const updatedState = GameAPI.updateSettings(newSettings);
      setGameState(prevState => {
        const combinedState = { ...prevState, ...updatedState };
        
        // Si cambiamos a modo automático y estamos en estado de juego, continuar automáticamente
        if (newSettings.gameMode === 'automatic' && 
            combinedState.gameState === 'playing' &&
            combinedState.nextAction === 'waitForClick') {
          setTimeout(() => {
            console.log("Continuando automáticamente después de cambiar a modo automático");
            handleGameStateUpdate({
              ...combinedState,
              nextAction: 'waitForClick',
              gameMode: 'automatic'
            });
          }, 500);
        }
        
        return combinedState;
      });
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
    }
  };

  /**
   * Maneja las recomendaciones del genio
   */
  const handleGenieRecommendation = (mode) => {
    handleSettingsUpdate({ gameMode: mode });
  };

  /**
   * Cierra el modal de revelación
   */
  const handleCloseCardReveal = () => {
    setShowCardReveal(false);
    setRevealedCardInfo(null);
    
    // Si estamos en modo automático, verificar si hay que continuar con el juego
    if (gameState && gameState.gameMode === 'automatic' && gameState.nextAction === 'moveCard') {
      setTimeout(() => {
        const moveResult = GameAPI.moveCard(
          gameState.currentCard, 
          gameState.targetGroup || gameState.currentCard.numericValue
        );
        handleGameStateUpdate(moveResult);
      }, 200); // Tiempo más corto para que fluya más rápido
    }
  };

  // Efecto para detectar posibles bloqueos en modo automático
  useEffect(() => {
    let timeoutId;
    
    // Solo activar el detector de bloqueo en modo automático y durante el juego
    if (gameState && gameState.gameMode === 'automatic' && gameState.gameState === 'playing') {
      console.log("Configurando detector de bloqueo para modo automático");
      
      // Establecer un tiempo límite para detectar bloqueos (10 segundos sin cambios)
      timeoutId = setTimeout(() => {
        console.log("Comprobando si el juego está bloqueado...");
        
        // Verificar si hay algún grupo con cartas disponibles
        const hasAvailableGroups = Object.values(gameState.groups || {}).some(
          group => group && group.cards && group.cards.length > 0
        );
        
        if (hasAvailableGroups && gameState.nextAction !== 'gameEnd') {
          console.log("Detectado posible bloqueo, continuando flujo...");
          
          // Intentar continuar el flujo automático
          if (gameState.nextAction === 'waitForClick') {
            // Buscar un grupo disponible
            const availableGroups = Object.keys(gameState.groups || {}).filter(gNum => {
              const group = gameState.groups[gNum];
              return group && group.cards && group.cards.length > 0;
            });
            
            if (availableGroups.length > 0) {
              const targetGroup = parseInt(availableGroups[0]);
              console.log("Desbloqueando con clic en grupo:", targetGroup);
              handleGroupClick(targetGroup);
            }
          } else if (gameState.currentCard && gameState.nextAction === 'moveCard') {
            // Mover la carta actual
            console.log("Desbloqueando con movimiento de carta");
            const moveResult = GameAPI.moveCard(
              gameState.currentCard, 
              gameState.targetGroup || gameState.currentCard.numericValue
            );
            handleGameStateUpdate(moveResult);
          }
        }
      }, 10000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [gameState?.gameState, gameState?.nextAction, gameState?.gameMode]);

  // Mostrar loading mientras se inicializa
  if (isLoading || !gameState) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.primary} flex items-center justify-center`}>
        <div className="text-white text-xl loading-shimmer p-4 rounded-lg">
          Cargando el Oráculo...
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.primary} relative ${isAnimating ? 'animate-theme-transition' : ''}`}>
      {/* Efectos de fondo */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-purple-800/10 to-blue-800/10"></div>
      </div>
      
      {/* Modal de shuffle */}
      <ModalView isOpen={gameState.showShuffleModal} onClose={() => {}}>
        <div className="p-4 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-white">
            🔮 El Oráculo está Barajando las Cartas
          </h2>
          <RiffleShuffleView />
        </div>
      </ModalView>

      {/* Modal de revelación de carta */}
      <CardRevealModal
        isOpen={showCardReveal}
        card={revealedCardInfo?.card}
        fromGroup={revealedCardInfo?.fromGroup}
        targetGroup={revealedCardInfo?.targetGroup}
        onClose={handleCloseCardReveal}
        duration={3000}
      />

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header con Oracle */}
        <div className="flex-shrink-0">
          <OracleView 
            message={gameState.message} 
            gameState={gameState.gameState} 
          />
        </div>

        {/* Área de juego */}
        <div className="flex-1 flex items-center justify-center p-2 sm:p-4">
          {gameState.gameState === 'menu' && (
            <div className="text-center px-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-400 mb-6 sm:mb-8">
                🔮 Oráculo de la Suerte
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                Un juego místico donde el destino decide tu suerte. Ordena las 52 cartas en sus grupos correspondientes sin caer en las trampas del oráculo.
              </p>
              <GameControlsViewEnhanced
                gameMode={gameState.gameMode}
                gameSpeed={gameState.gameSpeed}
                onStartGame={handleStartGame}
                onResetGame={handleResetGame}
                onSettingsChange={handleSettingsUpdate}
                gameState={gameState.gameState}
                onShowStats={() => setShowStatsPanel(true)}
              />
            </div>
          )}

          {(gameState.gameState === 'playing' || gameState.gameState === 'won' || gameState.gameState === 'lost') && (
            <GameBoardViewImproved
              groups={gameState.groups}
              currentCard={gameState.currentCard}
              onGroupClick={handleGroupClick}
              gameState={gameState.gameState}
              gameMode={gameState.gameMode}
              boardStructure={gameState.boardStructure}
            />
          )}
        </div>

        {/* Footer con controles */}
        {gameState.gameState !== 'menu' && (
          <div className="flex-shrink-0 p-4">
            <GameControlsViewEnhanced
              gameMode={gameState.gameMode}
              gameSpeed={gameState.gameSpeed}
              onStartGame={handleStartGame}
              onResetGame={handleResetGame}
              onSettingsChange={handleSettingsUpdate}
              gameState={gameState.gameState}
              gameHistory={gameState.gameHistory}
              onShowStats={() => setShowStatsPanel(true)}
            />
          </div>
        )}
      </div>

      {/* Botones flotantes */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        {/* Botón del Genio del Oráculo */}
        <button
          onClick={() => setShowGenieChat(true)}
          className={`
            bg-gradient-to-r from-amber-500 to-orange-500 
            text-white p-3 rounded-full shadow-2xl
            hover-lift hover-glow animate-float
            transition-all duration-300
          `}
          title="Consultar al Genio del Oráculo"
        >
          <span className="text-xl">🧞‍♂️</span>
        </button>

        {/* Botón de estadísticas */}
        <button
          onClick={() => setShowStatsPanel(true)}
          className={`
            bg-gradient-to-r ${theme.secondary} 
            text-white p-3 rounded-full shadow-2xl
            hover-lift hover-glow
            transition-all duration-300
          `}
          title="Ver Estadísticas"
        >
          <span className="text-xl">📊</span>
        </button>
      </div>

      {/* Panel de estadísticas */}
      <StatsPanel 
        isOpen={showStatsPanel} 
        onClose={() => setShowStatsPanel(false)} 
      />

      {/* Chat del Genio */}
      <GenieChat
        isOpen={showGenieChat}
        onClose={() => setShowGenieChat(false)}
        gameState={gameState}
        gameHistory={gameState.gameHistory || []}
        onApplyRecommendation={handleGenieRecommendation}
      />

      {/* Efectos de partículas para el fondo */}
      <div className="particles">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${Math.random() * 3 + 3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default OracleGameView;
