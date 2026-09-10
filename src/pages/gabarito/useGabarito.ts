import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { observeAuth } from '../../services/firebase/auth';

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
 * `denied`  — sem permissão de leitura (ou sem sessão): tratado como 404.
 * `empty`   — leitura permitida, mas o gabarito ainda não foi publicado.
 * `ready`   — conteúdo carregado.
 */
export type GabaritoState = 'loading' | 'denied' | 'empty' | 'ready';

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
        // responsável consegue. Um documento ausente é falta de publicação,
        // não falta de permissão — e merece uma mensagem diferente.
        if (!snapshot.exists()) {
          if (active) setState('empty');
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
