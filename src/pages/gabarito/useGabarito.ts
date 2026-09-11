import { useEffect, useState } from 'react';
import { Timestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { observeAuth } from '../../services/firebase/auth';

/**
 * Origem do conteúdo quando o gabarito ainda não existe no projeto.
 *
 * O documento em `internal/qa-gabarito` só pode ser gravado pela conta
 * responsável, então a primeira publicação acontece aqui: a própria rota busca
 * o JSON versionado e grava. Das próximas vezes, o conteúdo vem do Firestore.
 */
const FONTE_PADRAO =
  'https://raw.githubusercontent.com/rayansl0302/taskflow/main/docs/gabarito.json';

export interface Bug {
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

/**
 * `denied`     — sem permissão de leitura (ou sem sessão): tratado como 404.
 * `publishing` — primeira publicação em andamento.
 * `empty`      — leitura permitida, mas não foi possível publicar automaticamente.
 * `ready`      — conteúdo carregado.
 */
export type GabaritoState = 'loading' | 'denied' | 'publishing' | 'empty' | 'ready';

export const SEVERIDADES = ['CRÍTICA', 'ALTA', 'MÉDIA', 'BAIXA'] as const;

export function severityClass(severidade: string): string {
  const map: Record<string, string> = {
    'CRÍTICA': 'sev sev--critica',
    ALTA: 'sev sev--alta',
    'MÉDIA': 'sev sev--media',
    BAIXA: 'sev sev--baixa',
  };
  return map[severidade] ?? 'sev';
}

interface Cache {
  bugs: Bug[];
  updatedAt: Date | null;
}

/** Evita reler o documento a cada navegação entre a lista e o detalhe. */
let cache: Cache | null = null;

/**
 * Publica o gabarito na primeira vez que a conta responsável abre a rota.
 *
 * Roda apenas depois de a leitura ter sido autorizada pelas regras, ou seja,
 * só nesta sessão. Devolve `null` quando não foi possível publicar — a tela
 * então explica o caminho manual.
 */
async function publicarGabarito(): Promise<Cache | null> {
  try {
    const fonte = import.meta.env.VITE_GABARITO_SOURCE_URL || FONTE_PADRAO;
    const resposta = await fetch(fonte, { cache: 'no-store' });
    if (!resposta.ok) return null;

    const dados = await resposta.json();
    const bugs: Bug[] = dados.bugs ?? [];
    if (bugs.length === 0) return null;

    const updatedAt = new Date();
    await setDoc(doc(db, 'internal', 'qa-gabarito'), {
      titulo: dados.titulo ?? 'Gabarito interno — TaskFlow',
      descricao: dados.descricao ?? '',
      bugs,
      total: bugs.length,
      updatedAt: Timestamp.fromDate(updatedAt),
    });

    return { bugs, updatedAt };
  } catch {
    return null;
  }
}

/**
 * Carrega o gabarito de `internal/qa-gabarito`.
 *
 * O controle de acesso é do Firestore: a regra libera a leitura apenas para a
 * conta responsável pelo desafio. Qualquer recusa vira o estado `denied`, que
 * as telas renderizam como "página não encontrada".
 */
export function useGabarito() {
  const [state, setState] = useState<GabaritoState>(cache ? 'ready' : 'loading');
  const [bugs, setBugs] = useState<Bug[]>(cache?.bugs ?? []);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(cache?.updatedAt ?? null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const unsubscribe = observeAuth(async (user) => {
      if (!user) {
        cache = null;
        if (active) setState('denied');
        return;
      }
      if (active) setEmail(user.email);

      try {
        const snapshot = await getDoc(doc(db, 'internal', 'qa-gabarito'));

        // Chegar aqui significa que a regra autorizou a leitura: só a conta
        // responsável consegue. Documento ausente é falta de publicação, não
        // falta de permissão — e esta é a única sessão capaz de gravá-lo.
        if (!snapshot.exists()) {
          if (active) setState('publishing');
          const publicado = await publicarGabarito();
          if (!active) return;
          if (!publicado) {
            setState('empty');
            return;
          }
          cache = { bugs: publicado.bugs, updatedAt: publicado.updatedAt };
          setBugs(publicado.bugs);
          setUpdatedAt(publicado.updatedAt);
          setState(publicado.bugs.length > 0 ? 'ready' : 'empty');
          return;
        }

        const data = snapshot.data();
        const list: Bug[] = data.bugs ?? [];
        const quando = data.updatedAt?.toDate?.() ?? null;
        cache = { bugs: list, updatedAt: quando };
        if (!active) return;
        setBugs(list);
        setUpdatedAt(quando);
        setState(list.length > 0 ? 'ready' : 'empty');
      } catch {
        if (active) setState('denied');
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { state, bugs, updatedAt, email };
}
