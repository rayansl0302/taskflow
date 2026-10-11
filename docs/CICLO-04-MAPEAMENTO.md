# Ciclo 04 — mapeamento das ocorrências

> **DOCUMENTO INTERNO.** Cruzamento entre o relatório recebido e o gabarito
> ([`../QA_GABARITO.md`](../QA_GABARITO.md)).

**Responsável pelo QA:** Karolayne Silva Ramos
**Relatório:** "Reteste" (24 ocorrências; o PDF registra o período como 07/10/2026 a 12/10/0026)
**Emitido em:** 10/10/2026

---

## Resumo

| | Qtde |
|---|---:|
| Ocorrências reportadas | **24** |
| Defeitos **novos** do gabarito | **10** |
| Defeitos **parciais** fechados neste ciclo | **3** |
| Complemento de defeito já corrigido | 2 |
| Defeitos reais **fora** do gabarito | 1 |
| Falsos positivos ou já corrigidos | 2 |
| Relatos que não reproduzem um defeito plantado | 2 |
| Comportamento do navegador | 1 |
| Sugestões de melhoria | 2 |

**Placar do gabarito: 26 corrigidos, 1 parcial, 21 pendentes — 22 ainda plantados de 48.**

---

## Ocorrências

| # | Título | Classificação |
|---|---|---|
| BUG-001 | E-mail com espaços antes ou depois | ✅ **BUG-005** do gabarito |
| BUG-002 | Recuperação de senha com campo vazio ou e-mail inválido | ✅ **BUG-006** do gabarito |
| BUG-003 | Usuário inativo consegue logar | ✅ **BUG-003** do gabarito (junto com o BUG-016 deste relatório) |
| BUG-004 | Dashboard não atualiza a quantidade de tarefas | ✅ **BUG-043** do gabarito |
| BUG-005 | Cadastro de tarefa com três caracteres | Falso positivo — o mínimo do escopo é 3 |
| BUG-006 | Descrição com mais de 500 caracteres | ✅ **BUG-016** do gabarito |
| BUG-007 | Criar tarefa sem responsável | Defeito real, **fora do gabarito** |
| BUG-008 | Duplicação ao clicar duas vezes em Salvar | ✅ **BUG-018** do gabarito |
| BUG-009 | Busca de usuário para ao digitar espaço | ✅ **BUG-039** do gabarito |
| BUG-010 | Cadastro com e-mail inválido | Já corrigido — **BUG-032** |
| BUG-011 | Nome composto apenas por espaços | ✅ **BUG-031** do gabarito |
| BUG-012 | Admin não permanece no próprio perfil ao cadastrar | ✅ **BUG-026** do gabarito |
| BUG-013 | Cadastrar usuário sem selecionar perfil | ✅ **BUG-027** do gabarito |
| BUG-014 | Cancelar exclusão de usuário não impede a exclusão | ✅ **BUG-029** do gabarito |
| BUG-015 | Login após excluir usuário | ✅ **BUG-014** do gabarito |
| BUG-016 | Login com usuário INATIVO | ✅ **BUG-003** (mesmo defeito do BUG-003 deste relatório) |
| BUG-017 | Pesquisa com e sem acento | Complemento do **BUG-038**, já corrigido no ciclo 2 |
| BUG-018 | Filtro desaparece ao mudar de página | Não reproduz defeito plantado |
| BUG-019 | Ordem ao filtrar por prioridade | Não é o **BUG-040** |
| BUG-020 | Layout no celular ou tablet | ✅ **BUG-048** — a faixa de tablet ainda falhava |
| BUG-021 | Data da tarefa não digita no celular | Comportamento do campo nativo de data |
| BUG-022 | Admin altera o próprio perfil para USER | ✅ **BUG-011** do gabarito |
| MEL-001 | Combinar filtros de responsável e status | Sugestão repetida do ciclo 3 |
| MEL-002 | Dois usuários logados no mesmo navegador | Sugestão, fora do escopo |

---

## Defeitos novos identificados — corrigidos em 10/10/2026

