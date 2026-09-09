import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../contexts/AuthContext';
import { listTasksForMetrics } from '../services/firebase/tasks';
import { listUsers } from '../services/firebase/users';
import { formatDate, isOverdue } from '../utils/date';
import { statusClass } from '../utils/format';
import { TASK_STATUS_LABEL, type Task } from '../types';

interface Metrics {
  total: number;
  pending: number;
  inProgress: number;
  done: number;
  users: number;
}

const CACHE_KEY = 'taskflow:dashboard-metrics';
const CACHE_TTL = 10 * 60 * 1000;

function readCache(): { metrics: Metrics; savedAt: number } | null {
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function DashboardPage() {
  const { profile, isAdmin } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(() => readCache()?.metrics ?? null);
  const [recent, setRecent] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const cached = readCache();
      const fresh = Boolean(cached && Date.now() - cached.savedAt < CACHE_TTL);
      if (cached && fresh) {
        setMetrics(cached.metrics);
        setLoading(false);
      }

      const tasks = await listTasksForMetrics(isAdmin ? undefined : profile?.id);
      if (!active) return;
      setRecent(tasks.slice(0, 5));

      if (fresh) {
        setLoading(false);
        return;
      }

      const users = await listUsers();
      if (!active) return;

      const computed: Metrics = {
        total: tasks.length,
        pending: tasks.filter((task) => task.status === 'PENDENTE').length,
        inProgress: tasks.filter((task) => task.status === 'EM_ANDAMENTO').length,
        done: tasks.filter((task) => task.status === 'CONCLUIDA' || task.status === 'CANCELADA').length,
        users: users.length,
      };

      setMetrics(computed);
      setLoading(false);
      window.sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ metrics: computed, savedAt: Date.now() }),
      );
    }

    load();
    return () => {
      active = false;
    };
  }, [isAdmin, profile?.id]);

  if (loading && !metrics) {
    return <Spinner label="Carregando indicadores..." />;
  }

  const cards = [
    { label: 'Total de tarefas', value: metrics?.total ?? 0, tone: 'total' },
    { label: 'Pendentes', value: metrics?.pending ?? 0, tone: 'pending' },
    { label: 'Em andamento', value: metrics?.inProgress ?? 0, tone: 'progress' },
    { label: 'Concluídas', value: metrics?.done ?? 0, tone: 'done' },
    { label: 'Total de usuários', value: metrics?.users ?? 0, tone: 'users' },
  ];

  return (
    <>
      <PageHeader
        title={`Olá, ${profile?.name?.split(' ')[0] ?? ''}`}
        subtitle={
          isAdmin
            ? 'Visão geral de todas as tarefas e usuários do sistema.'
            : 'Visão geral das suas tarefas.'
        }
        actions={
          <Link className="btn btn--primary" to="/tasks/new">
            Nova tarefa
          </Link>
        }
      />

      <section className="metrics">
        {cards.map((card) => (
          <article key={card.label} className={`metric metric--${card.tone}`}>
            <span className="metric__label">{card.label}</span>
            <strong className="metric__value">{card.value}</strong>
          </article>
        ))}
      </section>

      <section className="card">
        <div className="card__header">
          <h2>Tarefas recentes</h2>
          <Link className="link" to="/tasks">
            Ver todas
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="muted">Nenhuma tarefa recente.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Status</th>
                <th>Prazo</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((task) => (
                <tr key={task.id}>
                  <td>
                    <Link className="link" to={`/tasks/${task.id}`}>
                      {task.title || '(sem título)'}
                    </Link>
                  </td>
                  <td>
                    <span className={statusClass(task.status)}>{TASK_STATUS_LABEL[task.status]}</span>
                  </td>
                  <td className={isOverdue(task.dueDate) ? 'text-danger' : ''}>
                    {formatDate(task.dueDate)}
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
