import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Field } from '../components/Field';
import { Spinner } from '../components/Spinner';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { createTask, deleteTask, getTask, updateTask } from '../services/firebase/tasks';
import { listUsers } from '../services/firebase/users';
import { toDateInputValue, formatDateTime } from '../utils/date';
import { friendlyError } from '../utils/format';
import { hasErrors, validateTask, validateTitle } from '../utils/validators';
import {
  TASK_PRIORITY_LABEL,
  TASK_STATUS_LABEL,
  type AppUser,
  type Task,
  type TaskInput,
  type TaskPriority,
  type TaskStatus,
} from '../types';

const EMPTY: TaskInput = {
  title: '',
  description: '',
  userId: '',
  status: 'PENDENTE',
  priority: 'MEDIA',
  dueDate: '',
};

export function TaskFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { profile, isAdmin } = useAuth();
  const { success, error: notifyError } = useToast();
  const navigate = useNavigate();

  const [values, setValues] = useState<TaskInput>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [users, setUsers] = useState<AppUser[]>([]);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    if (!id) {
      setValues((current) => ({ ...current, userId: profile?.id ?? '' }));
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const found = await getTask(id as string);
        if (!found) {
          notifyError('Tarefa não encontrada.');
          navigate('/tasks');
          return;
        }
        setTask(found);
        setValues({
          title: found.title,
          description: found.description,
          userId: found.userId,
          status: found.status,
          priority: found.priority,
          dueDate: toDateInputValue(found.dueDate),
        });
      } catch (error) {
        notifyError(friendlyError(error));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, profile?.id]);

  function update<K extends keyof TaskInput>(key: K, value: TaskInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const validation = validateTask(values);
    setErrors(validation);
    if (hasErrors(validation)) return;

    setSaving(true);
    try {
      if (isEdit && id) {
        await updateTask(id, values);
        success('Tarefa atualizada com sucesso.');
      } else {
        await createTask(values);
        success('Tarefa criada com sucesso.');
      }
      navigate('/dashboard');
    } catch (error) {
      notifyError(friendlyError(error));
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!task) return;
    setConfirmDelete(false);
    try {
      await deleteTask(task.id, task.status);
      success('Tarefa excluída com sucesso.');
      navigate('/tasks');
    } catch (error) {
      notifyError(friendlyError(error));
    }
  }

  if (loading) return <Spinner label="Carregando tarefa..." />;

  const owner = users.find((user) => user.id === values.userId);

  return (
    <>
      <PageHeader
        title={isEdit ? 'Detalhes da tarefa' : 'Nova tarefa'}
        subtitle={isEdit ? 'Visualize e edite as informações da tarefa.' : 'Preencha os dados da tarefa.'}
        actions={
          <Link className="btn btn--ghost" to="/tasks">
            Voltar
          </Link>
        }
      />

      {isEdit && task && (
        <section className="card card--meta">
          <div>
            <span className="meta__label">Responsável</span>
            <strong>{owner?.name ?? task.userId}</strong>
          </div>
          <div>
            <span className="meta__label">Criada em</span>
            <strong>{formatDateTime(task.createdAt)}</strong>
          </div>
          <div>
            <span className="meta__label">Última atualização</span>
            <strong>{formatDateTime(task.updatedAt)}</strong>
          </div>
        </section>
      )}

      <section className="card">
        <form className="form form--grid" onSubmit={handleSubmit} noValidate>
          <Field label="Título" htmlFor="title" error={errors.title}>
            <input
              id="title"
              className="input"
              maxLength={100}
              value={values.title}
              onChange={(event) => update('title', event.target.value)}
              onBlur={(event) =>
                setErrors((current) => ({
                  ...current,
                  title: validateTitle(event.target.value) ?? undefined,
                }))
              }
              placeholder="Ex.: Revisar contrato do fornecedor"
            />
          </Field>

          <Field
            label="Descrição"
            htmlFor="description"
            error={errors.description}
            hint={`${values.description.length}/500 caracteres`}
          >
            <textarea
              id="description"
              className="input textarea"
              rows={4}
              value={values.description}
              onChange={(event) => update('description', event.target.value)}
              placeholder="Detalhe o que precisa ser feito"
            />
          </Field>

          <Field label="Responsável" htmlFor="userId">
            <select
              id="userId"
              className="input"
              value={values.userId}
              disabled={!isAdmin}
              onChange={(event) => update('userId', event.target.value)}
            >
              <option value="">Selecione</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Status" htmlFor="status">
            <select
              id="status"
              className="input"
              value={values.status}
              onChange={(event) => update('status', event.target.value as TaskStatus)}
            >
              {(Object.keys(TASK_STATUS_LABEL) as TaskStatus[]).map((key) => (
                <option key={key} value={key}>
                  {TASK_STATUS_LABEL[key]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Prioridade" htmlFor="priority">
            <select
              id="priority"
              className="input"
              value={values.priority}
              onChange={(event) => update('priority', event.target.value as TaskPriority)}
            >
              {(Object.keys(TASK_PRIORITY_LABEL) as TaskPriority[]).map((key) => (
                <option key={key} value={key}>
                  {TASK_PRIORITY_LABEL[key]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Prazo" htmlFor="dueDate" error={errors.dueDate}>
            <input
              id="dueDate"
              className="input"
              type="date"
              value={values.dueDate}
              onChange={(event) => update('dueDate', event.target.value)}
            />
          </Field>

          <div className="form__actions">
            <button type="button" className="btn btn--ghost" onClick={() => navigate('/tasks')}>
              Cancelar
            </button>
            {isEdit && (
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => setConfirmDelete(true)}
              >
                Excluir
              </button>
            )}
            <button type="submit" className="btn btn--primary">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </section>

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir tarefa"
        message="Deseja realmente excluir esta tarefa? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
