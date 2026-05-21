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
            <span className={styles.highlight}>Olá!</span> Bem-vindo ao Quiz da Pesquisa Clínica!
          </p>
          
          <div className={styles.instructionSection}>
            <h3><span className={styles.emoji}>🎯</span> Como Funciona:</h3>
            <ol className={styles.instructionList}>
              <li><span className={styles.emoji}>🎲</span> Um tema será sorteado aleatoriamente</li>
              <li><span className={styles.emoji}>⏱️</span> Você terá <strong>30 segundos</strong> para responder cada pergunta</li>
              <li><span className={styles.emoji}>🚀</span> Quanto <strong>mais rápido</strong> você responder corretamente, melhor será sua pontuação</li>
              <li><span className={styles.emoji}>❌</span> Se errar uma pergunta, você será eliminado (mas poderá tentar novamente!)</li>
              <li><span className={styles.emoji}>🏁</span> Complete <strong>4 perguntas</strong> para finalizar o desafio</li>
            </ol>
          </div>
          
          <div className={styles.prizeSection}>
            <h3><span className={styles.emoji}>🎁</span> Prêmios:</h3>
            <p>Os participantes com as melhores pontuações ganharão brindes especiais da equipe de Pesquisa Clínica!</p>
          </div>
          
          <div className={styles.dateSection}>
            <p className={styles.date}><span className={styles.emoji}>📅</span> <strong>20 de Maio - Dia da Pesquisa Clínica</strong></p>
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