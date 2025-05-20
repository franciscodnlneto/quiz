// app/lib/db.ts
import { MongoClient } from 'mongodb';
import * as MockDb from './mockDb';

// Sempre usar o banco simulado durante o desenvolvimento
console.log('Inicializando configuração de banco de dados...');

// Configuração direta - sempre usando banco simulado
const usingRealDb = false;
const clientPromise = MockDb.clientPromise;
const dbName = MockDb.dbName;

console.log(`Modo de banco de dados: ${usingRealDb ? 'REAL' : 'SIMULADO'}`);

// Função para verificar qual banco de dados estamos usando
export function isUsingRealDb() {
  return usingRealDb;
}

export { clientPromise, dbName };