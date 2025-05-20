// test-mongodb-tls.js
require('dotenv').config();

// Configurar NODE_TLS_REJECT_UNAUTHORIZED=0 para ignorar erros de certificado
console.log('Definindo NODE_TLS_REJECT_UNAUTHORIZED=0 para ignorar erros de certificado TLS');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { MongoClient } = require('mongodb');

async function testConnection() {
  // Obter a URI do MongoDB do arquivo .env
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI não definida no arquivo .env');
    process.exit(1);
  }
  
  console.log('Usando a seguinte URI para conexão (truncada por segurança):');
  console.log(`${uri.substring(0, 20)}...${uri.substring(uri.length - 20)}`);
  
  // Criar uma instância do cliente MongoDB com opções para contornar problemas de TLS
  const options = {
    ssl: true,
    serverSelectionTimeoutMS: 30000,  // 30 segundos
    connectTimeoutMS: 30000,          // 30 segundos para conectar
  };
  
  console.log('Opções de conexão:', JSON.stringify(options, null, 2));
  console.log('NODE_TLS_REJECT_UNAUTHORIZED =', process.env.NODE_TLS_REJECT_UNAUTHORIZED);
  
  const client = new MongoClient(uri, options);
  
  try {
    console.log('Tentando conectar ao MongoDB...');
    await client.connect();
    console.log('Conexão com MongoDB bem-sucedida!');
    
    // Fazer um ping para confirmar a conexão
    const db = client.db('admin');
    const pingResult = await db.command({ ping: 1 });
    console.log('Ping ao servidor:', pingResult);
    
    // Se tudo ocorreu bem até aqui, lista os bancos de dados disponíveis
    console.log('Listando bancos de dados disponíveis:');
    const databasesList = await client.db().admin().listDatabases();
    
    databasesList.databases.forEach(db => {
      console.log(` - ${db.name}`);
    });
    
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:');
    console.error(error);
  } finally {
    // Sempre feche a conexão quando terminar
    await client.close();
    console.log('Conexão fechada');
  }
}

// Executar o teste de conexão
testConnection().catch(console.error);