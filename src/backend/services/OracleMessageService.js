/**
 * Servicio para manejar los mensajes del oráculo
 * Proporciona mensajes contextuales basados en el estado del juego
 */
class OracleMessageService {
  constructor() {
    this.messages = {
      welcome: '¡Bienvenido al Oráculo de la Suerte! ¿Estás listo para desafiar al destino?',
      welcomeBack: '¡Bienvenido de vuelta al Oráculo de la Suerte! ¿Estás listo para otro desafío?',
      shuffling: 'Las cartas están siendo barajadas por las fuerzas del destino...',
      gameStart: '¡El destino ha sido mezclado! Comencemos por el centro sagrado...',
      victory: '¡INCREÍBLE! Has logrado lo imposible. Todas las cartas han encontrado su lugar. ¡El oráculo te bendice con la victoria suprema!',
      defeat: '¡Oh no! El destino se ha bloqueado. No hay más cartas en este grupo para revelar. Has perdido...',
      sameGroupDefeat: '¡El oráculo ha hablado! La carta {card} pertenece al mismo grupo y no quedan más movimientos. Has perdido...'
    };
  }

  /**
   * Obtiene el mensaje de bienvenida inicial
   * @returns {string} Mensaje de bienvenida
   */
  getWelcomeMessage() {
    return this.messages.welcome;
  }

  /**
   * Obtiene el mensaje de bienvenida de regreso
   * @returns {string} Mensaje de bienvenida de regreso
   */
  getWelcomeBackMessage() {
    return this.messages.welcomeBack;
  }

  /**
   * Obtiene el mensaje durante el barajado
   * @returns {string} Mensaje de barajado
   */
  getShufflingMessage() {
    return this.messages.shuffling;
  }

  /**
   * Obtiene el mensaje de inicio del juego
   * @returns {string} Mensaje de inicio
   */
  getGameStartMessage() {
    return this.messages.gameStart;
  }

  /**
   * Obtiene el mensaje de victoria
   * @returns {string} Mensaje de victoria
   */
  getVictoryMessage() {
    return this.messages.victory;
  }

  /**
   * Obtiene el mensaje de derrota general
   * @returns {string} Mensaje de derrota
   */
  getDefeatMessage() {
    return this.messages.defeat;
  }

  /**
   * Obtiene el mensaje de derrota por mismo grupo
   * @param {Object} card - Carta que causó la derrota
   * @returns {string} Mensaje de derrota personalizado
   */
  getSameGroupDefeatMessage(card) {
    return this.messages.sameGroupDefeat.replace('{card}', `${card.value}${card.suit}`);
  }

  /**
   * Obtiene el mensaje cuando se revela una carta
   * @param {Object} card - Carta revelada
   * @param {number} targetGroup - Grupo de destino
   * @returns {string} Mensaje de carta revelada
   */
  getCardRevealedMessage(card, targetGroup) {
    return `¡Una ${card.value}${card.suit} ha sido revelada! Debe ir al grupo ${targetGroup}...`;
  }

  /**
   * Obtiene el mensaje cuando una carta encuentra su destino
   * @param {number} targetGroup - Grupo donde se colocó la carta
   * @returns {string} Mensaje de carta colocada
   */
  getCardPlacedMessage(targetGroup) {
    return `La carta ha encontrado su destino en el grupo ${targetGroup}. Continuemos...`;
  }

  /**
   * Obtiene el mensaje para el siguiente turno manual
   * @param {number} targetGroup - Grupo que debe ser clickeado
   * @returns {string} Mensaje de siguiente turno
   */
  getNextTurnMessage(targetGroup) {
    return `Ahora es tu turno. Haz clic en el grupo ${targetGroup} para revelar la siguiente carta...`;
  }

  /**
   * Obtiene mensajes motivacionales aleatorios durante el juego
   * @returns {string} Mensaje motivacional
   */
  getMotivationalMessage() {
    const motivationalMessages = [
      '¡El destino sonríe contigo!',
      '¡Las fuerzas místicas están de tu lado!',
      '¡Continúa, el oráculo te guía!',
      '¡Cada movimiento te acerca a la gloria!',
      '¡El poder del oráculo fluye a través de ti!'
    ];
    
    return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  }

  /**
   * Obtiene mensajes de advertencia cuando quedan pocas cartas
   * @param {number} remainingCards - Número de cartas restantes
   * @returns {string} Mensaje de advertencia
   */
  getWarningMessage(remainingCards) {
    if (remainingCards <= 5) {
      return '¡Cuidado! Quedan muy pocas cartas. El destino se vuelve más peligroso...';
    } else if (remainingCards <= 10) {
      return '¡Atención! El oráculo se vuelve más impredecible con cada movimiento...';
    }
    return null;
  }

  /**
   * Obtiene un mensaje personalizado basado en el estado del juego
   * @param {string} gameState - Estado actual del juego
   * @param {Object} context - Contexto adicional (carta, grupo, etc.)
   * @returns {string} Mensaje contextual
   */
  getContextualMessage(gameState, context = {}) {
    switch (gameState) {
      case 'menu':
        return context.isReturning ? this.getWelcomeBackMessage() : this.getWelcomeMessage();
      
      case 'shuffling':
        return this.getShufflingMessage();
      
      case 'playing':
        if (context.cardRevealed) {
          return this.getCardRevealedMessage(context.card, context.targetGroup);
        } else if (context.cardPlaced) {
          return this.getCardPlacedMessage(context.targetGroup);
        } else if (context.nextTurn) {
          return this.getNextTurnMessage(context.targetGroup);
        }
        return this.getGameStartMessage();
      
      case 'won':
        return this.getVictoryMessage();
      
      case 'lost':
        if (context.sameGroup) {
          return this.getSameGroupDefeatMessage(context.card);
        }
        return this.getDefeatMessage();
      
      default:
        return this.getWelcomeMessage();
    }
  }
}

export default OracleMessageService;
