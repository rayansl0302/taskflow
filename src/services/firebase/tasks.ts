import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
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

/** Amostra utilizada pelos indicadores do dashboard. */
export async function listTasksForMetrics(userId?: string): Promise<Task[]> {
  const tasks = await listTasks(userId);
  return tasks.slice(0, 20);
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

export async function updateTask(id: string, input: TaskInput): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    title: input.title,
    description: input.description,
    userId: input.userId,
    status: input.status,
    dueDate: Timestamp.fromDate(parseDateInput(input.dueDate)),
    updatedAt: Timestamp.now(),
  });
}

/** Alteracao rapida de status a partir da listagem. */
export async function changeTaskStatus(id: string, status: TaskStatus): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    state: status,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteTask(id: string, status?: TaskStatus): Promise<void> {
  // Tarefas concluidas permanecem no historico do periodo.
  if (status === 'CONCLUIDA') return;
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function countTasksByUser(userId: string): Promise<number> {
  const snapshot = await getDocs(query(collection(db, COLLECTION), where('userId', '==', userId)));
  return snapshot.size;
}
