import { useState, useEffect, createContext, useContext } from 'react';

// Contexto del tema
const ThemeContext = createContext();

// Temas disponibles
export const themes = {
  mystic: {
    name: 'Místico',
    primary: 'from-purple-900 via-blue-900 to-indigo-900',
    secondary: 'from-purple-600 to-indigo-600',
    accent: 'from-yellow-400 to-purple-400',
    card: 'from-blue-600 to-purple-600',
    oracle: 'from-purple-600 to-pink-600',
    board: 'from-green-900/40 to-green-800/40',
    border: 'border-yellow-600/50',
    text: 'text-purple-100',
    emoji: '🔮'
  },
  forest: {
    name: 'Bosque Encantado',
    primary: 'from-green-900 via-emerald-900 to-teal-900',
    secondary: 'from-green-600 to-emerald-600',
    accent: 'from-emerald-400 to-green-400',
    card: 'from-emerald-600 to-green-600',
    oracle: 'from-green-600 to-emerald-600',
    board: 'from-emerald-900/40 to-green-800/40',
    border: 'border-emerald-600/50',
    text: 'text-emerald-100',
    emoji: '🌲'
  },
  ocean: {
    name: 'Océano Profundo',
    primary: 'from-blue-900 via-cyan-900 to-teal-900',
    secondary: 'from-blue-600 to-cyan-600',
    accent: 'from-cyan-400 to-blue-400',
    card: 'from-cyan-600 to-blue-600',
    oracle: 'from-blue-600 to-cyan-600',
    board: 'from-blue-900/40 to-cyan-800/40',
    border: 'border-cyan-600/50',
    text: 'text-cyan-100',
    emoji: '🌊'
  },
  fire: {
    name: 'Llamas Eternas',
    primary: 'from-red-900 via-orange-900 to-yellow-900',
    secondary: 'from-red-600 to-orange-600',
    accent: 'from-orange-400 to-red-400',
    card: 'from-orange-600 to-red-600',
    oracle: 'from-red-600 to-orange-600',
    board: 'from-red-900/40 to-orange-800/40',
    border: 'border-orange-600/50',
    text: 'text-orange-100',
    emoji: '🔥'
  },
  cosmic: {
    name: 'Cósmico',
    primary: 'from-indigo-900 via-purple-900 to-pink-900',
    secondary: 'from-indigo-600 to-purple-600',
    accent: 'from-pink-400 to-indigo-400',
    card: 'from-purple-600 to-indigo-600',
    oracle: 'from-indigo-600 to-purple-600',
    board: 'from-indigo-900/40 to-purple-800/40',
    border: 'border-purple-600/50',
    text: 'text-indigo-100',
    emoji: '✨'
  }
};

// Hook personalizado para el tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};

// Provider del tema
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('mystic');
  const [isAnimating, setIsAnimating] = useState(false);

  // Cargar tema guardado
  useEffect(() => {
    const savedTheme = localStorage.getItem('oracle-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Cambiar tema con animación
  const changeTheme = (newTheme) => {
    if (newTheme === currentTheme) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentTheme(newTheme);
      localStorage.setItem('oracle-theme', newTheme);
      setTimeout(() => setIsAnimating(false), 300);
    }, 150);
  };

  const value = {
    currentTheme,
    theme: themes[currentTheme],
    themes,
    changeTheme,
    isAnimating
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
