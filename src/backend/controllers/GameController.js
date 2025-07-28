import GameService from '../services/GameService.js';
import OracleMessageService from '../services/OracleMessageService.js';
import BoardLayoutService from '../services/BoardLayoutService.js';
import OracleGenieService from '../services/OracleGenieService.js';

/**
 * Controlador principal del juego
 * Coordina todos los servicios y maneja la lógica de flujo del juego
 */
class GameController {
  constructor() {
    this.gameService = new GameService();
    this.messageService = new OracleMessageService();
    this.boardService = new BoardLayoutService();
    
    // Estado de la UI
    this.showShuffleModal = false;
    this.isReturningPlayer = false;
  }

  /**
   * Inicializa el juego y obtiene el estado inicial
   * @returns {Object} Estado inicial completo del juego
   */
  initializeGame() {
    const message = this.messageService.getWelcomeMessage();
    const gameState = this.gameService.getCurrentGameState();
    
    // Determinar mensaje personalizado basado en las preferencias cargadas
    let welcomeMessage = message;
    if (gameState.gameMode === 'automatic') {
      welcomeMessage += ` Modo automático activo según tus preferencias.`;
    }
    
    return {
      ...gameState,
      message: welcomeMessage,
      showShuffleModal: this.showShuffleModal,
      boardStructure: [],
      configInfo: {
        gameMode: gameState.gameMode,
        gameSpeed: gameState.gameSpeed,
        isPreference: true
      }
    };
  }

  /**
   * Inicia un nuevo juego
   * @returns {Object} Estado del juego durante el barajado
   */
  startNewGame() {
    this.showShuffleModal = true;
    const gameResult = this.gameService.startNewGame();
    const message = this.messageService.getShufflingMessage();
    
    // Mensaje personalizado basado en el modo del juego
    let modifiedMessage = message;
    if (gameResult.gameMode === 'automatic') {
      modifiedMessage += ` (Modo Automático activo)`;
    }
    
    return {
      ...gameResult,
      message: modifiedMessage,
      showShuffleModal: this.showShuffleModal,
      configInfo: {
        gameMode: gameResult.gameMode,
        gameSpeed: gameResult.gameSpeed,
        isActive: true
      }
    };
  }

  /**
   * Finaliza el barajado y comienza el juego
   * @returns {Object} Estado del juego listo para jugar
   */
  finishShufflingAndStartGame() {
    this.showShuffleModal = false;
    const gameResult = this.gameService.finishShufflingAndStartPlaying();
    
    // Mensaje personalizado basado en el modo de juego
    let message = this.messageService.getGameStartMessage();
    if (gameResult.gameMode === 'automatic') {
      message += ` El juego está en modo automático, observa cómo juega solo.`;
    } else {
      message += ` Comienza revelando cartas con tu mouse.`;
    }
    
    const boardStructure = this.boardService.generateBoardStructure(gameResult.groups);
    
    return {
      ...gameResult,
      message,
      showShuffleModal: this.showShuffleModal,
      boardStructure,
      configInfo: {
        gameMode: gameResult.gameMode,
        gameSpeed: gameResult.gameSpeed,
        isActive: true
      }
    };
  }

  /**
   * Revela la primera carta del grupo central para iniciar el juego
   * @returns {Object} Resultado de revelar la primera carta
   */
  revealInitialCenterCard() {
    return this.handleCardReveal(13);
  }

  /**
   * Maneja la revelación de una carta de un grupo
   * @param {number} groupNumber - Número del grupo
   * @returns {Object} Resultado de la revelación
   */
  handleCardReveal(groupNumber) {
    const revealResult = this.gameService.revealCardFromGroup(groupNumber);
    const gameState = this.gameService.getCurrentGameState();
    
    if (!revealResult.success) {
      // Juego perdido
      const message = revealResult.gameState === 'lost' 
        ? this.messageService.getContextualMessage('lost', { 
            sameGroup: revealResult.message.includes('mismo grupo'),
            card: revealResult.currentCard 
          })
        : revealResult.message;
      
      return {
        ...revealResult,
        message,
        gameMode: gameState.gameMode, // Mantener modo de juego
        gameSpeed: gameState.gameSpeed, // Mantener velocidad
        boardStructure: this.boardService.generateBoardStructure(revealResult.groups || {}),
        configInfo: {
          gameMode: gameState.gameMode,
          gameSpeed: gameState.gameSpeed,
          isActive: true
        }
      };
    }

    // Carta revelada exitosamente
    const message = this.messageService.getCardRevealedMessage(
      revealResult.currentCard, 
      revealResult.targetGroup
    );
    
    const boardStructure = this.boardService.generateBoardStructure(revealResult.groups);
    
    return {
      ...revealResult,
      message,
      boardStructure,
      nextAction: 'moveCard',
      moveDelay: 1500,
      gameMode: gameState.gameMode, // Mantener explícitamente el modo de juego
      gameSpeed: gameState.gameSpeed, // Mantener velocidad
      configInfo: {
        gameMode: gameState.gameMode,
        gameSpeed: gameState.gameSpeed,
        isActive: true
      }
    };
  }

