"use client";
import { useState } from 'react';
import styles from './ThemeSelector.module.css';

interface ThemeSelectorProps {
  themes: string[];
  onSelectTheme: (theme: string) => void;
  selectedTheme: string | null;
  onSorteioStart: () => void;
}

const generateColorFromText = (text: string): string => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 80%, 65%)`;
};

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
            style={{ backgroundColor: generateColorFromText(selectedTheme) }}
          >
            <span className={styles.themeName}>{selectedTheme}</span>
          </div>
          <button 
            className={styles.newThemeButton}
            onClick={startSorteio}
          >
            Trocar Tema
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;