// app/lib/mockDb.ts
// Este é um banco de dados simulado para ser usado se o MongoDB Atlas não estiver acessível
import { ObjectId } from 'mongodb';

class MockCollection {
  private data: any[] = [];
  private indexes: Record<string, number> = {};
  private name: string;

  constructor(name: string) {
    this.name = name;
    console.log(`Collection ${name} criada no banco de dados simulado`);
  }

  async insertOne(document: any) {
    const _id = new ObjectId();
    const docWithId = { ...document, _id };
    this.data.push(docWithId);
    
    // Atualizar índices
    Object.keys(this.indexes).forEach(key => {
      this.data.sort((a, b) => {
        const order = this.indexes[key];
        if (a[key] < b[key]) return order * -1;
        if (a[key] > b[key]) return order;
        return 0;
      });
    });

    console.log(`Documento inserido na coleção ${this.name}:`, docWithId);
    return { insertedId: _id, acknowledged: true };
  }

  async insertMany(documents: any[]) {
    const insertedIds: ObjectId[] = [];
    for (const doc of documents) {
      const result = await this.insertOne(doc);
      insertedIds.push(result.insertedId);
    }
    return { insertedCount: documents.length, acknowledged: true, insertedIds };
  }

  find(query: any = {}) {
    // Simulação simples de filtro
    let results = [...this.data];
    
    // Filtrar se necessário
    if (Object.keys(query).length > 0) {
      results = results.filter(item => {
        return Object.keys(query).every(key => {
          if (typeof query[key] === 'object') {
            // Operadores simples
            if (query[key].$eq) return item[key] === query[key].$eq;
            if (query[key].$gt) return item[key] > query[key].$gt;
            if (query[key].$lt) return item[key] < query[key].$lt;
            return true;
          }
          return item[key] === query[key];
        });
      });
    }

    return {
      sort: (sortQuery: Record<string, number>) => {
        // Ordenar resultados
        const key = Object.keys(sortQuery)[0];
        const order = sortQuery[key];
        
        results.sort((a, b) => {
          if (a[key] < b[key]) return order * -1;
          if (a[key] > b[key]) return order;
          return 0;
        });
        
        return {
          limit: (n: number) => {
            results = results.slice(0, n);
            return {
              toArray: () => Promise.resolve(results)
            };
          },
          toArray: () => Promise.resolve(results)
        };
      },
      toArray: () => Promise.resolve(results)
    };
  }

  async createIndex(indexSpec: Record<string, number>) {
    const key = Object.keys(indexSpec)[0];
    this.indexes[key] = indexSpec[key];
    return key;
  }

  async drop() {
    this.data = [];
    this.indexes = {};
    return true;
  }

  async command(command: any) {
    // Simulação simples para comandos como ping
    if (command.ping === 1) {
      return { ok: 1 };
    }
    return { ok: 1 };
  }
}

class MockDb {
  private collections: Record<string, MockCollection> = {};

  constructor(name: string) {
    console.log(`Database ${name} criado no banco de dados simulado`);
  }

  collection(name: string) {
    if (!this.collections[name]) {
      this.collections[name] = new MockCollection(name);
    }
    return this.collections[name];
  }

  async createCollection(name: string) {
    if (!this.collections[name]) {
      this.collections[name] = new MockCollection(name);
    }
    return this.collections[name];
  }

  async listCollections() {
    return {
      toArray: () => Promise.resolve(
        Object.keys(this.collections).map(name => ({ name }))
      )
    };
  }

  async command(command: any) {
    // Simulação simples para comandos como ping
    if (command.ping === 1) {
      return { ok: 1 };
    }
    return { ok: 1 };
  }
}

class MockClient {
  private dbs: Record<string, MockDb> = {};

  async connect() {
    console.log('Conectado ao banco de dados simulado');
    return this;
  }

  db(name: string) {
    if (!this.dbs[name]) {
      this.dbs[name] = new MockDb(name);
    }
    return this.dbs[name];
  }

  async close() {
    console.log('Conexão fechada no banco de dados simulado');
    return true;
  }
}

// Criando uma instância mockada do MongoDB
const mockClient = new MockClient();
const mockClientPromise = Promise.resolve(mockClient);
const dbName = process.env.DATABASE_NAME || 'quizAppDB';

// Adicione alguns dados de exemplo
(async () => {
  try {
    console.log('Inicializando banco de dados simulado com dados de exemplo...');
    const client = await mockClientPromise;
    const db = client.db(dbName);
    const collection = db.collection('scores');
    
    // Criar datas diferentes para os registros de exemplo
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
    
    // Adicionar alguns dados de exemplo
    const sampleScores = [
      {
        name: 'João Silva',
        whatsapp: '(34)9.1234-5678',
        score: 1250,
        totalTime: 87.5,
        createdAt: now
      },
      {
        name: 'Maria Oliveira',
        whatsapp: '(34)9.8765-4321',
        score: 1100,
        totalTime: 92.3,
        createdAt: oneDayAgo
      },
      {
        name: 'Pedro Santos',
        whatsapp: '(11)9.5555-6666',
        score: 950,
        totalTime: 103.2,
        createdAt: twoDaysAgo
      },
      {
        name: 'Ana Costa',
        whatsapp: '(21)9.7777-8888',
        score: 1150,
        totalTime: 88.9,
        createdAt: threeDaysAgo
      },
      {
        name: 'Carlos Ferreira',
        whatsapp: '(34)9.3333-2222',
        score: 850,
        totalTime: 112.5,
        createdAt: fourDaysAgo
      }
    ];
    
    const result = await collection.insertMany(sampleScores);
    console.log(`${result.insertedCount} pontuações de exemplo inseridas no banco de dados simulado`);
  } catch (error) {
    console.error('Erro ao adicionar dados de exemplo ao banco simulado:', error);
  }
})();

export { mockClientPromise as clientPromise, dbName };