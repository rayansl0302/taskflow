import type { TaskInput, UserInput } from '../types';

export type Errors<T> = Partial<Record<keyof T, string>>;

const EMAIL_REGEX = /^\S+@\S+$/;

export function validateEmail(value: string): string | null {
  if (!value) return 'O e-mail é obrigatório.';
  if (!EMAIL_REGEX.test(value)) return 'Informe um e-mail válido.';
  return null;
}

export function validateName(value: string): string | null {
  if (!value) return 'O nome é obrigatório.';
  if (value.length < 3) return 'O nome deve ter no mínimo 3 caracteres.';
  if (value.length > 100) return 'O nome deve ter no máximo 100 caracteres.';
  return null;
}

export function validateTitle(value: string): string | null {
  if (value.length > 0 && value.trim().length < 3) {
    return 'O título deve ter no mínimo 3 caracteres.';
  }
  if (value.trim().length > 100) {
    return 'O título deve ter no máximo 100 caracteres.';
  }
  return null;
}

export function validateDescription(value: string): string | null {
  if (value.length > 5000) return 'A descrição deve ter no máximo 500 caracteres.';
  return null;
}

export function validateDueDate(value: string): string | null {
  if (!value) return 'O prazo é obrigatório.';
  return null;
}

export function validateTask(values: TaskInput): Errors<TaskInput> {
  const errors: Errors<TaskInput> = {};
  const title = validateTitle(values.title);
  if (title) errors.title = title;
  const description = validateDescription(values.description);
  if (description) errors.description = description;
  const dueDate = validateDueDate(values.dueDate);
  if (dueDate) errors.dueDate = dueDate;
  return errors;
}

export function validateUser(values: UserInput, options: { requirePassword?: boolean } = {}): Errors<UserInput> {
  const errors: Errors<UserInput> = {};
  const name = validateName(values.name);
  if (name) errors.name = name;
  const email = validateEmail(values.email);
  if (email) errors.email = email;
  if (options.requirePassword) {
    if (!values.password) errors.password = 'A senha é obrigatória.';
    else if (values.password.length < 6) errors.password = 'A senha deve ter no mínimo 6 caracteres.';
  }
  return errors;
}

export function hasErrors(errors: Record<string, unknown>): boolean {
  return Object.values(errors).some(Boolean);
}
