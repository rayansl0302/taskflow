import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { readCachedSession, useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/Spinner';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { firebaseUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-loader">
        <Spinner label="Verificando sessão..." />
      </div>
    );
  }

  // A sessao em cache evita o "flash" de redirecionamento durante a
  // reidratacao do Firebase Auth.
  const cached = readCachedSession();
  if (!firebaseUser && !cached) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
