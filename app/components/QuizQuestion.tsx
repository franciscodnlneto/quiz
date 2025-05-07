// QuizQuestion.tsx - Componente de perguntas com transições suaves
"use client";
import { useState, useEffect } from 'react';
import styles from './QuizQuestion.module.css';

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
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ question, onNextQuestion }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // Efeito para animar a entrada ao montar o componente
  useEffect(() => {
    setFadeIn(true);
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
    setSelectedAnswer(index);
    const correctAnswerIndex = parseInt(question.Resposta_correta) - 1;
    setIsCorrect(index === correctAnswerIndex);
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

  const handleNextQuestion = () => {
    // Inicia a animação de saída
    setFadeOut(true);
    
    // Aguarda a animação completar antes de mudar a pergunta
    setTimeout(() => {
      setSelectedAnswer(null);
      setIsCorrect(null);
      setFadeOut(false);
      onNextQuestion();
    }, 500);
  };

  return (
    <div className={`${styles.questionContainer} ${fadeIn ? styles.fadeIn : ''} ${fadeOut ? styles.fadeOut : ''} ${selectedAnswer !== null ? styles.answered : ''}`}>
      <div className={styles.questionHeader}>
        <h3 className={styles.theme}>{question.Tema}</h3>
      </div>
      <h2 className={styles.questionTitle}>{question.Enunciado}</h2>

      <div className={styles.alternatives}>
        {alternativas.map((alternativa, index) => (
          <button
            key={index}
            className={`${styles.alternative} ${getAlternativeClass(index)}`}
            onClick={() => handleAnswerClick(index)}
            disabled={selectedAnswer !== null}
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
          <button
            className={styles.nextButton}
            onClick={handleNextQuestion}
          >
            Próxima Pergunta
          </button>
        </div>
      )}
      
      {/* Efeitos de confete para respostas corretas */}
      {isCorrect && <div className={styles.confetti}></div>}
    </div>
  );
};

export default QuizQuestion;