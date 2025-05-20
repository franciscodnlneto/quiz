// app/components/AnnouncementBanner.tsx
"use client";
import { useState, useEffect } from 'react';
import styles from './AnnouncementBanner.module.css';

interface AnnouncementBannerProps {
  email: string;
}

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ email }) => {
  const [dismissed, setDismissed] = useState(false);

  // Quando o banner é fechado, adicione uma classe ao elemento body ou html
  // para permitir ajustes no espaçamento
  useEffect(() => {
    if (dismissed) {
      document.documentElement.classList.add('banner-dismissed');
    } else {
      document.documentElement.classList.remove('banner-dismissed');
    }
    
    return () => {
      document.documentElement.classList.remove('banner-dismissed');
    };
  }, [dismissed]);

  if (dismissed) {
    return null;
  }

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <span className={styles.icon}>💉🩺💊🎮</span>
        <p>
          <strong>Profissionais do HC-UFU/EBSERH:</strong> Gamifique seus eventos e treinamentos usando o Quizito.App gratuitamente! 
          <a href={`mailto:${email}`} className={styles.email}>
            <span className={styles.emailIcon}>✉️</span> {email}
          </a>
        </p>
        <button 
          className={styles.closeButton} 
          onClick={() => setDismissed(true)}
          aria-label="Fechar anúncio"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBanner;