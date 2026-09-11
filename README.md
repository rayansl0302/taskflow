# TaskFlow

Sistema web de gestão de tarefas construído como **ambiente de avaliação prática de QA**.

O sistema é funcional de ponta a ponta (autenticação, autorização, CRUD de usuários e de
tarefas, dashboard, filtros, paginação) e roda sobre Firebase Authentication + Cloud Firestore.

> **Aviso para quem administra o desafio:** este repositório contém o gabarito dos defeitos
> ([`QA_GABARITO.md`](QA_GABARITO.md) e [`docs/gabarito.json`](docs/gabarito.json)) e a
> especificação do desafio. É material interno: **não compartilhe o repositório com o
> profissional avaliado**. O QA recebe apenas a URL da aplicação, as credenciais e o escopo
> funcional de [`docs/BRIEFING_QA.md`](docs/BRIEFING_QA.md).

---

## Stack

| Camada | Tecnologia |
|---|---|
| UI | React 18 + TypeScript + Vite |
| Rotas | React Router 6 |
| Estilos | CSS puro (design system próprio em `src/styles/global.css`) |
| Auth | Firebase Authentication (e-mail/senha) |
| Banco | Cloud Firestore |
| Ambiente local | Firebase Emulator Suite |

---

## Pré-requisitos

- **Node.js 18+** (testado com Node 20)
- **JDK 11+** — obrigatório para o emulador do Firestore
  (`https://adoptium.net`; confirme com `java -version`). O `firebase-tools` está fixado na
  linha 13.x justamente para funcionar com JDK 11/17; a linha 15.x exigiria JDK 21+.

---

## Instalação

```bash
npm install
cp .env.example .env
```

Depois edite o `.env`:

- `VITE_USE_EMULATORS=true` → roda tudo no Firebase Emulator Suite, sem precisar de um
  projeto real (ideal para desenvolvimento).
- `VITE_USE_EMULATORS=false` → usa o projeto Firebase configurado nas variáveis
  `VITE_FIREBASE_*` (é assim que o ambiente entregue ao QA roda).

O `.env` não é versionado.

---

## Executando com o emulador (recomendado)

Em um terminal, suba o emulador:

```bash
npm run emulators
```

Em outro terminal, popule os dados de demonstração e suba o front-end:

```bash
npm run seed
```

```bash
npm run dev
```

- Aplicação: http://localhost:5173
- Emulator UI (inspeção do Firestore e do Auth): http://localhost:4000

Os dados do emulador ficam em memória: ao encerrar, basta rodar `npm run seed` de novo.
Para preservá-los entre execuções use `npm run emulators:persist` (exporta ao sair) e depois
`npm run emulators:restore`.

Para subir emulador e front-end juntos:

```bash
npm run dev:full
```

---

## Usuários criados pelo seed

A senha de todos os usuários é a definida em `VITE_SEED_PASSWORD` no `.env`
(padrão: `Taskflow@2024`).

| E-mail | Perfil | Status |
|---|---|---|
| admin@taskflow.com | ADMIN | ATIVO |
| maria.silva@taskflow.com | USER | ATIVO |
| joao.pereira@taskflow.com | USER | ATIVO |
| ana.souza@taskflow.com | USER | ATIVO |
| carlos.inativo@taskflow.com | USER | INATIVO |

O seed também cria 35 tarefas distribuídas entre os usuários, com todos os status,
prioridades e prazos variados (vencidos, hoje, futuros) — massa suficiente para exercitar
pesquisa, filtros, ordenação e paginação.

---

## Executando contra um projeto Firebase real

O `.env` local já aponta para o projeto **taskflow-9dff8** com `VITE_USE_EMULATORS=false`.
Para reproduzir em outro projeto, ajuste as variáveis `VITE_FIREBASE_*`.

