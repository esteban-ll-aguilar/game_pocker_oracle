/**
 * Servicio principal del juego Oráculo de la Suerte
 * Maneja toda la lógica del negocio del juego
 */
class GameService {
  constructor() {
    this.gameState = 'menu'; // menu, shuffling, playing, won, lost
    this.deck = [];
    this.groups = {};
    this.currentCard = null;
    this.gameHistory = [];
    this.gameMode = 'manual'; // manual, automatic
    this.gameSpeed = 1000;
  }

  /**
   * Crea una baraja estándar de 52 cartas sin jokers
   * @returns {Array} Array de objetos carta
   */
  createStandardDeck() {
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
  }

  /**
   * Realiza un barajado realista (no perfecto) de las cartas
   * @param {Array} cards - Array de cartas a barajar
   * @returns {Array} Array de cartas barajadas
   */
  performRealisticShuffle(cards) {
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
  }

  /**
   * Inicializa los grupos de cartas para el juego
   * @param {Array} shuffledDeck - Baraja barajada
   * @returns {Object} Objeto con los grupos inicializados
   */
  initializeCardGroups(shuffledDeck) {
    const newGroups = {};
    
    // Grupos 1-12 (4 cartas cada uno)
    for (let i = 1; i <= 12; i++) {
      newGroups[i] = {
        cards: shuffledDeck.slice((i - 1) * 4, i * 4),
        position: this.getGroupPosition(i),
        revealed: []
      };
    }
    
    // Grupo central (13) con las 4 cartas restantes (K)
    newGroups[13] = {
      cards: shuffledDeck.slice(48),
      position: { x: 50, y: 50 }, // centro
      revealed: []
    };
    
    return newGroups;
  }

  /**
   * Obtiene la posición de un grupo en el tablero
   * @param {number} groupNumber - Número del grupo
   * @returns {Object} Objeto con coordenadas x, y
   */
  getGroupPosition(groupNumber) {
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
  }

  /**
   * Inicia un nuevo juego
   * @returns {Object} Estado inicial del juego
   */
  startNewGame() {
    this.gameState = 'shuffling';
    const newDeck = this.createStandardDeck();
    const shuffledDeck = this.performRealisticShuffle(newDeck);
    this.deck = shuffledDeck;
    this.groups = this.initializeCardGroups(shuffledDeck);
    this.currentCard = null;
    this.gameHistory = [];
    
    return {
      gameState: this.gameState,
      deck: this.deck,
      groups: this.groups,
      message: 'Las cartas están siendo barajadas por las fuerzas del destino...'
    };
  }

  /**
   * Finaliza el proceso de barajado e inicia el juego
   * @returns {Object} Estado del juego listo para jugar
   */
  finishShufflingAndStartPlaying() {
    this.gameState = 'playing';
    return {
      gameState: this.gameState,
      groups: this.groups,
      message: '¡El destino ha sido mezclado! Comencemos por el centro sagrado...'
    };
  }

  /**
   * Revela una carta de un grupo específico
   * @param {number} groupNumber - Número del grupo
   * @returns {Object} Resultado de la acción
   */
  revealCardFromGroup(groupNumber) {
    const group = this.groups[groupNumber];
    
    if (!group || group.cards.length === 0) {
      this.gameState = 'lost';
      return {
        success: false,
        gameState: this.gameState,
        message: '¡Oh no! El destino se ha bloqueado. No hay más cartas en este grupo para revelar. Has perdido...'
      };
    }

    const cardToReveal = group.cards[0]; // Primera carta del grupo
    
    // Actualizar el grupo
    this.groups[groupNumber] = {
      ...group,
      cards: group.cards.slice(1),
      revealed: [...group.revealed, cardToReveal]
    };

    this.currentCard = cardToReveal;
    
    // Agregar al historial
    this.gameHistory.push({
      card: cardToReveal,
      fromGroup: groupNumber,
      toGroup: cardToReveal.numericValue,
      timestamp: Date.now()
    });

    const targetGroup = cardToReveal.numericValue;
    
    // Verificar si la carta pertenece al mismo grupo (regla de pérdida)
    if (targetGroup === groupNumber && this.groups[groupNumber].cards.length === 0) {
      this.gameState = 'lost';
      return {
        success: false,
        gameState: this.gameState,
        currentCard: cardToReveal,
        groups: this.groups,
        message: `¡El oráculo ha hablado! La carta ${cardToReveal.value}${cardToReveal.suit} pertenece al mismo grupo y no quedan más movimientos. Has perdido...`
      };
    }

    return {
      success: true,
      gameState: this.gameState,
      currentCard: cardToReveal,
      groups: this.groups,
      targetGroup,
      message: `¡Una ${cardToReveal.value}${cardToReveal.suit} ha sido revelada! Debe ir al grupo ${targetGroup}...`
    };
  }

  /**
   * Mueve una carta al grupo correspondiente
   * @param {Object} card - Carta a mover
   * @param {number} targetGroup - Grupo de destino
   * @returns {Object} Resultado de la acción
   */
  moveCardToTargetGroup(card, targetGroup) {
    // Agregar carta al grupo de destino
    this.groups[targetGroup] = {
      ...this.groups[targetGroup],
      revealed: [...this.groups[targetGroup].revealed, card]
    };

    // Verificar victoria
    const allGroupsComplete = Object.keys(this.groups).every(groupNum => {
      const group = this.groups[groupNum];
      return group.cards.length === 0;
    });

    if (allGroupsComplete) {
      this.gameState = 'won';
      return {
        success: true,
        gameState: this.gameState,
        groups: this.groups,
        isVictory: true,
        message: '¡INCREÍBLE! Has logrado lo imposible. Todas las cartas han encontrado su lugar. ¡El oráculo te bendice con la victoria suprema!'
      };
    }

    return {
      success: true,
      gameState: this.gameState,
      groups: this.groups,
      targetGroup,
      isVictory: false,
      message: `La carta ha encontrado su destino en el grupo ${targetGroup}. Continuemos...`
    };
  }

  /**
   * Verifica si un grupo puede ser clickeado
   * @param {number} groupNumber - Número del grupo
   * @returns {boolean} True si el grupo puede ser clickeado
   */
  canClickGroup(groupNumber) {
    return this.gameState === 'playing' && 
           this.groups[groupNumber] && 
           this.groups[groupNumber].cards.length > 0;
  }

  /**
   * Reinicia el juego al estado inicial
   * @returns {Object} Estado inicial del juego
   */
  resetGameToInitialState() {
    this.gameState = 'menu';
    this.deck = [];
    this.groups = {};
    this.currentCard = null;
    this.gameHistory = [];
    
    return {
      gameState: this.gameState,
      message: '¡Bienvenido de vuelta al Oráculo de la Suerte! ¿Estás listo para otro desafío?'
    };
  }

  /**
   * Obtiene el estado actual del juego
   * @returns {Object} Estado completo del juego
   */
  getCurrentGameState() {
    return {
      gameState: this.gameState,
      deck: this.deck,
      groups: this.groups,
      currentCard: this.currentCard,
      gameHistory: this.gameHistory,
      gameMode: this.gameMode,
      gameSpeed: this.gameSpeed
    };
  }

  /**
   * Actualiza la configuración del juego
   * @param {Object} config - Nueva configuración
   */
  updateGameConfiguration(config) {
    if (config.gameMode) this.gameMode = config.gameMode;
    if (config.gameSpeed) this.gameSpeed = config.gameSpeed;
  }
}

export default GameService;
