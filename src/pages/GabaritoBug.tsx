import { Link, useLocation, useParams } from 'react-router-dom';
import { Spinner } from '../components/Spinner';
import { GabaritoEmpty } from './gabarito/GabaritoEmpty';
import { GabaritoNotFound } from './gabarito/GabaritoNotFound';
import { severityClass, useGabarito } from './gabarito/useGabarito';

/** Página dedicada a um defeito do gabarito (/gabarito/BUG-001). */
export function GabaritoBugPage() {
  const { bugId } = useParams();
  const { search } = useLocation();
  const { state, bugs, email } = useGabarito();

  if (state === 'loading' || state === 'publishing') {
    return (
      <div className="page-loader">
        <Spinner label={state === 'publishing' ? 'Publicando o gabarito...' : 'Carregando...'} />
      </div>
    );
  }

  if (state === 'denied') return <GabaritoNotFound />;

  if (state === 'empty') return <GabaritoEmpty email={email} />;

  const indice = bugs.findIndex((item) => item.id.toLowerCase() === (bugId ?? '').toLowerCase());
  const bug = indice >= 0 ? bugs[indice] : null;
  const voltar = `/gabarito${search}`;

  if (!bug) {
    return (
      <div className="page-loader">
        <div className="empty-state">
          <h3>Defeito não encontrado</h3>
          <p>Não existe nenhum item com o identificador informado.</p>
          <Link className="btn btn--primary" to={voltar}>
            Voltar ao gabarito
          </Link>
        </div>
      </div>
    );
  }

  const anterior = bugs[indice - 1];
  const proximo = bugs[indice + 1];

  return (
    <div className="gab gab--single">
      <header className="gab__bar">
        <Link className="gab__back" to={voltar}>
          ← Voltar ao gabarito
        </Link>
        <div className="gab__bar-actions">
          {anterior && (
            <Link className="btn btn--ghost btn--sm" to={`/gabarito/${anterior.id}${search}`}>
              {anterior.id}
            </Link>
          )}
          {proximo && (
            <Link className="btn btn--ghost btn--sm" to={`/gabarito/${proximo.id}${search}`}>
              {proximo.id}
            </Link>
          )}
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => window.print()}>
            Imprimir / PDF
          </button>
        </div>
      </header>

      <article className="gab__detail">
        <header className="gab__detail-head">
          <span className="gab__item-id">{bug.id}</span>
          <h1>{bug.titulo}</h1>
          <div className="gab__tags">
            <span className={severityClass(bug.severidade)}>{bug.severidade}</span>
            <span className="tag">{bug.area}</span>
            <span className="tag">Dificuldade: {bug.dificuldade}</span>
          </div>
        </header>

        <section className="gab__block">
          <h2>Por que acontece</h2>
          <p>{bug.porque}</p>
          <ul className="gab__files">
            {bug.local.map((item) => (
              <li key={item}>
                <code>{item}</code>
              </li>
            ))}
          </ul>
        </section>

        <section className="gab__block">
          <h2>Como replicar</h2>
          <ol className="gab__steps">
            {bug.passos.map((passo, index) => (
              <li key={index}>{passo}</li>
            ))}
          </ol>
        </section>

        <section className="gab__block gab__compare">
          <div className="gab__expected">
            <h3>Resultado esperado</h3>
            <p>{bug.esperado}</p>
          </div>
          <div className="gab__actual">
            <h3>Resultado atual</h3>
            <p>{bug.atual}</p>
          </div>
        </section>

        {(bug.descoberta || bug.observacoes) && (
          <section className="gab__block gab__notes">
            {bug.descoberta && (
              <p>
                <strong>Como o QA chega nele:</strong> {bug.descoberta}
              </p>
            )}
            {bug.observacoes && (
              <p>
                <strong>Observações:</strong> {bug.observacoes}
              </p>
            )}
          </section>
        )}
      </article>
    </div>
  );
}
