// QuizResult.tsx - Corrigido para consistência de formatação de tempo
"use client";
import { useState, useEffect } from 'react';
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
  const [whatsappError, setWhatsappError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Carrega os dados salvos do localStorage, se existirem
  useEffect(() => {
    const savedName = localStorage.getItem('quizito_user_name');
    const savedWhatsapp = localStorage.getItem('quizito_user_whatsapp');
    
    if (savedName) setName(savedName);
    if (savedWhatsapp) setWhatsapp(savedWhatsapp);
  }, []);
  
  // Função corrigida para formatar o tempo de forma consistente
  const formatTime = (timeInSeconds: number) => {
    // Garantir que o valor é um número válido e não NaN
    const validTime = isNaN(timeInSeconds) ? 0 : timeInSeconds;
    
    // Arredondar para uma casa decimal para consistência com o restante do aplicativo
    const roundedTime = Math.round(validTime * 10) / 10;
    
    // Formatação para minutos e segundos
    const minutes = Math.floor(roundedTime / 60);
    const seconds = Math.round(roundedTime % 60);
    
    // Retornar no formato MM:SS
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Função simplificada para aplicar máscara de telefone
  const formatPhone = (value: string) => {
    // Remove tudo que não é dígito
    const digitsOnly = value.replace(/\D/g, '');
    
    // Aplica a máscara de acordo com o comprimento da string
    if (digitsOnly.length <= 2) {
      return `(${digitsOnly}`;
    } else if (digitsOnly.length <= 3) {
      return `(${digitsOnly.substring(0, 2)})${digitsOnly.substring(2)}`;
    } else if (digitsOnly.length <= 7) {
      return `(${digitsOnly.substring(0, 2)})${digitsOnly.substring(2, 3)}.${digitsOnly.substring(3)}`;
    } else {
      return `(${digitsOnly.substring(0, 2)})${digitsOnly.substring(2, 3)}.${digitsOnly.substring(3, 7)}-${digitsOnly.substring(7, 11)}`;
    }
  };
  
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatPhone(rawValue);
    setWhatsapp(formattedValue);
    
    // Validação
    const digitsOnly = rawValue.replace(/\D/g, '');
    
    if (digitsOnly.length === 0) {
      setWhatsappError('');
    } else if (digitsOnly.length < 11) {
      setWhatsappError('O número deve ter 11 dígitos incluindo o 9');
    } else if (digitsOnly[2] !== '9') {
      setWhatsappError('O terceiro dígito deve ser 9 (número de celular)');
    } else {
      setWhatsappError('');
    }
  };
  
  const isWhatsappValid = () => {
    const digitsOnly = whatsapp.replace(/\D/g, '');
    return digitsOnly.length === 11 && digitsOnly[2] === '9';
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !isWhatsappValid()) {
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
      localStorage.setItem('quizito_user_time', totalTime.toString());
      
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
        <span className={styles.emoji}>🏆</span> Parabéns! Você completou o desafio! <span className={styles.emoji}>🎉</span>
      </h2>
      
      <div className={styles.scoreCard}>
        <h3 className={styles.scoreTitle}>Sua pontuação</h3>
        <div className={styles.scoreValue}>{score}</div>
        <div className={styles.scoreDetails}>
          <div className={styles.timeItem}>
            <span className={styles.timeLabel}>Tempo total:</span>
            <span className={styles.timeNumber}>{formatTime(totalTime)}</span>
          </div>
        </div>
      </div>
      
      {!submitted ? (
        <div className={styles.formContainer}>
          <h3 className={styles.formTitle}>
            <span className={styles.emoji}>🎁</span> Concorra a prêmios!
          </h3>
          <p className={styles.formDescription}>
            Parabéns por completar o desafio! Deixe seus dados para concorrer a prêmios especiais da equipe de Pesquisa Clínica.
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
                inputMode="numeric"
                id="whatsapp"
                className={`${styles.input} ${whatsappError ? styles.inputError : ''}`}
                value={whatsapp}
                onChange={handleWhatsappChange}
                placeholder="(XX)9.XXXX-XXXX"
                required
              />
              {whatsappError && (
                <div className={styles.errorMessage}>
                  <span className={styles.errorIcon}>⚠️</span> {whatsappError}
                </div>
              )}
              <div className={styles.inputHelper}>
                Formato: (XX)9.XXXX-XXXX - Apenas celulares
              </div>
            </div>
            
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting || !!whatsappError || !isWhatsappValid() || !name.trim()}
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