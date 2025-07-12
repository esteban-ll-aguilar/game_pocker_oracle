// Backend exports - Punto de entrada principal del backend
import GameController from './controllers/GameController.js';
import GameService from './services/GameService.js';
import OracleMessageService from './services/OracleMessageService.js';
import BoardLayoutService from './services/BoardLayoutService.js';

// Instancia singleton del controlador principal
const gameController = new GameController();

// Exportar el controlador principal y servicios individuales
export {
  gameController as default,
  GameController,
  GameService,
  OracleMessageService,
  BoardLayoutService
};

// API simplificada para el frontend
export const GameAPI = {
  // Inicialización y control del juego
  initialize: () => gameController.initializeGame(),
  startGame: () => gameController.startNewGame(),
  finishShuffle: () => gameController.finishShufflingAndStartGame(),
  resetGame: () => gameController.resetGame(),
  
  // Acciones del juego
  revealCard: (groupNumber) => gameController.handleCardReveal(groupNumber),
  moveCard: (card, targetGroup) => gameController.handleCardMovement(card, targetGroup),
  clickGroup: (groupNumber) => gameController.handleGroupClick(groupNumber),
  
  // Estado y configuración
  getCurrentState: () => gameController.getCurrentState(),
  updateSettings: (config) => gameController.updateGameSettings(config),
  
  // Utilidades
  getStatistics: () => gameController.getGameStatistics(),
  validateState: () => gameController.validateGameState(),
  getHints: () => gameController.getMovementHints(),
  
  // Flujo del juego
  prepareNextTurn: (targetGroup, gameMode) => gameController.prepareNextTurn(targetGroup, gameMode),
  revealInitialCard: () => gameController.revealInitialCenterCard()
};
