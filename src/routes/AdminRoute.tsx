import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function AdminRoute({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();

  if (loading) return null;

  if (profile && profile.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
