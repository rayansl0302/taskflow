import { Link } from 'react-router-dom';

/**
 * Resposta padrão para quem não tem acesso ao gabarito.
 *
 * Deliberadamente igual a uma rota inexistente: quem não é a conta responsável
 * não descobre que existe conteúdo por trás desta URL.
 */
export function GabaritoNotFound() {
  return (
    <div className="page-loader">
      <div className="empty-state">
        <h3>Página não encontrada</h3>
        <p>O endereço acessado não existe ou não está disponível.</p>
        <Link className="btn btn--primary" to="/dashboard">
          Ir para o início
        </Link>
      </div>
    </div>
  );
}
