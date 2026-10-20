# Ciclo 06 — mapeamento das ocorrências

Relatório `QA_Taskflow-Gestao-de-tarefas_Reteste_2026-10-19 (2)`, emitido em 19/10/2026 por
Karolayne Silva Ramos, período de 18/10/2026 a 19/10/2026.

**Documento interno. Não entregar ao profissional avaliado.**

---

## Resumo

| | Qtde |
|---|---:|
| Ocorrências reportadas | **5** |
| Defeitos do gabarito identificados | **5** |
| Falsos positivos | 0 |

**Placar final: 46 corrigidos de 46 avaliáveis — nenhum defeito plantado continua no sistema.**

Aproveitamento de 100%: cinco ocorrências, cinco defeitos reais, nenhum ruído. É o fecho do
desafio, e o único ciclo em que cada relato correspondeu exatamente a um defeito do catálogo.

---

## Ocorrências

| Relatório | Assunto | Classificação |
|---|---|---|
| BUG-001 | Alterações em abas diferentes não persistem | ✅ **BUG-024** do gabarito |
| BUG-002 | Alterações rápidas de status não permanecem | ✅ **BUG-025** do gabarito |
| BUG-003 | Não é possível excluir tarefa Concluída | ✅ **BUG-020** do gabarito |
| BUG-004 | Concluídas do painel divergem da listagem | ✅ **BUG-042** do gabarito |
| BUG-005 | "Nenhuma tarefa encontrada" antes do carregamento | ✅ **BUG-046** do gabarito |

O relatório usa a linguagem dos roteiros entregues antes do ciclo — "Teste 1A", "Teste 1B",
"Slow 3G", "tarefas A e B". O material de apoio foi seguido à risca, e os defeitos que
dependiam de técnica (concorrência e timing) caíram todos.

---

## Observação sobre o BUG-002 do relatório

Ela escreve que, depois do F5, **as duas tarefas voltam ao status inicial**. Esse é o
comportamento do **BUG-021** — a gravação que ia para o campo `state`, que a aplicação nunca
lia —, corrigido em 19/10 no ciclo anterior.

O **BUG-025**, que é o defeito ainda plantado quando ela testou, produz o resultado oposto: a
tela perde uma das alterações, mas as duas ficam gravadas e reaparecem no F5.

A explicação mais provável é que o ambiente que ela testou ainda não tinha recebido o deploy
das correções do ciclo 5, feitas na noite de 19/10. Dois indícios sustentam isso: o relatório
cobre 18 e 19/10, e o BUG-001 dela mostra a prioridade sendo gravada — o que só acontece com
a correção do BUG-019 aplicada, sugerindo que ela pegou o ambiente em transição.

De todo modo, **o crédito vale**: ela executou exatamente o cenário do BUG-025 e detectou a
divergência entre o que a tela mostra e o que fica guardado, que é o que o defeito produz. O
BUG-025 foi corrigido junto com os outros quatro.

---

## Correções aplicadas em 19/10/2026

| Defeito | O que mudou |
|---|---|
| BUG-020 | `deleteTask` tinha uma saída antecipada para tarefas concluídas; foi removida, junto com o parâmetro de status que só existia para isso |
| BUG-024 | A gravação passou a ser uma transação que compara o `updatedAt` carregado pela tela com o do servidor, e recusa a escrita quando divergem |
| BUG-025 | A atualização da listagem usava `tasks` do closure; passou a usar o updater funcional, que parte sempre da lista mais recente |
| BUG-042 | O cálculo de concluídas somava `CONCLUIDA` e `CANCELADA`; agora conta só a primeira |
| BUG-046 | O estado vazio só é montado depois que a consulta termina; durante o carregamento aparece apenas o indicador |

Sobre o **BUG-024**: a correção recusa a segunda gravação em vez de deixá-la vencer, e explica
o motivo na tela — "Esta tarefa foi alterada por outra pessoa enquanto você editava." Era o
único dos cinco que não tinha correção de uma linha, porque exigia uma leitura no servidor
dentro da mesma operação de escrita.

---

## Verificação

Cada correção foi exercitada no projeto real, repetindo os passos do próprio relatório:

| Defeito | O que foi observado depois da correção |
|---|---|
| BUG-020 | Tarefa concluída descartável excluída pela tela e confirmada ausente no banco |
| BUG-024 | Aba 1 salva e preservada; aba 2 recusada, com a mensagem de conflito capturada na tela |
| BUG-025 | Duas trocas em sequência rápida: a tela mostrou as duas, e o F5 confirmou as duas |
| BUG-042 | Painel e listagem em 9 concluídas; 25 + 11 + 9 + 7 fecha o total de 52 |
| BUG-046 | 100 amostras durante o carregamento, nenhuma afirmando "nenhuma tarefa"; só o indicador |

Os dados usados nos testes foram devolvidos ao estado anterior: títulos, prioridades e status
restaurados, e a tarefa descartável removida.

---

## Situação final do catálogo

| | Qtde |
|---|---:|
| Defeitos inseridos | 48 |
| Fora da avaliação (sem caminho pela interface) | 2 |
| **Avaliáveis** | **46** |
| **Encontrados e corrigidos** | **46** |
| Ainda plantados | **0** |

Os dois fora da avaliação continuam sendo o BUG-010 e o BUG-012, ambos de regras do Firestore.
A parte perigosa do BUG-010 — a escrita em tarefa de terceiro — foi fechada mesmo assim.

Os scripts `gerar-dicas-pdf.py` e `gerar-roteiros-pdf.py` passam a informar que não há material
a gerar, em vez de produzir um documento vazio.

---

## Percurso dos ciclos

Oito relatórios foram emitidos ao longo do desafio, somando **97 ocorrências**:

| Relatório | Período | Ocorrências |
|---|---|---:|
| Teste na visão do administrador | 19–20/09/2026 | 16 |
| Teste na visão do usuário | 17/08–21/09/2026 | 15 |
| Reteste na visão do admin | 21–26/09/2026 | 7 |
| Homologação — Sprint 01 | 22/09/2026 | 6 |
| Testes na visão do admin — 05/10 | 04–11/10/2026 | 7 |
| Reteste — ciclo 4 | 07–12/10/2026 | 24 |
| Reteste — ciclo 5 | 12–21/10/2026 | 17 |
| Reteste — ciclo 6 | 18–19/10/2026 | 5 |

Os defeitos creditados por ciclo só começaram a ser registrados no campo `ciclo` do gabarito a
partir do segundo relatório, então a contagem por ciclo é confiável apenas da metade em diante:
**12 no ciclo 4, 15 no ciclo 5 e 5 no ciclo 6**. Os sete restantes, fechados nos primeiros
ciclos, não têm o ciclo de origem marcado.

O que os dados sustentam com clareza é a virada dos três últimos ciclos: **32 dos 46 defeitos
avaliáveis caíram neles**, e o aproveitamento subiu de forma consistente depois que o material
de apoio passou a ser recortado sobre o que ainda estava plantado — até o ciclo final, em que
as cinco ocorrências corresponderam aos cinco defeitos restantes, sem nenhum falso positivo.
