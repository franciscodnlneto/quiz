"use client";
import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import ThemeSelector from './components/ThemeSelector';
import QuizQuestion from './components/QuizQuestion';
import SlotMachine from './components/SlotMachine';
import CountDown from './components/CountDown';

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

  useEffect(() => {
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

  useEffect(() => {
    if (selectedTheme && !isSorteando && questions.length > 0) {
      // Filtrar perguntas do tema selecionado
      const themeQuestions = questions.filter(q => q.Tema === selectedTheme);
      
      if (themeQuestions.length > 0) {
        // Selecionar uma pergunta aleatória
        const randomIndex = Math.floor(Math.random() * themeQuestions.length);
        setCurrentQuestion(themeQuestions[randomIndex]);
      } else {
        setCurrentQuestion(null);
      }
    }
  }, [selectedTheme, questions, isSorteando]);

  const handleThemeSelect = (theme: string) => {
    setSelectedTheme(theme);
    setSorteioCompleto(true);
    
    // Pequeno atraso antes de finalizar o sorteio completamente
    setTimeout(() => {
      setIsSorteando(false);
    }, 2000);
  };

  const handleNextQuestion = () => {
    if (selectedTheme) {
      const themeQuestions = questions.filter(q => q.Tema === selectedTheme);
      
      if (themeQuestions.length > 0) {
        // Sempre selecionar uma pergunta diferente se possível
        let randomIndex;
        let newQuestion;
        
        if (themeQuestions.length === 1) {
          // Se houver apenas uma pergunta, use-a
          newQuestion = themeQuestions[0];
        } else {
          // Continue tentando até encontrar uma pergunta diferente da atual
          do {
            randomIndex = Math.floor(Math.random() * themeQuestions.length);
            newQuestion = themeQuestions[randomIndex];
          } while (
            currentQuestion && 
            newQuestion.Enunciado === currentQuestion.Enunciado && 
            themeQuestions.length > 1
          );
        }
        
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
            />
          ) : (
            // Após o sorteio, mostra a pergunta
            currentQuestion ? (
              <QuizQuestion
                question={currentQuestion}
                onNextQuestion={handleNextQuestion}
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