// app/api/scores/route.ts
import { NextResponse } from 'next/server';
import { clientPromise, dbName, isUsingRealDb } from '../../lib/db';

// Função para formatar a data no padrão brasileiro
// Função para formatar a data no padrão brasileiro (mais compacta)
function formatDateTime(date: Date): string {
  // Ajustar para GMT-3 (Brasil)
  const brasilTime = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  
  const hour = brasilTime.getUTCHours().toString().padStart(2, '0');
  const minute = brasilTime.getUTCMinutes().toString().padStart(2, '0');
  const day = brasilTime.getUTCDate().toString().padStart(2, '0');
  const month = (brasilTime.getUTCMonth() + 1).toString(); // mês começa do zero
  
  // Formato mais compacto
  return `${hour}:${minute}(${day}/${month})`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, whatsapp, score, totalTime } = body;

    // Validação básica
    if (!name || !whatsapp || score === undefined || totalTime === undefined) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Formatação dos dados para salvar
    const scoreData = {
      name,
      whatsapp,
      score: Number(score),
      totalTime: Number(totalTime),
      createdAt: new Date()
    };

    // Mostrar mensagem para debugging
    console.log(`Salvando pontuação: ${name}, ${whatsapp}, ${score}`);
    console.log(`Usando banco de dados ${isUsingRealDb() ? 'real' : 'simulado'}`);
    
    try {
      // Conectar ao MongoDB e salvar os dados
      const client = await clientPromise;
      const db = client.db(dbName);
      const result = await db.collection('scores').insertOne(scoreData);

      return NextResponse.json({ 
        success: true, 
        id: result.insertedId,
        usingRealDb: isUsingRealDb()
      });
    } catch (dbError) {
      console.error('Erro ao interagir com o banco de dados:', dbError);
      return NextResponse.json(
        { error: `Erro no banco de dados: ${dbError instanceof Error ? dbError.message : String(dbError)}` },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Erro ao salvar pontuação:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Erro ao salvar pontuação: ' + errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('Processando requisição GET para /api/scores');
    
    try {
      const client = await clientPromise;
      if (!client) {
        throw new Error('Falha ao conectar com o cliente do banco de dados');
      }
      
      const db = client.db(dbName);
      if (!db) {
        throw new Error('Falha ao acessar o banco de dados');
      }
      
      console.log('Buscando coleção scores...');
      const collection = db.collection('scores');
      
      // Buscar as pontuações em ordem decrescente
      console.log('Executando consulta ao banco de dados...');
      const scores = await collection.find({})
        .sort({ score: -1 })
        .limit(100)  // Limitamos a 100 registros para evitar sobrecarga
        .toArray();
      
      console.log(`Encontradas ${scores.length} pontuações`);
      
      // Mascarar os números de WhatsApp antes de enviar
      const maskedScores = scores.map((item, index) => {
        const whatsapp = String(item.whatsapp || '').replace(/\D/g, '');
        let maskedWhatsapp = '';
        
        if (whatsapp.length >= 11) {
          // Formato: (XX)9.****-XXXX
          maskedWhatsapp = `(${whatsapp.substring(0, 2)})${whatsapp.substring(2, 3)}.****-${whatsapp.substring(7, 11)}`;
        } else if (whatsapp.length >= 8) {
          // Caso o formato seja diferente, tentar máscarar da melhor forma possível
          maskedWhatsapp = whatsapp.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1)$2.****-$4');
        } else {
          // Formato muito diferente do esperado
          maskedWhatsapp = '(XX)9.****-XXXX';
        }
        
        // Formatar a data
        let formattedDate = '';
        if (item.createdAt) {
          formattedDate = formatDateTime(new Date(item.createdAt));
        }
        
        return {
          position: index + 1,
          name: item.name || 'Anônimo',
          whatsapp: maskedWhatsapp,
          score: Number(item.score) || 0,
          totalTime: Number(item.totalTime) || 0,
          createdAt: formattedDate
        };
      });
      
      return NextResponse.json({
        scores: maskedScores,
        usingRealDb: isUsingRealDb()
      });
    } catch (dbError) {
      console.error('Erro na operação de banco de dados:', dbError);
      
      // Criar uma data atual para os dados simulados
      const now = new Date();
      const formattedDate = formatDateTime(now);
      
      // Resposta de fallback - dados simulados para não quebrar a UI
      console.log('Gerando dados simulados como fallback...');
      const fallbackScores = [
        { position: 1, name: 'Usuário exemplo 1', whatsapp: '(XX)9.****-1234', score: 1200, totalTime: 90.5, createdAt: formattedDate },
        { position: 2, name: 'Usuário exemplo 2', whatsapp: '(XX)9.****-5678', score: 1100, totalTime: 95.3, createdAt: formattedDate },
        { position: 3, name: 'Usuário exemplo 3', whatsapp: '(XX)9.****-9012', score: 950, totalTime: 102.1, createdAt: formattedDate }
      ];
      
      return NextResponse.json({
        scores: fallbackScores,
        usingRealDb: false,
        warning: "Usando dados de exemplo - banco de dados não disponível"
      });
    }
  } catch (error: unknown) {
    console.error('Erro ao buscar pontuações:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar pontuações: ' + errorMessage,
        scores: [], // Enviar array vazio para evitar erros no cliente
        usingRealDb: false
      },
      { status: 500 }
    );
  }
}