// page.tsx - Arquivo principal modificado
"use client";
import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { selectRandomQuestion } from './utils/randomUtils';

import ThemeSelector from './components/ThemeSelector';
import SlotMachine from './components/SlotMachine';
import CountDown from './components/CountDown';
import QuizQuestion from './components/QuizQuestion';

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

  useEffect(() => {
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

  useEffect(() => {
    if (selectedTheme && !isSorteando && questions.length > 0) {
      // Use o algoritmo de seleção aleatória melhorada também aqui
      const newQuestion = selectRandomQuestion(
        questions,
        selectedTheme,
        [] // não use histórico para a primeira seleção
      );
      
      if (newQuestion) {
        setCurrentQuestion(newQuestion);
      } else {
        setCurrentQuestion(null);
      }
    }
  }, [selectedTheme, questions, isSorteando]);

  const handleThemeSelect = (theme: string) => {
    setSelectedTheme(theme);
    setSorteioCompleto(true);
    
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

  const handleNextQuestion = () => {
    if (selectedTheme) {
      // Use a função de seleção aleatória de perguntas
      const newQuestion = selectRandomQuestion(
        questions,
        selectedTheme,
        questionHistory
      );
      
      if (newQuestion) {
        // Atualize o histórico de perguntas
        setQuestionHistory(prev => {
          const updated = [...prev, newQuestion.Enunciado];
          // Mantenha apenas as últimas N perguntas no histórico
          const historyLimit = Math.min(5, Math.floor(
            questions.filter(q => q.Tema === selectedTheme).length / 2
          ));
          return updated.slice(-historyLimit);
        });
        
        setCurrentQuestion(newQuestion);
      }
    }
  };

  const handleSorteioStart = () => {
    // Reseta o estado do sorteio
    setIsSorteando(true);
    setSorteioCompleto(false);
    setCurrentQuestion(null);
    setSelectedTheme(null);
  };

  const handleCountdownComplete = () => {
    // O countdown zerou, mas o sorteio visual pode continuar por mais tempo
    // O SlotMachine irá chamar handleThemeSelect quando terminar
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
              onSorteioStart={handleSorteioStart}
            />
          ) : (
            <CountDown
              seconds={5}
              onComplete={handleCountdownComplete}
            />
          )}
        </div>

        <div className={styles.questionSection}>
          {isSorteando ? (
            // Durante o sorteio, mostra a roleta de temas
            <SlotMachine 
              themes={themes} 
              onSelect={handleThemeSelect}
              duration={5000}
              usedThemes={usedThemes} // Passa o histórico de temas
            />
          ) : (
            // Após o sorteio, mostra a pergunta
            currentQuestion ? (
              <QuizQuestion
                question={currentQuestion}
                onNextQuestion={handleNextQuestion}
                onSelectNewTheme={handleSorteioStart} // Adicionamos a função para selecionar novo tema
              />
            ) : (
              <div className={styles.noQuestion}>
                {selectedTheme ?
                  "Não há perguntas disponíveis para este tema." :
                  "Selecione um tema para começar!"}
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}