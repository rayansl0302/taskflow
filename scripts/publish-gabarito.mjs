/**
 * Publica o gabarito interno no Firestore e libera a rota /gabarito
 * exclusivamente para a conta responsável pelo desafio.
 *
 * Fonte da verdade: o arquivo JSON apontado por GABARITO_DATA (fora do repositório).
 * A partir dele o script:
 *   1. garante a existência da conta interna;
 *   2. grava os bugs em `internal/qa-gabarito` (via Admin SDK, que ignora as regras);
 *   3. escreve o UID autorizado em firestore.rules;
 *   4. regenera o QA_GABARITO.md ao lado do JSON.
 *
 * Uso:
 *   npm run gabarito:publish
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';

// --- configuracao -----------------------------------------------------
const env = { ...process.env };
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !env[match[1]]) env[match[1]] = match[2].trim();
  }
}

const projectId = env.VITE_FIREBASE_PROJECT_ID;
const ownerEmail = env.GABARITO_OWNER_EMAIL;
const ownerPassword = env.GABARITO_OWNER_PASSWORD;
const dataFile = resolve(env.GABARITO_DATA || '../TaskFlow-gabarito/gabarito.json');
const useEmulators = env.VITE_USE_EMULATORS !== 'false';

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

if (!ownerEmail) {
  fail(
    'Defina GABARITO_OWNER_EMAIL no .env com o e-mail da conta que poderá abrir /gabarito.\n' +
      'Use uma conta diferente das credenciais entregues ao QA.',
  );
}

if (!existsSync(dataFile)) {
  fail(`Gabarito não encontrado em "${dataFile}".\nAjuste GABARITO_DATA no .env.`);
}

if (useEmulators) {
  const host = env.VITE_EMULATOR_HOST || '127.0.0.1';
  process.env.FIREBASE_AUTH_EMULATOR_HOST ||= `${host}:${env.VITE_EMULATOR_AUTH_PORT || 9099}`;
  process.env.FIRESTORE_EMULATOR_HOST ||= `${host}:${env.VITE_EMULATOR_FIRESTORE_PORT || 8080}`;
  initializeApp({ projectId });
} else {
  const keyPath = env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccount.json';
  if (!existsSync(keyPath)) {
    fail(
      `Nenhuma service account encontrada em "${keyPath}".\n` +
        'Console do Firebase → Configurações do projeto → Contas de serviço → Gerar nova chave privada.',
    );
  }
  initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))), projectId });
}

const auth = getAuth();
const db = getFirestore();

// --- markdown ---------------------------------------------------------
function toMarkdown(data) {
  const lines = [];
  lines.push(`# ${data.titulo}`, '');
  lines.push('> **DOCUMENTO INTERNO. NÃO ENTREGAR AO PROFISSIONAL AVALIADO.**', '>');
  lines.push(`> ${data.descricao}`, '');
  lines.push(`**Total de bugs inseridos: ${data.bugs.length}**`, '', '---', '');

  lines.push('## Índice', '');
  lines.push('| ID | Título | Área | Severidade | Dificuldade |');
  lines.push('|---|---|---|---|---|');
  for (const bug of data.bugs) {
    lines.push(`| ${bug.id} | ${bug.titulo} | ${bug.area} | ${bug.severidade} | ${bug.dificuldade} |`);
  }
  lines.push('', '### Distribuição por severidade', '');
  lines.push('| Severidade | Qtde |', '|---|---:|');
  for (const nivel of ['CRÍTICA', 'ALTA', 'MÉDIA', 'BAIXA']) {
    lines.push(`| ${nivel} | ${data.bugs.filter((b) => b.severidade === nivel).length} |`);
  }
  lines.push('', '---', '');

  for (const bug of data.bugs) {
    lines.push(`## ${bug.id} — ${bug.titulo}`, '');
    lines.push(`**Área:** ${bug.area} · **Severidade:** ${bug.severidade} · **Dificuldade:** ${bug.dificuldade}`, '');
    lines.push('**Por que acontece**', '', bug.porque, '');
    lines.push('**Onde está**', '');
    for (const local of bug.local) lines.push(`- \`${local}\``);
    lines.push('', '**Como reproduzir**', '');
    bug.passos.forEach((passo, index) => lines.push(`${index + 1}. ${passo}`));
    lines.push('', `**Resultado esperado:** ${bug.esperado}`, '');
    lines.push(`**Resultado atual:** ${bug.atual}`, '');
    if (bug.descoberta) lines.push(`**Como se chega nele:** ${bug.descoberta}`, '');
    if (bug.observacoes) lines.push(`**Observações:** ${bug.observacoes}`, '');
    lines.push('---', '');
  }

  return lines.join('\n');
}

// --- execucao ---------------------------------------------------------
async function run() {
  console.log(`> projeto: ${projectId}${useEmulators ? ' (emulador)' : ''}`);

  const data = JSON.parse(readFileSync(dataFile, 'utf8'));
  if (!Array.isArray(data.bugs) || data.bugs.length === 0) {
    fail(`O arquivo "${dataFile}" não contém a lista "bugs".`);
  }

  // 1. conta interna
  let owner;
  try {
    owner = await auth.getUserByEmail(ownerEmail);
    console.log(`> conta interna existente: ${ownerEmail}`);
  } catch {
    if (!ownerPassword) {
      fail(
        `A conta ${ownerEmail} ainda não existe.\n` +
          'Defina GABARITO_OWNER_PASSWORD no .env para criá-la nesta execução.',
      );
    }
    owner = await auth.createUser({
      email: ownerEmail,
      password: ownerPassword,
      displayName: 'Responsável pelo desafio',
    });
    console.log(`> conta interna criada: ${ownerEmail}`);
  }

  // 2. conteudo
  await db
    .collection('internal')
    .doc('qa-gabarito')
    .set({
      titulo: data.titulo,
      descricao: data.descricao,
      bugs: data.bugs,
      total: data.bugs.length,
      updatedAt: Timestamp.now(),
      ownerUid: owner.uid,
    });
  console.log(`> ${data.bugs.length} bugs publicados em internal/qa-gabarito`);

  // 3. regras
  const rulesPath = 'firestore.rules';
  const rules = readFileSync(rulesPath, 'utf8');
  const updated = rules.replace(
    /(match \/internal\/\{docId\} \{[\s\S]*?request\.auth\.uid == ')[^']*(')/,
    `$1${owner.uid}$2`,
  );
  if (updated === rules) {
    console.warn('! Não foi possível localizar o bloco /internal em firestore.rules.');
  } else if (updated !== rules) {
    writeFileSync(rulesPath, updated);
    console.log(`> firestore.rules atualizado com o UID ${owner.uid}`);
  }

  // 4. markdown
  const mdPath = env.GABARITO_MD || join(dirname(dataFile), 'QA_GABARITO.md');
  writeFileSync(mdPath, toMarkdown(data), 'utf8');
  console.log(`> markdown regenerado em ${mdPath}`);

  console.log('\nFalta um passo — publicar as regras:\n\n    npm run deploy:rules\n');
  console.log(`Depois disso, acesse /gabarito autenticado como ${ownerEmail}.`);
}

run().catch((error) => {
  console.error('Falha ao publicar o gabarito:', error);
  process.exit(1);
});
