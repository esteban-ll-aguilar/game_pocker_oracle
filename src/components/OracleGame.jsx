import React, { useState, useEffect, useCallback } from 'react';
import RiffleShuffle from './RiffleShuffle';
import GameBoard from './GameBoard';
import Oracle from './Oracle';
import GameControls from './GameControls';
import Modal from './Modal';

const OracleGame = () => {
  const [gameState, setGameState] = useState('menu'); // menu, shuffling, playing, won, lost
  const [showShuffleModal, setShowShuffleModal] = useState(false);
  const [deck, setDeck] = useState([]);
  const [gameMode, setGameMode] = useState('manual'); // manual, automatic
  const [gameSpeed, setGameSpeed] = useState(1000); // velocidad para modo automático
  const [groups, setGroups] = useState({});
  const [currentCard, setCurrentCard] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [oracleMessage, setOracleMessage] = useState('¡Bienvenido al Oráculo de la Suerte! ¿Estás listo para desafiar al destino?');

  // Crear baraja sin jokers (52 cartas)
  const createDeck = useCallback(() => {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const newDeck = [];
    
    suits.forEach(suit => {
      values.forEach((value, index) => {
        newDeck.push({
          id: `${suit}-${value}`,
          suit,
          value,
          numericValue: index + 1, // A=1, 2=2, ..., K=13
          isRed: suit === '♥' || suit === '♦'
        });
      });
    });
    
    return newDeck;
  }, []);

  // Barajado realista (no perfecto)
  const shuffleDeck = useCallback((cards) => {
    const shuffled = [...cards];
    
    // Simular corte imperfecto
    const cutPoint = Math.floor(shuffled.length / 2) + Math.floor(Math.random() * 6) - 3;
    const leftHalf = shuffled.slice(0, cutPoint);
    const rightHalf = shuffled.slice(cutPoint);
    
    const result = [];
    let leftIndex = 0;
    let rightIndex = 0;
    
    // Riffle shuffle imperfecto
    while (leftIndex < leftHalf.length || rightIndex < rightHalf.length) {
      // Decidir de qué lado tomar cartas (no alternado perfecto)
      const takeFromLeft = Math.random() > 0.5;
      const burstSize = Math.floor(Math.random() * 3) + 1; // 1-3 cartas por vez
      
      for (let i = 0; i < burstSize; i++) {
        if (takeFromLeft && leftIndex < leftHalf.length) {
          result.push(leftHalf[leftIndex++]);
        } else if (rightIndex < rightHalf.length) {
          result.push(rightHalf[rightIndex++]);
        }
      }
    }
    
    return result;
  }, []);

  // Inicializar grupos de cartas
  const initializeGroups = useCallback((shuffledDeck) => {
    const newGroups = {};
    
    // Grupos 1-12 (4 cartas cada uno)
    for (let i = 1; i <= 12; i++) {
      newGroups[i] = {
        cards: shuffledDeck.slice((i - 1) * 4, i * 4),
        position: getGroupPosition(i),
        revealed: []
      };
    }
    
    // Grupo central (13) con las 4 cartas restantes
    newGroups[13] = {
      cards: shuffledDeck.slice(48),
      position: { x: 50, y: 50 }, // centro
      revealed: []
    };
    
    return newGroups;
  }, []);

  // Obtener posición del grupo en el cuadrado
  const getGroupPosition = (groupNumber) => {
    const positions = {
      1: { x: 20, y: 20 },   // esquina superior izquierda
      2: { x: 40, y: 20 },   // arriba centro-izq
      3: { x: 60, y: 20 },   // arriba centro-der
      4: { x: 80, y: 20 },   // esquina superior derecha
      5: { x: 80, y: 40 },   // derecha centro-arr
      6: { x: 80, y: 60 },   // derecha centro-abj
      7: { x: 80, y: 80 },   // esquina inferior derecha
      8: { x: 60, y: 80 },   // abajo centro-der
      9: { x: 40, y: 80 },   // abajo centro-izq
      10: { x: 20, y: 80 },  // esquina inferior izquierda
      11: { x: 20, y: 60 },  // izquierda centro-abj
      12: { x: 20, y: 40 }   // izquierda centro-arr
    };
    return positions[groupNumber];
  };

  // Revelar carta de un grupo
  const revealCardFromGroup = useCallback((groupNumber, currentGroups = groups) => {
    const group = currentGroups[groupNumber];
    if (!group || group.cards.length === 0) {
      // Regla de bloqueo: no hay más cartas para revelar
      setGameState('lost');
      setOracleMessage('¡Oh no! El destino se ha bloqueado. No hay más cartas en este grupo para revelar. Has perdido...');
      return;
    }

    const cardToReveal = group.cards[0]; // Primera carta del grupo
    const updatedGroups = {
      ...currentGroups,
      [groupNumber]: {
        ...group,
        cards: group.cards.slice(1),
        revealed: [...group.revealed, cardToReveal]
      }
    };

    setGroups(updatedGroups);
    setCurrentCard(cardToReveal);
    
    // Agregar al historial
    setGameHistory(prev => [...prev, {
      card: cardToReveal,
      fromGroup: groupNumber,
      toGroup: cardToReveal.numericValue,
      timestamp: Date.now()
    }]);

    const targetGroup = cardToReveal.numericValue;
    
    // Verificar si la carta pertenece al mismo grupo (regla de pérdida)
    if (targetGroup === groupNumber && updatedGroups[groupNumber].cards.length === 0) {
      setGameState('lost');
      setOracleMessage(`¡El oráculo ha hablado! La carta ${cardToReveal.value}${cardToReveal.suit} pertenece al mismo grupo y no quedan más movimientos. Has perdido...`);
      return;
    }

    setOracleMessage(`¡Una ${cardToReveal.value}${cardToReveal.suit} ha sido revelada! Debe ir al grupo ${targetGroup}...`);

    // Mover carta al grupo correspondiente después de un momento
    setTimeout(() => {
      moveCardToGroup(cardToReveal, targetGroup, updatedGroups);
    }, 1500);
  }, [groups]);

  // Mover carta al grupo correspondiente
  const moveCardToGroup = useCallback((card, targetGroup, currentGroups) => {
    const updatedGroups = {
      ...currentGroups,
      [targetGroup]: {
        ...currentGroups[targetGroup],
        revealed: [...currentGroups[targetGroup].revealed, card]
      }
    };

    setGroups(updatedGroups);
    setOracleMessage(`La carta ha encontrado su destino en el grupo ${targetGroup}. Continuemos...`);

    // Verificar victoria
    const allGroupsComplete = Object.keys(updatedGroups).every(groupNum => {
      const group = updatedGroups[groupNum];
      return group.cards.length === 0;
    });

    if (allGroupsComplete) {
      setGameState('won');
      setOracleMessage('¡INCREÍBLE! Has logrado lo imposible. Todas las cartas han encontrado su lugar. ¡El oráculo te bendice con la victoria suprema!');
      return;
    }

    // Continuar con el siguiente movimiento
    setTimeout(() => {
      if (gameMode === 'automatic') {
        revealCardFromGroup(targetGroup, updatedGroups);
      } else {
        setOracleMessage(`Ahora es tu turno. Haz clic en el grupo ${targetGroup} para revelar la siguiente carta...`);
      }
    }, 1000);
  }, [gameMode, revealCardFromGroup]);

  // Manejar clic manual en grupo
  const handleGroupClick = useCallback((groupNumber) => {
    if (gameState !== 'playing' || gameMode !== 'manual') return;
    
    revealCardFromGroup(groupNumber);
  }, [gameState, gameMode, revealCardFromGroup]);

  // Iniciar juego
  const startGame = useCallback(() => {
    setGameState('shuffling');
    setShowShuffleModal(true);
    setOracleMessage('Las cartas están siendo barajadas por las fuerzas del destino...');
    
    setTimeout(() => {
      const newDeck = createDeck();
      const shuffledDeck = shuffleDeck(newDeck);
      setDeck(shuffledDeck);
      const initialGroups = initializeGroups(shuffledDeck);
      setGroups(initialGroups);
      
      setShowShuffleModal(false);
      setGameState('playing');
      setOracleMessage('¡El destino ha sido mezclado! Comencemos por el centro sagrado...');
      
      // Revelar primera carta del grupo central
      setTimeout(() => {
        revealCardFromGroup(13, initialGroups);
      }, 1000);
    }, 8000); // Duración de la animación de shuffle
  }, [createDeck, shuffleDeck, initializeGroups, revealCardFromGroup]);

  // Reiniciar juego
  const resetGame = useCallback(() => {
    setGameState('menu');
    setDeck([]);
    setGroups({});
    setCurrentCard(null);
    setGameHistory([]);
    setOracleMessage('¡Bienvenido de vuelta al Oráculo de la Suerte! ¿Estás listo para otro desafío?');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-purple-800/10 to-blue-800/10"></div>
      </div>
      
      {/* Modal de shuffle */}
      <Modal isOpen={showShuffleModal} onClose={() => {}}>
        <div className="p-4 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-white">
            🔮 El Oráculo está Barajando las Cartas
          </h2>
          <RiffleShuffle />
        </div>
      </Modal>

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header con Oracle */}
        <div className="flex-shrink-0">
          <Oracle message={oracleMessage} gameState={gameState} />
        </div>

        {/* Área de juego */}
        <div className="flex-1 flex items-center justify-center p-2 sm:p-4">
          {gameState === 'menu' && (
            <div className="text-center px-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-400 mb-6 sm:mb-8">
                🔮 Oráculo de la Suerte
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                Un juego místico donde el destino decide tu suerte. Ordena las 52 cartas en sus grupos correspondientes sin caer en las trampas del oráculo.
              </p>
              <GameControls
                gameMode={gameMode}
                setGameMode={setGameMode}
                gameSpeed={gameSpeed}
                setGameSpeed={setGameSpeed}
                onStartGame={startGame}
                onResetGame={resetGame}
                gameState={gameState}
              />
            </div>
          )}

          {(gameState === 'playing' || gameState === 'won' || gameState === 'lost') && (
            <GameBoard
              groups={groups}
              currentCard={currentCard}
              onGroupClick={handleGroupClick}
              gameState={gameState}
              gameMode={gameMode}
            />
          )}
        </div>

        {/* Footer con controles */}
        {gameState !== 'menu' && (
          <div className="flex-shrink-0 p-4">
            <GameControls
              gameMode={gameMode}
              setGameMode={setGameMode}
              gameSpeed={gameSpeed}
              setGameSpeed={setGameSpeed}
              onStartGame={startGame}
              onResetGame={resetGame}
              gameState={gameState}
              gameHistory={gameHistory}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OracleGame;
