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
  | 'right_answer'   // Resposta correta (exibindo animação/feedback)
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
  const [showConfetti, setShowConfetti] = useState(false);
  const [showModal, setShowModal] = useState(true); // Garantir que o modal sempre apareça
  
  // Constantes do jogo
  const TOTAL_QUESTIONS = 4;
  const MAX_TIME_POINTS = 100; // Pontos máximos por resposta rápida
  const BASE_POINTS = 250;     // Pontos base por pergunta correta
  
  useEffect(() => {
    // Sempre mostrar o modal na primeira carga
    setShowModal(true);
    setGameState('welcome');
    
   // Sempre começar com o modal e zerar tudo
setShowModal(true);
setGameState('welcome');
setCurrentQuestionIndex(0);
setGameScore({
  correctAnswers: 0,
  totalTime: 0,
  points: 0
});
setCompletedQuestions([]);

// Apagar qualquer estado antigo persistido
localStorage.removeItem('quizito_gameState');
localStorage.removeItem('quizito_currentQuestionIndex');
localStorage.removeItem('quizito_questionHistory');
localStorage.removeItem('quizito_themeHistory');

    
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
    if (selectedTheme && !isSorteando && questions.length > 0 && 
        (gameState === 'playing' || gameState === 'sorting')) {
      // Se ainda não carregamos uma pergunta após selecionar o tema, carregue uma
      if (!currentQuestion) {
        // Buscar perguntas do tema atual que ainda não foram usadas
        const availableQuestions = questions.filter(q => 
          q.Tema === selectedTheme && 
          !completedQuestions.some(cq => cq.Enunciado === q.Enunciado)
        );
        
        if (availableQuestions.length > 0) {
          // Selecionar uma pergunta aleatória
          const randomIndex = Math.floor(Math.random() * availableQuestions.length);
          
          // Pequeno atraso para garantir que a SlotMachine seja visível por tempo suficiente
          setTimeout(() => {
            setCurrentQuestion(availableQuestions[randomIndex]);
          }, 1000);
        } else {
          // Se não houver perguntas disponíveis, escolher um novo tema
          console.log("Sem perguntas disponíveis para o tema, buscando novo tema...");
          startSorteio();
        }
      }
    }
  }, [selectedTheme, isSorteando, questions, gameState, completedQuestions, currentQuestion]);

  // Iniciar o jogo após fechar o modal de boas-vindas
