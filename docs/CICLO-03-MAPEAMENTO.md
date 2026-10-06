# Ciclo 03 — mapeamento das ocorrências

> **DOCUMENTO INTERNO.** Cruzamento entre o relatório recebido e o gabarito
> ([`../QA_GABARITO.md`](../QA_GABARITO.md)).

**Responsável pelo QA:** Karolayne Silva Ramos
**Relatório:** "Testes na visão do admin" (7 ocorrências)
**Emitido em:** 05/10/2026

---

## Resumo

| | Qtde |
|---|---:|
| Ocorrências reportadas | **7** |
| Defeitos **novos** do gabarito | **3** |
| Defeitos **parciais** novos | 1 |
| Defeitos reais **fora** do gabarito | 1 |
| Sugestões de melhoria | 1 |
| Ocorrências causadas por falha de ambiente | 0 |

Primeiro ciclo sem nenhuma ocorrência de ambiente — todos os relatos descrevem o
comportamento real do sistema. Nenhum dos dez defeitos corrigidos reapareceu.

**Placar do gabarito: 10 corrigidos, 3 encontrados, 4 parciais, 31 pendentes — 38 ainda
plantados de 48.**

---

## Ocorrências

| # | Título | Classificação |
|---|---|---|
| BUG-001 | "Sempre aparece 46 tarefas encontradas" | ✅ **BUG-036** do gabarito |
| BUG-002 | Filtro de tarefas não funciona — pesquisa não encontra | ✅ **BUG-035** do gabarito |
| BUG-003 | Filtro de prioridade não mostra nenhum item | ✅ **BUG-035** (mesma causa do anterior) |
| BUG-004 | Data aceita ano com 5 dígitos (ex.: 20263) | Defeito real, **fora do gabarito** |
| BUG-005 | Dashboard não atualiza a quantidade de tarefas | ✅ **BUG-041** do gabarito |
| BUG-006 | Permite delegar tarefa a usuário inativo | ⚠️ **BUG-003** parcial |
| MEL-001 | Filtrar tarefas por responsável | Sugestão de melhoria |

---

## Defeitos novos identificados

| Gabarito | Severidade | Reportado como |
|---|---|---|
| BUG-035 — Aplicar filtro não retorna para a primeira página | MÉDIA | CICLO-03 BUG-002 e BUG-003 |
| BUG-036 — Contador de resultados ignora os filtros | MÉDIA | CICLO-03 BUG-001 |
| BUG-041 — Dashboard considera no máximo 20 tarefas | ALTA | CICLO-03 BUG-005 |

### Os dois relatos que viraram um defeito só

O BUG-002 ("a pesquisa não encontra a tarefa") e o BUG-003 ("o filtro de prioridade não
mostra nenhum item") descrevem o mesmo defeito: a página atual não é reposta ao mudar o
filtro. Reproduzido:

| Cenário | Resultado |
|---|---|
| Filtrar por prioridade ALTA estando na página 1 | 10 resultados |
| Mesmo filtro estando na página 3 | "Nenhuma tarefa encontrada" |
| Pesquisar "revisar" estando na página 1 | 6 resultados |
| Mesma busca estando na página 4 | "Nenhuma tarefa encontrada" |

A pesquisa e o filtro funcionam; o que falha é o deslocamento da paginação, que continua
apontando para além do fim da lista filtrada. Vale registrar que a correção da pesquisa
feita no ciclo 2 (BUG-038) continua valendo — a busca por "revisar" encontra os seis itens
normalmente a partir da primeira página.

### O número 46

O BUG-001 cita "sempre aparece 46 tarefas encontradas", que era exatamente o total de
tarefas do projeto naquele momento. É o contador lendo a lista completa em vez da filtrada —
hoje ele exibe 48 pelo mesmo motivo.

### Parcial

**BUG-003 — Usuário INATIVO consegue usar o sistema (ALTA).**
No CICLO-03 BUG-006 ela percebeu que o seletor "Responsável" oferece contas inativas e
aceita a atribuição — confirmado: "Carlos Inativo" aparece na lista. Esse é um sintoma do
defeito plantado, que é mais amplo: o campo `status` não surte efeito em lugar nenhum,
inclusive no acesso. Falta ela tentar entrar com `carlos.inativo@taskflow.com`, que é onde
a severidade real aparece.

---

## Defeito fora do gabarito

**CICLO-03 BUG-004 — o campo de prazo aceita ano com 5 dígitos.**
Confirmado: o `<input type="date">` tem `min` (a correção do BUG-017), mas não tem `max`, e
nem a validação impõe um teto. `20263-10-05` é aceito sem reclamação.

Não é um dos 48 defeitos plantados — é um defeito legítimo que escapou na construção do
sistema. Conta a favor dela: achou algo que nem o gabarito previa.

---

## Situação das correções anteriores

Nenhum dos dez defeitos corrigidos voltou a ser reportado. O ciclo exercitou de novo
pesquisa, filtros, datas e dashboard — as mesmas áreas dos ciclos anteriores — sem
reincidência.

## Onde concentrar o ciclo 4

As áreas com mais defeitos pendentes continuam pouco exploradas:

- **Gestão de usuários** — criar, editar e excluir (5 pendentes, 2 críticos)
- **Autorização entre perfis** — o que um USER alcança digitando a URL (3 críticos)
- **Concorrência** — a mesma tarefa em duas abas, ações em sequência rápida (3 pendentes)
- **Ciclo de vida da tarefa** — alterar status pela listagem, excluir, editar prioridade
  (4 pendentes, todos ALTA)

Ela testou a listagem de tarefas com profundidade neste ciclo e tirou dela 3 defeitos. O
mesmo rigor aplicado à área administrativa deve render mais, porque é onde está a maior
concentração de pendências críticas.
