// app/lib/db.ts
import { MongoClient } from 'mongodb';

// Configurar o NODE_TLS_REJECT_UNAUTHORIZED apenas em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

if (!process.env.MONGODB_URI) {
  throw new Error('Por favor, defina a variável de ambiente MONGODB_URI');
}

if (!process.env.DATABASE_NAME) {
  throw new Error('Por favor, defina a variável de ambiente DATABASE_NAME');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.DATABASE_NAME;

// Interface para o objeto global com a propriedade _mongoClientPromise
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Configurações para a conexão MongoDB
const options = {
  ssl: true,
  serverSelectionTimeoutMS: 60000,  // Aumentado para 60 segundos
  connectTimeoutMS: 60000,          // Aumentado para 60 segundos
};

console.log('Configurando conexão MongoDB com NODE_TLS_REJECT_UNAUTHORIZED =', process.env.NODE_TLS_REJECT_UNAUTHORIZED);

// Em desenvolvimento, use uma variável global para evitar conexões múltiplas durante hot-reload
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect()
      .catch(err => {
        console.error('Erro na conexão MongoDB (desenvolvimento):', err);
        console.error('Detalhes da conexão:');
        console.error('- URI (parcial):', uri.substring(0, 20) + '...');
        console.error('- Opções:', JSON.stringify(options));
        throw err; // Re-throw para que o erro apareça no console
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Em produção, é melhor não usar uma variável global
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .catch(err => {
      console.error('Erro na conexão MongoDB (produção):', err);
      throw err; // Re-throw para que o erro apareça no console
    });
}

// Função para verificar se estamos usando o banco de dados real
// Agora sempre retorna true, já que removemos o fallback para mock
export function isUsingRealDb() {
  return true;
}

export { clientPromise, dbName };