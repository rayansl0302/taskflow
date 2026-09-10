import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

/**
 * Projeto usado no ambiente do desafio.
 *
 * Estes valores ficam no código de propósito: a configuração web do Firebase é
 * embutida no bundle de qualquer aplicação cliente e é pública por definição —
 * a proteção real vem das regras do Firestore e do Authentication.
 *
 * Servem de fallback para plataformas que não leem arquivos `.env` do
 * repositório (a Vercel, por exemplo, só injeta variáveis definidas no painel).
 * Qualquer variável VITE_FIREBASE_* presente no build tem precedência.
 */
const DEFAULT_CONFIG = {
  apiKey: 'AIzaSyBbaR1yG_1ZZM64EseNXisA1MtgVpD7-5c',
  authDomain: 'taskflow-9dff8.firebaseapp.com',
  projectId: 'taskflow-9dff8',
  storageBucket: 'taskflow-9dff8.firebasestorage.app',
  messagingSenderId: '301802726897',
  appId: '1:301802726897:web:98c441841d4203de4b9050',
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_CONFIG.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_CONFIG.appId,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  const host = import.meta.env.VITE_EMULATOR_HOST || '127.0.0.1';
  connectAuthEmulator(auth, `http://${host}:${import.meta.env.VITE_EMULATOR_AUTH_PORT || 9099}`, {
    disableWarnings: true,
  });
  connectFirestoreEmulator(db, host, Number(import.meta.env.VITE_EMULATOR_FIRESTORE_PORT || 8080));
}
