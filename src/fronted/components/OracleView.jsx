import React from 'react';

/**
 * Componente de vista del Oráculo
 * Solo maneja la presentación de los mensajes del oráculo
 */
const OracleView = ({ message, gameState }) => {
  // Determinar el estilo del oráculo basado en el estado del juego
  const getOracleStyle = () => {
    switch (gameState) {
      case 'won':
        return 'from-green-600 to-emerald-600 text-green-100';
      case 'lost':
        return 'from-red-600 to-rose-600 text-red-100';
      case 'playing':
        return 'from-purple-600 to-indigo-600 text-purple-100';
      case 'shuffling':
        return 'from-blue-600 to-cyan-600 text-blue-100';
      default:
        return 'from-purple-600 to-pink-600 text-purple-100';
    }
  };

  // Determinar el emoji del oráculo basado en el estado
  const getOracleEmoji = () => {
    switch (gameState) {
      case 'won':
        return '🏆';
      case 'lost':
        return '💀';
      case 'playing':
        return '🔮';
      case 'shuffling':
        return '🌀';
      default:
        return '🔮';
    }
  };

  return (
    <div className="relative">
      {/* Fondo con efectos */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
      
      {/* Contenedor principal del oráculo */}
      <div className={`relative bg-gradient-to-r ${getOracleStyle()} p-4 sm:p-6 shadow-2xl`}>
        {/* Efectos de brillo */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10"></div>
        
        {/* Contenido del oráculo */}
        <div className="relative flex items-center justify-center space-x-3 sm:space-x-4">
          {/* Emoji del oráculo */}
          <div className="text-2xl sm:text-3xl md:text-4xl animate-pulse">
            {getOracleEmoji()}
          </div>
          
          {/* Mensaje del oráculo */}
          <div className="flex-1 text-center">
            <p className="text-sm sm:text-base md:text-lg font-semibold leading-relaxed">
              {message}
            </p>
          </div>
          
          {/* Emoji del oráculo (espejo) */}
          <div className="text-2xl sm:text-3xl md:text-4xl animate-pulse">
            {getOracleEmoji()}
          </div>
        </div>
        
        {/* Efectos decorativos */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </div>
      
      {/* Sombra inferior */}
      <div className="absolute -bottom-2 left-4 right-4 h-2 bg-black/20 blur-sm rounded-full"></div>
    </div>
  );
};

export default OracleView;
