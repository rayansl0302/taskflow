import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Field } from '../components/Field';
import { requestPasswordReset } from '../services/firebase/auth';
import { useToast } from '../contexts/ToastContext';

export function ForgotPasswordPage() {
  const { success } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
    } catch {
      // e-mails nao cadastrados nao sao revelados ao usuario
    } finally {
      setSubmitting(false);
      setSent(true);
      success('Enviamos um link de recuperação para o seu e-mail.');
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
            <Field label="E-mail" htmlFor="reset-email">
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
