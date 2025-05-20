// setupDb.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.DATABASE_NAME;

async function setupDatabase() {
  if (!uri || !dbName) {
    console.error('MONGODB_URI ou DATABASE_NAME não definidos no arquivo .env');
    process.exit(1);
  }

  // Configurações específicas para contornar problemas de SSL - usando apenas opções compatíveis
  const options = {
    tlsAllowInvalidCertificates: true, // Permite certificados inválidos (use apenas em desenvolvimento)
    tlsAllowInvalidHostnames: true,    // Permite hostnames inválidos (use apenas em desenvolvimento) 
    serverSelectionTimeoutMS: 60000    // Aumenta o timeout para seleção de servidor para 60 segundos
  };

  const client = new MongoClient(uri, options);

  try {
    await client.connect();
    console.log('Conectado ao MongoDB com sucesso!');

    const db = client.db(dbName);
    
    // Verificar se a coleção de pontuações já existe
    const collections = await db.listCollections({ name: 'scores' }).toArray();
    
    if (collections.length > 0) {
      console.log('A coleção "scores" já existe. Deseja recriá-la? (s/n)');
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readline.question('', async (answer) => {
        if (answer.toLowerCase() === 's') {
          await db.collection('scores').drop();
          console.log('Coleção "scores" removida com sucesso.');
          await createScoresCollection(db);
        } else {
          console.log('Operação cancelada. A coleção "scores" não foi modificada.');
          // Mesmo que não recrie a coleção, garante que o índice existe
          await ensureIndexes(db);
        }
        readline.close();
        await client.close();
      });
    } else {
      await createScoresCollection(db);
      await client.close();
    }
  } catch (error) {
    console.error('Erro ao configurar o banco de dados:', error);
    console.error('Detalhes do erro:', error.stack);
    await client.close();
    process.exit(1);
  }
}

// Nova função para garantir que os índices existam
async function ensureIndexes(db) {
  try {
    // Criar índice para ordenação por pontuação (descendente)
    await db.collection('scores').createIndex({ score: -1 });
    console.log('Índice score criado ou já existente');
    
    // Criar índice para ordenação por data (útil para consultas por período)
    await db.collection('scores').createIndex({ createdAt: -1 });
    console.log('Índice createdAt criado ou já existente');
    
    console.log('Índices verificados com sucesso.');
  } catch (error) {
    console.error('Erro ao criar índices:', error);
    throw error;
  }
}

async function createScoresCollection(db) {
  try {
    // Criar a coleção de pontuações
    await db.createCollection('scores');
    console.log('Coleção "scores" criada com sucesso.');

    // Criar índices para melhorar a performance das consultas
    await ensureIndexes(db);

    // Inserir algumas pontuações de exemplo (opcional)
    const sampleScores = [
      {
        name: 'João Silva',
        whatsapp: '(34)9.1234-5678',
        score: 1250,
        totalTime: 87.5,
        createdAt: new Date()
      },
      {
        name: 'Maria Oliveira',
        whatsapp: '(34)9.8765-4321',
        score: 1100,
        totalTime: 92.3,
        createdAt: new Date()
      },
      {
        name: 'Pedro Santos',
        whatsapp: '(11)9.5555-6666',
        score: 950,
        totalTime: 103.2,
        createdAt: new Date()
      },
      {
        name: 'Ana Costa',
        whatsapp: '(21)9.7777-8888',
        score: 1150,
        totalTime: 88.9,
        createdAt: new Date()
      },
      {
        name: 'Carlos Ferreira',
        whatsapp: '(34)9.3333-2222',
        score: 850,
        totalTime: 112.5,
        createdAt: new Date()
      }
    ];

    const result = await db.collection('scores').insertMany(sampleScores);
    console.log(`${result.insertedCount} pontuações de exemplo inseridas com sucesso.`);
  } catch (error) {
    console.error('Erro ao criar coleção:', error);
    throw error;
  }
}

setupDatabase().catch(console.error);