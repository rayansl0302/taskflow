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

export type GabaritoState = 'loading' | 'denied' | 'ready';

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

  useEffect(() => {
    let active = true;

    const unsubscribe = observeAuth(async (user) => {
      if (!user) {
        cache = null;
        if (active) setState('denied');
        return;
      }
      try {
        const snapshot = await getDoc(doc(db, 'internal', 'qa-gabarito'));
        if (!snapshot.exists()) {
          if (active) setState('denied');
          return;
        }
        const data = snapshot.data();
        const list: Bug[] = data.bugs ?? [];
        const quando = data.updatedAt?.toDate?.() ?? null;
        cache = { bugs: list, updatedAt: quando };
        if (!active) return;
        setBugs(list);
        setUpdatedAt(quando);
        setState('ready');
      } catch {
        if (active) setState('denied');
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { state, bugs, updatedAt };
}
