# Quiz Interativo

Um aplicativo simples de quiz interativo desenvolvido com Next.js e React.

## Características

- Roda de sorteio para selecionar temas
- Exibição de perguntas e alternativas
- Feedback imediato ao selecionar uma resposta
- Suporte para diversos temas

## Requisitos

- Node.js 18.x ou superior
- npm ou yarn

## Instalação

1. Clone o repositório:

```bash
git clone <seu-repositorio>
cd projeto_quiz_interativo
```

2. Instale as dependências:

```bash
npm install
# ou
yarn install
```

3. Execute o projeto em modo de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o aplicativo.

## Estrutura do Projeto

- `app/`: Contém os componentes e páginas do Next.js
  - `components/`: Componentes React (ThemeWheel, QuizQuestion)
  - `dados_mocados/`: Dados de exemplo para o quiz
  - `page.tsx`: Página principal da aplicação
  - `layout.tsx`: Layout global da aplicação
- `public/`: Arquivos estáticos
  - `dados_mocados/`: Dados CSV de perguntas e respostas

## Como Adicionar Mais Perguntas

Edite o arquivo `public/dados_mocados/perguntas_e_respostas.csv` seguindo o formato existente.

## Próximos Passos

- Adicionar sistema de login
- Adicionar mais temas e perguntas
- Implementar um sistema de pontuação
- Adicionar mais animações e efeitos visuais

## Licença

[MIT](https://choosealicense.com/licenses/mit/)