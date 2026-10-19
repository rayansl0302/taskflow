# Ciclo 05 — mapeamento das ocorrências

Relatório `QA_Taskflow-Gestao-de-tarefas_Reteste_2026-10-19`, emitido em 19/10/2026 por
Karolayne Silva Ramos, período de 12/10/2026 a 21/10/2026.

**Documento interno. Não entregar ao profissional avaliado.**

---

## Resumo

| | Qtde |
|---|---:|
| Ocorrências reportadas | **17** |
| Defeitos do gabarito identificados | **15** |
| Ocorrência repetida (mesmo defeito, dois relatos) | 1 |
| Relatos que não correspondem a defeito plantado | 1 |

**Placar do gabarito: 41 corrigidos, 5 pendentes — 5 ainda plantados de 46 avaliáveis.**

O melhor ciclo até aqui. Ela fechou sozinha todas as sete frentes do material de apoio
que ainda tinham algo a entregar, e as quatro ocorrências de severidade crítica que abriu
são defeitos reais de autorização e de integridade de login.

---

## Ocorrências

| Relatório | Assunto | Classificação |
|---|---|---|
| BUG-001 | Prioridade não persiste após F5 | ✅ **BUG-019** do gabarito |
| BUG-002 | Status alterado pela listagem não permanece | ✅ **BUG-021** do gabarito |
| BUG-003 | USER acessa a tela administrativa /users | ✅ **BUG-008** do gabarito |
| BUG-004 | Acessar e editar tarefa de outro usuário | ✅ **BUG-009** do gabarito |
| BUG-005 | Tarefa editada não volta ao topo da listagem | Não reproduz defeito plantado |
| BUG-006 | F5 no formulário perde os dados sem aviso | ✅ **BUG-023** do gabarito |
| BUG-007 | Rota inexistente exibe tela em branco | ✅ **BUG-047** do gabarito |
| BUG-008 | Item repetido entre a página 1 e a página 2 | ✅ **BUG-034** do gabarito |
| BUG-009 | E-mail antigo continua autenticando | ✅ **BUG-028** do gabarito (parcial fechado) |
| BUG-010 | Responsável vira um identificador sem sentido | ✅ **BUG-030** do gabarito |
| BUG-011 | Usuário comum acessa tarefa alheia pela URL | ✅ **BUG-009** — mesmo defeito do BUG-004 |
| BUG-012 | Conta comum vê o total de usuários | ✅ **BUG-013** do gabarito |
| BUG-013 | Login não devolve à rota pedida | ✅ **BUG-007** do gabarito |
| BUG-014 | Salvar edição leva ao dashboard | ✅ **BUG-022** do gabarito |
| BUG-015 | Filtro Cancelada não retorna nada | ✅ **BUG-037** do gabarito |
| BUG-016 | Prioridades em Alta, Baixa, Média | ✅ **BUG-040** do gabarito |
| BUG-017 | Prazo para hoje marcado como atrasado | ✅ **BUG-045** do gabarito |

---

## Observações sobre a classificação

**BUG-008 — o título não corresponde ao conteúdo.** O título diz "Tarefas simultâneas, mesma
tarefa em duas abas", mas os passos ("verificar tarefa repetida no topo da aba 2"), o
resultado esperado ("as tarefas não devem se repetir") e o encontrado ("uma tarefa aparece no
final da primeira página e novamente no início da segunda") descrevem a paginação. Foi
classificado pelo conteúdo, como **BUG-034**. O defeito de duas abas que o título sugere é o
BUG-024, que **continua plantado** — ela não chegou a exercitá-lo.

**BUG-004 e BUG-011 são a mesma coisa.** Os dois descrevem abrir a tarefa de outra pessoa
trocando o identificador na URL. O BUG-004 acrescenta que conseguiu editar, o que na prática
também exercitava a regra de escrita do Firestore — à época ainda permissiva, porque as regras
novas não tinham sido publicadas.

---

## O que não corresponde a defeito plantado

**BUG-005 — tarefa editada não volta ao topo.** O critério de ordenação chama-se "Mais
recentes" e ordena por data de **criação**, não de alteração. Uma tarefa editada não foi criada
de novo, então permanece onde está. O comportamento é coerente com o critério; o que existe é
uma ambiguidade no rótulo, não um defeito. Nada foi alterado.

---

## Correções aplicadas em 19/10/2026

| Defeito | O que mudou |
|---|---|
| BUG-007 | O login lê a rota de origem que o `ProtectedRoute` já guardava e volta para ela |
| BUG-008 | `/users` passou a exigir `AdminRoute`, como as outras telas administrativas |
| BUG-009 | O formulário recusa tarefa de terceiro: quem não é dono nem ADMIN volta para a listagem |
| BUG-013 | O cartão "Total de usuários" só é montado para o ADMIN |
| BUG-019 | `updateTask` passou a gravar a prioridade, que ficava de fora do payload |
| BUG-021 | A troca rápida de status gravava em `state`, campo que a aplicação nunca lê; agora grava em `status` |
| BUG-022 | Salvar devolve à listagem de tarefas |
| BUG-023 | O formulário pede confirmação do navegador antes de descartar o que foi digitado |
| BUG-028 | O e-mail é a identidade de login e deixou de ser editável depois da criação |
| BUG-030 | Excluir um usuário transfere as tarefas dele para o administrador, e o diálogo avisa |
| BUG-034 | O deslocamento da página usava `PAGE_SIZE - 1` e repetia o último item |
| BUG-037 | O filtro enviava `CANCELADO` e o status gravado é `CANCELADA` |
| BUG-040 | A ordenação por prioridade passou a usar peso de urgência, não ordem alfabética do código |
| BUG-045 | O prazo vale até o fim do dia: a comparação passou a ser por data, não por instante |
| BUG-047 | Rota coringa com uma tela 404 que explica e oferece caminho de volta |

Sobre o **BUG-028**: alterar o e-mail de outra conta no Authentication exige o Admin SDK, que
depende de uma service account que o projeto não tem. A correção foi eliminar a origem da
divergência — o campo fica somente leitura na edição, com a explicação na própria tela.

Sobre o **BUG-030**: a transferência foi verificada com um cenário descartável (um perfil e uma
tarefa criados só para o teste). O perfil saiu, a tarefa ficou e trocou de responsável. A
listagem também passou a exibir "Usuário removido" em vez do identificador cru, como rede de
segurança para registros antigos.

---

## O que continua plantado

Cinco defeitos, em duas famílias:

| Defeito | Severidade | Assunto |
|---|---|---|
| BUG-020 | ALTA | Excluir tarefa concluída não remove do banco |
| BUG-024 | ALTA | Edição simultânea sobrescreve sem aviso |
| BUG-025 | MÉDIA | Troca rápida de status gera estado inconsistente |
| BUG-042 | MÉDIA | "Concluídas" soma as tarefas canceladas |
| BUG-046 | BAIXA | Estado vazio aparece durante o carregamento |

Conferido depois das correções: os cinco continuam reproduzindo. O BUG-021 e o BUG-025 moram
na mesma tela e pareciam vizinhos demais para sobreviverem juntos — a gravação do status foi
corrigida, mas a atualização otimista da listagem continua usando uma cópia obsoleta do array,
que é o que faz uma das alterações sumir da tela.

Fora da avaliação continuam o BUG-010 e o BUG-012, que nenhum caminho da interface revela.
