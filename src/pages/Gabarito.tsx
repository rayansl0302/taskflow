import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { auth } from '../services/firebase/config';
import { Spinner } from '../components/Spinner';
import { GabaritoEmpty } from './gabarito/GabaritoEmpty';
import { GabaritoNotFound } from './gabarito/GabaritoNotFound';
import { SEVERIDADES, severityClass, useGabarito } from './gabarito/useGabarito';

/**
 * Índice do gabarito interno (/gabarito).
 *
 * Cada defeito abre em uma página própria (`/gabarito/BUG-001`), o que dá
 * espaço para a leitura, gera um link direto para cada item e faz o botão
 * voltar do navegador funcionar. Os filtros ficam na query string para
 * sobreviverem à ida e volta.
 */
export function GabaritoPage() {
  const { state, bugs, updatedAt, email } = useGabarito();
  const [params, setParams] = useSearchParams();

  const busca = params.get('q') ?? '';
  const area = params.get('area') ?? '';
  const severidade = params.get('sev') ?? '';

  function atualizar(chave: string, valor: string) {
    const proximos = new URLSearchParams(params);
    if (valor) proximos.set(chave, valor);
    else proximos.delete(chave);
    setParams(proximos, { replace: true });
  }

  const areas = useMemo(
    () => Array.from(new Set(bugs.map((bug) => bug.area))).sort((a, b) => a.localeCompare(b)),
    [bugs],
  );

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return bugs.filter((bug) => {
      const alvo = `${bug.id} ${bug.titulo} ${bug.area} ${bug.porque}`.toLowerCase();
      return (
        (!termo || alvo.includes(termo)) &&
        (!severidade || bug.severidade === severidade) &&
        (!area || bug.area === area)
      );
    });
  }, [bugs, busca, severidade, area]);

  if (state === 'loading') {
    return (
      <div className="page-loader">
        <Spinner label="Carregando..." />
      </div>
    );
  }

  if (state === 'denied') return <GabaritoNotFound />;

  if (state === 'empty') return <GabaritoEmpty email={email} />;

  return (
    <div className="gab">
      <header className="gab__bar">
        <div>
          <strong>Gabarito interno — TaskFlow</strong>
          <small>
            {bugs.length} defeitos catalogados
            {updatedAt ? ` · publicado em ${updatedAt.toLocaleString('pt-BR')}` : ''}
          </small>
        </div>
        <div className="gab__bar-actions">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => auth.signOut().then(() => window.location.assign('/login'))}
          >
            Sair
          </button>
        </div>
      </header>

      <section className="gab__summary">
        {SEVERIDADES.map((nivel) => {
          const total = bugs.filter((bug) => bug.severidade === nivel).length;
          const ativo = severidade === nivel;
          return (
            <button
              key={nivel}
              type="button"
              className={`gab__stat${ativo ? ' is-active' : ''}`}
              onClick={() => atualizar('sev', ativo ? '' : nivel)}
            >
              <span className={severityClass(nivel)}>{nivel}</span>
              <strong>{total}</strong>
            </button>
          );
        })}
      </section>

      <section className="gab__filters-bar">
        <input
          className="input"
          type="search"
          placeholder="Buscar por id, título, área ou causa"
          value={busca}
          onChange={(event) => atualizar('q', event.target.value)}
        />
        <select className="input" value={area} onChange={(event) => atualizar('area', event.target.value)}>
          <option value="">Todas as áreas</option>
          {areas.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <span className="gab__count">
          {filtrados.length} de {bugs.length}
        </span>
      </section>

      {filtrados.length === 0 ? (
        <p className="gab__empty">Nenhum defeito corresponde ao filtro.</p>
      ) : (
        <ul className="gab__cards">
          {filtrados.map((bug) => (
            <li key={bug.id}>
              <Link className="gab__card" to={`/gabarito/${bug.id}${params.toString() ? `?${params}` : ''}`}>
                <div className="gab__card-head">
                  <span className="gab__item-id">{bug.id}</span>
                  <span className={severityClass(bug.severidade)}>{bug.severidade}</span>
                </div>
                <h2 className="gab__card-title">{bug.titulo}</h2>
                <p className="gab__card-porque">{bug.porque}</p>
                <div className="gab__tags">
                  <span className="tag">{bug.area}</span>
                  <span className="tag">Dificuldade: {bug.dificuldade}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
