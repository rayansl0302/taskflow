import type { TaskPriority, TaskStatus } from '../types';

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function statusClass(status: TaskStatus): string {
  return `badge badge--${status.toLowerCase().replace('_', '-')}`;
}

export function priorityClass(priority: TaskPriority): string {
  return `badge badge--${priority.toLowerCase()}`;
}

/** Traduz erros do Firebase para mensagens de usuario. */
export function friendlyError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha inválidos.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente em alguns minutos.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado.';
    default:
      return (error as Error)?.message ?? 'Erro inesperado.';
  }
}
