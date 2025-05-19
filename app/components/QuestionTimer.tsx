// QuestionTimer.tsx - Corrigindo para mostrar décimos de segundo
"use client";
import { useState, useEffect, useRef } from 'react';
import styles from './QuestionTimer.module.css';

interface QuestionTimerProps {
  seconds: number;
  onTimeUp: () => void;
  isRunning: boolean;
  onTimerTick?: (secondsLeft: number) => void;
}

const QuestionTimer: React.FC<QuestionTimerProps> = ({ 
  seconds, 
  onTimeUp, 
  isRunning,
  onTimerTick
}) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Resetar o timer quando a prop seconds mudar
  useEffect(() => {
    setTimeLeft(seconds);
    startTimeRef.current = null;
  }, [seconds]);
  
  // Gerenciar o temporizador
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - (startTimeRef.current || 0)) / 1000;
        const newTimeLeft = Math.max(0, seconds - elapsed);
        
        // Arredondar para uma casa decimal
        const roundedTimeLeft = Math.round(newTimeLeft * 10) / 10;
        
        setTimeLeft(roundedTimeLeft);
        if (onTimerTick) onTimerTick(roundedTimeLeft);
        
        if (roundedTimeLeft <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          onTimeUp();
        }
      }, 100); // Atualizando a cada 100ms para mostrar os décimos de segundo
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, seconds, onTimeUp, onTimerTick]);
  
  // Calcular a cor do timer baseado no tempo restante
  const getTimerColor = () => {
    if (timeLeft > seconds * 0.6) return '#4CAF50'; // Verde
    if (timeLeft > seconds * 0.3) return '#FFC107'; // Amarelo
    return '#F44336'; // Vermelho
  };
  
  // Calcular a porcentagem restante
  const percentLeft = (timeLeft / seconds) * 100;
  
  // Determinar a classe de animação
  const getAnimationClass = () => {
    if (timeLeft <= 5) return styles.critical;
    if (timeLeft <= 10) return styles.warning;
    return '';
  };

  // Formatar o tempo com uma casa decimal
  const formatTime = (time: number) => {
    return time.toFixed(1);
  };

  return (
    <div className={styles.timerContainer}>
      <div className={styles.timerHeader}>
        <span className={styles.timerLabel}>Tempo Restante</span>
        <span className={`${styles.timerValue} ${getAnimationClass()}`}>
          {timeLeft > 0 ? formatTime(timeLeft) : '0.0'}s
        </span>
      </div>
      
      <div className={styles.progressContainer}>
        <div 
          className={styles.progressBar} 
          style={{ 
            width: `${percentLeft}%`,
            backgroundColor: getTimerColor()
          }}
        ></div>
      </div>
    </div>
  );
};

export default QuestionTimer;