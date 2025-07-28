/**
 * Servicio del Genio del Oráculo
 * Proporciona análisis inteligente, predicciones y consejos estratégicos
 */
class OracleGenieService {
  constructor() {
    this.personality = 'wise'; // wise, playful, mysterious, encouraging
    this.responses = this.initializeResponses();
  }

  /**
   * Inicializa las respuestas del genio según su personalidad
   */
  initializeResponses() {
    return {
      greetings: [
        "🧞‍♂️ ¡Saludos, mortal! Soy el Genio del Oráculo, aquí para guiarte hacia la victoria.",
        "✨ El destino me ha convocado para asistirte en tu búsqueda de la suerte.",
        "🔮 Bienvenido, valiente jugador. Mi sabiduría ancestral está a tu disposición.",
        "🌟 Las estrellas se han alineado para nuestro encuentro. ¿En qué puedo ayudarte?"
      ],
      
      winPredictions: {
        high: [
          "🎯 Las probabilidades están a tu favor! Veo un 85% de posibilidades de victoria.",
          "⭐ Los astros sonríen sobre ti. La victoria está prácticamente asegurada.",
          "🏆 Mi cristal mágico muestra un futuro dorado. ¡Adelante, campeón!"
        ],
        medium: [
          "⚖️ Las fuerzas están equilibradas. Tienes un 60% de posibilidades de triunfar.",
          "🎲 El destino es incierto, pero tus habilidades pueden inclinar la balanza.",
          "🌙 Veo luces y sombras en tu futuro. La victoria es posible con estrategia."
        ],
        low: [
          "⚠️ Los vientos del destino soplan en tu contra. Solo un 25% de posibilidades.",
          "🌩️ Las probabilidades son adversas, pero los milagros existen.",
          "💪 El camino será difícil, pero los verdaderos héroes brillan en la adversidad."
        ]
      },

      strategies: [
        "🧠 Consejo: En modo manual, observa los patrones de las cartas reveladas.",
        "⚡ Estrategia: El modo automático es más rápido pero menos controlable.",
        "🎯 Tip: Concéntrate en vaciar primero los grupos con más cartas.",
        "🔍 Sabiduría: Cada carta revelada te da información valiosa sobre las siguientes."
      ],

      encouragement: [
        "💫 ¡No te rindas! Cada gran mago falló antes de triunfar.",
        "🌟 Tu determinación es tu mayor poder. ¡Sigue adelante!",
        "🔥 El fracaso es solo el primer paso hacia el éxito.",
        "✨ Cada partida te hace más sabio. ¡La próxima será tuya!"
      ],

      celebrations: [
        "🎉 ¡INCREÍBLE! Has demostrado ser digno de mi respeto.",
        "👑 ¡Magnífico! Eres un verdadero maestro del Oráculo.",
        "🏆 ¡Espectacular! Tu victoria resonará en los ecos del tiempo.",
        "⭐ ¡Extraordinario! Has superado las expectativas del destino."
      ]
    };
  }

  /**
   * Calcula la probabilidad de ganar basada en el estado actual del juego
   */
  calculateWinProbability(gameState, gameHistory = []) {
    if (!gameState || !gameState.groups) {
      return { probability: 50, factors: ['Estado del juego no disponible'] };
    }

    let probability = 50; // Base
    const factors = [];

    // Factor 1: Cartas restantes
    const totalCards = Object.values(gameState.groups).reduce((sum, group) => sum + group.cards.length, 0);
    if (totalCards > 40) {
      probability += 20;
      factors.push('Muchas cartas disponibles (+20%)');
    } else if (totalCards < 15) {
      probability -= 15;
      factors.push('Pocas cartas restantes (-15%)');
    }

    // Factor 2: Distribución de cartas por grupo
    const groupSizes = Object.values(gameState.groups).map(group => group.cards.length);
    const maxGroupSize = Math.max(...groupSizes);
    const minGroupSize = Math.min(...groupSizes);
    
    if (maxGroupSize - minGroupSize <= 2) {
      probability += 15;
      factors.push('Distribución equilibrada (+15%)');
    } else if (maxGroupSize - minGroupSize > 6) {
      probability -= 10;
      factors.push('Distribución desigual (-10%)');
    }

    // Factor 3: Historial de movimientos
    if (gameHistory.length > 0) {
      const recentMoves = gameHistory.slice(-5);
      const successfulMoves = recentMoves.filter(move => move.success !== false).length;
      const successRate = successfulMoves / recentMoves.length;
      
      if (successRate > 0.8) {
        probability += 10;
        factors.push('Racha de buenos movimientos (+10%)');
      } else if (successRate < 0.4) {
        probability -= 10;
        factors.push('Movimientos recientes problemáticos (-10%)');
      }
    }

    // Factor 4: Modo de juego
    if (gameState.gameMode === 'automatic') {
      probability += 5;
      factors.push('Modo automático (+5%)');
    }

    // Factor 5: Cartas ya reveladas
    const revealedCards = Object.values(gameState.groups).reduce((sum, group) => sum + group.revealed.length, 0);
    if (revealedCards > 20) {
      probability += 10;
      factors.push('Mucha información disponible (+10%)');
    }
    
    // Factor 6: Velocidad del juego (solo en modo automático)
    if (gameState.gameMode === 'automatic' && gameState.gameSpeed) {
      if (gameState.gameSpeed <= 500) {
        probability -= 5;
        factors.push('Velocidad alta (puede causar errores) (-5%)');
      } else if (gameState.gameSpeed >= 2000) {
        probability += 3;
        factors.push('Velocidad prudente (+3%)');
      }
    }

    // Limitar probabilidad entre 5% y 95%
    probability = Math.max(5, Math.min(95, probability));

    return { probability: Math.round(probability), factors };
  }