  /**
   * Mueve una carta al grupo de destino
   * @param {Object} card - Carta a mover
   * @param {number} targetGroup - Grupo de destino
   * @returns {Object} Resultado del movimiento
   */
  handleCardMovement(card, targetGroup) {
    const moveResult = this.gameService.moveCardToTargetGroup(card, targetGroup);
    
    // Limpiar la carta actual después de moverla
    this.gameService.currentCard = null;
    
    // Obtener el estado actualizado para mantener modo y velocidad
    const gameState = this.gameService.getCurrentGameState();
    
    if (moveResult.isVictory) {
      // Juego ganado
      const message = this.messageService.getVictoryMessage();
      return {
        ...moveResult,
        message,
        currentCard: null,
        gameMode: gameState.gameMode, // Mantener el modo
        gameSpeed: gameState.gameSpeed, // Mantener la velocidad
        boardStructure: this.boardService.generateBoardStructure(moveResult.groups),
        configInfo: {
          gameMode: gameState.gameMode,
          gameSpeed: gameState.gameSpeed,
          isActive: true
        }
      };

    }

    // Movimiento exitoso, ahora debe revelar del grupo donde se colocó la carta
    const placedMessage = this.messageService.getCardPlacedMessage(targetGroup);
    const boardStructure = this.boardService.generateBoardStructure(moveResult.groups);
    
    // Verificar si el grupo de destino tiene cartas para revelar
    if (moveResult.groups[targetGroup] && moveResult.groups[targetGroup].cards.length > 0) {
      return {
        ...moveResult,
        message: `${placedMessage} Ahora revela una carta del grupo ${targetGroup}.`,
        currentCard: null,
        boardStructure,
        nextAction: 'revealFromTarget',
        nextRevealGroup: targetGroup,
        continueDelay: 1500,
        gameMode: gameState.gameMode, // Mantener el modo
        gameSpeed: gameState.gameSpeed, // Mantener la velocidad
        configInfo: {
          gameMode: gameState.gameMode,
          gameSpeed: gameState.gameSpeed,
          isActive: true
        }
      };
    } else {
      // Si no hay cartas en el grupo de destino, el juego puede estar bloqueado
      return {
        ...moveResult,
        message: `${placedMessage} El grupo ${targetGroup} está vacío. Elige otro grupo para continuar.`,
        currentCard: null,
        boardStructure,
        nextAction: 'waitForClick',
        continueDelay: 1000,
        gameMode: gameState.gameMode, // Mantener el modo
        gameSpeed: gameState.gameSpeed, // Mantener la velocidad
        configInfo: {
          gameMode: gameState.gameMode,
          gameSpeed: gameState.gameSpeed,
          isActive: true
        }
      };
    }
  }

  /**
   * Prepara el siguiente turno del juego
   * @param {number} targetGroup - Grupo para el siguiente turno
   * @param {string} gameMode - Modo de juego (manual/automatic)
   * @returns {Object} Estado preparado para el siguiente turno
   */
  prepareNextTurn(targetGroup, gameMode) {
    const gameState = this.gameService.getCurrentGameState();
    
    // Asegurarse de que el modo de juego esté sincronizado
    if (gameMode && gameMode !== gameState.gameMode) {
      // Actualizar el modo de juego si es diferente
      this.gameService.updateGameConfiguration({ gameMode: gameMode });
    }
    
    // Usar el modo proporcionado o el actual del estado del juego
    const currentMode = gameMode || gameState.gameMode;
    
    if (currentMode === 'automatic') {
      // En modo automático, elegir el mejor grupo para revelar
      const bestGroup = this.gameService.getBestGroupForAutoReveal();
      
      if (bestGroup === null) {
        // No hay más grupos disponibles
        return {
          ...gameState,
          message: 'No hay más cartas para revelar',
          nextAction: 'gameEnd',
          boardStructure: this.boardService.generateBoardStructure(gameState.groups)
        };
      }
      
      return {
        ...gameState,
        message: this.messageService.getMotivationalMessage(),
        nextAction: 'autoReveal',
        targetGroup: bestGroup,
        gameMode: 'automatic', // Modo automático explícito
        boardStructure: this.boardService.generateBoardStructure(gameState.groups)
      };
    } else {
      return {
        ...gameState,
        message: this.messageService.getNextTurnMessage(targetGroup),
        nextAction: 'waitForClick',
        targetGroup,
        gameMode: 'manual', // Modo manual explícito
        boardStructure: this.boardService.generateBoardStructure(gameState.groups)
      };
    }
  }

