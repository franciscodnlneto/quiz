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
    const r = Math.round(0 + (255 - 0) * p);       // 0 → 255
    const g = Math.round(230 - (230 - 72) * p);    // 230 → 72
    const b = Math.round(118 - (118 - 36) * p);    // 118 → 36

    return `linear-gradient(145deg, rgb(${r}, ${g}, ${b}), rgb(${Math.max(r - 30, 0)}, ${Math.max(g - 30, 0)}, ${Math.max(b - 30, 0)}))`;
  };

  // Texto: branco → dourado (#FFC107)
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
