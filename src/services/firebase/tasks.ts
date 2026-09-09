import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
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

export async function listTasks(userId?: string): Promise<Task[]> {
  const base = collection(db, COLLECTION);
  const q = userId
    ? query(base, where('userId', '==', userId), orderBy('createdAt', 'desc'))
    : query(base, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => toTask(item.id, item.data()));
}

/** Amostra utilizada pelos indicadores do dashboard. */
export async function listTasksForMetrics(userId?: string): Promise<Task[]> {
  const base = collection(db, COLLECTION);
  const q = userId
    ? query(base, where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(20))
    : query(base, orderBy('createdAt', 'desc'), limit(20));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => toTask(item.id, item.data()));
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
