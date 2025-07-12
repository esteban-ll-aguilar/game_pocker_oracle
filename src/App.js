import React from 'react';
import { OracleGameView } from './fronted/index.js';

/**
 * Componente principal de la aplicación
 * Usa la nueva arquitectura separada frontend/backend
 */
function App() {
  return (
    <div className="App">
      <OracleGameView />
    </div>
  );
} 

export default App;
