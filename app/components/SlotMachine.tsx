"use client";
import React, { useState, useEffect, useRef } from 'react';
import styles from './SlotMachine.module.css';
import { selectRandomTheme, getSecureRandomInt, shuffleArray } from '../utils/randomUtils';


interface SlotMachineProps {
  themes: string[];
  onSelect: (theme: string) => void;
  duration?: number;
  usedThemes?: string[]; // Nova prop para temas já usados
}

// Função atualizada para gerar cores baseadas na paleta do CPC
export const generateColorFromText = (text: string): string => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Usar o hash para decidir entre variações das cores do CPC
  const value = Math.abs(hash) % 100;
  
  // Definir as cores base do CPC
  const magenta = { r: 176, g: 42, b: 120 }; // #B02A78
  const verde = { r: 154, g: 195, b: 60 };   // #9AC33C
  
  // Variações das cores principais
  const colors = [
    { r: magenta.r, g: magenta.g, b: magenta.b },          // #B02A78
    { r: magenta.r - 20, g: magenta.g + 10, b: magenta.b + 20 }, // #9D3488
    { r: verde.r, g: verde.g, b: verde.b },                // #9AC33C
    { r: verde.r - 10, g: verde.g + 10, b: verde.b - 10 }  // #90CD32
  ];
  
  // Escolher uma cor baseada no hash
  const colorIndex = Math.floor(value / 25); // 0-3
  const selectedColor = colors[colorIndex];
  
  // Converter para HSL para permitir ajustes de luminosidade
  const r = selectedColor.r / 255;
  const g = selectedColor.g / 255;
  const b = selectedColor.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // acromático
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    
    h = Math.round(h * 60);
  }
  
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `hsl(${h}, ${s}%, ${l}%)`;
};

const SlotMachine: React.FC<SlotMachineProps> = ({ themes, onSelect, duration = 3000, usedThemes = [] }) => { // Duração padrão 3s
  const [spinning, setSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const itemHeight = 70; // Atualizado para 70px para corresponder ao CSS
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
  setSpinning(true);
  
  // Use o novo algoritmo de seleção de temas
  const selectedTheme = selectRandomTheme(safeThemes, usedThemes);
  
  // Encontre o índice correspondente no array original
  const selectedIndex = safeThemes.indexOf(selectedTheme);
  
  if (slotRef.current) {
    void slotRef.current.offsetHeight;
    startAnimation(selectedIndex);
    
    setTimeout(() => {
      setSelectedIndex(selectedIndex);
      onSelect(safeThemes[selectedIndex]);
    }, duration);
  }
};

  const startAnimation = (targetIndex: number) => {
    if (!slotRef.current) return;
  
    const initialOffset = -(itemHeight * safeThemes.length * 5);
    const cycleHeight = itemHeight * safeThemes.length;
    const slotWindow = slotRef.current?.parentElement;
    if (!slotWindow) return;
  
    const slotWindowHeight = slotWindow.clientHeight;
    const centerOffset = (slotWindowHeight / 2) - (itemHeight / 2);
    const finalPosition = -((cycleHeight * 2) + (targetIndex * itemHeight) - centerOffset);
  
    const totalDuration = duration;
    const trembleDuration = totalDuration * 0.2;
    const spinDuration = totalDuration - trembleDuration;
  
    const weightedRandom = () => {
      const weights = [0.05, 0.05, 0.1, 0.15, 0.2, 0.15, 0.1, 0.1, 0.05, 0.05]; // soma = 1
      const rnd = Math.random();
      let sum = 0;
      for (let i = 0; i < weights.length; i++) {
        sum += weights[i];
        if (rnd < sum) return i + 1;
      }
      return 10;
    };
    
    const pulseCount = weightedRandom();
    
    const pulseDurations = Array.from({ length: pulseCount }, (_, i) => spinDuration / pulseCount);
  
    let currentPulse = 0;
    let pulseStartTime: number | null = null;
  
    let startOffset = initialOffset;
  
    const easeInOut = (t: number) => t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  
    const runPulse = (timestamp: number) => {
      if (!slotRef.current) return;
      if (pulseStartTime === null) pulseStartTime = timestamp;
  
      const pulseElapsed = timestamp - pulseStartTime;
      const pulseDuration = pulseDurations[currentPulse];
      const progress = Math.min(pulseElapsed / pulseDuration, 1);
      const eased = easeInOut(progress);
  
      // Cálculo da posição parcial para esta etapa
      const pulseTarget = initialOffset + ((finalPosition - initialOffset) * ((currentPulse + 1) / pulseCount));
      const position = startOffset + (pulseTarget - startOffset) * eased;
  
      slotRef.current.style.transition = 'none';
      slotRef.current.style.transform = `translateY(${position}px)`;
  
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(runPulse);
      } else {
        currentPulse++;
        startOffset = position;
        pulseStartTime = null;
  
        if (currentPulse < pulseCount) {
          animationRef.current = requestAnimationFrame(runPulse);
        } else {
          finalizeWithEmotion(finalPosition, trembleDuration);
        }
      }
    };
  
    slotRef.current.style.transition = 'none';
    slotRef.current.style.transform = `translateY(${initialOffset}px)`;
    void slotRef.current.offsetHeight;
  
    animationRef.current = requestAnimationFrame(runPulse);
  };
    
  const finalizeWithEmotion = (finalPosition: number, durationLeft: number) => {
    if (!slotRef.current) return;
  
    const trembles = [0, -8, +4, -6, +3, 0]; // pode randomizar se quiser
    const interval = durationLeft / trembles.length;
  
    let step = 0;
  
    const doTremble = () => {
      if (!slotRef.current) return;
  
      const offset = trembles[step] ?? 0;
      slotRef.current.style.transition = 'transform 0.12s ease-out';
      slotRef.current.style.transform = `translateY(${finalPosition + offset}px)`;
      void slotRef.current.offsetHeight;
  
      step++;
  
      if (step < trembles.length) {
        setTimeout(doTremble, interval);
      } else {
        // Fixa no final exato
        slotRef.current.style.transition = 'transform 0.3s ease-in-out';
        slotRef.current.style.transform = `translateY(${finalPosition}px)`;
        setTimeout(() => setSpinning(false), 300);
      }
    };
  
    doTremble();
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