| Gabarito | Severidade | Reportado como |
|---|---|---|
| BUG-005 — E-mail de login não é normalizado | BAIXA | RETESTE BUG-001 |
| BUG-006 — Recuperação de senha sempre informa sucesso | MÉDIA | RETESTE BUG-002 |
| BUG-016 — Descrição aceita mais de 500 caracteres | MÉDIA | RETESTE BUG-006 |
| BUG-018 — Duplo clique em Salvar cria duas tarefas | ALTA | RETESTE BUG-008 |
| BUG-026 — Criar usuário derruba a sessão do ADMIN | CRÍTICA | RETESTE BUG-012 |
| BUG-027 — Perfil não é obrigatório ao criar usuário | MÉDIA | RETESTE BUG-013 |
| BUG-029 — Exclusão de usuário sem confirmação | MÉDIA | RETESTE BUG-014 |
| BUG-031 — Nome composto apenas por espaços é aceito | BAIXA | RETESTE BUG-011 |
| BUG-039 — Pesquisa de usuários trata nome e e-mail de formas diferentes | MÉDIA | RETESTE BUG-009 |
| BUG-043 — Dashboard exibe números em cache | ALTA | RETESTE BUG-004 |

O RETESTE BUG-001 descreve o login com espaços como se o sucesso fosse o defeito. O resultado que ela aceita inclui remover os espaços. O defeito plantado é o contrário: o espaço fazia o e-mail ser rejeitado. A correção ignora espaços nas pontas e a caixa, e o login segue com o endereço normalizado.

O RETESTE BUG-014 não vê um botão Cancelar que falha. A exclusão acontecia no primeiro clique, então não havia o que cancelar. A confirmação passa a existir, no mesmo padrão da exclusão de tarefas.

O RETESTE BUG-004 é o cenário de indicador desatualizado do BUG-043. O cache também vazava números entre usuários da mesma aba; os dois efeitos saem juntos porque a tela deixa de reutilizar o `sessionStorage`.

---

## Parciais fechados

**BUG-003 — Usuário INATIVO consegue usar o sistema (ALTA).**
No ciclo 3 ela viu que uma tarefa pode ser delegada a uma conta inativa. Neste reteste entrou com a conta inativa (BUG-003 e BUG-016 do relatório). O login agora é recusado, e o seletor de responsável não oferece mais contas inativas para uma tarefa nova.

**BUG-011 — USER se promove a ADMIN pelo próprio perfil (CRÍTICA).**
No ciclo 1 ela registrou que o campo não mudava. Neste reteste o administrador muda o próprio perfil para USER e perde o acesso, sem caminho de volta (BUG-022). O campo fica desabilitado na tela de perfil, e a regra do Firestore recusa alteração de `role` feita pela própria conta — inclusive a de um administrador.

**BUG-014 — Usuário excluído continua conseguindo logar (CRÍTICA).**
No ciclo 1 ela viu o rótulo "Usuário" numa conta de administrador. Neste reteste excluiu um usuário e entrou de novo com a senha antiga (BUG-015). Sem o documento do perfil, a sessão é encerrada em vez de ganhar um perfil implícito.

---

## Complementos fechados

**BUG-048 — Layout não é responsivo (MÉDIA).**
A correção do ciclo 2 cobriu apenas larguras até 768px, e o relatório deste ciclo cita "celular **e tablet**" (BUG-020). A faixa de tablet continuava quebrada: entre 769px e 1024px a barra lateral de 248px permanecia fixa, então em uma viewport de 820px a página voltava a rolar na horizontal (977px de conteúdo), a tabela de 680px estourava um cartão de 499px, cada filtro ficava com 84px e as métricas do dashboard mantinham cinco colunas. Um breakpoint para a faixa de tablet passa a empilhar os filtros em duas colunas, reduzir as métricas a três colunas e dar rolagem própria ao cartão, como já acontecia no celular.

Medido em 820×1180 e 1024×768 depois da correção: a página não rola mais na horizontal e a tabela rola dentro do cartão. Em 390×844 o comportamento do celular segue igual.

---

## Fora do gabarito

**RETESTE BUG-007 — tarefa salva sem responsável.**
O seletor começa em "Selecione", com valor vazio, e a validação não olhava o campo. A tarefa passa a exigir responsável.

**RETESTE BUG-017 — pesquisa sem acento não acha "política".**
A correção do BUG-038, no ciclo 2, normalizou caixa e espaços, e o resultado esperado também falava de acento. A busca de tarefas agora ignora acento. A de usuários foi pelo BUG-039, não por este item.

---

## O que não foi alterado

| Ocorrência | Motivo |
|---|---|
| BUG-005 | O escopo pede título com no mínimo 3 caracteres. Três caracteres válidos devem ser aceitos. |
| BUG-010 | O BUG-032 já recusa e-mail sem domínio completo desde 21/09/2026. |
| BUG-018 | Trocar a página da listagem não limpa o filtro. O filtro só vive na tela; sair de `/tasks` e voltar recomeça a consulta. Não é um dos defeitos plantados. |
| BUG-019 | Os passos filtram por prioridade. O BUG-040 é a ordenação pelo critério "Prioridade", que continua alfabética. |
| BUG-021 | No celular, o `input type="date"` abre o calendário do navegador. Não é um defeito da aplicação. |
| MEL-001 | A mesma sugestão do ciclo 3: filtrar tarefas por responsável. O escopo não exige esse filtro. |
| MEL-002 | Uma sessão por navegador é o comportamento do Firebase Authentication. |

