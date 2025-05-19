// GameOverMessage.tsx
"use client";
import styles from './GameOverMessage.module.css';

interface GameOverMessageProps {
  reason: 'timeout' | 'wrong_answer';
  onTryAgain: () => void;
}

const GameOverMessage: React.FC<GameOverMessageProps> = ({ reason, onTryAgain }) => {
  return (
    <div className={styles.gameOverContainer}>
      <div className={`${styles.icon} ${reason === 'timeout' ? styles.timeoutIcon : styles.wrongIcon}`}>
        {reason === 'timeout' ? '⏱️' : '❌'}
      </div>
      
      <h2 className={styles.title}>
        {reason === 'timeout' 
          ? 'Tempo Esgotado!' 
          : 'Resposta Incorreta!'}
      </h2>
      
      <p className={styles.message}>
        {reason === 'timeout'
          ? 'Você não respondeu dentro do tempo limite de 30 segundos.'
          : 'A resposta selecionada não está correta.'}
      </p>
      
      <div className={styles.infoBox}>
        <p className={styles.infoText}>
          Não desanime! Você pode tentar novamente para conseguir uma pontuação melhor.
        </p>
      </div>
      
      <button className={styles.tryAgainButton} onClick={onTryAgain}>
        Tentar Novamente <span className={styles.emoji}>🔄</span>
      </button>
    </div>
  );
};

export default GameOverMessage;