  /**
   * Maneja el clic en un grupo (solo modo manual)
   * @param {number} groupNumber - Número del grupo clickeado
   * @returns {Object} Resultado del clic
   */
  handleGroupClick(groupNumber) {
    const gameState = this.gameService.getCurrentGameState();
    
    // Si no estamos en estado de juego, no procesar clics
    if (gameState.gameState !== 'playing') {
      return {
        success: false,
        message: 'Acción no permitida en el estado actual del juego',
        gameMode: gameState.gameMode // Mantener el modo actual
      };
    }
    
    // Comprobar reglas específicas para modo manual
    if (gameState.gameMode === 'manual') {
      // Si hay una carta revelada, solo permitir clic en el grupo correcto
      if (gameState.currentCard) {
        const targetGroup = gameState.currentCard.numericValue;
        if (groupNumber !== targetGroup) {
          return {
            success: false,
            message: `Debes colocar la carta ${gameState.currentCard.value}${gameState.currentCard.suit} en el grupo ${targetGroup}`,
            currentCard: gameState.currentCard,
            groups: gameState.groups,
            gameState: gameState.gameState,
            gameMode: gameState.gameMode, // Mantener el modo actual
            boardStructure: this.boardService.generateBoardStructure(gameState.groups)
          };
        }
        
        // Mover la carta al grupo correcto
        return this.handleCardMovement(gameState.currentCard, targetGroup);
      }
    }
    
    // Verificar si el grupo puede ser clickeado (para ambos modos)
    if (!this.gameService.canClickGroup(groupNumber)) {
      return {
        success: false,
        message: 'Este grupo no tiene cartas para revelar',
        groups: gameState.groups,
        gameState: gameState.gameState,
        gameMode: gameState.gameMode, // Mantener el modo actual
        boardStructure: this.boardService.generateBoardStructure(gameState.groups)
      };
    }

    // Para ambos modos, revelar la carta
    return this.handleCardReveal(groupNumber);
  }

  /**
   * Reinicia el juego al estado inicial
   * @returns {Object} Estado inicial del juego
   */
  resetGame() {
    this.showShuffleModal = false;
    this.isReturningPlayer = true;
    
    const resetResult = this.gameService.resetGameToInitialState();
    
    // Mensaje personalizado según el modo de juego
    let message = this.messageService.getWelcomeBackMessage();
    if (resetResult.gameMode === 'automatic') {
      message += ` Se mantiene el modo automático según tus preferencias.`;
    } else {
      message += ` Modo manual activo.`;
    }
    
    return {
      ...resetResult,
      message,
      showShuffleModal: this.showShuffleModal,
      boardStructure: [],
      configInfo: {
        gameMode: resetResult.gameMode,
        gameSpeed: resetResult.gameSpeed,
        isActive: true
      }
    };
  }

  /**
   * Actualiza la configuración del juego
   * @param {Object} config - Nueva configuración
   * @returns {Object} Estado actualizado del juego
   */
  updateGameSettings(config) {
    // Actualizar la configuración del juego en el servicio
    const updatedConfig = this.gameService.updateGameConfiguration(config);
    const gameState = this.gameService.getCurrentGameState();
    
    let configMessage = 'Configuración actualizada:';
    
    if (config.gameMode !== undefined) {
      configMessage += ` Modo ${config.gameMode === 'automatic' ? 'Automático' : 'Manual'}`;
    }
    
    if (config.gameSpeed !== undefined) {
      const speedText = config.gameSpeed === 2000 ? 'Lento' : 
                       (config.gameSpeed === 1000 ? 'Normal' : 'Rápido');
      configMessage += ` | Velocidad ${speedText}`;
    }
    
    configMessage += ` (guardado en preferencias)`;
    
    return {
      ...gameState,
      message: configMessage,
      boardStructure: this.boardService.generateBoardStructure(gameState.groups)
    };
  }

