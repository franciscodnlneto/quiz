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

    // Atualiza a fase com base no tempo restante
    if (count === seconds && phase === 'sorteando') {
      setCurrentPhase('iniciando');
    } else if (count <= 2 && currentPhase !== 'finalizando') {
      setCurrentPhase('finalizando');
    } else if (count < seconds - 1 && currentPhase === 'iniciando') {
      setCurrentPhase('sorteando');
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, seconds, onComplete, phase, currentPhase]);

  // Calcula a porcentagem para o progress bar
  const progressPercentage = ((seconds - count) / seconds) * 100;

  return (
    <div className={`${styles.countdownContainer} ${styles[currentPhase]}`}>
      <div className={styles.countdownInner}>
        <div className={styles.phaseText}>
          {currentPhase === 'iniciando' && 'Iniciando sorteio...'}
          {currentPhase === 'sorteando' && 'Sorteando tema...'}
          {currentPhase === 'finalizando' && 'Finalizando sorteio!'}
        </div>
        
        <div className={styles.timerDisplay}>
          <div className={styles.number}>{count}</div>
          <div className={styles.unit}>segundos</div>
        </div>
        
        <div className={styles.progressBarContainer}>
          <div 
            className={styles.progressBar} 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className={styles.spinner}></div>
    </div>
  );
};

export default CountDown;