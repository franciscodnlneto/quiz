// WelcomeModal.tsx - Corrigido para garantir que seja sempre visível
"use client";
import { useState, useEffect } from 'react';
import styles from './WelcomeModal.module.css';

interface WelcomeModalProps {
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  const [modalOpen, setModalOpen] = useState(true);

const handleClose = () => {
  setModalOpen(false);
  setTimeout(() => {
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' }); // adicionada essa linha
  }, 500); 
};


  return (
    <div className={`${styles.modalOverlay} ${modalOpen ? styles.open : styles.closing}`}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>
          <span className={styles.emoji}>🔬</span> 3º Aniversário do CEBS <span className={styles.emoji}>🏆</span>
        </h2>
        
        <div className={styles.modalBody}>
          <p className={styles.greeting}>
            <span className={styles.highlight}>Olá!</span> Bem-vindo ao Quiz do 3º Aniversário do CEBS!
          </p>

          <div className={styles.instructionSection}>
            <h3><span className={styles.emoji}>🎯</span> O desafio:</h3>
            <p className={styles.challengeText}>
              Você precisa <strong>acertar 5 perguntas seguidas</strong> sobre o CEBS e simulação clínica para concluir o quiz e entrar para o ranking! 🏆
            </p>
          </div>

          <div className={styles.instructionSection}>
            <h3><span className={styles.emoji}>📋</span> Como funciona:</h3>
            <ol className={styles.instructionList}>
              <li><span className={styles.emoji}>🎲</span> Um <strong>tema</strong> é sorteado aleatoriamente a cada pergunta</li>
              <li><span className={styles.emoji}>🅰️🅱️</span> Cada pergunta tem <strong>duas alternativas</strong> — escolha a correta</li>
              <li><span className={styles.emoji}>⏱️</span> Você tem <strong>30 segundos</strong> para responder cada uma</li>
              <li><span className={styles.emoji}>🚀</span> Quanto <strong>mais rápido</strong> acertar, mais pontos ganha</li>
              <li><span className={styles.emoji}>❌</span> Errou ou tempo esgotou? <strong>Game over</strong> e o contador volta a zero — mas pode tentar quantas vezes quiser!</li>
              <li><span className={styles.emoji}>🏁</span> Conseguiu acertar <strong>5 seguidas</strong>? Parabéns! Você completa o desafio e seu nome vai para o ranking.</li>
            </ol>
          </div>

          <div className={styles.prizeSection}>
            <h3><span className={styles.emoji}>🎁</span> Prêmios:</h3>
            <p>Ao final do evento, as <strong>melhores pontuações</strong> ganharão brindes especiais da equipe do CEBS! Deixe seu WhatsApp ao terminar para sermos capazes de entrar em contato. 📞</p>
          </div>

          <div className={styles.dateSection}>
            <p className={styles.date}><span className={styles.emoji}>🎉</span> <strong>3º Aniversário do CEBS</strong></p>
          </div>
        </div>
        
        <button className={styles.startButton} onClick={handleClose}>
          Entendi! Vamos começar <span className={styles.emoji}>🚀</span>
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;