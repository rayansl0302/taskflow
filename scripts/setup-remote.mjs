/**
 * Prepara o ambiente usando apenas o SDK cliente — sem service account.
 * É o caminho para deixar o ambiente publicado (Vercel, Hosting) pronto para o
 * QA sem precisar baixar uma chave privada. Funciona também contra o emulador
 * quando VITE_USE_EMULATORS=true.
 *
 * O script:
 *   1. entra com a conta responsável e publica o gabarito em internal/qa-gabarito;
 *   2. cria (ou reaproveita) as contas de demonstração no Authentication;
 *   3. grava o perfil de cada uma em users/{uid};
 *   4. entra como ADMIN, limpa as tarefas antigas e cria a massa de 35 tarefas.
 *
 * Pré-requisito: as regras deste repositório precisam estar publicadas.
 * Sem isso toda escrita volta como permission-denied — o script avisa e para.
 *
 * Uso:
 *   npm run setup:remote
 *
 * Variáveis lidas de .env:
 *   GABARITO_OWNER_EMAIL / GABARITO_OWNER_PASSWORD  conta responsável
 *   VITE_SEED_PASSWORD                              senha das contas de demonstração
 *   VITE_FIREBASE_*                                 configuração do projeto
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp } from 'firebase/app';
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  Timestamp,
  addDoc,
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  setDoc,
} from 'firebase/firestore';

// --- configuracao -----------------------------------------------------
const env = { ...process.env };
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !env[match[1]]) env[match[1]] = match[2].trim();
  }
}

const DEFAULTS = {
  apiKey: 'AIzaSyBbaR1yG_1ZZM64EseNXisA1MtgVpD7-5c',
  authDomain: 'taskflow-9dff8.firebaseapp.com',
  projectId: 'taskflow-9dff8',
  storageBucket: 'taskflow-9dff8.firebasestorage.app',
  messagingSenderId: '301802726897',
  appId: '1:301802726897:web:98c441841d4203de4b9050',
};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || DEFAULTS.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULTS.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || DEFAULTS.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULTS.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULTS.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || DEFAULTS.appId,
};

const ownerEmail = env.GABARITO_OWNER_EMAIL;
const ownerPassword = env.GABARITO_OWNER_PASSWORD;
const seedPassword = env.VITE_SEED_PASSWORD || 'Taskflow@2024';
const dataFile = resolve(env.GABARITO_DATA || './docs/gabarito.json');

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

// A conta responsável é opcional: sem a senha dela o script prepara o ambiente
// do QA e deixa o gabarito para ser publicado pela própria rota /gabarito, no
// primeiro acesso da conta autorizada.
const publicaGabarito = Boolean(ownerEmail && ownerPassword && existsSync(dataFile));

const useEmulators = env.VITE_USE_EMULATORS === 'true';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

if (useEmulators) {
  const host = env.VITE_EMULATOR_HOST || '127.0.0.1';
  connectAuthEmulator(auth, `http://${host}:${env.VITE_EMULATOR_AUTH_PORT || 9099}`, {
    disableWarnings: true,
  });
  connectFirestoreEmulator(db, host, Number(env.VITE_EMULATOR_FIRESTORE_PORT || 8080));
}

// --- dados ------------------------------------------------------------
const users = [
  { key: 'admin', name: 'Administrador TaskFlow', email: 'admin@taskflow.com', role: 'ADMIN', status: 'ATIVO' },
  { key: 'maria', name: 'Maria Silva', email: 'maria.silva@taskflow.com', role: 'USER', status: 'ATIVO' },
  { key: 'joao', name: 'João Pereira', email: 'joao.pereira@taskflow.com', role: 'USER', status: 'ATIVO' },
  { key: 'ana', name: 'Ana Souza', email: 'ana.souza@taskflow.com', role: 'USER', status: 'ATIVO' },
  { key: 'carlos', name: 'Carlos Inativo', email: 'carlos.inativo@taskflow.com', role: 'USER', status: 'INATIVO' },
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

function explicarErro(error, contexto) {
  const code = error?.code ?? '';
  if (code === 'permission-denied') {
    fail(
      `Permissão negada ao ${contexto}.\n\n` +
        'As regras deste repositório ainda não estão publicadas no projeto.\n' +
        'Console do Firebase → Firestore Database → Regras → cole o conteúdo de\n' +
        'firestore.rules e publique. Depois rode este script novamente.',
    );
  }
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
    fail(`Senha incorreta ao ${contexto}. Confira o .env.`);
  }
  if (code === 'auth/operation-not-allowed') {
    fail(
      'O provedor E-mail/senha está desabilitado.\n' +
        'Console do Firebase → Authentication → Sign-in method → habilite E-mail/senha.',
    );
  }
  throw error;
}

// --- execucao ---------------------------------------------------------
async function run() {
  console.log(`> projeto: ${firebaseConfig.projectId}${useEmulators ? ' (emulador)' : ''}`);

  // 1. gabarito, com a conta responsável (quando a senha está disponível)
  if (publicaGabarito) {
    try {
      await signInWithEmailAndPassword(auth, ownerEmail, ownerPassword);
    } catch (error) {
      explicarErro(error, `entrar como ${ownerEmail}`);
    }
    console.log(`> autenticado como ${ownerEmail}`);

    const gabarito = JSON.parse(readFileSync(dataFile, 'utf8'));
    try {
      await setDoc(doc(db, 'internal', 'qa-gabarito'), {
        titulo: gabarito.titulo,
        descricao: gabarito.descricao,
        bugs: gabarito.bugs,
        total: gabarito.bugs.length,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      explicarErro(error, 'publicar o gabarito');
    }
    console.log(`> gabarito publicado: ${gabarito.bugs.length} defeitos`);
  } else {
    console.log('> gabarito: será publicado no primeiro acesso à rota /gabarito');
  }

  // 2 e 3. contas de demonstração e perfis
  const ids = {};
  for (const user of users) {
    let credential;
    try {
      credential = await signInWithEmailAndPassword(auth, user.email, seedPassword);
    } catch (error) {
      const code = error?.code ?? '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        try {
          credential = await createUserWithEmailAndPassword(auth, user.email, seedPassword);
        } catch (erroCriacao) {
          explicarErro(erroCriacao, `criar a conta ${user.email}`);
        }
      } else {
        explicarErro(error, `entrar como ${user.email}`);
      }
    }

    ids[user.key] = credential.user.uid;
    try {
      await setDoc(doc(db, 'users', credential.user.uid), {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: Timestamp.fromDate(daysFromNow(-60)),
      });
    } catch (error) {
      explicarErro(error, `gravar o perfil de ${user.email}`);
    }
    console.log(`  usuário: ${user.email} (${user.role}/${user.status})`);
  }

  // 4. tarefas, como ADMIN
  await signInWithEmailAndPassword(auth, users[0].email, seedPassword);
  console.log('> autenticado como ADMIN para a carga de tarefas');

  const existentes = await getDocs(collection(db, 'tasks'));
  if (existentes.size > 0) {
    await Promise.all(existentes.docs.map((item) => deleteDoc(item.ref)));
    console.log(`> ${existentes.size} tarefa(s) anterior(es) removida(s)`);
  }

  const owners = ['maria', 'joao', 'ana', 'admin', 'carlos'];
  const offsets = [-12, -5, -1, 0, 1, 3, 7, 14, 30, 45];

  let index = 0;
  for (const title of titles) {
    const owner = owners[index % owners.length];
    const created = daysFromNow(-(index % 25) - 1);
    await addDoc(collection(db, 'tasks'), {
      title,
      description: `Tarefa de demonstração #${index + 1} — acompanhar execução e registrar o andamento no sistema.`,
      userId: ids[owner],
      status: STATUS[index % STATUS.length],
      priority: PRIORITY[(index * 3) % PRIORITY.length],
      dueDate: Timestamp.fromDate(daysFromNow(offsets[index % offsets.length])),
      createdAt: Timestamp.fromDate(created),
      updatedAt: Timestamp.fromDate(created),
    });
    index += 1;
  }
  console.log(`> ${titles.length} tarefas criadas`);

  await signOut(auth);

  console.log('\nAmbiente pronto.');
  console.log(`  QA:       admin@taskflow.com / ${seedPassword}`);
  console.log(`  Gabarito: ${ownerEmail} → /gabarito`);
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Falha ao preparar o ambiente:', error);
    process.exit(1);
  });
