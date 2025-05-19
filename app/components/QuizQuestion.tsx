// QuizQuestion.tsx - Atualizado com sincronização do cálculo de pontuação
"use client";
import { useState, useEffect, useRef } from 'react';
import styles from './QuizQuestion.module.css';
import { generateColorFromText } from './SlotMachine';
import QuestionTimer from './QuestionTimer';

interface Question {
  Tema: string;
  Enunciado: string;
  Num_de_alternativas: string;
  Alternativa_1: string;
  Alternativa_2: string;
  Alternativa_3: string;
  Alternativa_4: string;
  Resposta_correta: string;
  Alternativa_irreverente: string;
}

interface QuizQuestionProps {
  question: Question;
  onNextQuestion: () => void;
  onSelectNewTheme: () => void;
  onAnswerQuestion: (correct: boolean, timeSpent: number) => void;
  onTimeUp: () => void;
  currentQuestionNumber: number;
  totalQuestions: number;
  showConfetti?: boolean;
  currentScore: number; // Adicione esta nova prop
} 

const QuizQuestion: React.FC<QuizQuestionProps> = ({ 
  question, 
  onNextQuestion, 
  onSelectNewTheme, 
  onAnswerQuestion,
  onTimeUp,
  currentQuestionNumber,
  totalQuestions,
  showConfetti = false,
  currentScore // Adicione esta prop
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [themeColor, setThemeColor] = useState("");
  const [timerRunning, setTimerRunning] = useState(true);
  const [displayTimeSpent, setDisplayTimeSpent] = useState(0);
  const [lastPartialScore, setLastPartialScore] = useState(0);
  
  // Constantes para cálculo da pontuação (mesmas do QuestionTimer)
  const MAX_TIME_POINTS = 100; // Pontos máximos por resposta rápida
  const BASE_POINTS = 250;     // Pontos base por pergunta correta
  
  // Usar refs para maior confiabilidade
  const initialTimeRef = useRef<number>(30);
  const currentTimeRef = useRef<number>(30);
  const processingActionRef = useRef<boolean>(false);

  // Efeito para animar a entrada ao montar o componente e resetar estados
  useEffect(() => {
    // Resetar todos os estados quando uma nova pergunta é carregada
    setFadeIn(true);
    setThemeColor(generateColorFromText(question.Tema));
    setSelectedAnswer(null);
    setIsCorrect(null);
    setTimerRunning(true);
    setDisplayTimeSpent(0);
    setLastPartialScore(MAX_TIME_POINTS);
    
    // Resetar refs
    initialTimeRef.current = 30;
    currentTimeRef.current = 30;
    processingActionRef.current = false;
    
    const timer = setTimeout(() => {
      setFadeIn(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [question]);

  // Preparar as alternativas da pergunta
  const numAlternativas = parseInt(question.Num_de_alternativas);
  const alternativas = [
    question.Alternativa_1,
    question.Alternativa_2,
    question.Alternativa_3,
    question.Alternativa_4
  ].slice(0, numAlternativas);

  // Função para acompanhar o valor atual do timer
  const handleTimerTick = (secondsLeft: number) => {
    // Atualizar o ref com o valor atual
    currentTimeRef.current = secondsLeft;
    
    // Calcular a pontuação parcial - MESMA FÓRMULA usada no QuestionTimer
    const timeElapsed = initialTimeRef.current - secondsLeft;
    const timePoints = Math.max(0, MAX_TIME_POINTS - (timeElapsed * (MAX_TIME_POINTS / initialTimeRef.current)));
    const partialScore = Math.round(timePoints);
    
    // Registrar a pontuação parcial para uso quando a resposta for selecionada
    setLastPartialScore(partialScore);
  };

  // Função para processar a escolha de uma alternativa
  const handleAnswerClick = (index: number) => {
    // Evitar processamento múltiplo ou quando já selecionou uma resposta
    if (selectedAnswer !== null || processingActionRef.current) return;
    
    // Marcar que estamos processando para evitar cliques duplos
    processingActionRef.current = true;
    
    // Parar o timer
    setTimerRunning(false);
    
    // Calcular o tempo gasto - usando a diferença entre o tempo inicial e o atual
    const timeSpent = initialTimeRef.current - currentTimeRef.current;
    
    // Garantir que é um valor positivo e arredondar consistentemente
    const roundedTimeSpent = Math.max(0, Math.round(timeSpent * 10) / 10);
    
    // Atualizar o state para exibição
    setDisplayTimeSpent(roundedTimeSpent);
    
    // Determinar se a resposta está correta
    const correctAnswerIndex = parseInt(question.Resposta_correta) - 1;
    const isAnswerCorrect = index === correctAnswerIndex;
    
    // Atualizar os estados
    setSelectedAnswer(index);
    setIsCorrect(isAnswerCorrect);
    
    // Notificar o componente pai
    onAnswerQuestion(isAnswerCorrect, BASE_POINTS + lastPartialScore);


  };

  // Determinar a classe CSS para cada alternativa
  const getAlternativeClass = (index: number) => {
    if (selectedAnswer === null) return '';
    
    const correctAnswerIndex = parseInt(question.Resposta_correta) - 1;
    
    if (index === selectedAnswer) {
      return index === correctAnswerIndex ? styles.correct : styles.incorrect;
    }
    
    if (index === correctAnswerIndex) {
      return styles.correctAnswer;
    }
    
    return styles.disabled;
  };

  // Função para lidar com o tempo esgotado
  const handleTimeUp = () => {
    // Evitar processamento múltiplo
    if (processingActionRef.current) return;
    
    // Marcar que estamos processando
    processingActionRef.current = true;
    
    // Parar o timer
    setTimerRunning(false);
    
    // Notificar o componente pai
    onTimeUp();
  };

  // Ajustar o tamanho do título baseado no comprimento
  const formatQuestionTitle = (text: string) => {
    if (text.length > 100) {
      return (
        <h2 className={styles.questionTitle} style={{ fontSize: '1.2rem', lineHeight: '1.25' }}>
          {text}
        </h2>
      );
    }
    return <h2 className={styles.questionTitle}>{text}</h2>;
  };

  // Calculador de pontuação total
  const calculateTotalScore = () => {
    if (isCorrect) {
      return BASE_POINTS + lastPartialScore;
    }
    return 0;
  };


  return (
    <div className={`${styles.questionContainer} ${fadeIn ? styles.fadeIn : ''} ${fadeOut ? styles.fadeOut : ''} ${selectedAnswer !== null ? styles.answered : ''}`}>
    <div className={styles.progress}>
      <div className={styles.progressText}>
        Pergunta {currentQuestionNumber} de {totalQuestions}
      </div>
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${(currentQuestionNumber / totalQuestions) * 100}%` }}
        ></div>
      </div>
    </div>
      
  
<QuestionTimer
  seconds={30}
  onTimeUp={handleTimeUp}
  isRunning={timerRunning}
  onTimerTick={handleTimerTick}
currentScore={currentScore}
  accumulatedScore={currentScore}
/>

      
      <div className={styles.questionHeader}>
        <div 
          className={styles.theme}
          style={{ 
            backgroundColor: themeColor,
            color: 'white',
            boxShadow: `0 4px 10px ${themeColor}80` // Adiciona transparência à sombra
          }}
        >
          <span className={styles.themeName}>{question.Tema}</span>
          <span className={styles.themeGlow}></span>
        </div>
      </div>
      
      {formatQuestionTitle(question.Enunciado)}

      <div className={styles.alternatives}>
        {alternativas.map((alternativa, index) => (
          <button
            key={index}
            className={`${styles.alternative} ${getAlternativeClass(index)}`}
            onClick={() => handleAnswerClick(index)}
            disabled={selectedAnswer !== null || !timerRunning}
          >
            <span className={styles.letter}>{String.fromCharCode(65 + index)}</span>
            <span className={styles.content}>{alternativa}</span>
          </button>
        ))}
      </div>

      {selectedAnswer !== null && (
        <div className={styles.feedback}>
          <p className={isCorrect ? styles.correctFeedback : styles.incorrectFeedback}>
            {isCorrect ? 'Parabéns! Você acertou!' : 'Ops! Resposta incorreta.'}
          </p>
          <div className={styles.scoreInfo}>

            <div className={styles.timeInfo}>
              Tempo: <span className={styles.timeValue}>{displayTimeSpent.toFixed(1)} segundos</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Efeito de confetti controlado pelo componente pai */}
      {showConfetti && <div className={styles.confetti}></div>}
    </div>
  );
};

export default QuizQuestion;