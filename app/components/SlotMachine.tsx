"use client";
import React, { useState, useEffect, useRef } from 'react';
import styles from './SlotMachine.module.css';

interface SlotMachineProps {
  themes: string[];
  onSelect: (theme: string) => void;
  duration?: number;
}

// Função para gerar uma cor baseada no texto do tema
export const generateColorFromText = (text: string): string => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 80%, 65%)`;
};

const SlotMachine: React.FC<SlotMachineProps> = ({ themes, onSelect, duration = 5000 }) => {
  const [spinning, setSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [finalIndex, setFinalIndex] = useState<number | null>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const [slotHeight, setSlotHeight] = useState(0);
  const [itemHeight, setItemHeight] = useState(0);
  const animationRef = useRef<number | null>(null);
  
  // Garante que temos temas disponíveis
  const safeThemes = themes.length > 0 ? themes : ['Carregando temas...'];
  
  // Cria uma longa lista de temas repetidos para o efeito de slot machine
  // Duplica o array de temas várias vezes para garantir continuidade na animação
  const repeatedThemes = [...Array(30)].flatMap(() => safeThemes);

  // Inicializa a altura dos itens e do slot
  useEffect(() => {
    if (slotRef.current) {
      const height = slotRef.current.clientHeight;
      setSlotHeight(height);
      setItemHeight(80); // Define a altura fixa de cada item
    }
  }, []);

  // Inicia o sorteio automaticamente quando o componente é montado
  useEffect(() => {
    if (slotHeight > 0 && itemHeight > 0 && !spinning && selectedIndex === null) {
      startSpin();
    }
  }, [slotHeight, itemHeight]);

  // Função para iniciar o sorteio
  const startSpin = () => {
    // Sorteia um tema aleatório
    const randomIndex = Math.floor(Math.random() * safeThemes.length);
    setFinalIndex(randomIndex);
    setSpinning(true);
    
    if (slotRef.current) {
      // Inicializa a posição de partida
      slotRef.current.style.transition = 'none';
      slotRef.current.style.transform = 'translateY(0)';
      
      // Força um reflow para garantir que a transição funcione
      void slotRef.current.offsetHeight;
      
      // Inicia a animação
      startAnimation();
      
      // Define um timeout para parar o sorteio
      setTimeout(() => {
        setSpinning(false);
        setSelectedIndex(randomIndex);
        onSelect(safeThemes[randomIndex]);
        
        // Cancela qualquer animação restante
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
        }
      }, duration);
    }
  };

  // Função de animação da roleta
  const startAnimation = () => {
    if (!slotRef.current) return;
    
    const totalItems = repeatedThemes.length;
    const multiplier = safeThemes.length * 2; // Quantas vezes queremos que a roleta dê voltas completas
    const totalScrollDistance = itemHeight * safeThemes.length * multiplier;
    
    let startTime: number | null = null;
    let previousTimestamp: number | null = null;
    let currentPosition = 0;
    
    // Funções de easing para controle da velocidade
    const easeOutQuart = (x: number) => 1 - Math.pow(1 - x, 4);
    const easeOutElastic = (x: number) => {
      const c4 = (2 * Math.PI) / 3;
      return x === 0
        ? 0
        : x === 1
        ? 1
        : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    };
    
    const animate = (timestamp: number) => {
      if (!slotRef.current) return;
      
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      
      // Calcula o progresso da animação (0 a 1)
      const rawProgress = Math.min(elapsedTime / duration, 1);
      
      // Primeiro 60% da animação: velocidade alta e constante
      // Últimos 40%: desaceleração com efeito elástico
      if (rawProgress < 0.6) {
        // Fase inicial: rolagem rápida e constante
        const speedFactor = 5; // Controla a velocidade inicial
        currentPosition = (elapsedTime * speedFactor) % (itemHeight * safeThemes.length);
      } else {
        // Fase final: desaceleração com efeito elástico
        const slowDownProgress = (rawProgress - 0.6) / 0.4;
        const easedProgress = easeOutElastic(slowDownProgress);
        
        // Cálculo da posição final para alinhar com o tema selecionado
        const initialPosition = (0.6 * duration * 5) % (itemHeight * safeThemes.length);
        const finalPosition = (finalIndex !== null ? 
          (finalIndex * itemHeight) + ((totalItems / 2) - (safeThemes.length / 2)) * itemHeight :
          0);
        
        // A posição final é modulada para garantir que ela fique visível na janela
        const modulatedFinalPosition = finalPosition % (itemHeight * safeThemes.length);
        
        // Interpola entre a posição atual e a posição final
        currentPosition = initialPosition - (initialPosition - modulatedFinalPosition) * easedProgress;
      }
      
      // Ajusta a posição para garantir que sempre temos conteúdo visível
      const adjustedPosition = -(currentPosition % (itemHeight * safeThemes.length));
      slotRef.current.style.transform = `translateY(${adjustedPosition}px)`;
      
      // Continua a animação enquanto estiver girando
      if (spinning) {
        animationRef.current = requestAnimationFrame(animate);
      } else if (finalIndex !== null) {
        // Garante que o tema final esteja centralizado
        const finalPosition = -(finalIndex * itemHeight + 
          ((totalItems / 2) - (safeThemes.length / 2)) * itemHeight) % 
          (itemHeight * safeThemes.length);
        
        slotRef.current.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        slotRef.current.style.transform = `translateY(${finalPosition}px)`;
      }
      
      previousTimestamp = timestamp;
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Limpa a animação quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.slotMachineContainer}>
      <div className={styles.slotMachineBody}>
        <div className={styles.lightsTopRow}>
          {[...Array(6)].map((_, i) => (
            <div key={`top-${i}`} className={`${styles.light} ${spinning ? styles.blinking : ''}`}></div>
          ))}
        </div>
        
        <div className={styles.slotWindow}>
          <div className={styles.slotOverlay}></div>
          <div ref={slotRef} className={styles.slotWrapper}>
            {repeatedThemes.map((theme, index) => (
              <div
                key={index}
                className={`${styles.slotItem} ${selectedIndex !== null && index % safeThemes.length === selectedIndex ? styles.selectedItem : ''}`}
                style={{ backgroundColor: generateColorFromText(theme) }}
              >
                {theme}
              </div>
            ))}
          </div>
          <div className={styles.slotGlass}></div>
          <div className={styles.selectionIndicator}></div>
        </div>
        
        <div className={styles.lightsBottomRow}>
          {[...Array(6)].map((_, i) => (
            <div key={`bottom-${i}`} className={`${styles.light} ${spinning ? styles.blinking : ''}`}></div>
          ))}
        </div>
      </div>
      
      {selectedIndex !== null && safeThemes.length > 0 && (
        <div className={styles.selectedThemeOverlay}>
          <div 
            className={styles.selectedThemeMessage}
            style={{ 
              backgroundColor: generateColorFromText(safeThemes[selectedIndex]),
              color: 'white'
            }}
          >
            {safeThemes[selectedIndex]}
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotMachine;