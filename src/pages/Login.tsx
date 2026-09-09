import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Field } from '../components/Field';
import { validateEmail } from '../utils/validators';
import { friendlyError } from '../utils/format';

export function LoginPage() {
  const { login } = useAuth();
  const { success, error: notifyError } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const emailProblem = validateEmail(email);
    setEmailError(emailProblem);
    if (emailProblem) return;

    setSubmitting(true);
    try {
      await login(email, password);
      success('Bem-vindo ao TaskFlow!');
      navigate('/dashboard');
    } catch (error) {
      notifyError(friendlyError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <span className="sidebar__logo">TF</span>
          <div>
            <strong>TaskFlow</strong>
            <small>Gestão de tarefas</small>
          </div>
        </div>

        <h1 className="auth-card__title">Entrar na sua conta</h1>
        <p className="auth-card__subtitle">Informe suas credenciais para acessar o sistema.</p>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <Field label="E-mail" htmlFor="email" error={emailError ?? undefined}>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="username"
              placeholder="voce@taskflow.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>

          <Field label="Senha" htmlFor="password">
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>

          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <Link className="auth-card__link" to="/forgot-password">
          Esqueci minha senha
        </Link>
      </div>
    </div>
  );
}
