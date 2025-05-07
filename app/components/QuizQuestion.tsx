// QuizQuestion.tsx - Componente de perguntas com transições suaves
"use client";
import { useState, useEffect } from 'react';
import styles from './QuizQuestion.module.css';
import { generateColorFromText } from './SlotMachine'; // Importa a função de cor do SlotMachine

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
  const [themeColor, setThemeColor] = useState("");

  // Efeito para animar a entrada ao montar o componente
  useEffect(() => {
    setFadeIn(true);
    setThemeColor(generateColorFromText(question.Tema));
    
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
            style={{
              background: `linear-gradient(135deg, ${themeColor}, ${adjustColor(themeColor, -20)})`,
              boxShadow: `0 4px 15px ${themeColor}80`
            }}
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

// Função para ajustar a luminosidade de uma cor HSL
function adjustColor(color: string, amount: number): string {
  // Extrai os valores H, S, L da string de cor HSL
  const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!hslMatch) return color;
  
  const h = parseInt(hslMatch[1]);
  const s = parseInt(hslMatch[2]);
  let l = parseInt(hslMatch[3]);
  
  // Ajusta a luminosidade
  l = Math.max(0, Math.min(100, l + amount));
  
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export default QuizQuestion;