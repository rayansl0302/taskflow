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

**Placar do gabarito: 13 corrigidos, 4 parciais, 31 pendentes — 35 ainda plantados de 48.**

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

## Defeitos novos identificados — corrigidos em 05/10/2026

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

---

## Preparação do quarto ciclo

Os três defeitos novos foram **removidos do sistema** em 05/10/2026, junto com o defeito
fora do gabarito:

| Defeito | O que mudou |
|---|---|
| BUG-035 | Mudar busca, filtro ou ordenação recomeça na primeira página |
| BUG-036 | O contador passa a refletir a lista filtrada |
| BUG-041 | Os indicadores do painel passam a considerar a base inteira |
| Ano com 5 dígitos | O campo de prazo ganhou teto (`max`) e a validação recusa anos fora de quatro dígitos |

> O teto exigiu cuidado extra: a comparação textual de datas falha quando o ano tem um
> número diferente de dígitos — `'20263-10-05'` é textualmente *menor* que `'2100-12-31'` e
> passava direto. A validação confere o tamanho do ano antes de comparar.

**Verificado após as correções:** filtrar por prioridade a partir da página 4 agora volta
para a página 1 com 10 resultados e contador em 14; a busca por "revisar" devolve 6 com
contador em 6; o painel mostra 48, igual à listagem; e o ano de 5 dígitos é recusado no
formulário.

**Os 35 restantes continuam no sistema**, incluindo os quatro parciais.

---

## Material de apoio entregue

Como ela está em início de carreira e vinha tendo dificuldade em alcançar algumas áreas,
passou a acompanhar o desafio um **guia de testes exploratórios**
([`GUIA_EXPLORATORIO_QA.md`](GUIA_EXPLORATORIO_QA.md) e o PDF correspondente).

O guia não cita nenhum defeito: traz oito técnicas de investigação e roteiros de perguntas
por área. As perguntas foram escolhidas para empurrar na direção dos fluxos onde estão as
pendências — gestão de usuários, autorização entre perfis, concorrência e ciclo de vida da
tarefa —, mantendo o mérito da descoberta com ela.
