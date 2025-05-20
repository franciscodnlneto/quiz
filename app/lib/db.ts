// app/lib/db.ts
import { MongoClient } from 'mongodb';
import * as RealDb from './mongodb';
import * as MockDb from './mockDb';

// Variável para controlar se estamos usando o banco real ou simulado
let usingRealDb = true;
let clientPromise: Promise<MongoClient>; 
let dbName: string; 

// Inicialização assíncrona para conexão ao banco de dados
async function initializeDb() {
  try {
    console.log('Tentando conectar ao MongoDB Atlas...');
    
    // Tentar conectar ao banco real
    const client = await RealDb.clientPromise;
    
    // Verificar a conexão com um simples ping
    await client.db(RealDb.dbName).command({ ping: 1 });
    
    console.log('Conexão com MongoDB Atlas bem-sucedida!');
    clientPromise = RealDb.clientPromise;
    dbName = RealDb.dbName;
    usingRealDb = true;
  } catch (error: unknown) {
    console.warn('Não foi possível conectar ao MongoDB Atlas. Usando banco de dados simulado local.');
    console.error('Erro de conexão:', error instanceof Error ? error.message : String(error));
    
    // Se falhou a conexão real, usar o banco simulado
    clientPromise = MockDb.clientPromise;
    dbName = MockDb.dbName;
    usingRealDb = false;
  }
}

// Inicializar a conexão
initializeDb();

// Função para verificar qual banco de dados estamos usando
export function isUsingRealDb() {
  return usingRealDb;
}

export { clientPromise, dbName };