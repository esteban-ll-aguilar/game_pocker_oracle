/**
 * Servicio para manejar el layout y posiciones del tablero de juego
 * Proporciona funciones para calcular posiciones de grupos en el tablero 4x4
 */
class BoardLayoutService {
  constructor() {
    // Configuración del tablero 4x4 con el grupo central (K) ocupando 2x2
    this.boardConfig = {
      rows: 4,
      cols: 4,
      centerGroup: 13,
      centerSpan: 2
    };
  }

  /**
   * Obtiene la posición de un grupo en la cuadrícula 4x4
   * @param {number} groupNumber - Número del grupo (1-13)
   * @returns {Object} Objeto con row, col y span si aplica
   */
  getGridPosition(groupNumber) {
    const positions = {
      1: { row: 0, col: 0 },   // esquina superior izquierda
      2: { row: 0, col: 1 },   // arriba izquierda
      3: { row: 0, col: 2 },   // arriba derecha
      4: { row: 0, col: 3 },   // esquina superior derecha
      5: { row: 1, col: 3 },   // derecha arriba
      6: { row: 2, col: 3 },   // derecha abajo
      7: { row: 3, col: 3 },   // esquina inferior derecha
      8: { row: 3, col: 2 },   // abajo derecha
      9: { row: 3, col: 1 },   // abajo izquierda
      10: { row: 3, col: 0 },  // esquina inferior izquierda
      11: { row: 2, col: 0 },  // izquierda abajo
      12: { row: 1, col: 0 },  // izquierda arriba
      13: { row: 1, col: 1, span: 2 }   // centro (K) - ocupa 2x2
    };
    return positions[groupNumber] || { row: 1, col: 1 };
  }

  /**
   * Verifica si una celda específica es parte del grupo central
   * @param {number} row - Fila de la celda
   * @param {number} col - Columna de la celda
   * @returns {boolean} True si la celda es parte del grupo central
   */
  isCenterCell(row, col) {
    const centerPos = this.getGridPosition(13);
    return centerPos && (
      (row === centerPos.row && col === centerPos.col) ||
      (row === centerPos.row && col === centerPos.col + 1) ||
      (row === centerPos.row + 1 && col === centerPos.col) ||
      (row === centerPos.row + 1 && col === centerPos.col + 1)
    );
  }

  /**
   * Encuentra qué grupo corresponde a una posición específica
   * @param {number} row - Fila
   * @param {number} col - Columna
   * @param {Object} groups - Grupos del juego
   * @returns {string|null} Número del grupo o null si no hay grupo
   */
  findGroupAtPosition(row, col, groups) {
    return Object.keys(groups).find(groupNum => {
      const pos = this.getGridPosition(parseInt(groupNum));
      return pos.row === row && pos.col === col;
    });
  }

  /**
   * Genera la estructura completa del tablero para renderizado
   * @param {Object} groups - Grupos del juego
   * @returns {Array} Array de objetos representando cada celda del tablero
   */
  generateBoardStructure(groups) {
    const boardCells = [];
    const totalCells = this.boardConfig.rows * this.boardConfig.cols;

    for (let index = 0; index < totalCells; index++) {
      const row = Math.floor(index / this.boardConfig.cols);
      const col = index % this.boardConfig.cols;
      
      const groupNumber = this.findGroupAtPosition(row, col, groups);
      const isCenterCell = this.isCenterCell(row, col);
      
      if (groupNumber) {
        const group = groups[groupNumber];
        const isCenter = parseInt(groupNumber) === this.boardConfig.centerGroup;
        
        boardCells.push({
          key: `grid-${row}-${col}`,
          row,
          col,
          groupNumber: parseInt(groupNumber),
          group,
          isCenter,
          isCenterCell,
          type: 'group'
        });
      } else if (isCenterCell && groups[this.boardConfig.centerGroup]) {
        // Esta celda es parte del grupo central pero ya fue renderizada
        boardCells.push({
          key: `center-occupied-${row}-${col}`,
          row,
          col,
          type: 'center-occupied'
        });
      } else {
        // Celda vacía
        boardCells.push({
          key: `empty-${row}-${col}`,
          row,
          col,
          type: 'empty'
        });
      }
    }

    return boardCells;
  }

  /**
   * Obtiene las clases CSS para una celda específica
   * @param {Object} cell - Objeto celda del tablero
   * @param {Object} currentCard - Carta actual del juego
   * @returns {string} Clases CSS para la celda
   */
  getCellClasses(cell, currentCard) {
    let classes = 'relative aspect-[3/4]';
    
    if (cell.type === 'group') {
      const shouldHighlight = currentCard && currentCard.numericValue === cell.groupNumber;
      
      if (shouldHighlight) {
        classes += ' animate-pulse';
      }
      
      if (cell.isCenter) {
        classes += ' col-span-2 row-span-2';
      }
    } else if (cell.type === 'empty') {
      classes += ' border-2 border-dashed border-gray-600/30 rounded-xl bg-gray-800/20';
    }
    
    return classes;
  }

  /**
   * Valida si el layout del tablero es correcto
   * @param {Object} groups - Grupos del juego
   * @returns {Object} Resultado de la validación
   */
  validateBoardLayout(groups) {
    const errors = [];
    const warnings = [];
    
    // Verificar que existan todos los grupos necesarios
    for (let i = 1; i <= 13; i++) {
      if (!groups[i]) {
        errors.push(`Falta el grupo ${i}`);
      }
    }
    
    // Verificar que el grupo central tenga la configuración correcta
    if (groups[13]) {
      const centerPos = this.getGridPosition(13);
      if (!centerPos.span || centerPos.span !== 2) {
        warnings.push('El grupo central no tiene la configuración de span correcta');
      }
    }
    
    // Verificar que no haya solapamientos
    const occupiedPositions = new Set();
    Object.keys(groups).forEach(groupNum => {
      const pos = this.getGridPosition(parseInt(groupNum));
      const posKey = `${pos.row}-${pos.col}`;
      
      if (occupiedPositions.has(posKey)) {
        errors.push(`Solapamiento detectado en posición ${posKey}`);
      }
      occupiedPositions.add(posKey);
      
      // Si es el grupo central, marcar las posiciones adicionales
      if (parseInt(groupNum) === 13 && pos.span === 2) {
        const additionalPositions = [
          `${pos.row}-${pos.col + 1}`,
          `${pos.row + 1}-${pos.col}`,
          `${pos.row + 1}-${pos.col + 1}`
        ];
        
        additionalPositions.forEach(addPos => {
          if (occupiedPositions.has(addPos)) {
            errors.push(`Solapamiento del grupo central en posición ${addPos}`);
          }
          occupiedPositions.add(addPos);
        });
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Obtiene información estadística del tablero
   * @param {Object} groups - Grupos del juego
   * @returns {Object} Estadísticas del tablero
   */
  getBoardStatistics(groups) {
    let totalCards = 0;
    let totalRevealedCards = 0;
    let emptyGroups = 0;
    let fullGroups = 0;
    
    Object.values(groups).forEach(group => {
      totalCards += group.cards.length;
      totalRevealedCards += group.revealed.length;
      
      if (group.cards.length === 0) {
        emptyGroups++;
      } else if (group.cards.length === 4) {
        fullGroups++;
      }
    });
    
    return {
      totalCards,
      totalRevealedCards,
      emptyGroups,
      fullGroups,
      totalGroups: Object.keys(groups).length,
      completionPercentage: Math.round((emptyGroups / Object.keys(groups).length) * 100)
    };
  }
}

export default BoardLayoutService;
