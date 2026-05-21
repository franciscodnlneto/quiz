# CLAUDE.md

Instruções operacionais para o Claude Code ao trabalhar neste repositório.

---

## 🗄️ Resetar / limpar o ranking (collection `quizito_cebs`)

### Gatilhos

Quando o usuário pedir qualquer variante de:

- "deleta o banco de dados"
- "deleta o ranking"
- "reinicia o banco"
- "reinicia o banco de dados"
- "limpa o ranking"
- "limpa as pontuações"
- "apaga as pontuações"
- "zera a collection"
- "reseta o banco"
- "esvazia o ranking"
- "limpa a tabela de pontos"

…o Claude deve executar o script `scripts/reset-database.js`.

### Como executar

**1. Dry run primeiro (sempre)** — só conta os documentos, não apaga nada:

```bash
npm run reset-db
```

Isso mostra: banco, collection e quantidade de documentos atualmente lá. Use isso pra confirmar que está apontando pro lugar certo antes de apagar.

**2. Apagar de verdade** — irreversível:

```bash
npm run reset-db -- --confirm
```

Faz `collection.drop()` na `quizito_cebs`. A collection é recriada vazia automaticamente quando alguém terminar o quiz e enviar uma nova pontuação pela app.

### Diagnóstico de conexão

Antes de rodar o reset (ou se a app estiver dando erro de banco), use:

```bash
npm run test-db
```

Tenta autenticar, listar o banco, contar documentos. Mostra erro específico
quando falha (bad auth, timeout, sem permissão, placeholder no URI, etc.).
Não loga a string de conexão nem a senha.

### Pré-requisitos

Os scripts leem de `.env.local` (não comitado, gitignored):

```
MONGODB_URI=mongodb+srv://...
DATABASE_NAME=quizito_cebs
```

Se o usuário não tiver `.env.local`, ele pode puxar da Vercel:

```bash
vercel env pull .env.local
```

(Requer Vercel CLI logada na conta do projeto.)

### Comportamento esperado

- `NamespaceNotFound` (collection já não existia) → trata como sucesso silenciosamente.
- Sem `MONGODB_URI` ou `DATABASE_NAME` → erro claro com instrução de configurar.
- Sem `--confirm` → DRY RUN, nunca apaga.

---

## 📦 Estrutura relevante do projeto

- `app/` — Next.js App Router
  - `app/page.tsx` — orquestração do jogo, lê o CSV
  - `app/components/QuizQuestion.tsx` — pergunta + 2 alternativas
  - `app/components/WelcomeModal.tsx` — modal inicial
  - `app/components/QuizResult.tsx` — tela final + formulário nome/WhatsApp
  - `app/components/Leaderboard.tsx` — ranking lateral
  - `app/api/scores/route.ts` — POST/GET na collection `quizito_cebs`
  - `app/lib/db.ts` — conexão MongoDB (lê `MONGODB_URI` e `DATABASE_NAME`)
- `public/dados_mocados/100_Perguntas_CEBS.csv` — fonte das perguntas
- `scripts/reset-database.js` — script de reset do ranking

## ⚙️ Configuração do jogo

Em `app/page.tsx`:

- `TOTAL_QUESTIONS = 5` — quantidade de acertos seguidos para completar
- `MAX_TIME_POINTS = 100` — bônus máximo por velocidade
- `BASE_POINTS = 250` — pontos fixos por acerto
- Timer por pergunta: 30 segundos
