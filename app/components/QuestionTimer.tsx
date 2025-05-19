"use client";
import { useState, useEffect, useRef } from 'react';
import styles from './QuestionTimer.module.css';

interface QuestionTimerProps {
  seconds: number;
  onTimeUp: () => void;
  isRunning: boolean;
  onTimerTick?: (secondsLeft: number) => void;
  currentScore: number;
  accumulatedScore: number; // Nova prop adicionada aqui
}


const QuestionTimer: React.FC<QuestionTimerProps> = ({
  seconds,
  onTimeUp,
  isRunning,
  onTimerTick,
  currentScore,
  accumulatedScore
}) => {
  // Usar refs para o estado real do timer para evitar problemas de closure
  const timeLeftRef = useRef<number>(seconds);
  const [displayTimeLeft, setDisplayTimeLeft] = useState(seconds);
  const [currentPartialScore, setCurrentPartialScore] = useState(100);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);
  const hasCalledTimeUpRef = useRef<boolean>(false);
  
  // Constantes para cálculo da pontuação (mesmas do componente principal)
  const MAX_TIME_POINTS = 100; // Pontos máximos por resposta rápida
  const BASE_POINTS = 250;     // Pontos base por pergunta correta
  
  // Limpa o intervalo e reseta tudo quando o componente desmonta
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);
  
  // Resetar o timer quando as props mudam
  useEffect(() => {
    // Reiniciar tudo quando o componente é montado ou quando seconds muda
    timeLeftRef.current = seconds;
    setDisplayTimeLeft(seconds);
    setCurrentPartialScore(MAX_TIME_POINTS);
    startTimeRef.current = null;
    hasCalledTimeUpRef.current = false;
    
    // Notificar o componente pai sobre o valor inicial
    if (onTimerTick) {
      onTimerTick(seconds);
    }
    
    // Limpar qualquer intervalo existente
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [seconds]);
  
  // Manipular a execução/pausa do timer
  useEffect(() => {
    // Limpar qualquer intervalo existente antes de configurar um novo
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (isRunning) {
      // Registrar o tempo de início se ainda não estiver definido
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
        lastTickTimeRef.current = Date.now();
      }
      
      // Criar um novo intervalo de alta precisão (50ms)
      intervalRef.current = setInterval(() => {
        // Calcular tempo decorrido desde o início
        const now = Date.now();
        const elapsed = (now - startTimeRef.current!) / 1000;
        const newTimeLeft = Math.max(0, seconds - elapsed);
        
        // Arredondar para uma casa decimal de forma consistente
        const roundedTimeLeft = Math.round(newTimeLeft * 10) / 10;
        
        // Calcular a pontuação parcial com base no tempo restante
        // A fórmula deve ser exatamente a mesma usada no componente QuizQuestion
        const timePoints = Math.max(0, MAX_TIME_POINTS - ((seconds - roundedTimeLeft) * (MAX_TIME_POINTS / seconds)));
        const partialScore = Math.round(timePoints);
        
        // Atualizar refs
        timeLeftRef.current = roundedTimeLeft;
        
        // Atualizar state apenas se o tempo mudou significativamente (100ms)
        if (now - lastTickTimeRef.current >= 100) {
          lastTickTimeRef.current = now;
          setDisplayTimeLeft(roundedTimeLeft);
          setCurrentPartialScore(partialScore);
          
          // Notificar o componente pai sobre a mudança
          if (onTimerTick) {
            onTimerTick(roundedTimeLeft);
          }
        }
        
        // Verificar se o tempo acabou
        if (roundedTimeLeft <= 0 && !hasCalledTimeUpRef.current) {
          hasCalledTimeUpRef.current = true; // Evitar múltiplas chamadas
          
          // Limpar o intervalo
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          
          // Notificar que o tempo acabou
          onTimeUp();
        }
      }, 50); // Intervalo mais curto para maior precisão
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, seconds, onTimeUp, onTimerTick]);
  
  // Calcular a cor do timer baseado no tempo restante
  const getTimerColor = () => {
    if (displayTimeLeft > seconds * 0.6) return '#4CAF50'; // Verde
    if (displayTimeLeft > seconds * 0.3) return '#FFC107'; // Amarelo
    return '#F44336'; // Vermelho
  };
  
  // Calcular a porcentagem restante
  const percentLeft = (displayTimeLeft / seconds) * 100;
  
  // Determinar a classe de animação
  const getAnimationClass = () => {
    if (displayTimeLeft <= 5) return styles.critical;
    if (displayTimeLeft <= 10) return styles.warning;
    return '';
  };

  // Formatar o tempo com uma casa decimal
  const formatTime = (time: number) => {
    return time.toFixed(1);
  };

 return (
  <div className={styles.timerContainer}>
    <div className={styles.timerHeader}>
      <div className={styles.timerInfo}>
        <span className={styles.timerLabel}>Tempo Restante</span>
        <span className={`${styles.timerValue} ${getAnimationClass()}`}>
          {formatTime(displayTimeLeft)}s
        </span>
      </div>
<div className={styles.scoreInfo}>
  <span className={styles.scoreLabel}>Score Parcial</span>
  <span className={styles.scoreValue}>
    {BASE_POINTS} + {currentPartialScore} = {BASE_POINTS + currentPartialScore}
  </span>
</div>



    </div>
    
    <div className={styles.progressContainer}>
      <div className={styles.progressBar} style={{ width: `${percentLeft}%`, backgroundColor: getTimerColor() }}></div>
    </div>
  </div>
);

};

export default QuestionTimer;