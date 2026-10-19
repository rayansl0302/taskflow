import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Endereço que não corresponde a nenhuma rota.
 *
 * Fica fora do `ProtectedRoute` de propósito: quem não está autenticado
 * também digita endereço errado, e mandar essa pessoa para o login apagaria
 * a informação de que o endereço é que não existe.
 */
export function NotFoundPage() {
  const { firebaseUser } = useAuth();
  const destino = firebaseUser ? '/dashboard' : '/login';

  return (
    <div className="page-loader">
      <section className="card card--notfound">
        <strong className="notfound__code">404</strong>
        <h1 className="notfound__title">Página não encontrada</h1>
        <p className="muted">
          O endereço digitado não existe ou a página foi removida. Confira o endereço ou volte
          para uma tela conhecida.
        </p>
        <Link className="btn btn--primary" to={destino}>
          {firebaseUser ? 'Voltar ao dashboard' : 'Ir para o login'}
        </Link>
      </section>
    </div>
  );
}
