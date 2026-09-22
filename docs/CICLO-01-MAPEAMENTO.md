# Ciclo 01 — mapeamento das ocorrências

> **DOCUMENTO INTERNO.** Cruzamento entre os relatórios recebidos e o gabarito
> ([`../QA_GABARITO.md`](../QA_GABARITO.md)).

**Responsável pelo QA:** Karolayne Silva Ramos
**Relatórios:** visão do administrador (16 ocorrências) e visão do usuário (15 ocorrências)
**Emitidos em:** 21/09/2026

---

## Resumo

| | Qtde |
|---|---:|
| Ocorrências reportadas | **31** |
| Ocorrências que apontam defeitos do gabarito | 13 |
| ↳ defeitos **distintos** do gabarito | **7** |
| ↳ defeitos **parciais** (sintoma sim, causa não) | **2** |
| Ocorrências causadas por falha de ambiente | 8 |
| Sugestões de melhoria / fora do escopo entregue | 8 |

As 31 ocorrências não equivalem a 31 defeitos encontrados por dois motivos: os dois ciclos
testaram os mesmos fluxos e repetiram achados (login com senha errada, acesso após logout,
data no passado, validação de e-mail e perfil aparecem nos dois relatórios), e oito
ocorrências descrevem um problema de infraestrutura do ambiente, não um defeito plantado.

**Placar do gabarito: 7 encontrados, 2 parciais, 39 pendentes — faltam 41 de 48.**

---

## Visão do administrador — 16 ocorrências

| # | Título | Classificação |
|---|---|---|
| BUG-001 | Acesso ao sistema com senha incorreta | ✅ **BUG-001** do gabarito |
| BUG-002 | Permissão de texto nos campos e-mail e senha | Fora do escopo — não há limite de tamanho especificado para os campos de login |
| BUG-003 | Não é possível visualizar a senha digitada | Sugestão de melhoria |
| BUG-004 | Não é possível cadastrar novos admin | Falso positivo — consequência do ambiente (ver nota) |
| BUG-005 | Salva edição de perfil sem e-mail preenchido | ✅ **BUG-033** do gabarito |
| BUG-006 | Sistema não valida e-mail | ✅ **BUG-032** do gabarito |
| BUG-007 | Campo e-mail aceita qualquer caractere no perfil | ✅ **BUG-032** (mesmo defeito do item anterior) |
| BUG-008 | Não permite alterar o perfil de acesso | ⚠️ **BUG-011** parcial — ver observação |
| BUG-009 | Aparece "Usuário" no acesso de admin | ⚠️ **BUG-014** parcial — ver observação |
| BUG-010 | Aviso de erro na página de tarefas | Ambiente — índice do Firestore |
| BUG-011 | Sistema não salva tarefas corretamente | Ambiente — índice do Firestore |
| BUG-012 | Campo data aceita data passada | ✅ **BUG-017** do gabarito |
| BUG-013 | Mensagem de erro ao visualizar tarefas | Ambiente — índice do Firestore |
| BUG-014 | Não é possível editar status de tarefas | Ambiente — a listagem não carregava, então o fluxo não pôde ser exercitado |
| BUG-015 | Erro ao sair do sistema (botão voltar) | ✅ **BUG-002** do gabarito |
| MEL-001 | Selecionar tipo de login na tela de entrada | Sugestão de melhoria |

## Visão do usuário — 15 ocorrências

