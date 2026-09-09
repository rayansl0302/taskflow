import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../contexts/ToastContext';
import { deleteUser, listUsers } from '../services/firebase/users';
import { formatDate } from '../utils/date';
import { friendlyError, initials } from '../utils/format';
import { ROLE_LABEL, type AppUser } from '../types';

export function UsersPage() {
  const { success, error: notifyError } = useToast();
  const navigate = useNavigate();

  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        setUsers(await listUsers());
      } catch (error) {
        notifyError(friendlyError(error));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !search || user.name.includes(search) || user.email.includes(search.toLowerCase());
      const matchesRole = !role || user.role === role;
      const matchesStatus = !status || user.status === status;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, role, status]);

  async function handleDelete(user: AppUser) {
    try {
      await deleteUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      success('Usuário excluído com sucesso.');
    } catch (error) {
      notifyError(friendlyError(error));
    }
  }

  return (
    <>
      <PageHeader
        title="Usuários"
        subtitle="Gerencie os usuários que têm acesso ao TaskFlow."
        actions={
          <Link className="btn btn--primary" to="/users/new">
            Novo usuário
          </Link>
        }
      />

      <section className="card">
        <div className="filters">
          <input
            className="input"
            type="search"
            placeholder="Pesquisar por nome ou e-mail"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select className="input" value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="">Todos os perfis</option>
            <option value="ADMIN">Administrador</option>
            <option value="USER">Usuário</option>
          </select>
          <select className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Todos os status</option>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
          </select>
        </div>

        <p className="muted results-count">{filtered.length} usuário(s) encontrado(s)</p>

        {loading ? (
          <Spinner label="Carregando usuários..." />
        ) : filtered.length === 0 ? (
          <EmptyState title="Nenhum usuário encontrado" description="Ajuste os filtros da busca." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Criado em</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <span className="avatar avatar--sm">{initials(user.name)}</span>
                      <Link className="link" to={`/users/${user.id}`}>
                        {user.name}
                      </Link>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{ROLE_LABEL[user.role] ?? '—'}</td>
                  <td>
                    <span className={`badge badge--${user.status.toLowerCase()}`}>{user.status}</span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td className="table__actions">
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => navigate(`/users/${user.id}`)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={() => handleDelete(user)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
