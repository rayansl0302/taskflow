import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Field } from '../components/Field';
import { requestPasswordReset } from '../services/firebase/auth';
import { useToast } from '../contexts/ToastContext';
import { friendlyError } from '../utils/format';
import { validateEmail } from '../utils/validators';

export function ForgotPasswordPage() {
  const { success, error: notifyError } = useToast();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const problem = validateEmail(normalizedEmail);
    setEmailError(problem);
    if (problem) return;

    setSubmitting(true);
    try {
      await requestPasswordReset(normalizedEmail);
      setSent(true);
      success('Enviamos um link de recuperação para o seu e-mail.');
    } catch (error) {
      notifyError(friendlyError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card__title">Recuperar senha</h1>
        <p className="auth-card__subtitle">
          Informe o e-mail cadastrado e enviaremos um link para redefinir a senha.
        </p>

        {sent ? (
          <div className="alert alert--success">
            Se o e-mail informado estiver cadastrado, você receberá as instruções em instantes.
          </div>
        ) : (
          <form className="form" onSubmit={handleSubmit} noValidate>
            <Field label="E-mail" htmlFor="reset-email" error={emailError ?? undefined}>
              <input
                id="reset-email"
                className="input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@taskflow.com"
              />
            </Field>
            <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </form>
        )}

        <Link className="auth-card__link" to="/login">
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
