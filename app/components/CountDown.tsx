"use client";
import React, { useState, useEffect } from 'react';
import styles from './CountDown.module.css';

interface CountDownProps {
  seconds: number;
  onComplete?: () => void;
  phase?: 'iniciando' | 'sorteando' | 'finalizando';
}

const CountDown: React.FC<CountDownProps> = ({ 
  seconds, 
  onComplete,
  phase = 'sorteando'
}) => {
  const [count, setCount] = useState(seconds);
  const [currentPhase, setCurrentPhase] = useState(phase);

  useEffect(() => {
    if (count <= 0) {
      onComplete && onComplete();
      return;
    }

    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval);
          return 0;
        }
        return parseFloat((prev - 0.1).toFixed(1));
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (count <= 2 && currentPhase !== 'finalizando') {
      setCurrentPhase('finalizando');
    } else if (count < seconds - 1 && currentPhase === 'iniciando') {
      setCurrentPhase('sorteando');
    } else if (count === seconds && phase === 'sorteando') {
      setCurrentPhase('iniciando');
    }
  }, [count, seconds, phase, currentPhase]);

  const progress = 1 - count / seconds;

  // Escala viva de verde → laranja → vermelho
  const getInterpolatedBackground = (p: number) => {
    const hue = 120 - 120 * p;
  
    // Ajuste de luminosidade para contraste
    let lightnessTop = 50;
    let lightnessBottom = 40;
  
    if (hue >= 40 && hue <= 60) {
      lightnessTop = 42;
      lightnessBottom = 32;
    }
  
    return `linear-gradient(145deg, hsl(${hue}, 100%, ${lightnessTop}%), hsl(${hue}, 100%, ${lightnessBottom}%))`;
  };
  
  const getInterpolatedTextColor = (p: number) => {
    const r = Math.round(255 - (255 - 255) * p);
    const g = Math.round(255 - (255 - 193) * p);
    const b = Math.round(255 - (255 - 7) * p);
    return `rgb(${r}, ${g}, ${b})`;
  };
  

  return (
    <div 
      className={styles.countdownContainer}
      style={{ background: getInterpolatedBackground(progress) }}
    >
      <div className={styles.countdownInner}>
        <div className={styles.phaseText}>
          {currentPhase === 'iniciando' && 'Iniciando sorteio...'}
          {currentPhase === 'sorteando' && 'Sorteando tema...'}
          {currentPhase === 'finalizando' && 'Finalizando sorteio!'}
        </div>

        <div className={styles.timerDisplay}>
          <div 
            className={styles.number}
            style={{ color: getInterpolatedTextColor(progress) }}
          >
            {count.toFixed(1)}
          </div>
          <div className={styles.unit}>segundos</div>
        </div>

        <div className={styles.progressBarContainer}>
          <div 
            className={styles.progressBar} 
            style={{ width: `${progress * 100}%` }}
          ></div>
        </div>
      </div>

      <div className={styles.spinner}></div>
    </div>
  );
};

export default CountDown;