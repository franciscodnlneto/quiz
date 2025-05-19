// page.tsx - Corrigindo a duplicação do contador
"use client";
import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { selectRandomQuestion, selectRandomTheme } from './utils/randomUtils';

import ThemeSelector from './components/ThemeSelector';
import SlotMachine from './components/SlotMachine';
import CountDown from './components/CountDown';
import QuizQuestion from './components/QuizQuestion';
import WelcomeModal from './components/WelcomeModal';
import GameOverMessage from './components/GameOverMessage';
import QuizResult from './components/QuizResult';

import styles from './page.module.css';

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

// Interface para pontuação do jogador
interface GameScore {
  correctAnswers: number;
  totalTime: number;
  points: number;
}

// Estados do jogo
type GameState = 
  | 'welcome'        // Modal inicial de boas-vindas
  | 'sorting'        // Sorteando tema
  | 'playing'        // Jogando (respondendo perguntas)
  | 'game_over'      // Jogo finalizado por erro/timeout
  | 'completed'      // Completou todas as perguntas
  | 'result';        // Exibindo resultado

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSorteando, setIsSorteando] = useState(false);
  const [sorteioCompleto, setSorteioCompleto] = useState(false);
  
  // Novos estados para rastrear histórico
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);
  const [usedThemes, setUsedThemes] = useState<string[]>([]);
  
  // Novos estados para o jogo
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameOverReason, setGameOverReason] = useState<'timeout' | 'wrong_answer'>('timeout');
  const [gameScore, setGameScore] = useState<GameScore>({
    correctAnswers: 0,
    totalTime: 0,
    points: 0
  });
  const [completedQuestions, setCompletedQuestions] = useState<Question[]>([]);
  
  // Constantes do jogo
  const TOTAL_QUESTIONS = 4;
  const MAX_TIME_POINTS = 100; // Pontos máximos por resposta rápida
  const BASE_POINTS = 250;     // Pontos base por pergunta correta
  
  useEffect(() => {
    // Verificar se já existe uma pontuação salva
    const savedGameState = localStorage.getItem('quizito_gameState');
    
    if (savedGameState) {
      try {
        const parsedState = JSON.parse(savedGameState);
        if (parsedState.gameState && parsedState.gameScore) {
          // Só restaurar se o jogo não estava completo
          if (parsedState.gameState !== 'completed' && parsedState.gameState !== 'result') {
            setGameState(parsedState.gameState);
            setGameScore(parsedState.gameScore);
            setCurrentQuestionIndex(parsedState.currentQuestionIndex || 0);
            setCompletedQuestions(parsedState.completedQuestions || []);
          }
        }
      } catch (e) {
        console.error('Erro ao carregar estado do jogo:', e);
      }
    }
    
    // Carrega o histórico salvo quando o componente é montado
    const savedQuestionHistory = localStorage.getItem('quizito_questionHistory');
    const savedThemeHistory = localStorage.getItem('quizito_themeHistory');
    
    if (savedQuestionHistory) {
      try {
        setQuestionHistory(JSON.parse(savedQuestionHistory));
      } catch (e) {
        console.error('Erro ao carregar histórico de perguntas:', e);
      }
    }
    
    if (savedThemeHistory) {
      try {
        setUsedThemes(JSON.parse(savedThemeHistory));
      } catch (e) {
        console.error('Erro ao carregar histórico de temas:', e);
      }
    }
    
    fetch('/dados_mocados/perguntas_e_respostas.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          delimiter: ';',
          skipEmptyLines: true,
          complete: (results) => {
            const parsedQuestions = results.data as Question[];
            setQuestions(parsedQuestions);
            
            // Extrair todos os temas únicos do CSV
            const uniqueThemes = Array.from(new Set(parsedQuestions.map(q => q.Tema)))
              .filter(theme => theme && theme.trim() !== ''); // Filtrar temas vazios
              
            console.log('Temas carregados:', uniqueThemes);
            setThemes(uniqueThemes);
            setLoading(false);
          },
          error: (error: any) => {
            console.error('Erro ao analisar o CSV:', error);
            setLoading(false);
          }
        });
      })
      .catch(error => {
        console.error('Erro ao carregar o arquivo CSV:', error);
        setLoading(false);
      });
  }, []);

  // Salvar o estado do jogo quando ele muda
  useEffect(() => {
    if (gameState !== 'welcome') {
      localStorage.setItem('quizito_gameState', JSON.stringify({
        gameState,
        gameScore,
        currentQuestionIndex,
        completedQuestions
      }));
    }
  }, [gameState, gameScore, currentQuestionIndex, completedQuestions]);

  // Salva o histórico de perguntas quando ele muda
  useEffect(() => {
    if (questionHistory.length > 0) {
      localStorage.setItem('quizito_questionHistory', JSON.stringify(questionHistory));
    }
  }, [questionHistory]);

  // Salva o histórico de temas quando ele muda
  useEffect(() => {
    if (usedThemes.length > 0) {
      localStorage.setItem('quizito_themeHistory', JSON.stringify(usedThemes));
    }
  }, [usedThemes]);

  // Selecionar uma nova pergunta quando o tema é escolhido
  useEffect(() => {
    if (selectedTheme && !isSorteando && questions.length > 0 && gameState === 'playing') {
      // Buscar perguntas do tema atual que ainda não foram usadas
      const availableQuestions = questions.filter(q => 
        q.Tema === selectedTheme && 
        !completedQuestions.some(cq => cq.Enunciado === q.Enunciado)
      );
      
      if (availableQuestions.length > 0) {
        // Selecionar uma pergunta aleatória
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        setCurrentQuestion(availableQuestions[randomIndex]);
      } else {
        // Se não houver perguntas disponíveis, escolher um novo tema
        startSorteio();
      }
    }
  }, [selectedTheme, isSorteando, questions, gameState, completedQuestions]);

  // Iniciar o jogo após fechar o modal de boas-vindas
  const handleWelcomeClose = () => {
    setGameState('sorting');
    startSorteio();
  };

  // Função para iniciar um novo sorteio de tema
  const startSorteio = () => {
    setIsSorteando(true);
    setSorteioCompleto(false);
    setCurrentQuestion(null);
    setSelectedTheme(null);
    setGameState('sorting');
  };

  // Quando um tema é selecionado no sorteio
  const handleThemeSelect = (theme: string) => {
    setSelectedTheme(theme);
    setSorteioCompleto(true);
    setGameState('playing');
    
    // Adicione o tema ao histórico
    setUsedThemes(prev => {
      const updated = [...prev, theme];
      // Mantenha apenas os últimos N temas no histórico (N = metade do total, no máximo 5)
      const historyLimit = Math.min(5, Math.floor(themes.length / 2));
      return updated.slice(-historyLimit);
    });
    
    // Limpe o histórico de perguntas ao mudar de tema
    setQuestionHistory([]);
    
    // Pequeno atraso antes de finalizar o sorteio completamente
    setTimeout(() => {
      setIsSorteando(false);
    }, 2000);
  };

  // Função para processar a resposta de uma pergunta
  const handleAnswerQuestion = (correct: boolean, timeSpent: number) => {
    if (currentQuestion) {
      if (correct) {
        // Calcular pontos com base no tempo
        const timePoints = Math.max(0, MAX_TIME_POINTS - (timeSpent * (MAX_TIME_POINTS / 30)));
        const questionPoints = BASE_POINTS + Math.round(timePoints);
        
        // Atualizar a pontuação
        setGameScore(prev => ({
          correctAnswers: prev.correctAnswers + 1,
          totalTime: prev.totalTime + timeSpent,
          points: prev.points + questionPoints
        }));
        
        // Adicionar à lista de perguntas completadas
        setCompletedQuestions(prev => [...prev, currentQuestion]);
        
        // Verificar se completou todas as perguntas
        if (currentQuestionIndex + 1 >= TOTAL_QUESTIONS) {
          setGameState('completed');
        }
      } else {
        // Se errou, finaliza o jogo
        setGameOverReason('wrong_answer');
        setGameState('game_over');
      }
    }
  };

  // Função para quando o tempo se esgota
  const handleTimeUp = () => {
    setGameOverReason('timeout');
    setGameState('game_over');
  };

  // Função para avançar para a próxima pergunta
  const handleNextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
    
    // Se completou todas as perguntas, mostrar resultado
    if (currentQuestionIndex + 1 >= TOTAL_QUESTIONS) {
      setGameState('result');
    } else {
      // Caso contrário, selecionar nova pergunta
      if (currentQuestion) {
        // Atualize o histórico de perguntas
        setQuestionHistory(prev => {
          const updated = [...prev, currentQuestion.Enunciado];
          // Mantenha apenas as últimas N perguntas no histórico
          const historyLimit = Math.min(5, Math.floor(
            questions.filter(q => q.Tema === selectedTheme).length / 2
          ));
          return updated.slice(-historyLimit);
        });
      }
      
      // Selecione uma nova pergunta
      if (selectedTheme) {
        const availableQuestions = questions.filter(q => 
          q.Tema === selectedTheme && 
          !completedQuestions.some(cq => cq.Enunciado === q.Enunciado) &&
          currentQuestion?.Enunciado !== q.Enunciado
        );
        
        if (availableQuestions.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableQuestions.length);
          setCurrentQuestion(availableQuestions[randomIndex]);
        } else {
          // Se não houver mais perguntas neste tema, sortear um novo
          startSorteio();
        }
      }
    }
  };

  // Função para reiniciar o jogo
  const handleResetGame = () => {
    setGameScore({
      correctAnswers: 0,
      totalTime: 0,
      points: 0
    });
    setCurrentQuestionIndex(0);
    setCompletedQuestions([]);
    setSelectedTheme(null);
    setCurrentQuestion(null);
    startSorteio();
  };

  // Função para mostrar o conteúdo baseado no estado do jogo
  const renderGameContent = () => {
    switch (gameState) {
      case 'welcome':
        return <WelcomeModal onClose={handleWelcomeClose} />;
        
      case 'sorting':
        return (
          <div className={styles.questionSection}>
            {/* Removido o contador duplicado aqui */}
            <SlotMachine 
              themes={themes} 
              onSelect={handleThemeSelect}
              duration={5000}
              usedThemes={usedThemes}
            />
          </div>
        );
        
      case 'playing':
        return (
          <div className={styles.questionSection}>
            {currentQuestion && (
              <QuizQuestion
                question={currentQuestion}
                onNextQuestion={handleNextQuestion}
                onSelectNewTheme={startSorteio}
                onAnswerQuestion={handleAnswerQuestion}
                onTimeUp={handleTimeUp}
                currentQuestionNumber={currentQuestionIndex + 1}
                totalQuestions={TOTAL_QUESTIONS}
              />
            )}
          </div>
        );
        
      case 'game_over':
        return (
          <div className={styles.questionSection}>
            <GameOverMessage 
              reason={gameOverReason}
              onTryAgain={handleResetGame}
            />
          </div>
        );
        
      case 'completed':
      case 'result':
        return (
          <div className={styles.questionSection}>
            <QuizResult 
              score={gameScore.points}
              totalTime={gameScore.totalTime}
              correctAnswers={gameScore.correctAnswers}
              onReset={handleResetGame}
            />
          </div>
        );
        
      default:
        return (
          <div className={styles.noQuestion}>
            Selecione um tema para começar!
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Carregando perguntas...</p>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Seção de temas só fica visível quando não estamos em game_over, completed ou result */}
        {(gameState !== 'game_over' && gameState !== 'completed' && gameState !== 'result' && gameState !== 'welcome') && (
          <div className={styles.themeSection}>
            <div className={styles.themeSectionLogo}>
              <img src="/dados_mocados/logo_cpc.svg" alt="Logo CPC" />
            </div>
            <h2 className={styles.sectionTitle}>Temas</h2>
            
            {/* Mostra o seletor de temas ou o contador regressivo */}
            {!isSorteando ? (
              <ThemeSelector
                themes={themes}
                onSelectTheme={handleThemeSelect}
                selectedTheme={selectedTheme}
                onSorteioStart={startSorteio}
              />
            ) : (
              <CountDown
                seconds={5}
                onComplete={() => {}}
              />
            )}
          </div>
        )}

        {/* Conteúdo principal do jogo que muda com base no estado */}
        {renderGameContent()}
      </div>
    </main>
  );
}