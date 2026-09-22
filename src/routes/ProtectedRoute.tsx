import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
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

  // Só a sessão do Firebase autoriza: o perfil guardado localmente serve
  // para montar a tela mais rápido, nunca como prova de autenticação.
  if (!firebaseUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
