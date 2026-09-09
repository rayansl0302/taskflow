export type Role = 'ADMIN' | 'USER';
export type UserStatus = 'ATIVO' | 'INATIVO';
export type TaskStatus = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';
export type TaskPriority = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: Date | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  userId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface TaskInput {
  title: string;
  description: string;
  userId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

export interface UserInput {
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  password?: string;
}

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
};

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Administrador',
  USER: 'Usuário',
};
