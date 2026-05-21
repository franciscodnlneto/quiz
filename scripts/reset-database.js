/**
 * scripts/reset-database.js
 *
 * Apaga TODO o conteúdo da collection do ranking do Quiz do CEBS.
 *
 * Como funciona:
 *  - Lê MONGODB_URI e DATABASE_NAME de .env.local
 *  - Conecta no MongoDB Atlas
 *  - Dropa a collection (apaga todos os documentos)
 *  - A collection é recriada automaticamente no próximo insert que a app fizer
 *
 * Uso:
 *  npm run reset-db              -> dry run (só conta os documentos atuais, sem apagar)
 *  npm run reset-db -- --confirm -> apaga de verdade
 *
 * IMPORTANTE: a operação é IRREVERSÍVEL. Sempre rode primeiro o dry run para
 * confirmar que está apontando para o banco/collection corretos.
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const COLLECTION_NAME = 'quizito_cebs';

async function main() {
  const args = process.argv.slice(2);
  const confirmed = args.includes('--confirm');

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DATABASE_NAME;

  if (!uri) {
    console.error('[ERRO] MONGODB_URI nao encontrada. Configure em .env.local.');
    console.error('       Dica: rode "vercel env pull .env.local" para puxar da Vercel.');
    process.exit(1);
  }
  if (!dbName) {
    console.error('[ERRO] DATABASE_NAME nao encontrada. Configure em .env.local.');
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    ssl: true,
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  });

  try {
    console.log('Conectando ao MongoDB Atlas...');
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection(COLLECTION_NAME);

    const count = await collection.countDocuments();

    console.log('');
    console.log('  Banco        : ' + dbName);
    console.log('  Collection   : ' + COLLECTION_NAME);
    console.log('  Documentos   : ' + count);
    console.log('');

    if (!confirmed) {
      console.log('[DRY RUN] Nenhuma alteracao feita.');
      console.log('         Para apagar de verdade, rode: npm run reset-db -- --confirm');
      return;
    }

    if (count === 0) {
      console.log('[OK] Collection ja esta vazia. Nada a fazer.');
      return;
    }

    console.log('Apagando ' + count + ' documento(s)...');
    try {
      await collection.drop();
      console.log('[OK] Collection "' + COLLECTION_NAME + '" apagada com sucesso.');
      console.log('     Ela sera recriada vazia no proximo registro enviado pela app.');
    } catch (err) {
      if (err && err.codeName === 'NamespaceNotFound') {
        console.log('[OK] Collection ja nao existia. Nada a fazer.');
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error('[ERRO]', err && err.message ? err.message : err);
    process.exitCode = 1;
  } finally {
    await client.close().catch(() => {});
  }
}

main();
