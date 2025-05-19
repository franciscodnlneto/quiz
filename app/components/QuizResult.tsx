// QuizResult.tsx
"use client";
import { useState } from 'react';
import styles from './QuizResult.module.css';

interface QuizResultProps {
  score: number;
  totalTime: number;
  correctAnswers: number;
  onReset: () => void;
}

const QuizResult: React.FC<QuizResultProps> = ({ 
  score, 
  totalTime,
  correctAnswers,
  onReset 
}) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !whatsapp.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Aqui você implementaria a lógica para enviar os dados para seu backend
    // Por enquanto vamos apenas simular um envio
    try {
      // Simulação de envio para o servidor
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Armazena localmente para demonstração
      localStorage.setItem('quizito_user_name', name);
      localStorage.setItem('quizito_user_whatsapp', whatsapp);
      localStorage.setItem('quizito_user_score', score.toString());
      
      setSubmitted(true);
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={styles.resultContainer}>
      <div className={styles.confetti}></div>
      
      <h2 className={styles.congratsTitle}>
        <span className={styles.emoji}>🎉</span> Parabéns! <span className={styles.emoji}>🎉</span>
      </h2>
      
      <div className={styles.scoreCard}>
        <h3 className={styles.scoreTitle}>Sua pontuação</h3>
        <div className={styles.scoreValue}>{score}</div>
        <div className={styles.scoreDetails}>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Respostas certas:</span>
            <span className={styles.scoreNumber}>{correctAnswers}/4</span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Tempo total:</span>
            <span className={styles.scoreNumber}>{formatTime(totalTime)}</span>
          </div>
        </div>
      </div>
      
      {!submitted ? (
        <div className={styles.formContainer}>
          <h3 className={styles.formTitle}>
            <span className={styles.emoji}>🏆</span> Concorra a prêmios!
          </h3>
          <p className={styles.formDescription}>
            Deixe seus dados para concorrer a prêmios especiais da equipe de Pesquisa Clínica.
          </p>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>Nome completo</label>
              <input
                type="text"
                id="name"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome completo"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="whatsapp" className={styles.label}>WhatsApp (com DDD)</label>
              <input
                type="tel"
                id="whatsapp"
                className={styles.input}
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(00) 00000-0000"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Registrar minha pontuação'}
            </button>
          </form>
        </div>
      ) : (
        <div className={styles.successMessage}>
          <div className={styles.successIcon}>✓</div>
          <h3 className={styles.successTitle}>Dados enviados com sucesso!</h3>
          <p className={styles.successText}>
            Obrigado pela participação! Se sua pontuação estiver entre as melhores, 
            entraremos em contato pelo WhatsApp para a entrega do seu prêmio.
          </p>
        </div>
      )}
      
      <button className={styles.resetButton} onClick={onReset}>
        Jogar novamente <span className={styles.emoji}>🔄</span>
      </button>
    </div>
  );
};

export default QuizResult;