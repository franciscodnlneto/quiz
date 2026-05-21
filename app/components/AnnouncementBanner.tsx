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
        <span className={styles.icon}>🎓🏥🩺🧪</span>
        <p>
          <strong>3º Aniversário do CEBS</strong> — Centro de Ensino Baseado em Simulação do HC-UFU/HUBRASIL. Teste seus conhecimentos sobre simulação clínica realística!
          <a href={`mailto:${email}`} className={styles.contactLink}>
            <span className={styles.contactIcon}>✉️</span> {email}
          </a>
          <a
            href="https://wa.me/553432182081"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contactLink}
          >
            <span className={styles.contactIcon}>📞</span> (34) 3218-2081
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