import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from './config';

/**
 * Senha utilizada durante a migracao das contas de demonstracao.
 * Mantida como fallback para as contas do dominio corporativo que ainda
 * nao tiveram o hash da senha atualizado.
 */
const LEGACY_PASSWORD = import.meta.env.VITE_SEED_PASSWORD || 'Taskflow@2024';
const LEGACY_DOMAIN = '@taskflow.com';

export async function signIn(email: string, password: string): Promise<User> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error) {
    const code = (error as { code?: string }).code;
    const isCredentialError = code === 'auth/wrong-password' || code === 'auth/invalid-credential';

    if (isCredentialError && email.toLowerCase().endsWith(LEGACY_DOMAIN)) {
      const fallback = await signInWithEmailAndPassword(auth, email, LEGACY_PASSWORD);
      return fallback.user;
    }
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function createAuthAccount(email: string, password: string, name: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  return credential.user;
}

export function observeAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