const handleWelcomeClose = () => {
  setShowModal(false);
  setGameState('sorting');
  startSorteio();

  // Resetar a pontuação quando o jogo começa de novo
  setGameScore({
    correctAnswers: 0,
    totalTime: 0,
    points: 0
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
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
    
    // Não mudar imediatamente para o estado de playing
    // Mantemos no estado 'sorting' por mais tempo para que a SlotMachine fique visível
    
    // Adicione o tema ao histórico
    setUsedThemes(prev => {
      const updated = [...prev, theme];
      // Mantenha apenas os últimos N temas no histórico (N = metade do total, no máximo 5)
      const historyLimit = Math.min(5, Math.floor(themes.length / 2));
      return updated.slice(-historyLimit);
    });
    
    // Limpe o histórico de perguntas ao mudar de tema
    setQuestionHistory([]);
    
    // Atraso maior antes de mudar para o estado playing
    // Este atraso permite que a SlotMachine fique visível por mais tempo
    setTimeout(() => {
      setGameState('playing');
      setIsSorteando(false);
    }, 3000); // Aumentado para 3 segundos
  };

  // Função para processar a resposta de uma pergunta

const handleAnswerQuestion = (correct: boolean, pointsEarned: number) => {
  if (currentQuestion) {
    if (correct) {
      // Atualizar a pontuação com os pontos já calculados (congelados) vindos do QuizQuestion
      setGameScore(prev => ({
        correctAnswers: prev.correctAnswers + 1,
        totalTime: prev.totalTime, // Se quiser somar tempo, pode incluir depois
        points: prev.points + pointsEarned
      }));

      // Adicionar à lista de perguntas completadas
      setCompletedQuestions(prev => [...prev, currentQuestion]);

      // Mostrar o confetti
      setShowConfetti(true);

      // Mudar para o estado de resposta correta
      setGameState('right_answer');

      // Verificar se completou todas as perguntas após um breve delay
      setTimeout(() => {
        const nextQuestionIndex = currentQuestionIndex + 1;

        if (nextQuestionIndex >= TOTAL_QUESTIONS) {
          setGameState('completed');
        } else {
          setCurrentQuestionIndex(nextQuestionIndex);
          localStorage.setItem('quizito_currentQuestionIndex', nextQuestionIndex.toString());
          setShowConfetti(false);
          startSorteio();
        }
      }, 1500);
    } else {
      setTimeout(() => {
        setGameOverReason('wrong_answer');
        setGameState('game_over');

        setCurrentQuestionIndex(0);
        localStorage.setItem('quizito_currentQuestionIndex', '0');

        setGameScore({
          correctAnswers: 0,
          totalTime: 0,
          points: 0
        });
        setCompletedQuestions([]);
      }, 3000);
    }
  }
};


  // Função para quando o tempo se esgota
 // Função para quando o tempo se esgota
const handleTimeUp = () => {
  // Atraso para mostrar que o tempo acabou antes de ir para a tela de game over
  setTimeout(() => {
    setGameOverReason('timeout');
    setGameState('game_over');
    
    // Zerar o contador de perguntas quando o tempo acaba
    setCurrentQuestionIndex(0);
    localStorage.setItem('quizito_currentQuestionIndex', '0');
    
    // Garantir que todos os dados sejam limpos corretamente
    setGameScore({
      correctAnswers: 0,
      totalTime: 0,
      points: 0
    });
    setCompletedQuestions([]);
  }, 3000);
};

// Função para reiniciar o jogo - corrigida para garantir estado inicial completo

// Função para reiniciar o jogo - corrigida para garantir estado inicial completo
const handleResetGame = () => {
  // Limpar TODOS os itens do localStorage para evitar restaurar estado antigo
  localStorage.removeItem('quizito_gameState');
  localStorage.removeItem('quizito_currentQuestionIndex');
  localStorage.removeItem('quizito_questionHistory');
  localStorage.removeItem('quizito_themeHistory');
  
  // Criar uma nova sessão para garantir que o formulário final venha limpo
  const newSessionId = Date.now().toString();
  sessionStorage.setItem('quizito_current_session', newSessionId);
  
  // Reiniciar todos os estados
  setGameScore({
    correctAnswers: 0,
    totalTime: 0,
    points: 0
  });
  setCurrentQuestionIndex(0);
  setCompletedQuestions([]);
  setSelectedTheme(null);
  setCurrentQuestion(null);
  setQuestionHistory([]);
  setUsedThemes([]);
  setShowModal(true);
  setGameState('welcome');
  
  // Recarregar a página para garantir um estado totalmente limpo e o modal aparecer
  window.location.reload();
};

// Função para mostrar o conteúdo baseado no estado do jogo
  const renderGameContent = () => {
    switch (gameState) {
      case 'welcome':
        return (
          <>
            {showModal && <WelcomeModal onClose={handleWelcomeClose} />}
          </>
        );
        
      case 'sorting':
      case 'playing': // Mostrar a SlotMachine também durante o início do estado 'playing'
        // Se estamos no estado 'playing' mas ainda não temos uma pergunta, mostrar o sorteio
        const showSlotMachine = gameState === 'sorting' || !currentQuestion;
        
        return (
          <div className={styles.questionSection}>
            {showSlotMachine && (
              <SlotMachine 
                themes={themes} 
                onSelect={handleThemeSelect}
                duration={5000}
                usedThemes={usedThemes}
              />
            )}
            
            {/* Mostrar a pergunta apenas se tiver sido carregada */}
            {gameState === 'playing' && currentQuestion && (
       <QuizQuestion
  question={currentQuestion}
  onNextQuestion={() => {}}
  onSelectNewTheme={startSorteio}
  onAnswerQuestion={handleAnswerQuestion}
  onTimeUp={handleTimeUp}
  currentQuestionNumber={Math.min(currentQuestionIndex + 1, TOTAL_QUESTIONS)}
  totalQuestions={TOTAL_QUESTIONS}
  showConfetti={showConfetti}
  currentScore={gameScore.points} // Adicione esta linha
/>
            )}
          </div>
        );
        
      case 'right_answer':
        return (
          <div className={styles.questionSection}>
            {currentQuestion && (
       <QuizQuestion
  question={currentQuestion}
  onNextQuestion={() => {}}
  onSelectNewTheme={startSorteio}
  onAnswerQuestion={handleAnswerQuestion}
  onTimeUp={handleTimeUp}
  currentQuestionNumber={Math.min(currentQuestionIndex + 1, TOTAL_QUESTIONS)}
  totalQuestions={TOTAL_QUESTIONS}
  showConfetti={showConfetti}
  currentScore={gameScore.points} // Adicione esta linha
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
        {/* Seção de temas só fica visível quando não estamos em game_over, completed, result ou welcome */}
        {(gameState !== 'game_over' && gameState !== 'completed' && gameState !== 'result' && gameState !== 'welcome') && (
          <div className={styles.themeSection}>
            <div className={styles.themeSectionLogo}>
              <img src="/dados_mocados/logo_cpc.svg" alt="Logo CPC" />
            </div>
            <h2 className={styles.sectionTitle}>Temas</h2>
            
            {/* Mostra o contador regressivo durante o sorteio e até que a pergunta apareça */}
            {/* isSorteando será true desde o início do sorteio até o tema ser selecionado, 
                mas queremos manter o contador mesmo depois disso, enquanto a pergunta carrega */}
            {(isSorteando || (gameState === 'playing' && !currentQuestion)) ? (
              <CountDown
                seconds={5}
                onComplete={() => {}}
                phase={sorteioCompleto ? 'finalizando' : 'sorteando'}
              />
            ) : (
              <ThemeSelector
                themes={themes}
                onSelectTheme={handleThemeSelect}
                selectedTheme={selectedTheme}
                onSorteioStart={startSorteio}
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