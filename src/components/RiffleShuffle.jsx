import React, { useEffect, useRef, useState, useCallback } from "react";

const CARD_COUNT = 20;
const COLLISION_THRESHOLD = 30; // Distancia mínima entre cartas

export default function CinematicRiffleShuffle() {
  const containerRef = useRef();
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("Preparando...");
  const [particlesRef, setParticlesRef] = useState([]);
  const [cardPositions, setCardPositions] = useState(new Map());
  const cards = Array.from({ length: CARD_COUNT }, (_, i) => i);

  // Sistema de detección de colisiones mejorado
  const checkCollision = useCallback((pos1, pos2) => {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < COLLISION_THRESHOLD;
  }, []);

  // Función para encontrar posición libre sin colisiones
  const findSafePosition = useCallback((targetX, targetY, existingPositions, cardId) => {
    let safeX = targetX;
    let safeY = targetY;
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      let hasCollision = false;
      
      for (const [id, pos] of existingPositions) {
        if (id !== cardId && checkCollision({ x: safeX, y: safeY }, pos)) {
          hasCollision = true;
          break;
        }
      }

      if (!hasCollision) {
        return { x: safeX, y: safeY };
      }

      // Ajustar posición para evitar colisión
      const angle = Math.random() * Math.PI * 2;
      const offset = COLLISION_THRESHOLD + Math.random() * 20;
      safeX = targetX + Math.cos(angle) * offset;
      safeY = targetY + Math.sin(angle) * offset;
      attempts++;
    }

    return { x: safeX, y: safeY };
  }, [checkCollision]);

  // Generar partículas para efectos con mejor distribución
  const generateParticles = useCallback(() => {
    const particles = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        id: i,
        x: Math.random() * 1000,
        y: Math.random() * 700,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.4 + 0.1,
        speed: Math.random() * 3 + 2,
        delay: Math.random() * 1500,
        direction: Math.random() * Math.PI * 2
      });
    }
    setParticlesRef(particles);
  }, []);

  const cinematicRiffleShuffle = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    generateParticles();

    const allCards = Array.from(containerRef.current.children);
    const middle = Math.floor(allCards.length / 2);
    const leftHalf = allCards.slice(0, middle);
    const rightHalf = allCards.slice(middle);
    const positions = new Map();

    // Resetear con posicionamiento seguro
    allCards.forEach((card, i) => {
      const baseY = -i * 0.8;
      const safePos = findSafePosition(0, baseY, positions, i);
      positions.set(i, safePos);
      
      card.style.transform = `translateX(${safePos.x}px) translateY(${safePos.y}px) translateZ(${i * 1.5}px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)`;
      card.style.zIndex = CARD_COUNT - i; // Z-index invertido para mejor apilamiento
      card.style.transition = 'none';
      card.style.filter = 'brightness(1) saturate(1) blur(0px)';
    });

    setCardPositions(positions);

    setTimeout(() => {
      setCurrentPhase("Dividiendo el mazo...");
      const newPositions = new Map();
      
      // Fase 1: División con anti-colisión mejorada
      leftHalf.forEach((card, i) => {
        const targetX = -220 - i * 12;
        const targetY = -40 - i * 6;
        const safePos = findSafePosition(targetX, targetY, newPositions, i);
        newPositions.set(i, safePos);
        
        card.style.transition = 'transform 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 2.2s ease-out';
        card.style.transform = `translateX(${safePos.x}px) translateY(${safePos.y}px) translateZ(${i * 8}px) rotateX(${15 + i * 2.5}deg) rotateY(${-25 + i * 2}deg) rotateZ(${-35 + i * 3}deg) scale(${1.03 + i * 0.015})`;
        card.style.zIndex = 300 + i;
        card.style.filter = `brightness(${1.2 + i * 0.025}) saturate(1.4) drop-shadow(0 ${12 + i * 3}px ${20 + i * 3}px rgba(0,0,0,0.5))`;
      });

      rightHalf.forEach((card, i) => {
        const targetX = 220 + i * 12;
        const targetY = -40 - i * 6;
        const safePos = findSafePosition(targetX, targetY, newPositions, middle + i);
        newPositions.set(middle + i, safePos);
        
        card.style.transition = 'transform 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 2.2s ease-out';
        card.style.transform = `translateX(${safePos.x}px) translateY(${safePos.y}px) translateZ(${i * 8}px) rotateX(${15 + i * 2.5}deg) rotateY(${25 - i * 2}deg) rotateZ(${35 - i * 3}deg) scale(${1.03 + i * 0.015})`;
        card.style.zIndex = 300 + i;
        card.style.filter = `brightness(${1.2 + i * 0.025}) saturate(1.4) drop-shadow(0 ${12 + i * 3}px ${20 + i * 3}px rgba(0,0,0,0.5))`;
      });

      setCardPositions(newPositions);

      setTimeout(() => {
        setCurrentPhase("Formando el arco...");
        const arcPositions = new Map();
        
        // Fase 2: Arco cinematográfico con anti-colisión
        leftHalf.forEach((card, i) => {
          const targetX = -100 - i * 8;
          const arcHeight = 140 + i * 18;
          const targetY = -arcHeight - Math.sin(i * 0.3) * 12;
          const safePos = findSafePosition(targetX, targetY, arcPositions, i);
          arcPositions.set(i, safePos);
          
          card.style.transition = 'transform 2.5s cubic-bezier(0.68, -0.55, 0.265, 1.55), filter 2.5s ease-out';
          card.style.transform = `translateX(${safePos.x}px) translateY(${safePos.y}px) translateZ(${i * 10}px) rotateX(${50 + i * 4}deg) rotateY(${-25 + i * 2}deg) rotateZ(${-40 + i * 2.5}deg) scale(${1.06 + i * 0.02})`;
          card.style.zIndex = 400 + i;
          card.style.filter = `brightness(${1.35 + i * 0.025}) saturate(1.5) drop-shadow(0 ${15 + i * 4}px ${25 + i * 4}px rgba(255,215,0,0.5)) drop-shadow(0 0 ${20 + i * 3}px rgba(255,255,255,0.4))`;
        });

        rightHalf.forEach((card, i) => {
          const targetX = 100 + i * 8;
          const arcHeight = 140 + i * 18;
          const targetY = -arcHeight - Math.sin(i * 0.3) * 12;
          const safePos = findSafePosition(targetX, targetY, arcPositions, middle + i);
          arcPositions.set(middle + i, safePos);
          
          card.style.transition = 'transform 2.5s cubic-bezier(0.68, -0.55, 0.265, 1.55), filter 2.5s ease-out';
          card.style.transform = `translateX(${safePos.x}px) translateY(${safePos.y}px) translateZ(${i * 10}px) rotateX(${50 + i * 4}deg) rotateY(${25 - i * 2}deg) rotateZ(${40 - i * 2.5}deg) scale(${1.06 + i * 0.02})`;
          card.style.zIndex = 400 + i;
          card.style.filter = `brightness(${1.35 + i * 0.025}) saturate(1.5) drop-shadow(0 ${15 + i * 4}px ${25 + i * 4}px rgba(255,215,0,0.5)) drop-shadow(0 0 ${20 + i * 3}px rgba(255,255,255,0.4))`;
        });

        setTimeout(() => {
          setCurrentPhase("Riffle mágico...");
          
          // Fase 3: Riffle con sistema anti-colisión avanzado
          const shuffledOrder = [];
          const rifflePosistions = new Map();
          
          // Patrón de caída más realista
          let leftIndex = 0, rightIndex = 0;
          while (leftIndex < leftHalf.length || rightIndex < rightHalf.length) {
            const dropLeft = Math.random() > 0.45;
            const burstSize = Math.floor(Math.random() * 2) + 1;
            
            for (let burst = 0; burst < burstSize; burst++) {
              if (dropLeft && leftIndex < leftHalf.length) {
                shuffledOrder.push({ card: leftHalf[leftIndex], side: 'left', index: leftIndex, burst });
                leftIndex++;
              } else if (rightIndex < rightHalf.length) {
                shuffledOrder.push({ card: rightHalf[rightIndex], side: 'right', index: rightIndex, burst });
                rightIndex++;
              }
            }
          }

          shuffledOrder.forEach((item, i) => {
            setTimeout(() => {
              const { card, side, index, burst = 0 } = item;
              
              // Calcular posición objetivo con anti-colisión
              const baseX = (i - shuffledOrder.length / 2) * 8;
              const baseY = 80 + Math.sin(i * 0.4) * 20 + burst * 12;
              const safePos = findSafePosition(baseX, baseY, rifflePosistions, i);
              rifflePosistions.set(i, safePos);
              
              card.style.transition = 'transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 1s ease-out';
              
              // Movimiento más realista con física mejorada
              const wobbleX = Math.sin(i * 0.6) * 8;
              const wobbleY = Math.cos(i * 0.5) * 6;
              const spiral = Math.sin(i * 0.15) * 3;

              card.style.transform = `translateX(${safePos.x + wobbleX}px) translateY(${safePos.y + wobbleY}px) translateZ(${i * 4 + spiral}px) rotateX(${30 + wobbleX * 0.6}deg) rotateY(${side === 'left' ? -10 + spiral : 10 - spiral}deg) rotateZ(${wobbleX * 0.8 + spiral}deg) scale(${1.03 + Math.sin(i * 0.2) * 0.03})`;
              card.style.zIndex = 500 + i;
              card.style.filter = `brightness(${1.25 + Math.sin(i * 0.3) * 0.15}) saturate(1.4) drop-shadow(0 ${10 + Math.abs(wobbleX)}px ${18 + Math.abs(wobbleY)}px rgba(0,100,255,0.4)) blur(${Math.abs(wobbleX) * 0.05}px)`;
            }, i * 120 + Math.random() * 80 + (item.burst || 0) * 40);
          });


          setTimeout(() => {
            setCurrentPhase("Colapsando el puente...");
            
            // Fase 4: Colapso con ondas
            shuffledOrder.forEach((item, i) => {
              const { card } = item;
              setTimeout(() => {
                card.style.transition = 'transform 1.5s cubic-bezier(0.23, 1, 0.32, 1), filter 1.5s ease-out';
                const waveX = Math.sin(i * 0.4) * 20;
                const waveY = Math.cos(i * 0.3) * 15;
                const collapseX = i * 4 + waveX;
                const collapseY = 30 - (i * 1.2) + waveY;
                const tiltWave = Math.sin(i * 0.25) * 15;
                
                card.style.transform = `translateX(${collapseX}px) translateY(${collapseY}px) translateZ(${i * 2}px) rotateX(${tiltWave}deg) rotateY(${Math.sin(i * 0.4) * 5}deg) rotateZ(${Math.sin(i * 0.5) * 8}deg) scale(${1.01 + Math.sin(i * 0.2) * 0.03})`;
                card.style.zIndex = 400 + i;
                card.style.filter = `brightness(${1.15 + Math.sin(i * 0.3) * 0.15}) saturate(1.2) drop-shadow(0 ${6 + Math.abs(waveX) * 0.3}px ${12 + Math.abs(waveY) * 0.5}px rgba(50,205,50,0.3))`;
              }, i * 80 + Math.sin(i * 0.3) * 50);
            });

            setTimeout(() => {
              setCurrentPhase("Presionando y alineando...");
              
              // Fase 5: Presión con efectos de compresión
              shuffledOrder.forEach((item, i) => {
                const { card } = item;
                card.style.transition = 'transform 2s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 2s ease-out';
                const pressX = i * 3 + Math.sin(i * 0.1) * 5;
                const pressY = -i * 1.2 + Math.cos(i * 0.15) * 3;
                const pressZ = i * 1.5;
                
                card.style.transform = `translateX(${pressX}px) translateY(${pressY}px) translateZ(${pressZ}px) rotateX(${i * 0.8 + Math.sin(i * 0.2) * 2}deg) rotateY(${Math.sin(i * 0.1) * 2}deg) rotateZ(${i * 0.5 + Math.cos(i * 0.3) * 1}deg) scale(${1 + Math.sin(i * 0.1) * 0.02})`;
                card.style.zIndex = 500 + i;
                card.style.filter = `brightness(${1.1 + Math.sin(i * 0.2) * 0.1}) saturate(1.1) drop-shadow(0 ${4 + i * 0.5}px ${8 + i}px rgba(0,0,0,0.2))`;
              });

              setTimeout(() => {
                setCurrentPhase("Perfección final...");
                
                // Fase 6: Alineación perfecta con efectos de finalización
                shuffledOrder.forEach((item, i) => {
                  const { card } = item;
                  card.style.transition = 'transform 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 2.5s ease-out';
                  card.style.transform = `translateX(${i * 0.5}px) translateY(${-i * 0.4}px) translateZ(${i * 0.6}px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)`;
                  card.style.zIndex = i;
                  card.style.filter = 'brightness(1) saturate(1) drop-shadow(0 2px 4px rgba(0,0,0,0.1))';
                });

                setTimeout(() => {
                  setCurrentPhase("¡Shuffle completado!");
                  setTimeout(() => {
                    setIsAnimating(false);
                    setCurrentPhase("Listo para mezclar");
                  }, 1000);
                }, 2500);
              }, 2000);
            }, shuffledOrder.length * 80 + 400);
          }, shuffledOrder.length * 150 + 800);
        }, 2000);
      }, 1800);
    }, 300);
  }, [isAnimating, findSafePosition, generateParticles, checkCollision]);

  useEffect(() => {
    cinematicRiffleShuffle();
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black overflow-hidden">
      {/* Partículas flotantes */}
      {particlesRef.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-yellow-400 animate-pulse"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
            animationDelay: `${particle.delay}ms`,
            animationDuration: `${particle.speed}s`
          }}
        />
      ))}

      {/* Contenedor principal con efectos de iluminación */}
      <div 
        className="relative w-[1000px] h-[700px] mb-8 rounded-3xl backdrop-blur-sm bg-gradient-to-br from-green-900/20 to-black/20 border border-yellow-400/20"
        style={{ 
          perspective: '1500px',
          transformStyle: 'preserve-3d',
          boxShadow: '0 0 50px rgba(255,215,0,0.2), inset 0 0 50px rgba(0,100,0,0.1)'
        }}
      >
        <div
          ref={containerRef}
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {cards.map((id) => {
            const suits = ['♠', '♥', '♦', '♣'];
            const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
            const suit = suits[id % 4];
            const value = values[id % 13];
            const isRed = suit === '♥' || suit === '♦';
            const isFaceCard = ['J', 'Q', 'K', 'A'].includes(value);
            
            return (
              <div
                key={id}
                className="absolute rounded-2xl select-none border-2 border-gray-300 overflow-hidden"
                style={{ 
                  top: '50%',
                  left: '50%',
                  marginTop: '-108px',
                  marginLeft: '-75px',
                  width: '150px',
                  height: '216px',
                  backfaceVisibility: 'hidden',
                  background: `linear-gradient(135deg, 
                    ${isFaceCard ? '#fdfcf0' : '#ffffff'} 0%, 
                    ${isFaceCard ? '#f5f3e7' : '#f8f9fa'} 50%, 
                    ${isFaceCard ? '#fdfcf0' : '#ffffff'} 100%)`,
                  boxShadow: `
                    0 12px 35px rgba(0,0,0,0.15), 
                    0 20px 50px rgba(0,0,0,0.1), 
                    inset 0 2px 0 rgba(255,255,255,0.9),
                    inset 0 -2px 0 rgba(0,0,0,0.05)
                  `,
                  border: '2px solid rgba(0,0,0,0.08)'
                }}
              >
                <div className="absolute inset-3 rounded-xl">
                  {/* Esquina superior izquierda */}
                  <div className={`absolute top-3 left-3 text-center ${isRed ? 'text-red-600' : 'text-gray-900'} font-bold`}>
                    <div className="text-xl leading-none font-black">{value}</div>
                    <div className="text-2xl leading-none">{suit}</div>
                  </div>
                  
                  {/* Centro con efectos especiales para cartas de figuras */}
                  <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
                    <div className={`${isFaceCard ? 'text-6xl' : 'text-5xl'} ${isFaceCard ? 'animate-pulse' : ''}`}>
                      {suit}
                    </div>
                    {isFaceCard && (
                      <div className="text-sm font-bold mt-1 text-gray-700">
                        {value === 'J' ? 'JACK' : value === 'Q' ? 'QUEEN' : value === 'K' ? 'KING' : 'ACE'}
                      </div>
                    )}
                  </div>
                  
                  {/* Esquina inferior derecha */}
                  <div className={`absolute bottom-3 right-3 text-center transform rotate-180 ${isRed ? 'text-red-600' : 'text-gray-900'} font-bold`}>
                    <div className="text-xl leading-none font-black">{value}</div>
                    <div className="text-2xl leading-none">{suit}</div>
                  </div>
                </div>
                
                {/* Efectos de brillo para cartas especiales */}
                {isFaceCard && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-200/20 via-transparent to-purple-200/20 animate-pulse"></div>
                )}
                
                {/* Patrón de fondo dinámico */}
                <div className="absolute inset-0 rounded-2xl opacity-5">
                  <div className={`w-full h-full bg-gradient-to-br ${isRed ? 'from-red-100 to-pink-100' : 'from-blue-100 to-indigo-100'} rounded-2xl`}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botón épico */}
      <button
        onClick={cinematicRiffleShuffle}
        disabled={isAnimating}
        className={`relative px-16 py-5 rounded-2xl font-bold text-2xl text-white transition-all duration-500 transform overflow-hidden ${
          isAnimating
            ? 'bg-gray-700 cursor-not-allowed scale-95'
            : 'bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-400 hover:to-yellow-500 hover:scale-110 active:scale-95 shadow-2xl hover:shadow-yellow-500/50'
        }`}
      >
        <span className="relative z-10">
          {isAnimating ? '🎴 Mezclando...' : '🎴 Ejecutar Riffle Shuffle'}
        </span>
        {!isAnimating && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        )}
      </button>


      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
        .bg-gradient-conic {
          background: conic-gradient(var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}
