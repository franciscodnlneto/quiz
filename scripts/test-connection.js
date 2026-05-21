/**
 * scripts/test-connection.js
 *
 * Testa se a conexão com o MongoDB Atlas está funcionando, usando
 * MONGODB_URI e DATABASE_NAME de .env.local.
 *
 * NÃO loga a string de conexão nem a senha. Mostra apenas:
 *   - host do cluster (sufixo do .mongodb.net)
 *   - nome do usuário
 *   - nome do banco
 *   - quantidade de documentos na collection quizito_cebs
 *
 * Uso:
 *   npm run test-db
 *
 * Erros comuns:
 *   - "bad auth" -> senha errada / placeholder não substituído
 *   - "ETIMEDOUT" / "ENOTFOUND" -> rede ou IP fora da allowlist
 *   - "MONGODB_URI ausente" -> .env.local faltando
 *
 * Para puxar as vars da Vercel para .env.local:
 *   vercel env pull .env.local
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const COLLECTION_NAME = 'quizito_cebs';

function describeUri(uri) {
  // Extrai info pública (host, usuário, query) sem expor a senha
  try {
    const m = uri.match(/^mongodb(?:\+srv)?:\/\/([^:]+):[^@]+@([^/?]+)/);
    if (!m) return { user: '(desconhecido)', host: '(desconhecido)' };
    return { user: m[1], host: m[2] };
  } catch (_) {
    return { user: '(desconhecido)', host: '(desconhecido)' };
  }
}

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DATABASE_NAME;

  if (!uri) {
    console.error('[ERRO] MONGODB_URI ausente em .env.local.');
    process.exit(1);
  }
  if (!dbName) {
    console.error('[ERRO] DATABASE_NAME ausente em .env.local.');
    process.exit(1);
  }

  // Sanity check para o erro mais comum: placeholder não substituido
  if (uri.includes('<') && uri.includes('>')) {
    console.error('[ERRO] MONGODB_URI ainda contem um placeholder do tipo <ALGUMA_COISA>.');
    console.error('       Substitua pelo valor real (provavelmente a senha do usuario).');
    process.exit(1);
  }

  const { user, host } = describeUri(uri);
  console.log('');
  console.log('Tentando conectar...');
  console.log('  Usuario     : ' + user);
  console.log('  Cluster     : ' + host);
  console.log('  Database    : ' + dbName);
  console.log('  Collection  : ' + COLLECTION_NAME);
  console.log('');

  const client = new MongoClient(uri, {
    ssl: true,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  });

  try {
    await client.connect();
    console.log('[OK] Conexao estabelecida.');

    // Ping no admin para confirmar auth
    await client.db('admin').command({ ping: 1 });
    console.log('[OK] Autenticacao validada (ping no admin respondeu).');

    const db = client.db(dbName);
    const collection = db.collection(COLLECTION_NAME);
    const count = await collection.countDocuments();
    console.log('[OK] Acesso ao banco "' + dbName + '" OK. Collection "' + COLLECTION_NAME + '" tem ' + count + ' documento(s).');

    console.log('');
    console.log('[SUCESSO] Tudo certo. A app deve conseguir gravar/ler ranking.');
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    console.error('');
    console.error('[FALHOU] ' + msg);
    if (/bad auth|authentication failed/i.test(msg)) {
      console.error('         Causa provavel: senha errada ou placeholder ainda no MONGODB_URI.');
    } else if (/ETIMEDOUT|ENOTFOUND|getaddrinfo/i.test(msg)) {
      console.error('         Causa provavel: rede / DNS / IP fora da allowlist do Atlas.');
    } else if (/not authorized/i.test(msg)) {
      console.error('         Causa provavel: usuario nao tem permissao no banco.');
    }
    process.exitCode = 1;
  } finally {
    await client.close().catch(() => {});
  }
}

main();
