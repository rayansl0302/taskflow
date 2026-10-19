import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './config';
import type { AppUser, UserInput } from '../../types';

const COLLECTION = 'users';

function toUser(id: string, data: Record<string, any>): AppUser {
  return {
    id,
    name: data.name ?? '',
    email: data.email ?? '',
    role: data.role ?? 'USER',
    status: data.status ?? 'ATIVO',
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
  };
}

export async function listUsers(): Promise<AppUser[]> {
  const snapshot = await getDocs(query(collection(db, COLLECTION), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((item) => toUser(item.id, item.data()));
}

export async function getUser(id: string): Promise<AppUser | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  if (!snapshot.exists()) return null;
  return toUser(snapshot.id, snapshot.data());
}

export async function createUserProfile(id: string, input: UserInput): Promise<void> {
  await setDoc(doc(db, COLLECTION, id), {
    name: input.name,
    email: input.email,
    role: input.role,
    status: input.status,
    createdAt: Timestamp.now(),
  });
}

export async function updateUser(id: string, input: Partial<UserInput>): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.email !== undefined) payload.email = input.email;
  if (input.role !== undefined) payload.role = input.role;
  if (input.status !== undefined) payload.status = input.status;
  await updateDoc(doc(db, COLLECTION, id), payload);
}

export async function deleteUser(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

/**
 * Exclui o usuario e transfere as tarefas dele para outro responsavel.
 *
 * Apagar so o perfil deixava as tarefas apontando para um identificador que
 * nao existe mais, e a listagem passava a mostrar o UID cru no lugar do nome
 * (BUG-030). Transferir preserva os registros e mantem a coluna coerente.
 *
 * Devolve quantas tarefas mudaram de dono.
 */
export async function deleteUserAndReassignTasks(
  id: string,
  novoResponsavelId: string,
): Promise<number> {
  const tarefas = await getDocs(query(collection(db, 'tasks'), where('userId', '==', id)));

  await Promise.all(
    tarefas.docs.map((tarefa) =>
      updateDoc(tarefa.ref, { userId: novoResponsavelId, updatedAt: Timestamp.now() }),
    ),
  );

  await deleteDoc(doc(db, COLLECTION, id));
  return tarefas.size;
}
