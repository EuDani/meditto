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
