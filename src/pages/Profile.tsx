import { useEffect, useState, type FormEvent } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Field } from '../components/Field';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { updateUser } from '../services/firebase/users';
import { countTasksByUser } from '../services/firebase/tasks';
import { formatDate } from '../utils/date';
import { friendlyError, initials } from '../utils/format';
import { ROLE_LABEL, type Role } from '../types';

export function ProfilePage() {
  const { profile, refreshProfile, isAdmin } = useAuth();
  const { success, error: notifyError } = useToast();

  const [name, setName] = useState(profile?.name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [role, setRole] = useState<Role>(profile?.role ?? 'USER');
  const [nameError, setNameError] = useState<string | undefined>();
  const [taskCount, setTaskCount] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setEmail(profile.email);
    setRole(profile.role);
    countTasksByUser(profile.id)
      .then(setTaskCount)
      .catch(() => setTaskCount(null));
  }, [profile?.id]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!profile) return;

    if (!name) {
      setNameError('O nome é obrigatório.');
      return;
    }
    setNameError(undefined);

    setSaving(true);
    try {
      await updateUser(profile.id, { name, email, role });
      await refreshProfile();
      success('Perfil atualizado com sucesso.');
    } catch (error) {
      notifyError(friendlyError(error));
    } finally {
      setSaving(false);
    }
  }

  if (!profile) return null;

  return (
    <>
      <PageHeader title="Meu perfil" subtitle="Atualize seus dados pessoais." />

      <section className="card card--profile">
        <span className="avatar avatar--lg">{initials(profile.name)}</span>
        <div>
          <h2 className="profile__name">{profile.name}</h2>
          <p className="muted">{profile.email}</p>
          <div className="profile__tags">
            <span className="tag">{ROLE_LABEL[profile.role] ?? '—'}</span>
            <span className="tag">{profile.status}</span>
            <span className="tag">Desde {formatDate(profile.createdAt)}</span>
            <span className="tag">{taskCount ?? 0} tarefa(s)</span>
          </div>
        </div>
      </section>

      <section className="card">
        <form className="form form--grid" onSubmit={handleSubmit} noValidate>
          <Field label="Nome" htmlFor="profile-name" error={nameError}>
            <input
              id="profile-name"
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>

          <Field label="E-mail" htmlFor="profile-email">
            <input
              id="profile-email"
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>

          <Field
            label="Perfil de acesso"
            htmlFor="profile-role"
            hint={isAdmin ? undefined : 'Somente um administrador pode alterar o perfil de acesso.'}
          >
            <select
              id="profile-role"
              className={`input${isAdmin ? '' : ' is-locked'}`}
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
            >
              <option value="USER">Usuário</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </Field>

          <div className="form__actions">
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
