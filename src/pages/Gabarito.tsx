import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { auth } from '../services/firebase/config';
import { Spinner } from '../components/Spinner';
import { GabaritoEmpty } from './gabarito/GabaritoEmpty';
import { GabaritoNotFound } from './gabarito/GabaritoNotFound';
import {
  SEVERIDADES,
  STATUS_LABEL,
  bugStatus,
  severityClass,
  useGabarito,
  type BugStatus,
} from './gabarito/useGabarito';

const FILTROS_STATUS: { valor: string; rotulo: string }[] = [
  { valor: '', rotulo: 'Todos' },
  { valor: 'pendente', rotulo: 'Pendentes' },
  { valor: 'encontrado', rotulo: 'Encontrados' },
  { valor: 'parcial', rotulo: 'Parciais' },
  { valor: 'corrigido', rotulo: 'Corrigidos' },
];

/**
 * Índice do gabarito interno (/gabarito).
 *
 * Cada defeito abre em uma página própria (`/gabarito/BUG-001`), o que dá
 * espaço para a leitura, gera um link direto para cada item e faz o botão
 * voltar do navegador funcionar. Os filtros ficam na query string para
 * sobreviverem à ida e volta.
 */
export function GabaritoPage() {
  const { state, bugs, updatedAt, email, persistido, atualizar, atualizando } = useGabarito();
  const [params, setParams] = useSearchParams();

  const busca = params.get('q') ?? '';
  const area = params.get('area') ?? '';
  const severidade = params.get('sev') ?? '';
  const status = params.get('status') ?? '';

  function mudar(chave: string, valor: string) {
    const proximos = new URLSearchParams(params);
    if (valor) proximos.set(chave, valor);
    else proximos.delete(chave);
    setParams(proximos, { replace: true });
  }

  const areas = useMemo(
    () => Array.from(new Set(bugs.map((bug) => bug.area))).sort((a, b) => a.localeCompare(b)),
    [bugs],
  );

  const placar = useMemo(() => {
    const contagem: Record<BugStatus, number> = {
      corrigido: 0,
      encontrado: 0,
      parcial: 0,
      pendente: 0,
    };
    bugs.forEach((bug) => {
      contagem[bugStatus(bug)] += 1;
    });
    return contagem;
  }, [bugs]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return bugs.filter((bug) => {
      const alvo = `${bug.id} ${bug.titulo} ${bug.area} ${bug.porque}`.toLowerCase();
      return (
        (!termo || alvo.includes(termo)) &&
        (!severidade || bug.severidade === severidade) &&
        (!area || bug.area === area) &&
        (!status || bugStatus(bug) === status)
      );
    });
  }, [bugs, busca, severidade, area, status]);

  if (state === 'loading' || state === 'publishing') {
    return (
      <div className="page-loader">
        <Spinner label={state === 'publishing' ? 'Publicando o gabarito...' : 'Carregando...'} />
      </div>
    );
  }

  if (state === 'denied') return <GabaritoNotFound />;

  if (state === 'empty') return <GabaritoEmpty email={email} />;

  const restantes = placar.pendente + placar.parcial + placar.encontrado;

  return (
    <div className="gab">
      <header className="gab__bar">
        <div>
          <strong>Gabarito interno — TaskFlow</strong>
          <small>
            {bugs.length} defeitos catalogados
            {updatedAt ? ` · publicado em ${updatedAt.toLocaleString('pt-BR')}` : ''}
            {persistido ? '' : ' · exibido a partir do repositório (não gravado no projeto)'}
          </small>
        </div>
        <div className="gab__bar-actions">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={atualizar}
            disabled={atualizando}
            title="Recarrega o gabarito a partir do repositório"
          >
            {atualizando ? 'Atualizando...' : 'Atualizar'}
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => auth.signOut().then(() => window.location.assign('/login'))}
          >
            Sair
          </button>
        </div>
      </header>

      <section className="gab__placar">
        <div className="gab__placar-total">
          <span className="gab__placar-rotulo">Ainda plantados</span>
          <strong>
            {restantes}
            <em>de {bugs.length}</em>
          </strong>
        </div>
        <div className="gab__placar-barra" aria-hidden="true">
          <span
            className="gab__placar-fatia gab__placar-fatia--corrigido"
            style={{ width: `${(placar.corrigido / bugs.length) * 100}%` }}
          />
          <span
            className="gab__placar-fatia gab__placar-fatia--parcial"
            style={{ width: `${(placar.parcial / bugs.length) * 100}%` }}
          />
        </div>
        <div className="gab__placar-legenda">
          <span>
            <i className="ponto ponto--corrigido" /> {placar.corrigido} corrigidos
          </span>
          <span>
            <i className="ponto ponto--encontrado" /> {placar.encontrado} encontrados
          </span>
          <span>
            <i className="ponto ponto--parcial" /> {placar.parcial}{' '}
            {placar.parcial === 1 ? 'parcial' : 'parciais'}
          </span>
          <span>
            <i className="ponto ponto--pendente" /> {placar.pendente} pendentes
          </span>
        </div>
      </section>

      <section className="gab__summary">
        {SEVERIDADES.map((nivel) => {
          const total = bugs.filter((bug) => bug.severidade === nivel).length;
          const abertos = bugs.filter(
            (bug) => bug.severidade === nivel && bugStatus(bug) !== 'corrigido',
          ).length;
          const ativo = severidade === nivel;
          return (
            <button
              key={nivel}
              type="button"
              className={`gab__stat${ativo ? ' is-active' : ''}`}
              onClick={() => mudar('sev', ativo ? '' : nivel)}
            >
              <span className={severityClass(nivel)}>{nivel}</span>
              <strong>
                {abertos}
                <em>/{total}</em>
              </strong>
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
          onChange={(event) => mudar('q', event.target.value)}
        />
        <select className="input" value={area} onChange={(event) => mudar('area', event.target.value)}>
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

      <nav className="gab__abas" aria-label="Filtrar por situação">
        {FILTROS_STATUS.map((filtro) => (
          <button
            key={filtro.valor}
            type="button"
            className={`gab__aba${status === filtro.valor ? ' is-active' : ''}`}
            onClick={() => mudar('status', filtro.valor)}
          >
            {filtro.rotulo}
          </button>
        ))}
      </nav>

      {filtrados.length === 0 ? (
        <p className="gab__empty">Nenhum defeito corresponde ao filtro.</p>
      ) : (
        <ul className="gab__cards">
          {filtrados.map((bug) => {
            const situacao = bugStatus(bug);
            return (
              <li key={bug.id}>
                <Link
                  className={`gab__card gab__card--${situacao}`}
                  to={`/gabarito/${bug.id}${params.toString() ? `?${params}` : ''}`}
                >
                  <div className="gab__card-head">
                    <span className="gab__item-id">{bug.id}</span>
                    <span className={severityClass(bug.severidade)}>{bug.severidade}</span>
                  </div>
                  <h2 className="gab__card-title">{bug.titulo}</h2>
                  <p className="gab__card-porque">{bug.porque}</p>
                  <div className="gab__tags">
                    <span className={`situacao situacao--${situacao}`}>
                      {STATUS_LABEL[situacao]}
                    </span>
                    <span className="tag">{bug.area}</span>
                    <span className="tag">Dificuldade: {bug.dificuldade}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
