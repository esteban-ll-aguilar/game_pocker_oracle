import React, { useState, useEffect } from 'react';
import { GameAPI } from '../../backend/index.js';
import GameBoardView from './GameBoardView.jsx';
import OracleView from './OracleView.jsx';
import GameControlsView from './GameControlsView.jsx';
import ModalView from './ModalView.jsx';
import RiffleShuffleView from './RiffleShuffleView.jsx';

/**
 * Componente principal de la vista del juego
 * Solo maneja la presentación, toda la lógica está en el backend
 */
const OracleGameView = () => {
  // Estado de la vista (solo UI)
  const [gameState, setGameState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
      
      // Simular el tiempo de barajado
      setTimeout(() => {
        const readyState = GameAPI.finishShuffle();
        setGameState(readyState);
        
        // Revelar la primera carta del centro después de un momento
        setTimeout(() => {
          const initialCardState = GameAPI.revealInitialCard();
          handleGameStateUpdate(initialCardState);
        }, 1000);
      }, 8000);
    } catch (error) {
      console.error('Error al iniciar el juego:', error);
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
      const clickResult = GameAPI.clickGroup(groupNumber);
      
      if (clickResult.success) {
        handleGameStateUpdate(clickResult);
      } else {
        console.warn('Clic no válido:', clickResult.message);
      }
    } catch (error) {
      console.error('Error al hacer clic en el grupo:', error);
    }
  };

  /**
   * Actualiza el estado del juego y maneja las acciones siguientes
   */
  const handleGameStateUpdate = (newState) => {
    setGameState(newState);
    
    // Manejar acciones automáticas basadas en el estado
    if (newState.nextAction === 'moveCard') {
      setTimeout(() => {
        const moveResult = GameAPI.moveCard(newState.currentCard, newState.targetGroup);
        handleGameStateUpdate(moveResult);
      }, newState.moveDelay || 1500);
    } else if (newState.nextAction === 'waitForNextTurn') {
      setTimeout(() => {
        const nextTurnState = GameAPI.prepareNextTurn(
          newState.targetGroup, 
          newState.gameMode || 'manual'
        );
        handleGameStateUpdate(nextTurnState);
      }, newState.continueDelay || 1000);
    } else if (newState.nextAction === 'autoReveal') {
      setTimeout(() => {
        const autoRevealResult = GameAPI.revealCard(newState.targetGroup);
        handleGameStateUpdate(autoRevealResult);
      }, newState.gameSpeed || 1000);
    }
  };

  /**
   * Actualiza la configuración del juego
   */
  const handleSettingsUpdate = (newSettings) => {
    try {
      const updatedState = GameAPI.updateSettings(newSettings);
      setGameState(updatedState);
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
    }
  };

  // Mostrar loading mientras se inicializa
  if (isLoading || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando el Oráculo...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative">
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
              <GameControlsView
                gameMode={gameState.gameMode}
                gameSpeed={gameState.gameSpeed}
                onStartGame={handleStartGame}
                onResetGame={handleResetGame}
                onSettingsChange={handleSettingsUpdate}
                gameState={gameState.gameState}
              />
            </div>
          )}

          {(gameState.gameState === 'playing' || gameState.gameState === 'won' || gameState.gameState === 'lost') && (
            <GameBoardView
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
            <GameControlsView
              gameMode={gameState.gameMode}
              gameSpeed={gameState.gameSpeed}
              onStartGame={handleStartGame}
              onResetGame={handleResetGame}
              onSettingsChange={handleSettingsUpdate}
              gameState={gameState.gameState}
              gameHistory={gameState.gameHistory}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OracleGameView;
