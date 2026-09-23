# Ciclo 02 — mapeamento das ocorrências

> **DOCUMENTO INTERNO.** Cruzamento entre os relatórios recebidos e o gabarito
> ([`../QA_GABARITO.md`](../QA_GABARITO.md)).

**Responsável pelo QA:** Karolayne Silva Ramos
**Relatórios:** "Testes na visão do admin — Reteste" (7 ocorrências) e
"Homologação — Sprint 01" (6 ocorrências)
**Emitidos em:** 22/09/2026

---

## Resumo

| | Qtde |
|---|---:|
| Ocorrências reportadas | **13** |
| Defeitos **novos** do gabarito | **3** |
| Defeitos **parciais** novos | 1 |
| Ocorrências causadas por falha de ambiente | 6 |
| Sugestões / fora do escopo entregue | 3 |

Os sete defeitos corrigidos após o ciclo 1 **não reapareceram** em nenhum dos dois
relatórios — o reteste confirma as correções.

**Placar do gabarito: 7 corrigidos, 3 encontrados, 3 parciais, 35 pendentes — 41 ainda
plantados de 48.**

---

## Testes na visão do admin — Reteste (7 ocorrências)

| # | Título | Classificação |
|---|---|---|
| BUG-001 | O admin não consegue mudar perfil de acesso | Ambiente — a conta admin estava com `role: USER` |
| BUG-002 | Nome "usuário" no perfil admin | Ambiente — mesma causa |
| BUG-003 | Data da tarefa é salva com um dia anterior | ✅ **BUG-044** do gabarito |
| BUG-004 | Pesquisa de tarefas diferencia maiúsculas e minúsculas | ✅ **BUG-038** do gabarito |
| FEA-001 | Sistema não permite cadastro de novos admin | Ambiente + fora do escopo (não há autocadastro) |
| FEA-002 | Admin não consegue delegar tarefas para usuários | Ambiente — o campo "Responsável" só é editável por ADMIN |
| FEA-003 | Admin não consegue gerenciar perfis | Ambiente — o menu "Usuários" fica oculto fora do perfil ADMIN |

## Homologação — Sprint 01 (6 ocorrências)

| # | Título | Classificação |
|---|---|---|
| BUG-001 | Não permite cadastro de novos usuários | Ambiente + fora do escopo |
| BUG-002 | Sem confirmação de e-mail ao editar perfil | ⚠️ **BUG-028** parcial — ver observação |
| BUG-003 | Tela de login não exibe a senha digitada | Sugestão de melhoria (repetida do ciclo 1) |
| BUG-004 | Erro ao salvar data da tarefa (um dia a menos) | ✅ **BUG-044** (repetido) |
| BUG-005 | Falta o botão "editar tarefas" | Fora do escopo — a linha e o título já levam à edição |
| MEL-001 | Página não responsiva no celular | ✅ **BUG-048** do gabarito |

---

## Defeitos novos identificados

| Gabarito | Severidade | Reportado como |
|---|---|---|
| BUG-038 — Pesquisa de tarefas é sensível a maiúsculas | MÉDIA | RETESTE ADMIN BUG-004 |
| BUG-044 — Data salva aparece um dia antes | ALTA | RETESTE ADMIN BUG-003 · SPRINT-01 BUG-004 |
| BUG-048 — Layout não é responsivo | MÉDIA | SPRINT-01 MEL-001 |

O BUG-044 foi descrito com precisão cirúrgica — *"digito 22/09/2026, salva 21/09/2026"* —,
que é exatamente o efeito de interpretar a data do formulário como meia-noite em UTC.
O BUG-048 veio classificado como melhoria, mas layout responsivo consta no escopo entregue,
então conta como defeito.

### Parcial

**BUG-028 — Alterar o e-mail do usuário não altera o login (ALTA).**
No SPRINT-01 BUG-002 ela observou que um e-mail novo é salvo sem nenhuma validação ou
confirmação. O formato é validado desde a correção do ciclo 1 (confirmado em produção: o
endereço `cristina.gmail.com` é recusado), então o que ela viu é a ausência de verificação
do endereço — a superfície do defeito real, que é a divergência entre o e-mail exibido e a
credencial de login. Faltou tentar entrar com o endereço novo.

---

## Nota sobre o ambiente

Seis das treze ocorrências têm uma única causa: **a conta `admin@taskflow.com` estava com
`role: "USER"` no projeto**. Sem nenhum administrador, o menu "Usuários" some, `/users/new`
fica bloqueado, o campo "Responsável" da tarefa não é editável e o rodapé do menu exibe
"Usuário" — que é exatamente o conjunto de sintomas dos itens marcados como ambiente.

A causa provável está no ciclo 1: com a listagem quebrada pelo índice ausente, a leitura do
perfil falhava e o `AuthContext` montava um perfil implícito com `role: USER`; ao editar e
salvar o próprio perfil — o que ela fez várias vezes naquele ciclo —, a tela gravou esse
`USER` por cima do `ADMIN` real. É o mecanismo do BUG-011 (a tela de perfil envia o campo
`role` no payload) agindo na direção contrária.

**Situação:** corrigido em 22/09/2026 — o papel ADMIN foi restaurado na conta.

> O BUG-011 continua plantado de propósito, então a gravação de `role` pelo perfil ainda
> existe. Com a listagem funcionando, o perfil carrega o papel correto e o problema não se
> repete sozinho; mas vale conferir o papel da conta admin entre um ciclo e outro.

---

## Situação das correções do ciclo 1

Nenhum dos sete defeitos corrigidos voltou a ser reportado. Em particular, o reteste
exercitou de novo a tela de perfil (SPRINT-01 BUG-002) e a criação de tarefas
(RETESTE ADMIN BUG-003), sem reincidência de validação de e-mail, título obrigatório ou
prazo no passado.

## Onde concentrar o ciclo 3

Com a área administrativa novamente acessível, os fluxos com mais defeitos pendentes são:

- **Gestão de usuários** — criar, editar e excluir (5 defeitos pendentes, 2 deles críticos)
- **Autorização entre perfis** — o que um USER alcança digitando a URL (3 críticos)
- **Listagem de tarefas** — paginação, contadores e filtros (5 pendentes)
- **Concorrência** — a mesma tarefa em duas abas, ações em sequência rápida (3 pendentes)
