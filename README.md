# Medito

PWA de meditação guiada: login com Supabase, métodos de respiração com timing preciso, paisagens sonoras
via YouTube e histórico de sessões.

## Setup

```bash
npm install
```

### 1. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Abra o **SQL Editor** do projeto e rode todo o conteúdo de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
3. Copie `.env.example` para `.env.local` e preencha com a URL e a chave anônima do seu projeto (em
   *Project Settings → API*):

```bash
cp .env.example .env.local
```

Sem essas variáveis o app funciona, mas mostra um aviso na tela de login e bloqueia o cadastro/entrada.

### 2. Rodar em desenvolvimento

```bash
npm run dev
```

### 3. Build de produção (PWA)

```bash
npm run build
npm run preview
```

## Métodos de respiração

Os 6 métodos (Relaxamento, Equilíbrio, Vigor, Foco, Energia, Descontração) estão definidos em
[`src/lib/breathing/modules.ts`](src/lib/breathing/modules.ts) com os tempos exatos de cada fase
(inspirar/segurar/expirar/segurar) e a regra de loop de cada técnica. O motor que executa a sessão fica em
[`src/lib/breathing/engine.ts`](src/lib/breathing/engine.ts).

## Paisagens sonoras

Cada usuário cadastra suas próprias paisagens sonoras colando um link do YouTube (aba **Sons**). O áudio
toca em um player oculto (sem vídeo visível) durante a sessão de meditação.

## Deploy no GitHub Pages

O workflow [`deploy-pages.yml`](.github/workflows/deploy-pages.yml) builda e publica o app automaticamente a
cada push em `main`.

1. No GitHub, vá em **Settings → Pages** e defina *Source* como **GitHub Actions**.
2. (Opcional, para o app já sair conectado ao Supabase) em **Settings → Secrets and variables → Actions**,
   crie os secrets `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os mesmos valores do seu `.env.local`.
3. Faça push em `main` (ou rode o workflow manualmente em **Actions**). O app fica disponível em
   `https://<seu-usuário>.github.io/meditto/`.

O build para GitHub Pages usa a variável `GITHUB_PAGES=true` para servir os arquivos em `/meditto/` em vez da
raiz — isso é feito automaticamente pelo workflow. Rodando `npm run build` sem essa variável (para Vercel,
Netlify, etc.) o app continua servindo pela raiz normalmente.

Como o GitHub Pages não tem roteamento de servidor, [`public/404.html`](public/404.html) redireciona rotas
desconhecidas (ex: `/meditto/historico`) de volta para o `index.html`, que devolve a URL original para o
React Router.
