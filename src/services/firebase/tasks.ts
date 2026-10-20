import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './config';
import { parseDateInput } from '../../utils/date';
import type { Task, TaskInput, TaskStatus } from '../../types';

const COLLECTION = 'tasks';

function toTask(id: string, data: Record<string, any>): Task {
  return {
    id,
    title: data.title ?? '',
    description: data.description ?? '',
    userId: data.userId ?? '',
    status: data.status ?? 'PENDENTE',
    priority: data.priority ?? 'MEDIA',
    dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate() : null,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
  };
}

/** Mais recentes primeiro. */
function porCriacaoDesc(a: Task, b: Task): number {
  return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
}

/**
 * Busca as tarefas e ordena em memória.
 *
 * Combinar `where('userId')` com `orderBy('createdAt')` exigiria um índice
 * composto no Firestore — sem ele a consulta falha com "The query requires an
 * index" e a listagem do USER fica vazia. Como o volume é pequeno e a tela já
 * reordena conforme o filtro escolhido, a ordenação fica no cliente.
 */
export async function listTasks(userId?: string): Promise<Task[]> {
  const base = collection(db, COLLECTION);
  const q = userId ? query(base, where('userId', '==', userId)) : query(base);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => toTask(item.id, item.data())).sort(porCriacaoDesc);
}

/** Base dos indicadores do dashboard. */
export async function listTasksForMetrics(userId?: string): Promise<Task[]> {
  return listTasks(userId);
}

export async function getTask(id: string): Promise<Task | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  if (!snapshot.exists()) return null;
  return toTask(snapshot.id, snapshot.data());
}

export async function createTask(input: TaskInput): Promise<string> {
  const now = Timestamp.now();
  const reference = await addDoc(collection(db, COLLECTION), {
    title: input.title,
    description: input.description,
    userId: input.userId,
    status: input.status,
    priority: input.priority,
    dueDate: Timestamp.fromDate(parseDateInput(input.dueDate)),
    createdAt: now,
    updatedAt: now,
  });
  return reference.id;
}

/**
 * A tarefa mudou entre o momento em que foi aberta e o da gravacao.
 *
 * Acontece quando duas pessoas (ou duas abas) editam o mesmo registro: a
 * segunda gravacao carrega os campos como estavam quando a tela abriu e
 * desfaria, em silencio, o que a primeira acabou de salvar.
 */
export class ConflitoDeEdicao extends Error {
  constructor() {
    super(
      'Esta tarefa foi alterada por outra pessoa enquanto você editava. ' +
        'Recarregue a página para ver a versão atual antes de salvar.',
    );
    this.name = 'ConflitoDeEdicao';
  }
}

/**
 * Grava a tarefa, recusando a escrita se ela mudou desde que foi aberta.
 *
 * `vistaEm` e o `updatedAt` que a tela carregou. A transacao le o documento no
 * servidor e so grava se os dois ainda baterem; sem isso a ultima gravacao
 * vence sempre, levando junto o que a outra pessoa escreveu.
 */
export async function updateTask(
  id: string,
  input: TaskInput,
  vistaEm?: Date | null,
): Promise<void> {
  const referencia = doc(db, COLLECTION, id);

  await runTransaction(db, async (transacao) => {
    const atual = await transacao.get(referencia);
    if (!atual.exists()) throw new Error('Tarefa não encontrada.');

    const dados = atual.data();
    const gravadaEm = dados.updatedAt instanceof Timestamp ? dados.updatedAt.toDate() : null;
    if (vistaEm && gravadaEm && gravadaEm.getTime() !== vistaEm.getTime()) {
      throw new ConflitoDeEdicao();
    }

    transacao.update(referencia, {
      title: input.title,
      description: input.description,
      userId: input.userId,
      status: input.status,
      priority: input.priority,
      dueDate: Timestamp.fromDate(parseDateInput(input.dueDate)),
      updatedAt: Timestamp.now(),
    });
  });
}

/** Alteracao rapida de status a partir da listagem. */
export async function changeTaskStatus(id: string, status: TaskStatus): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function countTasksByUser(userId: string): Promise<number> {
  const snapshot = await getDocs(query(collection(db, COLLECTION), where('userId', '==', userId)));
  return snapshot.size;
}