  /**
   * Genera una predicción de victoria
   */
  predictVictory(gameState, gameHistory = []) {
    const { probability, factors } = this.calculateWinProbability(gameState, gameHistory);
    
    let category = 'medium';
    if (probability >= 75) category = 'high';
    else if (probability <= 40) category = 'low';

    const prediction = this.getRandomResponse(this.responses.winPredictions[category]);
    
    return {
      prediction,
      probability,
      factors,
      category,
      recommendation: this.getRecommendation(category, gameState)
    };
  }

  /**
   * Obtiene una recomendación basada en la probabilidad
   */
  getRecommendation(category, gameState) {
    switch (category) {
      case 'high':
        return {
          mode: gameState.gameMode,
          message: "¡Mantén tu estrategia actual! Las probabilidades están contigo.",
          icon: "🎯"
        };
      case 'medium':
        return {
          mode: 'manual',
          message: "Te recomiendo el modo manual para tener más control sobre tus decisiones.",
          icon: "🧠"
        };
      case 'low':
        return {
          mode: 'automatic',
          message: "Considera el modo automático para una jugada más rápida y eficiente.",
          icon: "⚡"
        };
      default:
        return {
          mode: gameState.gameMode,
          message: "Confía en tu instinto y que la suerte te acompañe.",
          icon: "🍀"
        };
    }
  }

  /**
   * Proporciona un análisis estratégico del estado actual
   */
  analyzeGameState(gameState) {
    if (!gameState || !gameState.groups) {
      return "No puedo analizar el estado actual del juego.";
    }

    const analysis = [];
    const groups = Object.values(gameState.groups);
    
    // Análisis de distribución
    const cardCounts = groups.map(group => group.cards.length);
    const totalCards = cardCounts.reduce((sum, count) => sum + count, 0);
    const avgCards = totalCards / groups.length;
    
    analysis.push(`📊 Análisis: ${totalCards} cartas restantes, promedio de ${avgCards.toFixed(1)} por grupo.`);
    
    // Grupo más problemático
    const maxCards = Math.max(...cardCounts);
    const problematicGroups = cardCounts.filter(count => count === maxCards).length;
    
    if (maxCards > avgCards + 2) {
      analysis.push(`⚠️ Atención: ${problematicGroups} grupo(s) con ${maxCards} cartas necesitan prioridad.`);
    }
    
    // Progreso general
    const progress = ((52 - totalCards) / 52 * 100).toFixed(1);
    analysis.push(`📈 Progreso: ${progress}% del juego completado.`);
    
    return analysis.join('\n');
  }

