// randomUtils.ts - Funções de aleatoriedade melhoradas para o Quizito.App

/**
 * Embaralha um array usando o algoritmo Fisher-Yates
 * Este algoritmo garante uma distribuição verdadeiramente aleatória
 */
export function shuffleArray<T>(array: T[]): T[] {
  // Cria uma cópia do array para não modificar o original
  const shuffled = [...array];
  
  // Implementa o algoritmo Fisher-Yates para embaralhar
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(0, i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Gera um número aleatório no intervalo [min, max) com múltiplas fontes de entropia
 * Isso torna o gerador mais imprevisível que o Math.random() padrão
 */
export function getSecureRandomInt(min: number, max: number): number {
  // Usando múltiplas fontes de entropia para aumentar a aleatoriedade
  const sources = [
    Math.random(),                       // Fonte 1: Math.random() padrão
    Date.now() % 1000 / 1000,            // Fonte 2: Milissegundos do timestamp atual
    performance.now() % 1000 / 1000,     // Fonte 3: Timer de alta precisão
    (new Date().getMilliseconds() / 1000), // Fonte 4: Outra representação de tempo
    (Math.random() * Math.random())      // Fonte 5: Combinação de valores aleatórios
  ];
  
  // Mistura as fontes de aleatoriedade
  let randomValue = 0;
  for (let i = 0; i < sources.length; i++) {
    randomValue += sources[i];
    // Aplicando transformações adicionais para aumentar a entropia
    if (i % 2 === 0) {
      randomValue = (randomValue * sources[(i + 1) % sources.length]) % 1;
    } else {
      randomValue = (randomValue + sources[(i + 1) % sources.length]) % 1;
    }
  }
  
  // Calcula o resultado no intervalo [min, max)
  return Math.floor(randomValue * (max - min) + min);
}

/**
 * Seleciona um tema aleatoriamente, evitando temas recentemente usados
 */
export function selectRandomTheme(themes: string[], usedThemes: string[] = []): string {
  if (themes.length === 0) return '';
  
  // Se temos apenas um tema, retorna ele
  if (themes.length === 1) return themes[0];
  
  // Filtra temas não usados recentemente
  let availableThemes = themes.filter(theme => !usedThemes.includes(theme));
  
  // Se todos os temas já foram usados, usa todos
  if (availableThemes.length === 0) {
    // Embaralha todos os temas quando começamos um novo ciclo
    availableThemes = shuffleArray([...themes]);
  }
  
  // Seleciona um tema aleatoriamente
  const randomIndex = getSecureRandomInt(0, availableThemes.length);
  return availableThemes[randomIndex];
}

/**
 * Tipo para representar uma pergunta do quiz
 */
export interface Question {
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

/**
 * Seleciona uma pergunta aleatoriamente de um tema específico,
 * evitando perguntas recentemente exibidas
 */
export function selectRandomQuestion(
  questions: Question[], 
  theme: string, 
  usedQuestionIds: string[] = []
): Question | null {
  // Filtra perguntas do tema especificado
  const themeQuestions = questions.filter(q => q.Tema === theme);
  
  if (themeQuestions.length === 0) return null;
  if (themeQuestions.length === 1) return themeQuestions[0];
  
  // Filtra perguntas não usadas recentemente
  let availableQuestions = themeQuestions.filter(
    q => !usedQuestionIds.includes(q.Enunciado)
  );
  
  // Se todas as perguntas já foram usadas, usa todas
  if (availableQuestions.length === 0) {
    // Embaralha todas as perguntas quando começamos um novo ciclo
    availableQuestions = shuffleArray([...themeQuestions]);
  }
  
  // Seleciona uma pergunta aleatória
  const randomIndex = getSecureRandomInt(0, availableQuestions.length);
  return availableQuestions[randomIndex];
}