  /**
   * Obtiene el estado completo actual del juego
   * @returns {Object} Estado completo del juego
   */
  getCurrentState() {
    const gameState = this.gameService.getCurrentGameState();
    const boardStructure = this.boardService.generateBoardStructure(gameState.groups);
    const boardStats = this.boardService.getBoardStatistics(gameState.groups);
    
    // Mensaje contextual basado en el estado y modo de juego
    let contextMessage = this.messageService.getContextualMessage(gameState.gameState);
    
    if (gameState.gameState === 'playing') {
      // Añadir indicador del modo actual al mensaje
      const modeText = gameState.gameMode === 'automatic' 
        ? '📱 Modo Automático activo' 
        : '🖱️ Modo Manual activo';
      contextMessage = `${contextMessage} (${modeText})`;
    }
    
    return {
      ...gameState,
      showShuffleModal: this.showShuffleModal,
      boardStructure,
      boardStats,
      message: contextMessage,
      configInfo: {
        gameMode: gameState.gameMode,
        gameSpeed: gameState.gameSpeed,
        isActive: true
      }
    };
  }

  /**
   * Obtiene estadísticas del juego actual
   * @returns {Object} Estadísticas detalladas
   */
  getGameStatistics() {
    const gameState = this.gameService.getCurrentGameState();
    const boardStats = this.boardService.getBoardStatistics(gameState.groups);
    
    return {
      ...boardStats,
      gameHistory: gameState.gameHistory,
      currentGameState: gameState.gameState,
      gameMode: gameState.gameMode,
      totalMoves: gameState.gameHistory.length
    };
  }

  /**
   * Valida el estado actual del juego
   * @returns {Object} Resultado de la validación
   */
  validateGameState() {
    const gameState = this.gameService.getCurrentGameState();
    const boardValidation = this.boardService.validateBoardLayout(gameState.groups);
    
    return {
      isValid: boardValidation.isValid,
      errors: boardValidation.errors,
      warnings: boardValidation.warnings,
      gameState: gameState.gameState
    };
  }

  /**
   * Obtiene sugerencias para el próximo movimiento (modo ayuda)
   * @returns {Object} Sugerencias de movimiento
   */
  getMovementHints() {
    const gameState = this.gameService.getCurrentGameState();
    
    if (gameState.gameState !== 'playing') {
      return { hints: [], message: 'No hay sugerencias disponibles en este momento' };
    }

    const hints = [];
    const stats = this.boardService.getBoardStatistics(gameState.groups);
    
    // Encontrar el mejor grupo para revelar en modo automático
    const bestTargetGroup = this.gameService.getBestGroupForAutoReveal();
    
    if (stats.totalCards <= 10) {
      hints.push('¡Cuidado! Quedan pocas cartas, cada movimiento es crucial');
    }
    
    if (gameState.currentCard) {
      hints.push(`La carta actual (${gameState.currentCard.value}${gameState.currentCard.suit}) debe ir al grupo ${gameState.currentCard.numericValue}`);
    } else if (bestTargetGroup) {
      hints.push(`Te recomiendo revelar una carta del grupo ${bestTargetGroup} para optimizar tus posibilidades`);
    }
    
    // Analizar la distribución actual de cartas
    const groupDistribution = {};
    Object.keys(gameState.groups).forEach(groupNum => {
      const group = gameState.groups[groupNum];
      groupDistribution[groupNum] = {
        cards: group.cards.length,
        revealed: group.revealed.length
      };
    });
    
    // Identificar grupos desbalanceados (muchas cartas reveladas vs. ocultas)
    const unbalancedGroups = Object.entries(groupDistribution)
      .filter(([_, data]) => data.revealed > 3 && data.cards < 2)
      .map(([groupNum, _]) => parseInt(groupNum));
    
    if (unbalancedGroups.length > 0) {
      hints.push(`Los grupos ${unbalancedGroups.join(', ')} están desbalanceados, intenta revelar de otros grupos`);
    }
    
    // Analizar tendencias del juego
    if (stats.completionPercentage > 70) {
      hints.push('¡Estás cerca de completar el juego! Sé estratégico con tus últimos movimientos.');
    }
    
    return {
      hints,
      message: hints.length > 0 ? 'Sugerencias disponibles' : 'No hay sugerencias específicas',
      stats,
      bestTargetGroup
    };
  }
  
  /**
   * Obtiene análisis y consejos del genio para el modo automático
   * @returns {Object} Consejos y estadísticas del modo automático
   */
  getAutomaticModeInsights() {
    const gameState = this.gameService.getCurrentGameState();
    const genieService = new OracleGenieService();
    const advice = genieService.getAutomaticModeAdvice(gameState, gameState.gameHistory);
    
    return {
      ...advice,
      gameState: gameState.gameState,
      gameMode: gameState.gameMode,
      gameSpeed: gameState.gameSpeed
    };
  }
}

export default GameController;