O único parcial que continua plantado é o **BUG-028** (alterar o e-mail do usuário não altera o login).

---

## Situação das correções anteriores

Nenhum dos 13 defeitos já corrigidos voltou como regressão confirmada. O BUG-010 deste relatório repete a validação de e-mail do BUG-032, já recusada desde 21/09/2026. O BUG-020 reabre o BUG-048 com razão: a correção anterior tinha ficado restrita ao celular e a faixa de tablet só foi fechada agora.

## Onde concentrar o próximo ciclo

O que ainda está no sistema se concentra em:

- **Autorização entre perfis** — `/users` digitado por um USER, tarefa de outra pessoa pela URL, leitura da coleção `users` (BUG-008, BUG-009, BUG-010, BUG-012)
- **Ciclo de vida da tarefa** — prioridade que não grava, exclusão de concluída, status pela listagem (BUG-019, BUG-020, BUG-021)
- **Listagem, filtros e ordenação** — ela encostou nesta área duas vezes sem fechar nada: o critério "Prioridade" ordena pelos códigos em ordem alfabética, o filtro "Cancelada" nunca devolve resultado e o último registro de cada página reaparece na seguinte (BUG-040, BUG-037, BUG-034)
- **Concorrência** — duas abas e troca rápida de status (BUG-024, BUG-025)
- **Datas e indicadores** — prazo de hoje marcado como atrasado, e "Concluídas" somando canceladas (BUG-045, BUG-042)

---

## Estado do ambiente ao fim do ciclo

Os testes deixaram o projeto real em um estado que impediria o próximo ciclo. Conferido e
reparado em 11/10/2026:

| O que estava | Causa | O que foi feito |
|---|---|---|
| Nenhuma conta ADMIN no sistema | Ela exercitou o BUG-011 e rebaixou a própria conta de administrador | `admin@taskflow.com` devolvida a ADMIN |
| `maria.silva` e `carlos.inativo` sem perfil | Excluídas durante os testes de exclusão de usuário | Perfis recriados, o Carlos de volta como INATIVO |
| 24 das 55 tarefas sem responsável existente | Consequência do BUG-030, que segue plantado | Caíram para 1 ao recriar os dois perfis; a que sobrou foi deixada como está |

Duas observações para os próximos ciclos:

- A conta do Carlos precisa continuar INATIVA: é o único caminho para testar o bloqueio de
  login de conta inativa.
- A restauração do ADMIN só foi possível porque as regras novas ainda não estavam publicadas.
  Depois de publicá-las, nenhuma conta altera o próprio papel — inclusive para voltar a ser
  administrador. Com um único ADMIN no sistema, convém que a correção do BUG-011 permaneça,
  já que é ela que impede o rebaixamento acontecer de novo pela tela.

---

## Preparação do próximo ciclo

Os defeitos acima foram **removidos do sistema** em 10/10/2026, junto com o responsável obrigatório e o acento na pesquisa de tarefas.

| Defeito | O que mudou |
|---|---|
| BUG-003 | Conta inativa é desconectada no login; responsável novo só lista contas ativas |
| BUG-005 | O login ignora espaços nas pontas e a caixa do e-mail |
| BUG-006 | Recuperação de senha valida o e-mail e só confirma quando o envio acontece |
| BUG-011 | O perfil de acesso não se altera pela própria conta, nem na tela nem na regra |
| BUG-014 | Conta sem documento de perfil não entra mais |
| BUG-016 | Descrição limitada a 500 caracteres |
| BUG-018 | Salvar tarefa não aceita um segundo envio enquanto o primeiro não termina |
| BUG-026 | Criar usuário usa outra instância do Authentication e mantém o admin logado |
| BUG-027 | Perfil passou a ser obrigatório no cadastro |
| BUG-029 | Excluir usuário pede confirmação |
| BUG-031 | Nome só com espaços é rejeitado |
| BUG-039 | A busca de usuários trata nome e e-mail da mesma forma |
| BUG-043 | Os indicadores do dashboard são calculados a cada abertura |
| Fora do gabarito | Tarefa sem responsável é recusada; a busca de tarefas ignora acento |

**Os 22 restantes continuam no sistema**, incluindo o parcial BUG-028.
