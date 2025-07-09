import React, { useState, useEffect } from 'react';

const Oracle = ({ message, gameState }) => {
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Efecto de escritura tipo máquina de escribir
  useEffect(() => {
    if (message !== displayedMessage) {
      setIsTyping(true);
      setCurrentIndex(0);
      setDisplayedMessage('');
      
      const typeMessage = () => {
        let index = 0;
        const interval = setInterval(() => {
          if (index < message.length) {
            setDisplayedMessage(message.slice(0, index + 1));
            index++;
          } else {
            setIsTyping(false);
            clearInterval(interval);
          }
        }, 50); // Velocidad de escritura
        
        return interval;
      };

      const timeout = setTimeout(typeMessage, 300);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [message, displayedMessage]);

  // Obtener el estado visual del oráculo según el estado del juego
  const getOracleAppearance = () => {
    switch (gameState) {
      case 'menu':
        return {
          emoji: '🔮',
          bgColor: 'from-purple-600 to-blue-600',
          textColor: 'text-purple-100',
          borderColor: 'border-purple-400',
          shadowColor: 'shadow-purple-500/50'
        };
      case 'shuffling':
        return {
          emoji: '✨',
          bgColor: 'from-yellow-600 to-orange-600',
          textColor: 'text-yellow-100',
          borderColor: 'border-yellow-400',
          shadowColor: 'shadow-yellow-500/50'
        };
      case 'playing':
        return {
          emoji: '🎴',
          bgColor: 'from-green-600 to-teal-600',
          textColor: 'text-green-100',
          borderColor: 'border-green-400',
          shadowColor: 'shadow-green-500/50'
        };
      case 'won':
        return {
          emoji: '👑',
          bgColor: 'from-yellow-500 to-amber-500',
          textColor: 'text-yellow-100',
          borderColor: 'border-yellow-300',
          shadowColor: 'shadow-yellow-400/70'
        };
      case 'lost':
        return {
          emoji: '💀',
          bgColor: 'from-red-600 to-pink-600',
          textColor: 'text-red-100',
          borderColor: 'border-red-400',
          shadowColor: 'shadow-red-500/50'
        };
      default:
        return {
          emoji: '🔮',
          bgColor: 'from-purple-600 to-blue-600',
          textColor: 'text-purple-100',
          borderColor: 'border-purple-400',
          shadowColor: 'shadow-purple-500/50'
        };
    }
  };

  const appearance = getOracleAppearance();

  return (
    <div className="w-full p-6">
      <div className={`max-w-4xl mx-auto bg-gradient-to-r ${appearance.bgColor} rounded-2xl border-2 ${appearance.borderColor} shadow-2xl ${appearance.shadowColor} relative overflow-hidden`}>
        {/* Efectos de fondo animados */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 animate-pulse"></div>
        
        {/* Partículas flotantes */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full animate-bounce"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${2 + i * 0.3}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-6 flex items-center space-x-4">
          {/* Avatar del Oráculo */}
          <div className="flex-shrink-0">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-white/20 to-white/5 border-2 ${appearance.borderColor} flex items-center justify-center text-3xl ${gameState === 'playing' ? 'animate-pulse' : ''} ${gameState === 'won' ? 'animate-bounce' : ''} ${gameState === 'lost' ? 'animate-pulse' : ''}`}>
              {appearance.emoji}
            </div>
          </div>

          {/* Mensaje del Oráculo */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className={`text-lg font-bold ${appearance.textColor}`}>
                El Oráculo de la Suerte
              </h3>
              {gameState === 'won' && (
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <span key={i} className="text-yellow-300 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>
                      ⭐
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className={`text-base ${appearance.textColor} leading-relaxed min-h-[3rem] flex items-center`}>
              <span className="relative">
                {displayedMessage}
                {isTyping && (
                  <span className="inline-block w-0.5 h-5 bg-current ml-1 animate-pulse"></span>
                )}
              </span>
            </div>

            {/* Indicadores de estado */}
            <div className="mt-3 flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${appearance.textColor} bg-white/10 border border-white/20`}>
                {gameState === 'menu' && '🏠 Menú Principal'}
                {gameState === 'shuffling' && '🔄 Barajando...'}
                {gameState === 'playing' && '🎮 Jugando'}
                {gameState === 'won' && '🏆 ¡Victoria!'}
                {gameState === 'lost' && '💔 Derrota'}
              </div>
              
              {gameState === 'playing' && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className={`text-xs ${appearance.textColor}`}>En vivo</span>
                </div>
              )}
            </div>
          </div>

          {/* Efectos especiales según el estado */}
          {gameState === 'won' && (
            <div className="flex-shrink-0">
              <div className="text-4xl animate-spin">🎊</div>
            </div>
          )}
          
          {gameState === 'lost' && (
            <div className="flex-shrink-0">
              <div className="text-3xl animate-pulse">⚡</div>
            </div>
          )}
        </div>

        {/* Barra de progreso para estados especiales */}
        {(gameState === 'shuffling' || isTyping) && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div className="h-full bg-gradient-to-r from-white/60 to-white/80 animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Oracle;