  /**
   * Responde a preguntas específicas del usuario
   */
  answerQuestion(question, gameState, gameHistory = []) {
    const q = question.toLowerCase();
    
    if (q.includes('ganar') || q.includes('victoria') || q.includes('probabilidad')) {
      return this.predictVictory(gameState, gameHistory);
    }
    
    if (q.includes('estrategia') || q.includes('consejo') || q.includes('tip')) {
      return {
        message: this.getRandomResponse(this.responses.strategies),
        analysis: this.analyzeGameState(gameState)
      };
    }
    
    if (q.includes('modo') || q.includes('manual') || q.includes('automático')) {
      const recommendation = this.getRecommendation('medium', gameState);
      return {
        message: `${recommendation.icon} ${recommendation.message}`,
        recommendedMode: recommendation.mode
      };
    }
    
    if (q.includes('ánimo') || q.includes('motivación') || q.includes('perdí')) {
      return {
        message: this.getRandomResponse(this.responses.encouragement)
      };
    }
    
    // Respuesta general
    return {
      message: "🤔 Interesante pregunta. ¿Podrías ser más específico? Puedo ayudarte con predicciones, estrategias, o análisis del juego.",
      suggestions: [
        "¿Voy a ganar esta vez?",
        "¿Qué estrategia me recomiendas?",
        "¿Qué modo es mejor?",
        "Analiza mi situación actual"
      ]
    };
  }

  /**
   * Celebra una victoria
   */
  celebrateVictory(gameStats) {
    const celebration = this.getRandomResponse(this.responses.celebrations);
    const analysis = [];
    
    if (gameStats.moves <= 15) {
      analysis.push("⚡ ¡Eficiencia extraordinaria! Pocos movimientos.");
    }
    
    if (gameStats.time < 60000) {
      analysis.push("🚀 ¡Velocidad impresionante! Menos de un minuto.");
    }
    
    return {
      message: celebration,
      analysis: analysis.join(' '),
      bonus: analysis.length > 0 ? "🌟 Bonificación por excelencia!" : null
    };
  }

  /**
   * Saludo inicial del genio
   */
  getGreeting() {
    return this.getRandomResponse(this.responses.greetings);
  }

  /**
   * Obtiene una respuesta aleatoria de un array
   */
  getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  /**
   * Proporciona consejos estratégicos específicos para el modo automático
   * @param {Object} gameState - Estado actual del juego
   * @param {Array} gameHistory - Historial de movimientos
   * @returns {Object} Consejo estratégico
   */
  getAutomaticModeAdvice(gameState, gameHistory = []) {
    // Analizar el estado actual
    const totalCards = Object.values(gameState.groups).reduce(
      (sum, group) => sum + group.cards.length + group.revealed.length, 0
    );
    
    const revealedCards = Object.values(gameState.groups).reduce(
      (sum, group) => sum + group.revealed.length, 0
    );
    
    const completionPercentage = Math.round((revealedCards / totalCards) * 100);
    
    // Generar consejos basados en el estado
    let advice = {
      message: "Estoy monitoreando el progreso del juego en modo automático.",
      actionRecommendation: null,
      optimizationTip: null
    };
    
    // Recomendaciones basadas en el progreso
    if (completionPercentage < 30) {
      advice.message = "El juego está en sus etapas iniciales. El modo automático está explorando diferentes grupos.";
      advice.optimizationTip = "El modo automático funciona mejor con una velocidad intermedia en esta etapa.";
    } else if (completionPercentage < 60) {
      advice.message = "Progreso moderado. El algoritmo está equilibrando entre exploración y optimización.";
      
      // Verificar si hay muchos grupos con pocas cartas
      const lowCardGroups = Object.values(gameState.groups).filter(
        group => group.cards.length > 0 && group.cards.length < 3
      ).length;
      
      if (lowCardGroups > 5) {
        advice.actionRecommendation = "Hay varios grupos con pocas cartas. Considera aumentar la velocidad para más eficiencia.";
      }
    } else {
      advice.message = "Etapa avanzada del juego. El algoritmo está optimizando estratégicamente los últimos movimientos.";
      
      // Verificar si hay un desbalance importante
      const cardDistribution = Object.values(gameState.groups).map(group => 
        group ? group.cards.length : 0
      );
      
      const maxCards = Math.max(...cardDistribution);
      if (maxCards > 5) {
        advice.actionRecommendation = "Un grupo tiene muchas cartas acumuladas. El algoritmo intentará equilibrar el tablero.";
      } else {
        advice.optimizationTip = "La partida está bien balanceada. Mantén el modo automático para optimizar los movimientos finales.";
      }
    }
    
    // Incluir predicción de victoria
    const { probability } = this.calculateWinProbability(gameState, gameHistory);
    advice.winProbability = probability;
    
    return advice;
  }

  /**
   * Cambia la personalidad del genio
   */
  setPersonality(personality) {
    this.personality = personality;
    // Aquí se podrían ajustar las respuestas según la personalidad
  }
}

export default OracleGenieService;
