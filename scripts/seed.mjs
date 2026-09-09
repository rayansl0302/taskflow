/**
 * Popula o Firebase Emulator Suite com usuarios e tarefas de demonstracao.
 *
 *   1) npm run emulators
 *   2) npm run seed
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'node:fs';

// --- configuracao -----------------------------------------------------
const env = {};
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim();
  }
}

const projectId = env.VITE_FIREBASE_PROJECT_ID || 'taskflow-qa';
const password = env.VITE_SEED_PASSWORD || 'Taskflow@2024';
const host = env.VITE_EMULATOR_HOST || '127.0.0.1';
const useEmulators = env.VITE_USE_EMULATORS !== 'false';

if (useEmulators) {
  process.env.FIREBASE_AUTH_EMULATOR_HOST ||= `${host}:${env.VITE_EMULATOR_AUTH_PORT || 9099}`;
  process.env.FIRESTORE_EMULATOR_HOST ||= `${host}:${env.VITE_EMULATOR_FIRESTORE_PORT || 8080}`;
  initializeApp({ projectId });
} else {
  // Projeto real: exige uma service account
  // (Console > Configuracoes do projeto > Contas de servico > Gerar nova chave privada)
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccount.json';
  if (!existsSync(keyPath)) {
    console.error(
      `\nVITE_USE_EMULATORS=false, mas nenhuma service account foi encontrada em "${keyPath}".\n` +
        'Baixe a chave privada no Console do Firebase e salve como ./serviceAccount.json\n' +
        '(ou aponte GOOGLE_APPLICATION_CREDENTIALS para o arquivo).\n',
    );
    process.exit(1);
  }
  initializeApp({
    credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))),
    projectId,
  });
}
const auth = getAuth();
const db = getFirestore();

// --- dados ------------------------------------------------------------
const users = [
  { key: 'admin',   name: 'Administrador TaskFlow', email: 'admin@taskflow.com',         role: 'ADMIN', status: 'ATIVO'   },
  { key: 'maria',   name: 'Maria Silva',            email: 'maria.silva@taskflow.com',   role: 'USER',  status: 'ATIVO'   },
  { key: 'joao',    name: 'João Pereira',           email: 'joao.pereira@taskflow.com',  role: 'USER',  status: 'ATIVO'   },
  { key: 'ana',     name: 'Ana Souza',              email: 'ana.souza@taskflow.com',     role: 'USER',  status: 'ATIVO'   },
  { key: 'carlos',  name: 'Carlos Inativo',         email: 'carlos.inativo@taskflow.com',role: 'USER',  status: 'INATIVO' },
];

const STATUS = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'];
const PRIORITY = ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'];

const titles = [
  'Revisar contrato do fornecedor', 'Atualizar documentação da API', 'Corrigir layout do relatório',
  'Planejar sprint de outubro', 'Migrar base de clientes', 'Configurar ambiente de homologação',
  'Preparar apresentação executiva', 'Auditar acessos do sistema', 'Refatorar módulo de cobrança',
  'Criar checklist de deploy', 'Negociar renovação de licenças', 'Levantar requisitos do portal',
  'Ajustar filtros do dashboard', 'Revisar política de backup', 'Mapear jornada do usuário',
  'Automatizar relatório mensal', 'Validar integração de pagamentos', 'Documentar processo de onboarding',
  'Analisar chamados reincidentes', 'Atualizar dependências do projeto', 'Organizar workshop interno',
  'Definir metas do trimestre', 'Revisar textos da landing page', 'Testar fluxo de recuperação de senha',
  'Padronizar mensagens de erro', 'Investigar lentidão no login', 'Consolidar métricas de suporte',
  'Publicar release notes', 'Revisar acessos de terceiros', 'Criar plano de contingência',
  'Atualizar tabela de preços', 'Reunião de alinhamento com produto', 'Revisar João Silva - cadastro pendente',
  'Homologar novo gateway', 'Limpar registros duplicados',
];

const daysFromNow = (d) => {
  const date = new Date();
  date.setDate(date.getDate() + d);
  date.setHours(0, 0, 0, 0);
  return date;
};

async function run() {
  console.log(`> projeto: ${projectId}`);
  if (useEmulators) {
    console.log(`> auth emulator: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
    console.log(`> firestore emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`);
  } else {
    console.log('> destino: PROJETO REAL (os dados existentes serao substituidos)');
  }

  // limpa colecoes
  for (const collection of ['tasks', 'users']) {
    const snapshot = await db.collection(collection).get();
    await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()));
  }

  const ids = {};
  for (const user of users) {
    let record;
    try {
      record = await auth.getUserByEmail(user.email);
      await auth.updateUser(record.uid, { password, displayName: user.name });
    } catch {
      record = await auth.createUser({ email: user.email, password, displayName: user.name });
    }
    ids[user.key] = record.uid;

    await db.collection('users').doc(record.uid).set({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: Timestamp.fromDate(daysFromNow(-60)),
    });
    console.log(`  usuario: ${user.email} (${user.role}/${user.status})`);
  }

  const owners = ['maria', 'joao', 'ana', 'admin', 'carlos'];
  const offsets = [-12, -5, -1, 0, 1, 3, 7, 14, 30, 45];

  let index = 0;
  for (const title of titles) {
    const owner = owners[index % owners.length];
    const status = STATUS[index % STATUS.length];
    const priority = PRIORITY[(index * 3) % PRIORITY.length];
    const due = daysFromNow(offsets[index % offsets.length]);
    const created = daysFromNow(-(index % 25) - 1);

    await db.collection('tasks').add({
      title,
      description: `Tarefa de demonstração #${index + 1} — acompanhar execução e registrar o andamento no sistema.`,
      userId: ids[owner],
      status,
      priority,
      dueDate: Timestamp.fromDate(due),
      createdAt: Timestamp.fromDate(created),
      updatedAt: Timestamp.fromDate(created),
    });
    index += 1;
  }

  console.log(`\nSeed concluido: ${users.length} usuarios e ${titles.length} tarefas.`);
  console.log(`Senha de todos os usuarios: ${password}`);
}

run().catch((error) => {
  console.error('Falha no seed:', error);
  process.exit(1);
});
