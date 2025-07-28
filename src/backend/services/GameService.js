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
    
    // Cargar preferencias guardadas del usuario
    this.loadUserPreferences();
  }
  
  /**
   * Carga las preferencias del usuario desde localStorage
   */
  loadUserPreferences() {
    try {
      // Cargar el modo de juego guardado, o usar 'manual' por defecto
      // Intentar primero con la clave 'gameMode' (la nueva estándar)
      let savedGameMode = localStorage.getItem('gameMode');
      if (!savedGameMode) {
        // Si no existe, intentar con la clave legacy
        savedGameMode = localStorage.getItem('oracle-game-mode');
      }
      this.gameMode = savedGameMode || 'manual';
      
      // Cargar la velocidad guardada, o usar 1000 por defecto
      // Intentar primero con la clave 'gameSpeed' (la nueva estándar)
      let savedGameSpeed = localStorage.getItem('gameSpeed');
      if (!savedGameSpeed) {
        // Si no existe, intentar con la clave legacy
        savedGameSpeed = localStorage.getItem('oracle-game-speed');
      }
      this.gameSpeed = savedGameSpeed ? parseInt(savedGameSpeed) : 1000;
      
      console.log(`Preferencias cargadas: modo=${this.gameMode}, velocidad=${this.gameSpeed}`);
      
      // Guardar siempre en ambas claves para garantizar compatibilidad
      localStorage.setItem('gameMode', this.gameMode);
      localStorage.setItem('oracle-game-mode', this.gameMode);
      
      localStorage.setItem('gameSpeed', this.gameSpeed.toString());
      localStorage.setItem('oracle-game-speed', this.gameSpeed.toString());
    } catch (error) {
      // Si hay algún error, usar valores por defecto
      console.error('Error al cargar preferencias del usuario:', error);
      this.gameMode = 'manual';
      this.gameSpeed = 1000;
    }
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
    // Guardar la configuración actual antes de reiniciar
    const currentGameMode = this.gameMode;
    const currentGameSpeed = this.gameSpeed;
    
    this.gameState = 'shuffling';
    const newDeck = this.createStandardDeck();
    const shuffledDeck = this.performRealisticShuffle(newDeck);
    this.deck = shuffledDeck;
    this.groups = this.initializeCardGroups(shuffledDeck);
    this.currentCard = null;
    this.gameHistory = [];
    
    // Mantener la configuración del usuario
    this.gameMode = currentGameMode;
    this.gameSpeed = currentGameSpeed;
    
    return {
      gameState: this.gameState,
      deck: this.deck,
      groups: this.groups,
      gameMode: this.gameMode,
      gameSpeed: this.gameSpeed,
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
        message: '¡Oh no! El destino se ha bloqueado. No hay más cartas en este grupo para revelar. Has perdido...',
        groups: this.groups
      };
    }

    // Solo revelar UNA carta (la primera del grupo)
    const cardToReveal = group.cards[0];
    
    // Remover solo la primera carta del grupo
    this.groups[groupNumber] = {
      ...group,
      cards: group.cards.slice(1) // Quitar solo la primera carta
    };

    // La carta revelada se convierte en la carta actual (no se agrega a revealed aún)
    this.currentCard = cardToReveal;
    
    // Agregar al historial
    this.gameHistory.push({
      card: cardToReveal,
      fromGroup: groupNumber,
      toGroup: cardToReveal.numericValue,
      timestamp: Date.now(),
      action: 'reveal'
    });

    const targetGroup = cardToReveal.numericValue;
    
    // Verificar si la carta pertenece al mismo grupo (regla de pérdida)
    if (targetGroup === groupNumber) {
      // Solo perder si no hay más cartas en el grupo de destino para colocar esta carta
      if (this.groups[targetGroup].cards.length === 0) {
        this.gameState = 'lost';
        return {
          success: false,
          gameState: this.gameState,
          currentCard: cardToReveal,
          groups: this.groups,
          message: `¡El oráculo ha hablado! La carta ${cardToReveal.value}${cardToReveal.suit} pertenece al mismo grupo ${targetGroup} y no hay espacio. Has perdido...`
        };
      }
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
    // Guardar la configuración actual antes de reiniciar
    const currentGameMode = this.gameMode;
    const currentGameSpeed = this.gameSpeed;
    
    // Reiniciar el estado del juego
    this.gameState = 'menu';
    this.deck = [];
    this.groups = {};
    this.currentCard = null;
    this.gameHistory = [];
    
    // Restaurar la configuración del usuario
    this.gameMode = currentGameMode;
    this.gameSpeed = currentGameSpeed;
    
    return {
      gameState: this.gameState,
      gameMode: this.gameMode,
      gameSpeed: this.gameSpeed,
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
    if (config.gameMode !== undefined) {
      this.gameMode = config.gameMode;
      // Guardar la preferencia de modo en localStorage para que persista
      try {
        // Guardar en ambas claves para garantizar compatibilidad
        localStorage.setItem('gameMode', config.gameMode);
        localStorage.setItem('oracle-game-mode', config.gameMode);
        console.log(`Modo de juego actualizado y guardado: ${config.gameMode}`);
      } catch (error) {
        console.error('Error al guardar la configuración del modo de juego:', error);
      }
    }
    
    if (config.gameSpeed !== undefined) {
      this.gameSpeed = config.gameSpeed;
      // Guardar la preferencia de velocidad en localStorage
      try {
        // Guardar en ambas claves para garantizar compatibilidad
        localStorage.setItem('gameSpeed', config.gameSpeed.toString());
        localStorage.setItem('oracle-game-speed', config.gameSpeed.toString());
        console.log(`Velocidad de juego actualizada y guardada: ${config.gameSpeed}`);
      } catch (error) {
        console.error('Error al guardar la configuración de velocidad:', error);
      }
    }
    
    // Devolver el estado actualizado para facilitar la comunicación con el frontend
    return {
      gameMode: this.gameMode,
      gameSpeed: this.gameSpeed
    };
  }

  /**
   * Obtiene el mejor grupo para revelar en modo automático
   * @returns {number|null} Número del grupo recomendado o null si no hay opciones
   */
  getBestGroupForAutoReveal() {
    // Buscar grupos con cartas disponibles
    const availableGroups = Object.keys(this.groups).filter(groupNum => {
      const group = this.groups[groupNum];
      return group && group.cards.length > 0;
    }).map(num => parseInt(num));

    if (availableGroups.length === 0) return null;

    // Recopilar estadísticas del juego actual para tomar decisiones informadas
    const gameStats = this.getGameStatistics();
    
    // Calcular puntuación para cada grupo basada en múltiples factores
    const groupScores = availableGroups.map(groupNum => {
      const group = this.groups[groupNum];
      const revealedCount = group.revealed.length;
      const cardCount = group.cards.length;
      
      // Puntuación base por cantidad de cartas
      let score = cardCount * 10;
      
      // Factor 1: Grupos con muchas cartas pero pocas reveladas son valiosos
      // Calcula el ratio de cartas ocultas/reveladas
      const revealRatio = revealedCount > 0 ? cardCount / revealedCount : cardCount * 2;
      score += revealRatio * 5;
      
      // Factor 2: Evitar grupos que ya tienen muchas cartas del mismo valor
      // (para evitar que se vuelva muy difícil de completar)
      const valueDistribution = {};
      group.revealed.forEach(card => {
        valueDistribution[card.numericValue] = (valueDistribution[card.numericValue] || 0) + 1;
      });
      
      const maxDuplicates = Object.values(valueDistribution).reduce((max, count) => Math.max(max, count), 0);
      if (maxDuplicates > 2) {
        // Penalizar grupos con muchas cartas del mismo valor
        score -= maxDuplicates * 8;
      }
      
      // Factor 3: Priorizar grupos que coinciden con los valores más frecuentes en el tablero
      // si el juego está avanzado (para aumentar probabilidades de coincidencia)
      if (gameStats.completionPercentage > 40) {
        const mostFrequentValues = this.getMostFrequentCardValues();
        // Bonus si el grupo coincide con valores frecuentes
        if (mostFrequentValues.includes(groupNum)) {
          score += 15;
        }
      }
      
      // Factor 4: Estrategia situacional basada en el estado del juego
      if (gameStats.completionPercentage < 30) {
        // Al inicio del juego, explorar más opciones (grupos grandes)
        score += cardCount * 3;
      } else if (gameStats.completionPercentage > 70) {
        // Al final del juego, ser más conservador y focalizarse en grupos específicos
        // Priorizar grupos que tienen un balance entre cartas y espacios para ellas
        const targetCapacity = 4; // Ideal para grupos finales
        const balanceScore = 15 - Math.abs(revealedCount - targetCapacity);
        score += balanceScore > 0 ? balanceScore * 3 : 0;
      }
      
      // Factor 5: Aleatoriedad controlada para evitar quedarse atascado en patrones
      // Añadir un pequeño factor aleatorio (±10%)
      score += (Math.random() * 10) - 5;
      
      return {
        groupNum,
        score: Math.round(score),
        cardCount,
        revealedCount
      };
    });

    // Ordenar por puntuación y obtener el mejor grupo
    groupScores.sort((a, b) => b.score - a.score);
    
    // Registrar para depuración
    console.log("Puntuaciones de grupos para modo automático:", 
      groupScores.map(g => `Grupo ${g.groupNum}: ${g.score} puntos (${g.cardCount} cartas, ${g.revealedCount} reveladas)`));
    
    return groupScores[0].groupNum;
  }
  
  /**
   * Obtiene los valores de cartas más frecuentes en el tablero actual
   * @returns {Array<number>} Lista de valores numéricos más frecuentes
   */
  getMostFrequentCardValues() {
    // Contar todas las cartas reveladas por valor
    const valueCount = {};
    
    Object.values(this.groups).forEach(group => {
      group.revealed.forEach(card => {
        valueCount[card.numericValue] = (valueCount[card.numericValue] || 0) + 1;
      });
    });
    
    // Ordenar por frecuencia
    const sortedValues = Object.entries(valueCount)
      .sort((a, b) => b[1] - a[1])
      .map(entry => parseInt(entry[0]));
    
    // Devolver los 3 valores más comunes
    return sortedValues.slice(0, 3);
  }
  
  /**
   * Obtiene estadísticas rápidas del estado actual del juego
   * @returns {Object} Estadísticas del juego
   */
  getGameStatistics() {
    let totalCards = 0;
    let revealedCards = 0;
    
    Object.values(this.groups).forEach(group => {
      totalCards += group.cards.length + group.revealed.length;
      revealedCards += group.revealed.length;
    });
    
    return {
      totalCards,
      revealedCards,
      remainingCards: totalCards - revealedCards,
      completionPercentage: Math.round((revealedCards / totalCards) * 100)
    };
  }

  /**
   * Verifica si el juego puede continuar
   * @returns {boolean} True si hay movimientos posibles
   */
  canContinueGame() {
    // Verificar si hay cartas para revelar
    const hasCardsToReveal = Object.values(this.groups).some(group => 
      group && group.cards.length > 0
    );

    return hasCardsToReveal && this.gameState === 'playing';
  }
}

export default GameService;
