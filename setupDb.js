const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const fs = require('fs');
const csv = require('csv-parser');

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

async function setupDatabase() {
  try {
    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);

    // Collections
    const users = db.collection('users');
    const quizzes = db.collection('quizzes');
    const questions = db.collection('questions');

    // Admin user
    const adminUser = {
      email: 'appquizito@gmail.com',
      password: '123456',
      role: 'admin',
      createdAt: new Date(),
    };

    const userResult = await users.insertOne(adminUser);
    console.log('Usuário admin criado com ID:', userResult.insertedId);

    // Quiz
    const quiz = {
      title: 'Quiz CPC - Centro de Pesquisa Clínica',
      logoUrl: 'https://raw.githubusercontent.com/franciscodnlneto/imagens_publicas_diversas/refs/heads/main/logo_cpc_500x200.png',
      themeColors: {
        primary: '#B02A78',
        secondary: '#9AC33C',
        error: '#F44336',
        background: '#fdf0f7',
        text: '#333333',
        border: '#eaeaea',
      },
      createdBy: userResult.insertedId,
      createdAt: new Date(),
    };

    const quizResult = await quizzes.insertOne(quiz);
    console.log('Quiz criado com ID:', quizResult.insertedId);

    // Leitura do CSV e inserção de perguntas
    const questionsArray = [];

    fs.createReadStream('perguntas_e_respostas.csv')
      .pipe(csv())
      .on('data', (row) => {
        questionsArray.push({
          quizId: quizResult.insertedId,
          questionText: row.pergunta,
          options: [row.alternativa1, row.alternativa2, row.alternativa3, row.alternativa4].filter(Boolean),
          correctAnswer: row.resposta_correta,
          createdAt: new Date(),
        });
      })
      .on('end', async () => {
        const questionResult = await questions.insertMany(questionsArray);
        console.log(`${questionResult.insertedCount} perguntas inseridas com sucesso!`);

        await client.close();
      });
  } catch (err) {
    console.error(err);
  }
}

setupDatabase();
