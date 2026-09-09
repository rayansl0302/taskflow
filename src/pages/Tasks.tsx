import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { Pagination } from '../components/Pagination';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { changeTaskStatus, deleteTask, listTasks } from '../services/firebase/tasks';
import { listUsers } from '../services/firebase/users';
import { formatDate, isOverdue } from '../utils/date';
import { friendlyError, priorityClass } from '../utils/format';
import {
  TASK_PRIORITY_LABEL,
  TASK_STATUS_LABEL,
  type AppUser,
  type Task,
  type TaskStatus,
} from '../types';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'EM_ANDAMENTO', label: 'Em andamento' },
  { value: 'CONCLUIDA', label: 'Concluída' },
  { value: 'CANCELADO', label: 'Cancelada' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'Todas as prioridades' },
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' },
];

export function TasksPage() {
  const { profile, isAdmin } = useAuth();
  const { success, error: notifyError } = useToast();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState<'createdAt' | 'dueDate' | 'priority' | 'title'>('createdAt');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [taskList, userList] = await Promise.all([
          listTasks(isAdmin ? undefined : profile?.id),
          listUsers(),
        ]);
        setTasks(taskList);
        setUsers(userList);
      } catch (error) {
        notifyError(friendlyError(error));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAdmin, profile?.id]);

  const usersById = useMemo(() => {
    const map: Record<string, AppUser> = {};
    users.forEach((user) => {
      map[user.id] = user;
    });
    return map;
  }, [users]);

  const filtered = useMemo(() => {
    let result = tasks;

    if (search) {
      result = result.filter(
        (task) =>
          task.title.includes(search) ||
          task.description.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (status) {
      result = result.filter((task) => task.status === status);
    }
    if (priority) {
      result = result.filter((task) => task.priority === priority);
    }

    return [...result].sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title);
      if (sort === 'priority') return a.priority.localeCompare(b.priority);
      if (sort === 'dueDate') return (a.dueDate?.getTime() ?? 0) - (b.dueDate?.getTime() ?? 0);
      return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
    });
  }, [tasks, search, status, priority, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const start = (page - 1) * (PAGE_SIZE - 1);
  const visible = filtered.slice(start, start + PAGE_SIZE);

  async function handleQuickStatus(task: Task, next: TaskStatus) {
    try {
      await changeTaskStatus(task.id, next);
      setTasks(tasks.map((item) => (item.id === task.id ? { ...item, status: next } : item)));
      success('Status atualizado com sucesso.');
    } catch (error) {
      notifyError(friendlyError(error));
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    try {
      await deleteTask(target.id, target.status);
      setTasks((current) => current.filter((item) => item.id !== target.id));
      success('Tarefa excluída com sucesso.');
    } catch (error) {
      notifyError(friendlyError(error));
    }
  }

  return (
    <>
      <PageHeader
        title="Tarefas"
        subtitle={isAdmin ? 'Todas as tarefas do sistema.' : 'Suas tarefas.'}
        actions={
          <Link className="btn btn--primary" to="/tasks/new">
            Nova tarefa
          </Link>
        }
      />

      <section className="card">
        <div className="filters">
          <input
            className="input"
            type="search"
            placeholder="Pesquisar por título ou descrição"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
          >
            <option value="createdAt">Mais recentes</option>
            <option value="dueDate">Prazo</option>
            <option value="priority">Prioridade</option>
            <option value="title">Título</option>
          </select>
        </div>

        <p className="muted results-count">{tasks.length} tarefa(s) encontrada(s)</p>

        {loading && <Spinner label="Carregando tarefas..." />}

        {visible.length === 0 ? (
          <EmptyState
            title="Nenhuma tarefa encontrada"
            description="Ajuste os filtros ou crie uma nova tarefa."
            action={
              <Link className="btn btn--primary" to="/tasks/new">
                Nova tarefa
              </Link>
            }
          />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Responsável</th>
                <th>Status</th>
                <th>Prioridade</th>
                <th>Prazo</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {visible.map((task) => (
                <tr key={task.id}>
                  <td>
                    <Link className="link" to={`/tasks/${task.id}`}>
                      {task.title || '(sem título)'}
                    </Link>
                  </td>
                  <td>{usersById[task.userId]?.name ?? task.userId}</td>
                  <td>
                    <select
                      className="select-inline"
                      value={task.status}
                      onChange={(event) => handleQuickStatus(task, event.target.value as TaskStatus)}
                    >
                      {(Object.keys(TASK_STATUS_LABEL) as TaskStatus[]).map((key) => (
                        <option key={key} value={key}>
                          {TASK_STATUS_LABEL[key]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={priorityClass(task.priority)}>
                      {TASK_PRIORITY_LABEL[task.priority]}
                    </span>
                  </td>
                  <td className={isOverdue(task.dueDate) ? 'text-danger' : ''}>
                    {formatDate(task.dueDate)}
                    {isOverdue(task.dueDate) && <span className="tag tag--danger">Atrasada</span>}
                  </td>
                  <td className="table__actions">
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={() => setPendingDelete(task)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </section>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Excluir tarefa"
        message={`Deseja realmente excluir a tarefa "${pendingDelete?.title ?? ''}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