| # | Título | Classificação |
|---|---|---|
| BUG-001 | Login permite acesso com senha incorreta | ✅ **BUG-001** (repetido do outro ciclo) |
| BUG-002 | Dashboard carregando continuamente | Ambiente — índice do Firestore |
| BUG-003 | "The query requires an index" na tela de tarefas | Ambiente — índice do Firestore (mensagem literal) |
| BUG-004 | Ícone de visualização de senha não exibido | Sugestão de melhoria |
| BUG-005 | Campo e-mail aceita formato inválido no perfil | ✅ **BUG-032** (repetido) |
| BUG-006 | Sem mensagem de senha obrigatória + erro do Firebase | ✅ **BUG-004** do gabarito |
| BUG-007 | Tela de login sem botão de cadastro | Fora do escopo — o sistema não prevê autocadastro |
| BUG-008 | Perfil salva sem e-mail preenchido | ✅ **BUG-033** (repetido) |
| BUG-009 | Acesso à página após clicar em sair | ✅ **BUG-002** (repetido) |
| BUG-010 | Mensagem de erro na página de tarefas | Ambiente — índice do Firestore |
| BUG-011 | Sistema não salva tarefa cadastrada | Ambiente — índice do Firestore |
| BUG-012 | Permite salvar data anterior ao cadastro | ✅ **BUG-017** (repetido) |
| BUG-013 | Salva tarefa sem título e descrição | ✅ **BUG-015** do gabarito |
| BUG-014 | Preenchimento de senha e login "infinitos" | Fora do escopo — mesmo caso do ADMIN BUG-002 |
| MEL-001 | Perfil não permite trocar a senha | Sugestão de melhoria |

---

## Defeitos do gabarito identificados

| Gabarito | Severidade | Reportado como |
|---|---|---|
| BUG-001 — Login aceita senha incorreta | CRÍTICA | ADMIN BUG-001 · USER BUG-001 |
| BUG-002 — Tela protegida continua acessível após logout | CRÍTICA | ADMIN BUG-015 · USER BUG-009 |
| BUG-004 — Senha vazia exibe erro técnico do Firebase | BAIXA | USER BUG-006 |
| BUG-015 — Tarefa é criada sem título | ALTA | USER BUG-013 |
| BUG-017 — Prazo no passado é aceito | MÉDIA | ADMIN BUG-012 · USER BUG-012 |
| BUG-032 — Validação de e-mail aceita formato inválido | BAIXA | ADMIN BUG-006, BUG-007 · USER BUG-005 |
| BUG-033 — Perfil próprio não valida os campos | BAIXA | ADMIN BUG-005 · USER BUG-008 |

### Parciais

**BUG-011 — USER se promove a ADMIN pelo próprio perfil (CRÍTICA).**
No ADMIN BUG-008 ela registrou que o campo "Perfil de acesso" não permite alteração. É
exatamente o campo vulnerável: o bloqueio é apenas visual e o campo cede à navegação por
teclado, permitindo escalonamento de privilégio. Ela encontrou a porta, mas não testou a
maçaneta — reportou como limitação, não como brecha.

**BUG-014 — Perfil implícito quando o documento do usuário não é encontrado (CRÍTICA).**
No ADMIN BUG-009 ela notou o sistema exibindo "Usuário" para uma conta de administrador.
Esse é o perfil fantasma que o `AuthContext` inventa quando não consegue ler
`users/{uid}` — o mesmo mecanismo que permite a um usuário excluído continuar entrando.
Ela viu o sintoma sem chegar à causa nem à consequência de segurança.

---

## Nota sobre o ambiente

Oito ocorrências (ADMIN BUG-010, BUG-011, BUG-013, BUG-014 e USER BUG-002, BUG-003,
BUG-010, BUG-011) têm a mesma origem: o índice composto declarado em
[`../firestore.indexes.json`](../firestore.indexes.json) nunca foi publicado no projeto.
Sem ele, a consulta que combina `where('userId')` com `orderBy('createdAt')` falha com
*"The query requires an index"* — literalmente o texto do USER BUG-003.

O efeito em cascata explica quase todos os outros achados de ambiente: a listagem de
tarefas do USER ficava vazia, o dashboard não terminava de carregar, e a leitura do perfil
falhava — o que fazia o administrador ser tratado como usuário comum (ADMIN BUG-009) e
sumir com o menu administrativo, gerando o "não é possível cadastrar novos admin"
(ADMIN BUG-004).

**Situação:** corrigido. As consultas deixaram de depender do índice composto (a ordenação
passou a ser feita no cliente) e o dashboard passou a tratar falhas em vez de ficar preso
no carregamento. Um novo ciclo agora roda sobre um ambiente íntegro.

Vale considerar isso na avaliação: esses oito relatos consumiram parte do esforço dela e
mascararam fluxos inteiros — tarefas, dashboard e a área administrativa — onde está a maior
concentração de defeitos plantados ainda pendentes.
