"use client";
import React, { useState, useEffect, useRef } from 'react';
import styles from './SlotMachine.module.css';

interface SlotMachineProps {
  themes: string[];
  onSelect: (theme: string) => void;
  duration?: number;
}

export const generateColorFromText = (text: string): string => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 80%, 65%)`;
};

const SlotMachine: React.FC<SlotMachineProps> = ({ themes, onSelect, duration = 3000 }) => { // Reduzi a duração padrão para 3s
  const [spinning, setSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const itemHeight = 80;
  const animationRef = useRef<number | null>(null);
  
  const safeThemes = themes.length > 0 ? themes : ['Carregando temas...'];
  const multiplyFactor = 10;
  const repeatedThemes = [...Array(multiplyFactor)].flatMap(() => safeThemes);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!spinning && selectedIndex === null) {
        startSpin();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const startSpin = () => {
    const randomIndex = Math.floor(Math.random() * safeThemes.length);
    setSpinning(true);
    
    if (slotRef.current) {
      void slotRef.current.offsetHeight;
      startAnimation(randomIndex);
      
      setTimeout(() => {
        setSelectedIndex(randomIndex);
        onSelect(safeThemes[randomIndex]);
      }, duration);
    }
  };

  const startAnimation = (targetIndex: number) => {
    if (!slotRef.current) return;
    
    // Configuração inicial - começa mais acima para dar mais rotação
    const initialOffset = -(itemHeight * safeThemes.length * 5); // Aumentei para mais rotação
    slotRef.current.style.transition = 'none';
    slotRef.current.style.transform = `translateY(${initialOffset}px)`;
    void slotRef.current.offsetHeight;
    
    let startTime: number | null = null;
    const cycleHeight = itemHeight * safeThemes.length;
    
    // Calcula a posição final para centralizar exatamente o tema alvo
    // Considerando que o meio da tela é onde está o selectionIndicator
    const slotWindow = slotRef.current?.parentElement;
    if (!slotWindow) return;
    
    const slotWindowHeight = slotWindow.clientHeight;
    const centerOffset = (slotWindowHeight / 2) - (itemHeight / 2);
    const targetPosition = -((cycleHeight * 2) + (targetIndex * itemHeight) - centerOffset);
        
    // Função de easing para começar rápido e desacelerar suavemente
    const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    
    const animate = (timestamp: number) => {
      if (!slotRef.current) return;
      
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Aplica curva de aceleração/desaceleração
      const easedProgress = easeOutExpo(progress);
      
      // Calcula a posição atual com desaceleração
      const currentPosition = initialOffset + (targetPosition - initialOffset) * easedProgress;
      
      // Aplica a transformação
      slotRef.current.style.transform = `translateY(${currentPosition}px)`;
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        finalizeAnimation(targetPosition);
      }
    };
    
    const finalizeAnimation = (finalPosition: number) => {
      if (!slotRef.current) return;
    
      // Efeito elástico: passa um pouco e volta
      const overshoot = 15; // em px - pode ajustar para mais ou menos "toquinho"
      const overshootPosition = finalPosition + overshoot;
    
      slotRef.current.style.transition = 'transform 0.2s ease-out';
      slotRef.current.style.transform = `translateY(${overshootPosition}px)`;
    
      void slotRef.current.offsetHeight;
    
      setTimeout(() => {
        if (!slotRef.current) return;
    
        slotRef.current.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
        slotRef.current.style.transform = `translateY(${finalPosition}px)`;
        void slotRef.current.offsetHeight;
    
        setTimeout(() => {
          setSpinning(false);
        }, 400); // tempo do segundo movimento
      }, 200); // tempo do overshoot
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const getSlotItemClass = (index: number) => {
    if (selectedIndex !== null && index % safeThemes.length === selectedIndex) {
      return `${styles.slotItem} ${styles.selectedItem}`;
    }
    return styles.slotItem;
  };

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
                className={getSlotItemClass(index)}
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