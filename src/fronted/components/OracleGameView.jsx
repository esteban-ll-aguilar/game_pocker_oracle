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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Inicializa el juego usando el backend
   */ 
  const initializeGame = async () => {
    try {
      setIsLoading(true);
      const initialState = GameAPI.initialize();
      setGameState(initialState);
      
      // Mostrar información sobre modo de juego al iniciar
      setTimeout(() => {
        if (initialState.gameMode === 'automatic') {
          showInfo('El juego está configurado en modo automático según tus preferencias guardadas', 'Preferencias Cargadas');
        } else {
          showInfo(`Preferencias cargadas: Modo ${initialState.gameMode === 'automatic' ? 'Automático' : 'Manual'}, Velocidad ${initialState.gameSpeed === 2000 ? 'Lenta' : (initialState.gameSpeed === 1000 ? 'Normal' : 'Rápida')}`, 'Bienvenido');
        }
      }, 1000);
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
      // Guardar el modo actual antes de iniciar
      const currentMode = gameState ? gameState.gameMode : null;
      
      const newGameState = GameAPI.startGame();
      
      // Forzar el modo guardado si existe y es diferente
      if (currentMode === 'automatic' && newGameState.gameMode !== 'automatic') {
        console.log("Forzando modo automático guardado");
        newGameState.gameMode = 'automatic';
      }
      
      setGameState(newGameState);
      
      // Iniciar seguimiento de estadísticas
      startGame();
      
      // Mensaje basado en el modo de juego (cargado de las preferencias)
      const modeMessage = newGameState.gameMode === 'automatic' 
        ? `¡Nuevo juego iniciado en modo automático! Velocidad: ${
            newGameState.gameSpeed === 2000 ? 'Lenta' : 
            (newGameState.gameSpeed === 1000 ? 'Normal' : 'Rápida')
          }. Observa cómo la IA juega por ti.`
        : '¡Nuevo juego iniciado! Que la suerte te acompañe.';
        
      showInfo(modeMessage, 'Juego Iniciado');
      
      // Simular el tiempo de barajado (reducido para modo automático)
      const shuffleTime = newGameState.gameMode === 'automatic' ? 4000 : 8000;
      setTimeout(() => {
        const readyState = GameAPI.finishShuffle();
        
        // Forzar el modo automático si estaba activo
        if (newGameState.gameMode === 'automatic' && readyState.gameMode !== 'automatic') {
          console.log("Forzando modo automático después del barajado");
          readyState.gameMode = 'automatic';
        }
        
        setGameState(readyState);
        
        // El juego está listo, si está en modo automático iniciar automáticamente
        if (readyState.gameMode === 'automatic') {
          setTimeout(() => {
            console.log("Iniciando juego automáticamente desde grupo central");
            // Comenzar el juego automáticamente revelando del grupo central (13)
            const clickResult = GameAPI.clickGroup(13);
            
            // Forzar el modo automático en el resultado
            clickResult.gameMode = 'automatic';
            
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
      // Guardar el modo actual antes de reiniciar
      const currentMode = gameState ? gameState.gameMode : null;
      
      const resetState = GameAPI.resetGame();
      
      // Forzar el modo automático si estaba activo
      if (currentMode === 'automatic' && resetState.gameMode !== 'automatic') {
        console.log("Forzando modo automático durante el reinicio");
        resetState.gameMode = 'automatic';
      }
      
      setGameState(resetState);
      
      // Mostrar información sobre el modo actual que se mantiene
      if (resetState.gameMode === 'automatic') {
        showInfo('Se mantiene el modo automático como prefieres', 'Juego Reiniciado');
      }
    } catch (error) {
      console.error('Error al reiniciar el juego:', error);
    }
  };

  /**
   * Maneja el clic en un grupo
   */
  const handleGroupClick = async (groupNumber) => {
    try {
      // Guardar el modo actual para preservarlo
      const currentMode = gameState ? gameState.gameMode : null;
      
      console.log("Clic en grupo:", groupNumber, "Modo actual:", currentMode);
      const clickResult = GameAPI.clickGroup(groupNumber);
      
      // Asegurar que se mantiene el modo automático si estaba activo
      if (currentMode === 'automatic' && clickResult.gameMode !== 'automatic') {
        console.log("Forzando modo automático después del clic");
        clickResult.gameMode = 'automatic';
      }
      
      if (clickResult.success) {
        console.log("Clic exitoso en grupo:", groupNumber);
        recordMove(); // Registrar movimiento para estadísticas
        handleGameStateUpdate(clickResult);
      } else {
        // Si hay información de estado en el resultado, actualizar el estado
        if (clickResult.groups && clickResult.gameState) {
          setGameState(prevState => ({
            ...prevState,
            ...clickResult,
            // Mantener el modo actual
            gameMode: currentMode || prevState.gameMode
          }));
        }
        
        // Si estamos en modo automático y el clic no es válido, intentar con otro grupo
        if (currentMode === 'automatic') {
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
    
    // Verificar si el modo de juego debe actualizarse desde localStorage
    // Solo hacerlo si no viene explícitamente en el estado nuevo
    if (!newState.gameMode && localStorage.getItem('gameMode')) {
      console.log("Aplicando modo desde localStorage:", localStorage.getItem('gameMode'));
      newState.gameMode = localStorage.getItem('gameMode');
    }
    
    // Verificar y aplicar la información de configuración
    if (gameState && gameState.configInfo && !newState.configInfo) {
      console.log("Aplicando información de configuración existente");
      newState.configInfo = {
        ...(gameState.configInfo || {}),
        gameMode: newState.gameMode || (gameState ? gameState.gameMode : 'manual'),
        isActive: true
      };
    } else if (!newState.configInfo) {
      // Crear información de configuración si no existe
      newState.configInfo = {
        gameMode: newState.gameMode || (gameState ? gameState.gameMode : 'manual'),
        gameSpeed: newState.gameSpeed || (gameState ? gameState.gameSpeed : 1000),
        isActive: true
      };
    }
    
    // Actualizar el estado completo
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
          const modalCloseTime = newState.gameSpeed ? Math.min(1000, newState.gameSpeed * 0.8) : 1000;
          setTimeout(() => {
            setShowCardReveal(false);
            setRevealedCardInfo(null);
          }, modalCloseTime);
        }
        
        // Calcular tiempo de espera adaptativo según velocidad del juego
        const moveDelayTime = calculateAdaptiveDelay(newState.gameSpeed, showCardReveal);
        
        setTimeout(() => {
          const moveResult = GameAPI.moveCard(
            newState.currentCard, 
            newState.targetGroup || newState.currentCard.numericValue
          );
          handleGameStateUpdate(moveResult);
        }, moveDelayTime);
      }
      // En modo manual, NO mover automáticamente - esperar clic del usuario
    } else if (newState.nextAction === 'waitForNextTurn') {
      const delayTime = newState.gameMode === 'automatic' 
        ? calculateAdaptiveDelay(newState.gameSpeed) 
        : (newState.continueDelay || 1000);
        
      setTimeout(() => {
        const nextTurnState = GameAPI.prepareNextTurn(
          newState.targetGroup, 
          newState.gameMode || 'manual'
        );
        handleGameStateUpdate(nextTurnState);
      }, delayTime);
    } else if (newState.nextAction === 'autoReveal') {
      // En modo automático, continuar automáticamente
      const revealDelay = calculateAdaptiveDelay(newState.gameSpeed);
      setTimeout(() => {
        const autoRevealResult = GameAPI.revealCard(newState.targetGroup);
        handleGameStateUpdate(autoRevealResult);
      }, revealDelay);
    } else if (newState.nextAction === 'waitForClick' && newState.gameMode === 'automatic') {
      // Si está en modo automático pero esperando clic, continuar automáticamente
      
      // Calcular tiempo de espera basado en la velocidad del juego
      const waitTime = (newState.gameSpeed || 1000) * 0.8;
      
      setTimeout(() => {
        // Verificar si el juego sigue activo
        if (newState.gameState !== 'playing') {
          return;
        }
        
        // Usar la lógica del backend para encontrar el mejor grupo para revelar
        const bestTargetGroup = GameAPI.getHints().bestTargetGroup;
        let targetGroup = bestTargetGroup || newState.targetGroup;
        
        // Si no se encontró un grupo objetivo, realizar una búsqueda más exhaustiva
        if (!targetGroup) {
          // Buscar un grupo con cartas para revelar
          const availableGroups = Object.keys(newState.groups || {}).filter(groupNum => {
            const group = newState.groups[groupNum];
            return group && group.cards && group.cards.length > 0;
          });
          
          if (availableGroups.length > 0) {
            // Aplicar heurística avanzada
            const groupScores = availableGroups.map(groupNum => {
              const group = newState.groups[groupNum];
              const numericGroupNum = parseInt(groupNum);
              
              // Puntuación base: número de cartas
              let score = group.cards.length * 10;
              
              // Factor 1: Preferir grupos con distribución más uniforme
              const revealedRatio = group.revealed.length > 0 ? 
                group.cards.length / group.revealed.length : group.cards.length * 2;
              score += revealedRatio * 5;
              
              // Factor 2: Evitar grupos con muchas cartas repetidas
              const valueDistribution = {};
              group.revealed.forEach(card => {
                if (card.numericValue) {
                  valueDistribution[card.numericValue] = 
                    (valueDistribution[card.numericValue] || 0) + 1;
                }
              });
              
              const maxDuplicates = Object.values(valueDistribution).reduce(
                (max, count) => Math.max(max, count), 0);
              if (maxDuplicates > 2) {
                score -= maxDuplicates * 5;
              }
              
              // Factor 3: Aleatoriedad controlada para evitar bloqueos
              score += (Math.random() * 10) - 5;
              
              return { groupNum: numericGroupNum, score };
            });
            
            // Ordenar por puntuación
            groupScores.sort((a, b) => b.score - a.score);
            console.log("Puntuaciones de grupos (fallback):", 
              groupScores.map(g => `Grupo ${g.groupNum}: ${g.score.toFixed(1)}`).join(', '));
            
            targetGroup = groupScores[0].groupNum;
          }
        }
        
        if (targetGroup) {
          console.log("Revelando automáticamente del grupo:", targetGroup);
          const autoRevealResult = GameAPI.revealCard(targetGroup);
          
          // Verificar si la revelación fue exitosa
          if (autoRevealResult.success === false) {
            console.log("Revelación automática fallida, buscando alternativa...");
            
            // Intentar con otro grupo si el primero falló
            const availableGroups = Object.keys(newState.groups || {})
              .filter(gNum => parseInt(gNum) !== targetGroup) // Excluir el grupo que falló
              .filter(gNum => {
                const group = newState.groups[gNum];
                return group && group.cards && group.cards.length > 0;
              });
            
            if (availableGroups.length > 0) {
              const alternativeGroup = parseInt(availableGroups[0]);
              console.log("Intentando grupo alternativo:", alternativeGroup);
              setTimeout(() => {
                const secondAttempt = GameAPI.revealCard(alternativeGroup);
                handleGameStateUpdate(secondAttempt);
              }, 300);
              return;
            }
          }
          
          // Procesar el resultado de la revelación
          handleGameStateUpdate(autoRevealResult);
        } else {
          // Si no hay grupos disponibles, verificar si el juego ha terminado
          console.log("No hay grupos disponibles para revelar, finalizando juego");
          showInfo("No quedan movimientos posibles. El juego ha terminado.", "Fin del juego");
          const updatedState = {...newState, nextAction: 'gameEnd'};
          handleGameStateUpdate(updatedState);
        }
      }, waitTime);
    } else if (newState.nextAction === 'revealFromTarget') {
      // Debe revelar automáticamente del grupo donde se colocó la carta
      const delayTime = newState.gameMode === 'automatic' 
        ? calculateAdaptiveDelay(newState.gameSpeed) 
        : (newState.continueDelay || 1500);
        
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
      console.log("Actualizando configuración:", newSettings);
      
      // Guardar el modo localmente para garantizar que se aplica correctamente
      if (newSettings.gameMode) {
        localStorage.setItem('gameMode', newSettings.gameMode);
      }
      
      // Llamar al API para actualizar la configuración
      const updatedState = GameAPI.updateSettings(newSettings);
      
      // Actualizar el estado local con un manejo mejorado para preservar el modo
      setGameState(prevState => {
        // Asegurarse de que el modo se actualiza correctamente
        const combinedState = { 
          ...prevState, 
          ...updatedState,
          gameMode: newSettings.gameMode || prevState.gameMode,
          gameSpeed: newSettings.gameSpeed || prevState.gameSpeed,
          configInfo: {
            ...(prevState.configInfo || {}),
            gameMode: newSettings.gameMode || prevState.gameMode,
            gameSpeed: newSettings.gameSpeed || prevState.gameSpeed,
            isActive: true
          }
        };
        
        // Mostrar mensaje informativo cuando cambiamos el modo de juego
        if (newSettings.gameMode && newSettings.gameMode !== prevState.gameMode) {
          const modeText = newSettings.gameMode === 'automatic' ? 'Automático' : 'Manual';
          const modeEmoji = newSettings.gameMode === 'automatic' ? '🤖' : '🖱️';
          const modeMessage = `${modeEmoji} Modo ${modeText} activado y guardado en tus preferencias. Se mantendrá en futuros juegos hasta que lo cambies.`;
          
          showInfo(modeMessage, 'Configuración Guardada', 5000);
          
          // Forzar un refresco de la UI con un pequeño delay para asegurar que el cambio se refleja
          setTimeout(() => {
            const refreshState = GameAPI.getCurrentState();
            setGameState(prev => ({ 
              ...prev, 
              ...refreshState,
              gameMode: newSettings.gameMode // Forzar explícitamente el nuevo modo
            }));
          }, 200);
        }
        
        // Si cambiamos la velocidad, mostrar mensaje
        if (newSettings.gameSpeed && newSettings.gameSpeed !== prevState.gameSpeed) {
          const speedText = 
            newSettings.gameSpeed === 2000 ? 'Lenta' :
            newSettings.gameSpeed === 1000 ? 'Normal' : 'Rápida';
          
          showInfo(`⚡ Velocidad ${speedText} configurada y guardada en tus preferencias.`, 'Configuración Guardada');
        }
        
        // Si cambiamos a modo automático y estamos en estado de juego, continuar automáticamente
        if (newSettings.gameMode === 'automatic' && 
            combinedState.gameState === 'playing' &&
            combinedState.nextAction === 'waitForClick') {
          setTimeout(() => {
            console.log("Continuando automáticamente después de cambiar a modo automático");
            // Forzar el modo automático explícitamente
            const currentState = GameAPI.getCurrentState();
            handleGameStateUpdate({
              ...currentState,
              nextAction: 'waitForClick',
              gameMode: 'automatic'
            });
          }, 800); // Dar tiempo para que el usuario vea el mensaje
        }
        
        return combinedState;
      });
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      showError('No se pudo actualizar la configuración');
    }
  };
  
  /**
   * Calcula un tiempo de espera adaptativo basado en la velocidad del juego
   * @param {number} gameSpeed - Velocidad del juego (ms)
   * @param {boolean} hasModal - Si hay un modal activo que requiere tiempo adicional
   * @returns {number} Tiempo de espera ajustado
   */
  const calculateAdaptiveDelay = (gameSpeed, hasModal = false) => {
    // Valores por defecto si no hay velocidad especificada
    if (!gameSpeed) {
      return hasModal ? 1200 : 800;
    }
    
    // Factor de ajuste para diferentes velocidades
    let factor;
    if (gameSpeed <= 500) {
      // Velocidad rápida
      factor = 0.6;
    } else if (gameSpeed <= 1000) {
      // Velocidad normal
      factor = 0.75;
    } else {
      // Velocidad lenta
      factor = 0.85;
    }
    
    // Añadir tiempo extra si hay un modal activo
    const modalFactor = hasModal ? 1.5 : 1;
    
    // Calcular y devolver el tiempo adaptado
    return Math.round(gameSpeed * factor * modalFactor);
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
          
          // Forzar actualización del estado con el modo automático activado
          const refreshedState = GameAPI.getCurrentState();
          setGameState(prev => ({ 
            ...prev, 
            ...refreshedState,
            gameMode: 'automatic' 
          }));
          
          // Intentar continuar el flujo automático
          setTimeout(() => {
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
              handleGameStateUpdate({
                ...moveResult,
                gameMode: 'automatic'
              });
            }
          }, 300);
        }
      }, 10000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
