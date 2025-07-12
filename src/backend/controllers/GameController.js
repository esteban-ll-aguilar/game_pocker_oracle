import GameService from '../services/GameService.js';
import OracleMessageService from '../services/OracleMessageService.js';
import BoardLayoutService from '../services/BoardLayoutService.js';

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
    
    return {
      ...gameState,
      message,
      showShuffleModal: this.showShuffleModal,
      boardStructure: []
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
    
    return {
      ...gameResult,
      message,
      showShuffleModal: this.showShuffleModal
    };
  }

  /**
   * Finaliza el barajado y comienza el juego
   * @returns {Object} Estado del juego listo para jugar
   */
  finishShufflingAndStartGame() {
    this.showShuffleModal = false;
    const gameResult = this.gameService.finishShufflingAndStartPlaying();
    const message = this.messageService.getGameStartMessage();
    const boardStructure = this.boardService.generateBoardStructure(gameResult.groups);
    
    return {
      ...gameResult,
      message,
      showShuffleModal: this.showShuffleModal,
      boardStructure
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
        boardStructure: this.boardService.generateBoardStructure(revealResult.groups || {})
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
      moveDelay: 1500
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
    
    if (moveResult.isVictory) {
      // Juego ganado
      const message = this.messageService.getVictoryMessage();
      return {
        ...moveResult,
        message,
        boardStructure: this.boardService.generateBoardStructure(moveResult.groups)
      };
    }

    // Movimiento exitoso, continuar juego
    const placedMessage = this.messageService.getCardPlacedMessage(targetGroup);
    const boardStructure = this.boardService.generateBoardStructure(moveResult.groups);
    
    return {
      ...moveResult,
      message: placedMessage,
      boardStructure,
      nextAction: 'waitForNextTurn',
      continueDelay: 1000
    };
  }

  /**
   * Prepara el siguiente turno del juego
   * @param {number} targetGroup - Grupo para el siguiente turno
   * @param {string} gameMode - Modo de juego (manual/automatic)
   * @returns {Object} Estado preparado para el siguiente turno
   */
  prepareNextTurn(targetGroup, gameMode) {
    const gameState = this.gameService.getCurrentGameState();
    
    if (gameMode === 'automatic') {
      return {
        ...gameState,
        message: this.messageService.getMotivationalMessage(),
        nextAction: 'autoReveal',
        targetGroup,
        boardStructure: this.boardService.generateBoardStructure(gameState.groups)
      };
    } else {
      return {
        ...gameState,
        message: this.messageService.getNextTurnMessage(targetGroup),
        nextAction: 'waitForClick',
        targetGroup,
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
    
    if (gameState.gameMode !== 'manual' || gameState.gameState !== 'playing') {
      return {
        success: false,
        message: 'Acción no permitida en el estado actual del juego'
      };
    }

    if (!this.gameService.canClickGroup(groupNumber)) {
      return {
        success: false,
        message: 'Este grupo no puede ser clickeado'
      };
    }

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
    const message = this.messageService.getWelcomeBackMessage();
    
    return {
      ...resetResult,
      message,
      showShuffleModal: this.showShuffleModal,
      boardStructure: []
    };
  }

  /**
   * Actualiza la configuración del juego
   * @param {Object} config - Nueva configuración
   * @returns {Object} Estado actualizado del juego
   */
  updateGameSettings(config) {
    this.gameService.updateGameConfiguration(config);
    const gameState = this.gameService.getCurrentGameState();
    
    return {
      ...gameState,
      message: `Configuración actualizada: Modo ${config.gameMode || gameState.gameMode}`,
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
    
    return {
      ...gameState,
      showShuffleModal: this.showShuffleModal,
      boardStructure,
      boardStats,
      message: this.messageService.getContextualMessage(gameState.gameState)
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
    
    if (stats.totalCards <= 10) {
      hints.push('¡Cuidado! Quedan pocas cartas, cada movimiento es crucial');
    }
    
    if (gameState.currentCard) {
      hints.push(`La carta actual (${gameState.currentCard.value}${gameState.currentCard.suit}) debe ir al grupo ${gameState.currentCard.numericValue}`);
    }
    
    return {
      hints,
      message: hints.length > 0 ? 'Sugerencias disponibles' : 'No hay sugerencias específicas',
      stats
    };
  }
}

export default GameController;
