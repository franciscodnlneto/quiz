// QuizQuestion.tsx
"use client";
import { useState, useEffect, useRef } from 'react';
import styles from './QuizQuestion.module.css';
import { generateColorFromText } from './SlotMachine';
import QuestionTimer from './QuestionTimer';

interface Question {
  Tema: string;
  Enunciado: string;
  Num_de_alternativas: string;
  Resposta_correta: string;
  Resposta_incorreta: string;
}

interface QuizQuestionProps {
  question: Question;
  onNextQuestion: () => void;
  onSelectNewTheme: () => void;
  onAnswerQuestion: (correct: boolean, pointsEarned: number, timeSpent: number) => void;
  onTimeUp: () => void;
  currentQuestionNumber: number;
  totalQuestions: number;
  showConfetti?: boolean;
  currentScore: number;
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
  currentScore
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [themeColor, setThemeColor] = useState("");
  const [timerRunning, setTimerRunning] = useState(true);
  const [displayTimeSpent, setDisplayTimeSpent] = useState(0);
  const [lastPartialScore, setLastPartialScore] = useState(0);
  const [freezeDisplayScore, setFreezeDisplayScore] = useState(false);
  const [displayScore, setDisplayScore] = useState(currentScore);

  // Posição (0 ou 1) da alternativa correta — randomizada a cada pergunta
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [alternativas, setAlternativas] = useState<string[]>([]);

  const MAX_TIME_POINTS = 100;
  const BASE_POINTS = 250;

  const initialTimeRef = useRef<number>(30);
  const currentTimeRef = useRef<number>(30);
  const processingActionRef = useRef<boolean>(false);

  useEffect(() => {
    setDisplayScore(currentScore);
  }, []);

  useEffect(() => {
    setFadeIn(true);
    setThemeColor(generateColorFromText(question.Tema));
    setSelectedAnswer(null);
    setIsCorrect(null);
    setTimerRunning(true);
    setDisplayTimeSpent(0);
    setLastPartialScore(MAX_TIME_POINTS);
    setFreezeDisplayScore(false);
    setDisplayScore(currentScore);

    // Sorteia posição da resposta correta para esta pergunta
    const correctOnRight = Math.random() < 0.5;
    const newCorrectIndex = correctOnRight ? 1 : 0;
    setCorrectIndex(newCorrectIndex);
    setAlternativas(
      correctOnRight
        ? [question.Resposta_incorreta, question.Resposta_correta]
        : [question.Resposta_correta, question.Resposta_incorreta]
    );

    initialTimeRef.current = 30;
    currentTimeRef.current = 30;
    processingActionRef.current = false;

    const timer = setTimeout(() => {
      setFadeIn(false);
    }, 500);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => clearTimeout(timer);
  }, [question, currentScore]);

  const handleTimerTick = (secondsLeft: number) => {
    currentTimeRef.current = secondsLeft;

    const timeElapsed = initialTimeRef.current - secondsLeft;
    const timePoints = Math.max(0, MAX_TIME_POINTS - (timeElapsed * (MAX_TIME_POINTS / initialTimeRef.current)));
    const partialScore = Math.round(timePoints);

    setLastPartialScore(partialScore);
  };

  const handleAnswerClick = (index: number) => {
    if (selectedAnswer !== null || processingActionRef.current) return;

    processingActionRef.current = true;
    setTimerRunning(false);
    setFreezeDisplayScore(true);

    const timeSpent = initialTimeRef.current - currentTimeRef.current;
    const roundedTimeSpent = Math.max(0, Math.round(timeSpent * 10) / 10);

    setDisplayTimeSpent(roundedTimeSpent);

    const isAnswerCorrect = index === correctIndex;

    setSelectedAnswer(index);
    setIsCorrect(isAnswerCorrect);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    onAnswerQuestion(isAnswerCorrect, BASE_POINTS + lastPartialScore, roundedTimeSpent);
  };

  const getAlternativeClass = (index: number) => {
    if (selectedAnswer === null) return '';

    if (index === selectedAnswer) {
      return index === correctIndex ? styles.correct : styles.incorrect;
    }

    if (index === correctIndex) {
      return styles.correctAnswer;
    }

    return styles.disabled;
  };

  const handleTimeUp = () => {
    if (processingActionRef.current) return;

    processingActionRef.current = true;
    setTimerRunning(false);
    setFreezeDisplayScore(true);
    onTimeUp();
  };

  const formatQuestionTitle = (text: string) => {
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
        onTimerTick={handleTimerTick}
        currentScore={displayScore}
        accumulatedScore={currentScore}
        freezeDisplay={freezeDisplayScore}
      />

      <div className={styles.questionHeader}>
        <div
          className={styles.theme}
          style={{
            backgroundColor: themeColor,
            color: 'white',
            boxShadow: `0 4px 10px ${themeColor}80`
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

      {showConfetti && <div className={styles.confetti}></div>}
    </div>
  );
};

export default QuizQuestion;
