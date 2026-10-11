import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import { observeAuth, signIn, signOutUser } from '../services/firebase/auth';
import { auth } from '../services/firebase/config';
import { getUser } from '../services/firebase/users';
import type { AppUser } from '../types';

const SESSION_CACHE_KEY = 'taskflow:last-session';

/**
 * Conta responsável pelo desafio — a que abre /gabarito.
 *
 * Ela existe apenas no Authentication: não tem documento em `users`, de
 * propósito, para não aparecer na listagem, nos indicadores nem no seletor
 * de responsável que o profissional avaliado enxerga. Por isso precisa
 * escapar da checagem de perfil ausente, que existe para barrar contas
 * excluídas (BUG-014). O valor também fica embutido porque a Vercel ignora
 * os arquivos .env do repositório, do mesmo jeito que a configuração do
 * Firebase em services/firebase/config.ts.
 */
const OWNER_EMAIL = (
  import.meta.env.VITE_GABARITO_OWNER_EMAIL || 'rayansl0302@gmail.com'
)
  .trim()
  .toLowerCase();

function isOwnerAccount(user: User): boolean {
  return (user.email ?? '').trim().toLowerCase() === OWNER_EMAIL;
}

interface AuthContextValue {
  firebaseUser: User | null;
  profile: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Ultimo perfil autenticado, usado para acelerar a montagem das telas. */
export function readCachedSession(): AppUser | null {
  try {
    const raw = window.localStorage.getItem(SESSION_CACHE_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
}

function writeCachedSession(profile: AppUser | null) {
  if (!profile) return;
  window.localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(profile));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(() => readCachedSession());
  const [loading, setLoading] = useState(true);

  const encerrarSessaoInvalida = useCallback(async () => {
    setProfile(null);
    window.localStorage.removeItem(SESSION_CACHE_KEY);
    await signOutUser();
  }, []);

  const loadProfile = useCallback(async (user: User) => {
    // A autenticação não depende da leitura do perfil: se o Firestore recusar
    // a consulta, seguimos com um perfil mínimo montado a partir da conta.
    // Documento ausente e conta inativa são outro caso: a sessão não pode
    // continuar — com a exceção da conta responsável, que não tem perfil.
    let stored: AppUser | null = null;
    let leituraFalhou = false;
    try {
      stored = await getUser(user.uid);
    } catch {
      leituraFalhou = true;
      stored = null;
    }

    if (leituraFalhou && auth.currentUser?.uid !== user.uid) {
      setProfile(null);
      window.localStorage.removeItem(SESSION_CACHE_KEY);
      throw new Error('Esta conta não está mais disponível.');
    }

    if (!leituraFalhou && !stored && !isOwnerAccount(user)) {
      await encerrarSessaoInvalida();
      throw new Error('Esta conta não está mais disponível.');
    }

    if (stored?.status === 'INATIVO') {
      await encerrarSessaoInvalida();
      throw new Error('Esta conta está inativa. Procure um administrador.');
    }

    const resolved: AppUser =
      stored ?? {
        id: user.uid,
        name: user.displayName || user.email || 'Usuário',
        email: user.email || '',
        role: 'USER',
        status: 'ATIVO',
        createdAt: null,
      };
    setProfile(resolved);
    writeCachedSession(resolved);
    return resolved;
  }, [encerrarSessaoInvalida]);

  useEffect(() => {
    const unsubscribe = observeAuth(async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          await loadProfile(user);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [loadProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      const user = await signIn(email, password);
      await loadProfile(user);
    },
    [loadProfile],
  );

  const logout = useCallback(async () => {
    await signOutUser();
    setProfile(null);
    window.localStorage.removeItem(SESSION_CACHE_KEY);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (firebaseUser) await loadProfile(firebaseUser);
  }, [firebaseUser, loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      profile,
      loading,
      isAdmin: profile?.role === 'ADMIN',
      login,
      logout,
      refreshProfile,
    }),
    [firebaseUser, profile, loading, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
