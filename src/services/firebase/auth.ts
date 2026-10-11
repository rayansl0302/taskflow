import { deleteApp, initializeApp } from 'firebase/app';
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth, firebaseConfig } from './config';

export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function createAuthAccount(
  email: string,
  password: string,
  name: string,
): Promise<{ uid: string }> {
  const secondary = initializeApp(firebaseConfig, `taskflow-create-${Date.now()}`);
  const secondaryAuth = getAuth(secondary);
  if (import.meta.env.VITE_USE_EMULATORS === 'true') {
    const host = import.meta.env.VITE_EMULATOR_HOST || '127.0.0.1';
    connectAuthEmulator(
      secondaryAuth,
      `http://${host}:${import.meta.env.VITE_EMULATOR_AUTH_PORT || 9099}`,
      { disableWarnings: true },
    );
  }

  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    await updateProfile(credential.user, { displayName: name });
    const uid = credential.user.uid;
    await signOut(secondaryAuth);
    return { uid };
  } finally {
    await deleteApp(secondary);
  }
}

export function observeAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
