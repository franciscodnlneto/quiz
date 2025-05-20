// app/lib/db.ts
import { MongoClient } from 'mongodb';
import * as MockDb from './mockDb';
import { clientPromise as RealDbPromise } from './mongodb';

// Configuração para escolher entre banco real e simulado
// Altere para 'true' para usar o banco de dados real
const usingRealDb = true;

console.log(`Inicializando configuração de banco de dados...`);
console.log(`Modo de banco de dados: ${usingRealDb ? 'REAL' : 'SIMULADO'}`);

// Escolher o banco baseado na configuração
const clientPromise = usingRealDb ? RealDbPromise : MockDb.clientPromise;
const dbName = process.env.DATABASE_NAME || 'quizAppDB';

// Função para verificar qual banco de dados estamos usando
export function isUsingRealDb() {
  return usingRealDb;
}

export { clientPromise, dbName };