import React from 'react';
import { OracleGameView } from './fronted/index.js';
import { ThemeProvider } from './hooks/useTheme.js';
import NotificationSystem from './components/NotificationSystem.jsx';

/**
 * Componente principal de la aplicación
 * Integra el sistema de temas, notificaciones y la nueva arquitectura
 */
function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <OracleGameView />
        <NotificationSystem />
      </div>
    </ThemeProvider>
  );
} 

export default App;
