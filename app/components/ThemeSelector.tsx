"use client";
import { useState } from 'react';
import styles from './ThemeSelector.module.css';
import { generateColorFromText } from './SlotMachine'; // Importa a função de cor do SlotMachine
import Leaderboard from './Leaderboard'; // Importar o componente Leaderboard

interface ThemeSelectorProps {
  themes: string[];
  onSelectTheme: (theme: string) => void;
  selectedTheme: string | null;
  onSorteioStart: () => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  themes, 
  onSelectTheme, 
  selectedTheme, 
  onSorteioStart 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Inicia o sorteio
  const startSorteio = () => {
    setIsAnimating(true);
    
    // Pequena animação no botão
    setTimeout(() => {
      setIsAnimating(false);
      onSorteioStart();
    }, 300);
  };
  
  // Obtém a cor do tema selecionado
  const getThemeColor = () => {
    if (!selectedTheme) return '';
    return generateColorFromText(selectedTheme);
  };
  
  return (
    <div className={styles.themeSelectorContainer}>
      {!selectedTheme ? (
        // Estado inicial: mostra o botão para iniciar o sorteio
        <div className={styles.initialState}>
          <button 
            className={`${styles.spinButton} ${isAnimating ? styles.animating : ''}`}
            onClick={startSorteio}
          >
            <span className={styles.buttonIcon}>🎲</span>
            <span className={styles.buttonText}>Sortear Tema</span>
          </button>
          <p className={styles.helpText}>Clique para escolher um tema aleatório</p>
        </div>
      ) : (
        // Estado após seleção: mostra o tema selecionado
        <div className={styles.selectedState}>
          <h3 className={styles.themeHeader}>Tema do Quiz</h3>
          <div 
            className={styles.themeCard}
            style={{ backgroundColor: getThemeColor() }}
          >
            <span className={styles.themeName}>{selectedTheme}</span>
            <div className={styles.themeGlow}></div>
          </div>
{/* 
  <button 
    className={styles.newThemeButton}
    onClick={startSorteio}
  >
    Trocar Tema
  </button>
*/}
        </div>
      )}
      
      {/* Componente Leaderboard adicionado abaixo do seletor de temas */}
      <Leaderboard />
    </div>
  );
};

export default ThemeSelector;