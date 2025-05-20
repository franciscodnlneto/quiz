// app/components/Leaderboard.tsx
"use client";
import { useState, useEffect } from 'react';
import styles from './Leaderboard.module.css';

interface LeaderboardScore {
  position: number;
  name: string;
  whatsapp: string;
  score: number;
  totalTime: number;
  createdAt?: string; // Data de criação para exibição
}

interface ApiResponse {
  scores?: LeaderboardScore[];
  error?: string;
}

const Leaderboard: React.FC = () => {
  const [scores, setScores] = useState<LeaderboardScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fetchCount, setFetchCount] = useState(0); // Para forçar atualizações

  // Função para buscar as pontuações
  const fetchScores = async () => {
    try {
      setLoading(true);
      
      console.log('Buscando pontuações...');
      const response = await fetch('/api/scores');
      
      if (!response.ok) {
        throw new Error(`Falha ao buscar pontuações: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json() as ApiResponse;
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Verificar se scores é um array
      if (data.scores && Array.isArray(data.scores)) {
        setScores(data.scores);
        console.log(`Recebidas ${data.scores.length} pontuações`);
      } else {
        console.warn('Formato de resposta inesperado:', data);
        setScores([]);
      }
      
      setError('');
      
      // Incrementar o contador de atualizações
      setFetchCount(prev => prev + 1);
    } catch (error: unknown) {
      console.error('Erro ao buscar pontuações:', error);
      setError(`Não foi possível carregar o ranking: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Buscar pontuações ao montar o componente
  useEffect(() => {
    fetchScores();
    
    // Configurar um intervalo para atualizar a cada 30 segundos
    const intervalId = setInterval(() => {
      fetchScores();
    }, 30000);
    
    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(intervalId);
  }, []);

  // Renderizar o conteúdo adequado baseado no estado
  const renderContent = () => {
    if (loading && scores.length === 0) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Carregando ranking...</p>
        </div>
      );
    }
    
    if (error && scores.length === 0) {
      return (
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={fetchScores}
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    
    if (scores.length === 0) {
      return (
        <div className={styles.emptyContainer}>
          <p>Nenhuma pontuação registrada ainda.</p>
          <p>Seja o primeiro a completar o desafio!</p>
        </div>
      );
    }
    
    return (
      <div className={styles.tableContainer}>
        <table className={styles.leaderboardTable}>
          <thead>
            <tr>
              <th className={styles.positionHeader}>Pos</th>
              <th className={styles.whatsappHeader}>WhatsApp</th>
              <th className={styles.scoreHeader}>Pontos</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((item, idx) => (
              <tr key={`${item.position}-${idx}-${fetchCount}`} className={styles.scoreRow}>
                <td className={styles.position}>
                  {item.position <= 3 ? (
                    <span className={`${styles.medal} ${styles[`medal${item.position}`]}`}>
                      {item.position === 1 ? '🥇' : item.position === 2 ? '🥈' : '🥉'}
                    </span>
                  ) : (
                    `${item.position}º`
                  )}
                </td>
                <td className={styles.whatsapp}>{item.whatsapp}</td>
                <td className={styles.score}>
                  <span>{item.score}</span>
                  {item.createdAt && (
                    <span className={styles.timestamp}>{item.createdAt}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={styles.leaderboardContainer}>
      <h3 className={styles.leaderboardTitle}>
        <span className={styles.trophyIcon}>🏆</span> Ranking
      </h3>
      {renderContent()}
    </div>
  );
};

export default Leaderboard;