Checklist no [Firebase Console](https://console.firebase.google.com/):

1. **Authentication → Sign-in method → E-mail/senha**: habilitado.
2. **Firestore Database**: criado (modo produção).
3. Publicar regras e índices:

```bash
node node_modules/firebase-tools/lib/bin/firebase.js login
```

```bash
npm run deploy:rules
```

4. Popular a base. O seed usa o Admin SDK, que exige uma **service account**:
   Console → Configurações do projeto → Contas de serviço → *Gerar nova chave privada*.
   Salve o arquivo como `serviceAccount.json` na raiz (já está no `.gitignore`) e rode:

```bash
npm run seed
```

> O seed **apaga** as coleções `users` e `tasks` antes de recriá-las. Use apenas no
> ambiente do desafio.

### Deploy da aplicação

```bash
npm run build
```

```bash
npm run deploy:hosting
```

> A configuração `VITE_FIREBASE_*` é embutida no bundle — como em qualquer app web
> Firebase, a API key é pública por natureza e a proteção real vem das regras do
> Firestore e das configurações do Authentication.

### Deploy na Vercel

O projeto já vem pronto para a Vercel:

- [`vercel.json`](vercel.json) define o build (`npm run build` → `dist`) e a reescrita de
  SPA, necessária para que rotas como `/tasks/123` funcionem em acesso direto e após F5.
- A configuração do Firebase tem um fallback em
  [`src/services/firebase/config.ts`](src/services/firebase/config.ts), porque **a Vercel não
  lê arquivos `.env` do repositório** — ela só injeta variáveis definidas no painel do
  projeto. Sem esse fallback o build sai sem credenciais e a aplicação falha com
  `auth/invalid-api-key`. Os valores estão no código de propósito: a configuração web do
  Firebase é embutida no bundle de qualquer app cliente e é pública por definição — a
  proteção real vem das regras do Firestore e do Authentication.
- Qualquer variável `VITE_FIREBASE_*` definida no painel da Vercel (ou em
  [`.env.production`](.env.production), usado por builds locais e pelo Firebase Hosting) tem
  precedência sobre o fallback.

**Antes de entregar o ambiente ao QA**, o projeto Firebase precisa estar preparado — sem
isso a aplicação carrega, mas o login falha e as telas ficam sem dados.

**Passo 1 — publicar as regras.** O Firestore nasce com regras que bloqueiam tudo; enquanto
elas não forem substituídas, toda leitura volta `permission-denied`. Abra o Console do
Firebase → *Firestore Database* → *Regras*, cole o conteúdo de
[`firestore.rules`](firestore.rules) e publique. (Com o CLI autenticado, `npm run deploy:rules`
faz o mesmo.)

**Passo 2 — popular a base.**

```bash
npm run setup:remote
```

Esse script usa o **SDK cliente**, sem service account: cria as contas de demonstração,
grava os perfis e carrega as 35 tarefas. Se as regras ainda não estiverem publicadas, ele
para com uma mensagem explicando exatamente isso.

O gabarito não precisa de passo separado: na primeira vez que a conta responsável abrir
`/gabarito`, a própria rota busca [`docs/gabarito.json`](docs/gabarito.json) e grava o
documento em `internal/qa-gabarito`. Só aquela sessão consegue fazer isso, porque a escrita
é restrita pelas regras. Se `GABARITO_OWNER_PASSWORD` estiver preenchida no `.env`, o script
já publica o gabarito junto e a rota abre pronta.

> `npm run seed` continua existindo para o caminho com service account (Admin SDK) e é o
> usado com o emulador.

**Passo 3 — opcional.** Em *Authentication → Settings → Authorized domains*, inclua o domínio
da Vercel. O login por e-mail/senha funciona sem isso, mas os links de recuperação de senha
só são aceitos em domínios autorizados.

Se a aplicação subir sem a configuração do Firebase, a tela mostra uma mensagem explicando
o que falta, em vez de ficar em branco.

### Voltando para o emulador

Basta definir `VITE_USE_EMULATORS=true` no `.env` e rodar `npm run emulators` +
`npm run seed` (nesse modo o seed não precisa de service account).

---

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Front-end em modo desenvolvimento |
| `npm run build` | Type-check + build de produção |
| `npm run preview` | Serve o build de produção |
| `npm run lint` | Verificação de tipos (tsc) |
| `npm run emulators` | Emulator Suite (dados em memória) |
| `npm run emulators:persist` | Emulator Suite exportando os dados ao encerrar |
| `npm run emulators:restore` | Emulator Suite importando o último export |
| `npm run seed` | Popula a base (emulador ou projeto real) com usuários e tarefas |
| `npm run dev:full` | Emulador + front-end em paralelo |
| `npm run setup:remote` | Prepara um projeto real (contas, tarefas e gabarito) sem service account |
| `npm run gabarito:publish` | Publica o gabarito interno via Admin SDK (service account) |
| `npm run deploy:rules` | Publica `firestore.rules` e os índices |
| `npm run deploy:hosting` | Publica o build no Firebase Hosting |

---

## Rota interna do gabarito (`/gabarito`)

A fonte da verdade do gabarito é [`docs/gabarito.json`](docs/gabarito.json). Ele é publicado
no Firestore em `internal/qa-gabarito` e exibido na rota `/gabarito` — uma tela de consulta
com busca, filtro por área e severidade e, para cada defeito, **por que acontece**, **onde
está no código**, **como replicar** e **resultado esperado × resultado atual**.

O [`QA_GABARITO.md`](QA_GABARITO.md) é **gerado** a partir desse JSON — edite sempre o JSON,
nunca o markdown.

A leitura desse documento é liberada em `firestore.rules` **apenas para o e-mail da conta
responsável pelo desafio** (`request.auth.token.email`). Nem a conta ADMIN entregue ao QA
consegue abrir: ela recebe uma tela de "página não encontrada", porque a recusa vem do
servidor, não do front-end.

Configuração:

1. No `.env`, defina `GABARITO_OWNER_EMAIL` (uma conta diferente das entregues ao QA) e
   `GABARITO_OWNER_PASSWORD` (usada apenas na primeira execução, para criar a conta).
2. Publique o conteúdo, sincronize o e-mail nas regras e regenere o `QA_GABARITO.md`:

```bash
npm run gabarito:publish
```

3. Publique as regras atualizadas:

```bash
npm run deploy:rules
```

A cada alteração do gabarito, basta repetir o passo 2 — o passo 3 só é necessário quando o
e-mail autorizado muda.

> Se preferir não rodar o script, o e-mail pode ser editado direto no bloco `/internal` de
> [`firestore.rules`](firestore.rules); o script apenas mantém os dois lados em sincronia.

---

## Estrutura

```text
taskflow/
├── src/
│   ├── components/        componentes de UI reutilizáveis
│   ├── contexts/          AuthContext e ToastContext
│   ├── layouts/           shell da aplicação (sidebar + topbar)
│   ├── pages/             telas: login, dashboard, tarefas, usuários, perfil
│   ├── routes/            guardas de rota (autenticação e perfil ADMIN)
│   ├── services/firebase/ config, auth, users, tasks
│   ├── styles/            design system em CSS
│   ├── types/             modelos e enums
│   └── utils/             datas, formatação e validações
├── scripts/
│   ├── seed.mjs           massa de dados para o emulador ou projeto real
│   └── publish-gabarito.mjs
├── docs/
│   ├── BRIEFING_QA.md     material entregue ao profissional avaliado
│   └── gabarito.json      fonte da verdade do gabarito (interno)
├── QA_GABARITO.md         gabarito gerado a partir do JSON (interno)
├── firestore.rules
├── firestore.indexes.json
└── firebase.json
```

---

## Rotas

| Rota | Acesso |
|---|---|
| `/login` | pública |
| `/forgot-password` | pública |
| `/dashboard` | autenticado |
| `/tasks` | autenticado |
| `/tasks/new` | autenticado |
| `/tasks/:id` | autenticado |
| `/profile` | autenticado |
| `/users` | administrativo |
| `/users/new` | administrativo |
| `/users/:id` | administrativo |

---

## Modelo de dados

```text
users/{userId}
  name, email, role (ADMIN|USER), status (ATIVO|INATIVO), createdAt

tasks/{taskId}
  title, description, userId, status (PENDENTE|EM_ANDAMENTO|CONCLUIDA|CANCELADA),
  priority (BAIXA|MEDIA|ALTA|URGENTE), dueDate, createdAt, updatedAt
```
