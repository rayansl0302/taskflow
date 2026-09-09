import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Field } from '../components/Field';
import { Spinner } from '../components/Spinner';
import { useToast } from '../contexts/ToastContext';
import { createAuthAccount } from '../services/firebase/auth';
import { createUserProfile, getUser, updateUser } from '../services/firebase/users';
import { countTasksByUser } from '../services/firebase/tasks';
import { formatDate } from '../utils/date';
import { friendlyError } from '../utils/format';
import { hasErrors, validateUser } from '../utils/validators';
import type { Role, UserInput, UserStatus } from '../types';

const EMPTY: UserInput = {
  name: '',
  email: '',
  role: '' as Role,
  status: 'ATIVO',
  password: '',
};

export function UserFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { success, error: notifyError } = useToast();
  const navigate = useNavigate();

  const [values, setValues] = useState<UserInput>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const [taskCount, setTaskCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);
      try {
        const found = await getUser(id as string);
        if (!found) {
          notifyError('Usuário não encontrado.');
          navigate('/users');
          return;
        }
        setValues({
          name: found.name,
          email: found.email,
          role: found.role,
          status: found.status,
        });
        setCreatedAt(found.createdAt);
        setTaskCount(await countTasksByUser(found.id));
      } catch (error) {
        notifyError(friendlyError(error));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function update<K extends keyof UserInput>(key: K, value: UserInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const validation = validateUser(values, { requirePassword: !isEdit });
    setErrors(validation);
    if (hasErrors(validation)) return;

    setSaving(true);
    try {
      if (isEdit && id) {
        await updateUser(id, {
          name: values.name,
          email: values.email,
          role: values.role,
          status: values.status,
        });
        success('Usuário atualizado com sucesso.');
      } else {
        const account = await createAuthAccount(values.email, values.password as string, values.name);
        await createUserProfile(account.uid, values);
        success('Usuário criado com sucesso.');
      }
      navigate('/users');
    } catch (error) {
      notifyError(friendlyError(error));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner label="Carregando usuário..." />;

  return (
    <>
      <PageHeader
        title={isEdit ? 'Editar usuário' : 'Novo usuário'}
        subtitle={isEdit ? 'Atualize os dados de acesso do usuário.' : 'Cadastre um novo acesso ao sistema.'}
        actions={
          <Link className="btn btn--ghost" to="/users">
            Voltar
          </Link>
        }
      />

      {isEdit && (
        <section className="card card--meta">
          <div>
            <span className="meta__label">Data de criação</span>
            <strong>{formatDate(createdAt)}</strong>
          </div>
          <div>
            <span className="meta__label">Tarefas vinculadas</span>
            <strong>{taskCount ?? '—'}</strong>
          </div>
        </section>
      )}

      <section className="card">
        <form className="form form--grid" onSubmit={handleSubmit} noValidate>
          <Field label="Nome" htmlFor="name" error={errors.name}>
            <input
              id="name"
              className="input"
              maxLength={100}
              value={values.name}
              onChange={(event) => update('name', event.target.value)}
              placeholder="Nome completo"
            />
          </Field>

          <Field label="E-mail" htmlFor="user-email" error={errors.email}>
            <input
              id="user-email"
              className="input"
              type="email"
              value={values.email}
              onChange={(event) => update('email', event.target.value)}
              placeholder="usuario@taskflow.com"
            />
          </Field>

          {!isEdit && (
            <Field label="Senha inicial" htmlFor="user-password" error={errors.password}>
              <input
                id="user-password"
                className="input"
                type="password"
                value={values.password}
                onChange={(event) => update('password', event.target.value)}
                placeholder="Mínimo de 6 caracteres"
              />
            </Field>
          )}

          <Field label="Perfil" htmlFor="role" error={errors.role}>
            <select
              id="role"
              className="input"
              value={values.role}
              onChange={(event) => update('role', event.target.value as Role)}
            >
              <option value="">Selecione</option>
              <option value="ADMIN">Administrador</option>
              <option value="USER">Usuário</option>
            </select>
          </Field>

          <Field label="Status" htmlFor="user-status">
            <select
              id="user-status"
              className="input"
              value={values.status}
              onChange={(event) => update('status', event.target.value as UserStatus)}
            >
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </Field>

          <div className="form__actions">
            <button type="button" className="btn btn--ghost" onClick={() => navigate('/users')}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
