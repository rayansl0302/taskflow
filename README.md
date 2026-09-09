# TaskFlow

Sistema web de gestão de tarefas construído como **ambiente de avaliação prática de QA**.

O sistema é funcional de ponta a ponta (autenticação, autorização, CRUD de usuários e de
tarefas, dashboard, filtros, paginação) e roda sobre Firebase Authentication + Cloud Firestore.

> **Aviso para quem administra o desafio:** o gabarito com o mapa dos defeitos
> (`QA_GABARITO.md`) é material interno, fica **fora deste repositório** (o `.gitignore` o
> bloqueia) e não deve ser entregue ao profissional avaliado. O QA recebe apenas a URL da
> aplicação, as credenciais e o escopo funcional de [`docs/BRIEFING_QA.md`](docs/BRIEFING_QA.md).

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
| `npm run gabarito:publish` | Publica o gabarito interno e libera a rota `/gabarito` |
| `npm run deploy:rules` | Publica `firestore.rules` e os índices |
| `npm run deploy:hosting` | Publica o build no Firebase Hosting |

---

## Rota interna do gabarito (`/gabarito`)

O mapa dos defeitos não fica no repositório. A fonte da verdade é um JSON fora do projeto
(`GABARITO_DATA`), publicado no Firestore em `internal/qa-gabarito` e exibido na rota
`/gabarito` — uma tela de consulta com busca, filtro por área e severidade e, para cada
defeito, **por que acontece**, **onde está no código**, **como replicar** e **resultado
esperado × resultado atual**.

A leitura desse documento é liberada em `firestore.rules` **apenas para o UID da conta
responsável pelo desafio**. Nem a conta ADMIN entregue ao QA consegue abrir: ela recebe uma
tela de "página não encontrada", porque a recusa vem do servidor, não do front-end.

Configuração:

1. No `.env`, defina `GABARITO_OWNER_EMAIL` (uma conta diferente das entregues ao QA),
   `GABARITO_OWNER_PASSWORD` (usada apenas na primeira execução, para criar a conta) e
   `GABARITO_DATA` (caminho do JSON, fora do repositório).
2. Publique o conteúdo, grave o UID nas regras e regenere o `QA_GABARITO.md`:

```bash
npm run gabarito:publish
```

3. Publique as regras atualizadas:

```bash
npm run deploy:rules
```

A cada alteração do gabarito, basta repetir o passo 2 — o passo 3 só é necessário quando o
UID muda.

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
├── scripts/seed.mjs       massa de dados para o emulador
├── docs/BRIEFING_QA.md    material entregue ao profissional avaliado
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
