"use client";
import React, { useState, useEffect, useRef } from 'react';
import styles from './SlotMachine.module.css';

interface SlotMachineProps {
  themes: string[];
  onSelect: (theme: string) => void;
  duration?: number;
}

// Função para gerar uma cor baseada no texto do tema
const generateColorFromText = (text: string): string => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 75%, 60%)`;
};

const SlotMachine: React.FC<SlotMachineProps> = ({ themes, onSelect, duration = 5000 }) => {
  const [spinning, setSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [finalIndex, setFinalIndex] = useState<number | null>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const [slotHeight, setSlotHeight] = useState(0);
  const [itemHeight, setItemHeight] = useState(0);
  
  // Cria uma longa lista de temas repetidos para o efeito de slot machine
  const repeatedThemes = [...Array(20)].flatMap(() => themes);

  // Inicializa a altura dos itens e do slot
  useEffect(() => {
    if (slotRef.current) {
      const height = slotRef.current.clientHeight;
      setSlotHeight(height);
      setItemHeight(height / 4); // Mostra aproximadamente 4 itens visíveis
    }
  }, []);

  // Inicia o sorteio
  useEffect(() => {
    if (spinning && slotHeight > 0 && itemHeight > 0) {
      // Sorteia um tema aleatório
      const randomIndex = Math.floor(Math.random() * themes.length);
      setFinalIndex(randomIndex);
      
      // Define um timeout para parar o sorteio
      const timer = setTimeout(() => {
        setSpinning(false);
        setSelectedIndex(randomIndex);
        onSelect(themes[randomIndex]);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [spinning, themes, onSelect, duration, slotHeight, itemHeight]);

  // Efeito de foco no tema selecionado após o término do sorteio
  useEffect(() => {
    if (!spinning && selectedIndex !== null && slotRef.current) {
      // Calcula a posição para centralizar o tema selecionado
      const finalPosition = -(selectedIndex * itemHeight + itemHeight * repeatedThemes.length / 4);
      slotRef.current.style.transition = 'transform 0.5s ease-out';
      slotRef.current.style.transform = `translateY(${finalPosition}px)`;
    }
  }, [spinning, selectedIndex, itemHeight, repeatedThemes.length]);

  // Inicia o sorteio
  const startSpin = () => {
    if (slotRef.current) {
      setSelectedIndex(null);
      setSpinning(true);
      
      // Configura a animação inicial
      slotRef.current.style.transition = 'none';
      slotRef.current.style.transform = 'translateY(0)';
      
      // Força um reflow para que a próxima transição funcione
      void slotRef.current.offsetHeight;
      
      // Inicia a animação
      slotRef.current.style.transition = `transform ${duration/1000}s cubic-bezier(0.1, 0.7, 0.1, 1)`;
      slotRef.current.style.transform = `translateY(${-(repeatedThemes.length * itemHeight - slotHeight/2)}px)`;
    }
  };

  useEffect(() => {
    // Inicia o sorteio automaticamente quando o componente for montado
    startSpin();
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
                className={`${styles.slotItem} ${selectedIndex !== null && index % themes.length === selectedIndex ? styles.selectedItem : ''}`}
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
      
      {selectedIndex !== null && (
        <div className={styles.selectedThemeOverlay}>
          <div className={styles.selectedThemeMessage}>Tema Selecionado!</div>
        </div>
      )}
    </div>
  );
};

export default SlotMachine;