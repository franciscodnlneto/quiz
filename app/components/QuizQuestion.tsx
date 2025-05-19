// QuizQuestion.tsx - Atualizado com confetti controlado e barra de progresso
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
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ 
  question, 
  onNextQuestion, 
  onSelectNewTheme, 
  onAnswerQuestion,
  onTimeUp,
  currentQuestionNumber,
  totalQuestions,
  showConfetti = false
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [themeColor, setThemeColor] = useState("");
  const [timerRunning, setTimerRunning] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);
  
  const startTimeRef = useRef<number>(Date.now());

  // Efeito para animar a entrada ao montar o componente
  useEffect(() => {
    setFadeIn(true);
    setThemeColor(generateColorFromText(question.Tema));
    setSelectedAnswer(null);
    setIsCorrect(null);
    setTimerRunning(true);
    startTimeRef.current = Date.now();
    
    const timer = setTimeout(() => {
      setFadeIn(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [question]);

  const numAlternativas = parseInt(question.Num_de_alternativas);
  const alternativas = [
    question.Alternativa_1,
    question.Alternativa_2,
    question.Alternativa_3,
    question.Alternativa_4
  ].slice(0, numAlternativas);

  const handleAnswerClick = (index: number) => {
    if (selectedAnswer !== null) return;
    
    // Parar o timer
    setTimerRunning(false);
    
    // Calcular tempo gasto - usando décimos de segundo para maior precisão
    const answerTime = (Date.now() - startTimeRef.current) / 1000;
    setTimeSpent(parseFloat(answerTime.toFixed(1))); // Mantém 1 casa decimal
    
    setSelectedAnswer(index);
    const correctAnswerIndex = parseInt(question.Resposta_correta) - 1;
    const correct = index === correctAnswerIndex;
    setIsCorrect(correct);
    
    // Informar ao componente pai sobre a resposta
    onAnswerQuestion(correct, answerTime);
  };

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

  const handleTimeUp = () => {
    setTimerRunning(false);
    onTimeUp();
  };

  // Compacta o enunciado se for muito longo
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
          <div className={styles.timeInfo}>
            Tempo: <span className={styles.timeValue}>{timeSpent.toFixed(1)} segundos</span>
          </div>
          
          {/* Botão "Próxima Pergunta" removido - a transição é automática */}
        </div>
      )}
      
      {/* Efeito de confetti controlado pelo componente pai */}
      {showConfetti && <div className={styles.confetti}></div>}
    </div>
  );
};

export default QuizQuestion;