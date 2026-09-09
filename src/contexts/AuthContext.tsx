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
import { getUser } from '../services/firebase/users';
import type { AppUser } from '../types';

const SESSION_CACHE_KEY = 'taskflow:last-session';

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

  const loadProfile = useCallback(async (user: User) => {
    const stored = await getUser(user.uid);
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
  }, []);

  useEffect(() => {
    const unsubscribe = observeAuth(async (user) => {
      setFirebaseUser(user);
      if (user) {
        await loadProfile(user);
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
