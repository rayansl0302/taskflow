import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase/config';
import { observeAuth } from '../services/firebase/auth';
import { Spinner } from '../components/Spinner';

interface Bug {
  id: string;
  titulo: string;
  area: string;
  severidade: 'CRÍTICA' | 'ALTA' | 'MÉDIA' | 'BAIXA';
  dificuldade: 'Alta' | 'Média' | 'Baixa';
  local: string[];
  porque: string;
  passos: string[];
  esperado: string;
  atual: string;
  descoberta?: string;
  observacoes?: string;
}

type State = 'loading' | 'denied' | 'ready';

const SEVERIDADES = ['CRÍTICA', 'ALTA', 'MÉDIA', 'BAIXA'] as const;

function severityClass(severidade: string) {
  const map: Record<string, string> = {
    'CRÍTICA': 'sev sev--critica',
    ALTA: 'sev sev--alta',
    'MÉDIA': 'sev sev--media',
    BAIXA: 'sev sev--baixa',
  };
  return map[severidade] ?? 'sev';
}

/**
 * Rota interna do desafio (/gabarito).
 *
 * A proteção real não está aqui: o documento `internal/qa-gabarito` só pode ser
 * lido pelo UID autorizado nas regras do Firestore. Qualquer outra pessoa que
 * abra esta URL — inclusive autenticada como ADMIN — recebe a tela de
 * "página não encontrada", porque a leitura é recusada pelo servidor.
 */
export function GabaritoPage() {
  const [state, setState] = useState<State>('loading');
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [severidade, setSeveridade] = useState('');
  const [area, setArea] = useState('');

  useEffect(() => {
    const unsubscribe = observeAuth(async (user) => {
      if (!user) {
        setState('denied');
        return;
      }
      try {
        const snapshot = await getDoc(doc(db, 'internal', 'qa-gabarito'));
        if (!snapshot.exists()) {
          setState('denied');
          return;
        }
        const data = snapshot.data();
        const list: Bug[] = data.bugs ?? [];
        setBugs(list);
        setUpdatedAt(data.updatedAt?.toDate?.() ?? null);
        setSelectedId(list[0]?.id ?? null);
        setState('ready');
      } catch {
        setState('denied');
      }
    });
    return unsubscribe;
  }, []);

  const areas = useMemo(
    () => Array.from(new Set(bugs.map((bug) => bug.area))).sort((a, b) => a.localeCompare(b)),
    [bugs],
  );

  const filtered = useMemo(() => {
    const termo = search.trim().toLowerCase();
    return bugs.filter((bug) => {
      const alvo = `${bug.id} ${bug.titulo} ${bug.area} ${bug.porque}`.toLowerCase();
      return (
        (!termo || alvo.includes(termo)) &&
        (!severidade || bug.severidade === severidade) &&
        (!area || bug.area === area)
      );
    });
  }, [bugs, search, severidade, area]);

  const selected = useMemo(
    () => filtered.find((bug) => bug.id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId],
  );

  if (state === 'loading') {
    return (
      <div className="page-loader">
        <Spinner label="Carregando..." />
      </div>
    );
  }

  if (state === 'denied') {
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
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => window.print()}>
            Imprimir / PDF
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

      <section className="gab__summary">
        {SEVERIDADES.map((nivel) => {
          const total = bugs.filter((bug) => bug.severidade === nivel).length;
          const ativo = severidade === nivel;
          return (
            <button
              key={nivel}
              type="button"
              className={`gab__stat${ativo ? ' is-active' : ''}`}
              onClick={() => setSeveridade(ativo ? '' : nivel)}
            >
              <span className={severityClass(nivel)}>{nivel}</span>
              <strong>{total}</strong>
            </button>
          );
        })}
      </section>

      <div className="gab__body">
        <aside className="gab__list">
          <div className="gab__filters">
            <input
              className="input"
              type="search"
              placeholder="Buscar por id, título, área ou causa"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select className="input" value={area} onChange={(event) => setArea(event.target.value)}>
              <option value="">Todas as áreas</option>
              {areas.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <p className="gab__count">{filtered.length} de {bugs.length}</p>

          <ul className="gab__items">
            {filtered.map((bug) => (
              <li key={bug.id}>
                <button
                  type="button"
                  className={`gab__item${selected?.id === bug.id ? ' is-active' : ''}`}
                  onClick={() => setSelectedId(bug.id)}
                >
                  <span className="gab__item-id">{bug.id}</span>
                  <span className="gab__item-title">{bug.titulo}</span>
                  <span className={severityClass(bug.severidade)}>{bug.severidade}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="gab__empty">Nenhum defeito corresponde ao filtro.</li>}
          </ul>
        </aside>

        <article className="gab__detail">
          {selected ? (
            <>
              <header className="gab__detail-head">
                <span className="gab__item-id">{selected.id}</span>
                <h1>{selected.titulo}</h1>
                <div className="gab__tags">
                  <span className={severityClass(selected.severidade)}>{selected.severidade}</span>
                  <span className="tag">{selected.area}</span>
                  <span className="tag">Dificuldade: {selected.dificuldade}</span>
                </div>
              </header>

              <section className="gab__block">
                <h2>Por que acontece</h2>
                <p>{selected.porque}</p>
                <ul className="gab__files">
                  {selected.local.map((item) => (
                    <li key={item}>
                      <code>{item}</code>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="gab__block">
                <h2>Como replicar</h2>
                <ol className="gab__steps">
                  {selected.passos.map((passo, index) => (
                    <li key={index}>{passo}</li>
                  ))}
                </ol>
              </section>

              <section className="gab__block gab__compare">
                <div className="gab__expected">
                  <h3>Resultado esperado</h3>
                  <p>{selected.esperado}</p>
                </div>
                <div className="gab__actual">
                  <h3>Resultado atual</h3>
                  <p>{selected.atual}</p>
                </div>
              </section>

              {(selected.descoberta || selected.observacoes) && (
                <section className="gab__block gab__notes">
                  {selected.descoberta && (
                    <p>
                      <strong>Como o QA chega nele:</strong> {selected.descoberta}
                    </p>
                  )}
                  {selected.observacoes && (
                    <p>
                      <strong>Observações:</strong> {selected.observacoes}
                    </p>
                  )}
                </section>
              )}
            </>
          ) : (
            <p className="muted">Selecione um defeito na lista.</p>
          )}
        </article>
      </div>
    </div>
  );
}
