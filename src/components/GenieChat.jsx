import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../hooks/useTheme.js';
import { useNotifications } from './NotificationSystem.jsx';

/**
 * Componente del Chat del Genio del Oráculo
 * Chatbot inteligente que proporciona análisis, predicciones y consejos
 */
const GenieChat = ({ isOpen, onClose, gameState, gameHistory, onApplyRecommendation }) => {
  const { theme } = useTheme();
  const { showInfo } = useNotifications();
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickQuestions] = useState([
    "¿Voy a ganar esta vez?",
    "¿Qué estrategia me recomiendas?",
    "¿Qué modo es mejor?",
    "Analiza mi situación actual",
    "Dame ánimos",
    "¿Cómo voy hasta ahora?"
  ]); 
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Simular el servicio del genio (normalmente vendría del backend)
  const genieService = useMemo(() => ({
    answerQuestion: (question, gameState, gameHistory) => {
      const q = question.toLowerCase();
      
      if (q.includes('ganar') || q.includes('victoria') || q.includes('probabilidad')) {
        const probability = Math.floor(Math.random() * 60) + 30; // 30-90%
        let category = 'medium';
        let prediction = '';
        
        if (probability >= 75) {
          category = 'high';
          prediction = "🎯 Las probabilidades están a tu favor! Veo un " + probability + "% de posibilidades de victoria.";
        } else if (probability <= 40) {
          category = 'low';
          prediction = "⚠️ Los vientos del destino soplan en tu contra. Solo un " + probability + "% de posibilidades.";
        } else {
          prediction = "⚖️ Las fuerzas están equilibradas. Tienes un " + probability + "% de posibilidades de triunfar.";
        }
        
        return {
          prediction,
          probability,
          category,
          recommendation: {
            mode: category === 'low' ? 'automatic' : 'manual',
            message: category === 'low' ? 
              "Te recomiendo el modo automático para una jugada más eficiente." :
              "El modo manual te dará más control sobre tus decisiones.",
            icon: category === 'low' ? "⚡" : "🧠"
          },
          showActions: true
        };
      }
      
      if (q.includes('estrategia') || q.includes('consejo') || q.includes('tip')) {
        const strategies = [
          "🧠 Consejo: En modo manual, observa los patrones de las cartas reveladas.",
          "⚡ Estrategia: El modo automático es más rápido pero menos controlable.",
          "🎯 Tip: Concéntrate en vaciar primero los grupos con más cartas.",
          "🔍 Sabiduría: Cada carta revelada te da información valiosa sobre las siguientes."
        ];
        return {
          message: strategies[Math.floor(Math.random() * strategies.length)],
          analysis: "📊 Análisis: Mantén la calma y confía en tu estrategia."
        };
      }
      
      if (q.includes('modo') || q.includes('manual') || q.includes('automático')) {
        return {
          message: "🧠 Te recomiendo el modo manual para tener más control sobre tus decisiones.",
          recommendedMode: 'manual',
          showActions: true
        };
      }
      
      if (q.includes('ánimo') || q.includes('motivación') || q.includes('perdí')) {
        const encouragements = [
          "💫 ¡No te rindas! Cada gran mago falló antes de triunfar.",
          "🌟 Tu determinación es tu mayor poder. ¡Sigue adelante!",
          "🔥 El fracaso es solo el primer paso hacia el éxito.",
          "✨ Cada partida te hace más sabio. ¡La próxima será tuya!"
        ];
        return {
          message: encouragements[Math.floor(Math.random() * encouragements.length)]
        };
      }

      if (q.includes('analiza') || q.includes('situación') || q.includes('estado')) {
        return {
          message: "📊 Analizando tu situación actual...",
          analysis: "🎯 Tu progreso es sólido. Mantén el enfoque y la paciencia. Las cartas revelarán sus secretos a quien sabe esperar."
        };
      }

      if (q.includes('cómo voy') || q.includes('progreso')) {
        return {
          message: "📈 Tu desempeño es admirable. Cada movimiento te acerca más a la victoria.",
          analysis: "🌟 Has demostrado sabiduría en tus decisiones. Continúa por este camino."
        };
      }
      
      return {
        message: "🤔 Interesante pregunta. ¿Podrías ser más específico? Puedo ayudarte con predicciones, estrategias, o análisis del juego.",
        suggestions: [
          "¿Voy a ganar esta vez?",
          "¿Qué estrategia me recomiendas?",
          "¿Qué modo es mejor?",
          "Analiza mi situación actual"
        ]
      };
    },

    getGreeting: () => {
      const greetings = [
        "🧞‍♂️ ¡Saludos, mortal! Soy el Genio del Oráculo, aquí para guiarte hacia la victoria.",
        "✨ El destino me ha convocado para asistirte en tu búsqueda de la suerte.",
        "🔮 Bienvenido, valiente jugador. Mi sabiduría ancestral está a tu disposición.",
        "🌟 Las estrellas se han alineado para nuestro encuentro. ¿En qué puedo ayudarte?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
  }), []); 

  // Inicializar chat con saludo del genio
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = genieService.getGreeting();
      setMessages([{
        id: Date.now(),
        type: 'genie',
        content: greeting, 
        timestamp: new Date()
      }]);
    }
  }, [isOpen, messages.length, genieService]);

  // Scroll automático al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus en input cuando se abre
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    // Agregar mensaje del usuario
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simular tiempo de respuesta del genio
    setTimeout(() => {
      const response = genieService.answerQuestion(message, gameState, gameHistory);
      
      const genieMessage = {
        id: Date.now() + 1,
        type: 'genie',
        content: response.message || response.prediction,
        analysis: response.analysis,
        recommendation: response.recommendation,
        showActions: response.showActions,
        suggestions: response.suggestions,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, genieMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickQuestion = (question) => {
    handleSendMessage(question);
  };

  const handleApplyRecommendation = (mode) => {
    if (onApplyRecommendation) {
      onApplyRecommendation(mode);
      showInfo(`Modo cambiado a ${mode === 'manual' ? 'Manual' : 'Automático'}`, 'Recomendación Aplicada');
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`
        bg-gradient-to-br ${theme.primary} 
        rounded-2xl border-2 ${theme.border} shadow-2xl 
        w-full max-w-2xl max-h-[80vh] overflow-hidden
        transform transition-all duration-300
        flex flex-col
      `}>
        {/* Header - Sticky */}
        <div className={`bg-gradient-to-r ${theme.secondary} p-4 border-b border-white/20 sticky top-0 z-10 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl animate-float">🧞‍♂️</div>
              <div>
                <h2 className="text-xl font-bold text-white">Genio del Oráculo</h2>
                <p className="text-sm text-white/70">Tu consejero místico personal</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-400 transition-colors duration-200 text-2xl hover-lift flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20"
              title="Cerrar chat"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[80%] rounded-2xl p-3 shadow-lg
                ${message.type === 'user' 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                }
              `}>
                <div className="font-medium">{message.content}</div>
                
                {message.analysis && (
                  <div className="mt-2 text-sm opacity-90 border-t border-white/20 pt-2">
                    {message.analysis}
                  </div>
                )}

                {message.recommendation && (
                  <div className="mt-3 bg-white/20 rounded-lg p-2">
                    <div className="text-sm font-semibold mb-1">
                      {message.recommendation.icon} Recomendación:
                    </div>
                    <div className="text-sm">{message.recommendation.message}</div>
                    {message.showActions && (
                      <button
                        onClick={() => handleApplyRecommendation(message.recommendation.mode)}
                        className="mt-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-semibold transition-colors duration-200"
                      >
                        Aplicar Recomendación
                      </button>
                    )}
                  </div>
                )}

                {message.suggestions && (
                  <div className="mt-3 space-y-1">
                    <div className="text-xs font-semibold opacity-75">Sugerencias:</div>
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickQuestion(suggestion)}
                        className="block w-full text-left text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors duration-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-xs opacity-50 mt-2">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-3 shadow-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preguntas rápidas */}
        <div className="p-4 border-t border-white/20">
          <div className="text-sm font-semibold text-white mb-2">Preguntas rápidas:</div>
          <div className="grid grid-cols-2 gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="text-left text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors duration-200 hover-lift"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/20">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Pregúntale al genio..."
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              className={`
                px-4 py-2 rounded-lg font-semibold transition-all duration-200
                ${inputMessage.trim() 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover-lift' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenieChat;
