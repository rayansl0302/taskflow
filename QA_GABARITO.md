# Gabarito interno — TaskFlow

> **DOCUMENTO INTERNO. NÃO ENTREGAR AO PROFISSIONAL AVALIADO.**
>
> Mapa dos defeitos inseridos propositalmente na aplicação. Material interno: não entregar ao profissional avaliado.

**Total de bugs inseridos: 48**

---

## Índice

| ID | Título | Área | Severidade | Dificuldade |
|---|---|---|---|---|
| BUG-001 | Login aceita senha incorreta | Autenticação | CRÍTICA | Média |
| BUG-002 | Tela protegida continua acessível após logout | Autenticação | CRÍTICA | Média |
| BUG-003 | Usuário INATIVO consegue usar o sistema | Autenticação | ALTA | Baixa |
| BUG-004 | Senha vazia exibe erro técnico do Firebase | Autenticação / UX | BAIXA | Baixa |
| BUG-005 | E-mail de login não é normalizado | Autenticação | BAIXA | Média |
| BUG-006 | Recuperação de senha sempre informa sucesso | Autenticação | MÉDIA | Média |
| BUG-007 | Redirecionamento pós-login ignora a rota de origem | Navegação | BAIXA | Média |
| BUG-008 | USER acessa /users digitando a URL | Autorização | CRÍTICA | Baixa |
| BUG-009 | IDOR em /tasks/:id | Autorização | CRÍTICA | Média |
| BUG-010 | Regras do Firestore permitem ler e alterar tarefas de terceiros | Segurança | CRÍTICA | Alta |
| BUG-011 | USER se promove a ADMIN pelo próprio perfil | Segurança | CRÍTICA | Alta |
| BUG-012 | Qualquer usuário autenticado lê a coleção users | Segurança | ALTA | Média |
| BUG-013 | USER visualiza a métrica 'Total de usuários' | Autorização | MÉDIA | Baixa |
| BUG-014 | Usuário excluído continua conseguindo logar | Segurança | CRÍTICA | Média |
| BUG-015 | Tarefa é criada sem título | Validação | ALTA | Baixa |
| BUG-016 | Descrição aceita mais de 500 caracteres | Validação | MÉDIA | Média |
| BUG-017 | Prazo no passado é aceito | Validação / Datas | MÉDIA | Baixa |
| BUG-018 | Duplo clique em Salvar cria duas tarefas | Concorrência | ALTA | Média |
| BUG-019 | Edição não persiste a prioridade | CRUD | ALTA | Média |
| BUG-020 | Exclusão de tarefa concluída não remove do banco | CRUD | ALTA | Média |
| BUG-021 | Status alterado na listagem volta ao original | CRUD / Firestore | ALTA | Média |
| BUG-022 | Salvar tarefa redireciona para o dashboard | Navegação | BAIXA | Baixa |
| BUG-023 | Refresh no formulário perde os dados sem aviso | UX | BAIXA | Baixa |
| BUG-024 | Edição simultânea sobrescreve sem aviso | Concorrência | ALTA | Alta |
| BUG-025 | Troca rápida de status gera estado inconsistente | Concorrência | MÉDIA | Alta |
| BUG-026 | Criar usuário derruba a sessão do ADMIN | Autenticação | CRÍTICA | Média |
| BUG-027 | Perfil não é obrigatório ao criar usuário | Validação | MÉDIA | Baixa |
| BUG-028 | Alterar o e-mail do usuário não altera o login | CRUD / Sincronismo | ALTA | Alta |
| BUG-029 | Exclusão de usuário sem confirmação | UX | MÉDIA | Baixa |
| BUG-030 | Exclusão de usuário deixa tarefas órfãs | CRUD | ALTA | Média |
| BUG-031 | Nome composto apenas por espaços é aceito | Validação | BAIXA | Média |
| BUG-032 | Validação de e-mail aceita formato inválido | Validação | BAIXA | Média |
| BUG-033 | Perfil próprio não valida tamanho do nome | Validação | BAIXA | Média |
| BUG-034 | Último registro da página se repete na página seguinte | Paginação | MÉDIA | Média |
| BUG-035 | Aplicar filtro não retorna para a primeira página | Paginação | MÉDIA | Baixa |
| BUG-036 | Contador de resultados ignora os filtros | Filtros | MÉDIA | Baixa |
| BUG-037 | Filtro 'Cancelada' nunca retorna resultados | Filtros | MÉDIA | Baixa |
| BUG-038 | Pesquisa de tarefas é sensível a maiúsculas | Pesquisa | MÉDIA | Baixa |
| BUG-039 | Pesquisa de usuários trata nome e e-mail de formas diferentes | Pesquisa | MÉDIA | Média |
| BUG-040 | Ordenação por prioridade é alfabética | Ordenação | BAIXA | Média |
| BUG-041 | Dashboard considera no máximo 20 tarefas | Dashboard | ALTA | Média |
| BUG-042 | 'Concluídas' soma as tarefas canceladas | Dashboard | MÉDIA | Média |
| BUG-043 | Dashboard exibe números em cache (inclusive de outro usuário) | Cache / Estado | ALTA | Alta |
| BUG-044 | Data salva aparece um dia antes | Datas / Timezone | ALTA | Média |
| BUG-045 | Tarefa com prazo para hoje aparece como atrasada | Datas | MÉDIA | Média |
| BUG-046 | Estado vazio aparece durante o carregamento | UX / Loading | BAIXA | Baixa |
| BUG-047 | URL inexistente exibe tela em branco | Rotas | MÉDIA | Baixa |
| BUG-048 | Layout não é responsivo | Responsividade | MÉDIA | Baixa |

### Distribuição por severidade

| Severidade | Qtde |
|---|---:|
| CRÍTICA | 8 |
| ALTA | 13 |
| MÉDIA | 17 |
| BAIXA | 10 |

---

## BUG-001 — Login aceita senha incorreta

**Área:** Autenticação · **Severidade:** CRÍTICA · **Dificuldade:** Média

**Por que acontece**

O signIn() tem um fallback disfarçado de 'compatibilidade com contas migradas': quando o Firebase devolve auth/wrong-password ou auth/invalid-credential e o e-mail termina em @taskflow.com, o código refaz o login usando a senha padrão do seed (VITE_SEED_PASSWORD). Como todos os usuários de demonstração usam essa senha, qualquer senha errada acaba autenticando.

**Onde está**

- `src/services/firebase/auth.ts → signIn(), constante LEGACY_PASSWORD`

**Como reproduzir**

1. Abrir /login.
2. Informar admin@taskflow.com e uma senha qualquer (ex.: 'qualquercoisa').
3. Clicar em Entrar.

**Resultado esperado:** Mensagem 'E-mail ou senha inválidos' e permanência na tela de login.

**Resultado atual:** Login concluído com sucesso e redirecionamento para o dashboard.

**Como se chega nele:** Teste negativo de autenticação (senha inválida).

---

## BUG-002 — Tela protegida continua acessível após logout

**Área:** Autenticação · **Severidade:** CRÍTICA · **Dificuldade:** Média

**Por que acontece**

O guard de rota aceita como prova de autenticação um retrato do perfil guardado no localStorage (criado para evitar o 'flash' de redirecionamento durante a reidratação do Firebase Auth). O logout limpa o estado em memória, mas nunca remove essa chave — então o guard continua achando que existe sessão.

**Onde está**

- `src/routes/ProtectedRoute.tsx`
- `src/contexts/AuthContext.tsx → readCachedSession() / chave taskflow:last-session`

**Como reproduzir**

1. Fazer login com qualquer usuário.
2. Clicar em Sair.
3. Pressionar o botão Voltar do navegador (ou digitar /dashboard na barra de endereços).

**Resultado esperado:** Redirecionamento imediato para /login.

**Resultado atual:** A tela protegida é renderizada por completo — menu lateral, topbar e os indicadores do dashboard vindos do cache —, apenas sem o nome do usuário.

**Como se chega nele:** Botão voltar / digitação manual de URL após logout.

---

## BUG-003 — Usuário INATIVO consegue usar o sistema

**Área:** Autenticação · **Severidade:** ALTA · **Dificuldade:** Baixa

**Por que acontece**

O carregamento do perfil lê name, email, role e status do Firestore, mas nunca testa o status. O campo existe, é exibido na listagem de usuários e pode ser editado — só não tem efeito nenhum sobre o acesso.

**Onde está**

- `src/contexts/AuthContext.tsx → loadProfile()`

**Como reproduzir**

1. Fazer login com carlos.inativo@taskflow.com (status INATIVO).

**Resultado esperado:** Acesso bloqueado, com mensagem informando que a conta está inativa.

**Resultado atual:** Login normal, com acesso a dashboard, tarefas e perfil.

**Como se chega nele:** Comparar o campo Status da tela de usuários com o comportamento real.

---

## BUG-004 — Senha vazia exibe erro técnico do Firebase

**Área:** Autenticação / UX · **Severidade:** BAIXA · **Dificuldade:** Baixa

**Por que acontece**

O formulário valida a obrigatoriedade do e-mail, mas não a da senha, e o campo não tem o atributo required. A requisição chega ao Firebase, que devolve auth/missing-password — código não previsto no friendlyError(), que então cai no default e mostra a mensagem crua da biblioteca.

**Onde está**

- `src/pages/Login.tsx (valida apenas o e-mail)`
- `src/utils/format.ts → friendlyError()`

**Como reproduzir**

1. Abrir /login.
2. Preencher apenas o e-mail.
3. Clicar em Entrar.

**Resultado esperado:** Mensagem 'A senha é obrigatória.' abaixo do campo, sem chamada ao servidor.

**Resultado atual:** Toast com o texto 'Firebase: Error (auth/missing-password).'

**Como se chega nele:** Teste de campo obrigatório vazio.

---

## BUG-005 — E-mail de login não é normalizado

**Área:** Autenticação · **Severidade:** BAIXA · **Dificuldade:** Média

**Por que acontece**

O valor do campo é enviado exatamente como digitado, sem trim() nem toLowerCase(). Espaços colados (comuns em copiar/colar de e-mail) fazem o Firebase rejeitar o formato antes mesmo de verificar as credenciais.

**Onde está**

- `src/pages/Login.tsx`

**Como reproduzir**

1. Copiar e colar ' admin@taskflow.com' (com um espaço à esquerda).
2. Informar a senha correta e entrar.

**Resultado esperado:** Login efetuado — espaços nas pontas devem ser ignorados.

**Resultado atual:** Erro técnico auth/invalid-email.

**Como se chega nele:** Teste de limite com espaços em branco.

---

## BUG-006 — Recuperação de senha sempre informa sucesso

**Área:** Autenticação · **Severidade:** MÉDIA · **Dificuldade:** Média

**Por que acontece**

O envio está dentro de um try/catch com catch vazio, e a mensagem de sucesso é disparada no finally — ou seja, roda mesmo quando a chamada falha. Além disso, o formulário não valida o formato do e-mail antes de enviar.

**Onde está**

- `src/pages/ForgotPassword.tsx`

**Como reproduzir**

1. Abrir /forgot-password.
2. Digitar 'abc' (que nem é um e-mail).
3. Clicar em Enviar link de recuperação.

**Resultado esperado:** Validação de formato antes do envio; falhas reais precisam ser tratadas e comunicadas.

**Resultado atual:** Mensagem de sucesso e tela de confirmação, mesmo sem nenhuma requisição válida ter sido feita.

**Observações:** Não revelar se o e-mail existe é correto por segurança — o defeito é declarar sucesso para entradas inválidas e engolir falhas reais.

---

## BUG-007 — Redirecionamento pós-login ignora a rota de origem

**Área:** Navegação · **Severidade:** BAIXA · **Dificuldade:** Média

**Por que acontece**

O ProtectedRoute guarda a rota pretendida em location.state.from ao redirecionar para o login, mas a tela de login ignora esse estado e sempre navega para o dashboard.

**Onde está**

- `src/pages/Login.tsx → navigate('/dashboard')`
- `src/routes/ProtectedRoute.tsx (envia state.from)`

**Como reproduzir**

1. Deslogado, acessar diretamente /tasks/new.
2. Ser redirecionado para /login.
3. Autenticar.

**Resultado esperado:** Retorno para /tasks/new após o login.

**Resultado atual:** O usuário cai sempre no /dashboard e precisa refazer a navegação.

---

## BUG-008 — USER acessa /users digitando a URL

**Área:** Autorização · **Severidade:** CRÍTICA · **Dificuldade:** Baixa

**Por que acontece**

As rotas /users/new e /users/:id estão protegidas pelo AdminRoute, mas a listagem /users ficou apenas dentro do ProtectedRoute. O item de menu é escondido corretamente para USER, o que dá a falsa impressão de que a tela está protegida.

**Onde está**

- `src/App.tsx (a rota /users está fora do AdminRoute)`
- `src/pages/Users.tsx (não verifica o perfil)`

**Como reproduzir**

1. Fazer login com um usuário de perfil USER (ex.: maria.silva@taskflow.com).
2. Digitar /users diretamente na barra de endereços.

**Resultado esperado:** Acesso negado ou redirecionamento para uma tela permitida.

**Resultado atual:** A listagem administrativa é exibida, com e-mails de todos os usuários e botões de editar e excluir.

**Como se chega nele:** Alteração manual da URL com perfil não administrativo.

---

## BUG-009 — IDOR em /tasks/:id

**Área:** Autorização · **Severidade:** CRÍTICA · **Dificuldade:** Média

**Por que acontece**

A listagem filtra corretamente por userId, o que dá a impressão de isolamento. Mas a tela de detalhe/edição só faz getTask(id) e renderiza — nunca compara task.userId com o usuário autenticado. Como as regras do Firestore também liberam a leitura (BUG-010), o dado vem do servidor sem restrição.

**Onde está**

- `src/pages/TaskForm.tsx (carrega a tarefa por ID sem checar o dono)`

**Como reproduzir**

1. Logar como ADMIN e copiar o ID de uma tarefa da Maria (visível na URL).
2. Sair e logar como joao.pereira@taskflow.com.
3. Acessar /tasks/<id-da-tarefa-da-maria>.

**Resultado esperado:** Acesso negado — o USER só pode abrir as próprias tarefas.

**Resultado atual:** Os dados são exibidos e a tarefa pode ser editada e excluída por quem não é dono.

**Como se chega nele:** Troca manual do ID na URL entre usuários diferentes.

---

## BUG-010 — Regras do Firestore permitem ler e alterar tarefas de terceiros

**Área:** Segurança · **Severidade:** CRÍTICA · **Dificuldade:** Alta

**Por que acontece**

As regras liberam read, create e update para qualquer usuário autenticado (allow ... if isSignedIn()), sem comparar resource.data.userId com request.auth.uid. Só o delete verifica o dono. A separação por usuário existe apenas no filtro do front-end, então qualquer chamada direta ao SDK contorna a proteção.

**Onde está**

- `firestore.rules → match /tasks/{taskId}`

**Como reproduzir**

1. Autenticar como USER na aplicação.
2. No console do navegador, usar o SDK do Firestore para ler a coleção tasks inteira, ou atualizar uma tarefa de outro usuário.
3. Observar que a operação é aceita.

**Resultado esperado:** O USER só deve ler e escrever documentos em que userId == request.auth.uid.

**Resultado atual:** Leitura e escrita liberadas para toda a coleção; o front-end é a única barreira.

**Como se chega nele:** Chamada direta ao Firestore / teste de API, comparando com o que a interface permite.

---

## BUG-011 — USER se promove a ADMIN pelo próprio perfil

**Área:** Segurança · **Severidade:** CRÍTICA · **Dificuldade:** Alta

**Por que acontece**

O campo 'Perfil de acesso' parece bloqueado porque a classe .is-locked aplica pointer-events: none e cor de campo desabilitado — mas o elemento continua habilitado e focável pelo teclado. O valor do select entra no payload de updateUser(), e a regra do Firestore permite que o próprio usuário atualize seu documento sem proteger o campo role.

**Onde está**

- `src/pages/Profile.tsx (select recebe a classe CSS is-locked, sem o atributo disabled)`
- `firestore.rules → match /users/{userId}: allow update: if isAdmin() || isOwner(userId)`

**Como reproduzir**

1. Fazer login com um usuário USER.
2. Abrir /profile.
3. Pressionar Tab até o campo 'Perfil de acesso' (o mouse não funciona nele) e mudar para 'Administrador' com as setas.
4. Clicar em Salvar alterações.
5. Observar o menu 'Usuários' surgindo na barra lateral.

**Resultado esperado:** Campo realmente somente leitura e regra recusando qualquer alteração de role feita pelo próprio usuário.

**Resultado atual:** Escalonamento de privilégio completo: o USER vira ADMIN, com acesso a todas as tarefas e à gestão de usuários.

**Como se chega nele:** Navegação por teclado / inspeção do DOM em um campo aparentemente desabilitado.

---

## BUG-012 — Qualquer usuário autenticado lê a coleção users

**Área:** Segurança · **Severidade:** ALTA · **Dificuldade:** Média

**Por que acontece**

A regra foi afrouxada para que a listagem de tarefas conseguisse exibir o nome do responsável. Com isso, qualquer conta autenticada baixa a base inteira de usuários — nome, e-mail, perfil e status — mesmo sem abrir a tela administrativa.

**Onde está**

- `firestore.rules → match /users/{userId}: allow read: if isSignedIn()`
- `src/pages/Tasks.tsx e src/pages/Dashboard.tsx (chamam listUsers())`

**Como reproduzir**

1. Logar como USER.
2. Abrir /tasks com o DevTools na aba Network (ou Console).
3. Observar a resposta da consulta à coleção users.

**Resultado esperado:** O USER recebe apenas os dados estritamente necessários, sem exposição da base de usuários.

**Resultado atual:** Nome e e-mail de todos os usuários trafegam para qualquer conta autenticada.

**Como se chega nele:** Inspeção do tráfego / comparação entre o que a tela mostra e o que a API devolve.

---

## BUG-013 — USER visualiza a métrica 'Total de usuários'

**Área:** Autorização · **Severidade:** MÉDIA · **Dificuldade:** Baixa

**Por que acontece**

O array de cards do dashboard é fixo e inclui sempre o total de usuários; a verificação de perfil só é usada para escolher o texto do subtítulo e o escopo da consulta de tarefas.

**Onde está**

- `src/pages/Dashboard.tsx (o card é montado sem verificar isAdmin)`

**Como reproduzir**

1. Fazer login com um usuário USER e abrir o dashboard.

**Resultado esperado:** Métricas de usuários visíveis apenas para ADMIN; o USER vê somente dados das próprias tarefas.

**Resultado atual:** O card 'Total de usuários' aparece para todos os perfis.

---

## BUG-014 — Usuário excluído continua conseguindo logar

**Área:** Segurança · **Severidade:** CRÍTICA · **Dificuldade:** Média

**Por que acontece**

A exclusão remove o documento do Firestore, mas não a conta no Firebase Authentication. E quando o documento não existe, o AuthContext monta um perfil 'fantasma' em memória (role USER, status ATIVO) a partir dos dados do Auth — então o sistema trata a conta excluída como um usuário comum válido.

**Onde está**

- `src/services/firebase/users.ts → deleteUser() (apaga só o documento)`
- `src/contexts/AuthContext.tsx → loadProfile() (cria perfil implícito)`

**Como reproduzir**

1. Como ADMIN, excluir o usuário ana.souza@taskflow.com em /users.
2. Sair da aplicação.
3. Fazer login com ana.souza@taskflow.com e a senha original.

**Resultado esperado:** Acesso negado — a conta não existe mais.

**Resultado atual:** Login concluído; o sistema cria um perfil implícito e a pessoa navega normalmente.

**Como se chega nele:** Testar o login de um usuário logo após excluí-lo.

---

## BUG-015 — Tarefa é criada sem título

**Área:** Validação · **Severidade:** ALTA · **Dificuldade:** Baixa

**Por que acontece**

A função só valida o mínimo de 3 caracteres quando o campo não está vazio (if (value.length > 0 && ...)) e o input não tem o atributo required. Resultado: 1 ou 2 caracteres são barrados, mas o campo totalmente vazio passa.

**Onde está**

- `src/utils/validators.ts → validateTitle()`

**Como reproduzir**

1. Abrir /tasks/new.
2. Preencher apenas o prazo, deixando o título vazio.
3. Clicar em Salvar.

**Resultado esperado:** Mensagem 'O título é obrigatório.' e bloqueio do envio.

**Resultado atual:** Tarefa criada; a listagem passa a exibir '(sem título)'.

**Observações:** Vale testar também 1 e 2 caracteres — nesses casos a validação funciona, o que torna o defeito menos óbvio.

---

## BUG-016 — Descrição aceita mais de 500 caracteres

**Área:** Validação · **Severidade:** MÉDIA · **Dificuldade:** Média

**Por que acontece**

A tela informa o limite de 500 caracteres em um contador, mas o textarea não restringe a digitação e a validação usa 5000 como teto — a mensagem de erro, inclusive, continua dizendo 500.

**Onde está**

- `src/utils/validators.ts → validateDescription() (limite de 5000)`
- `src/pages/TaskForm.tsx (textarea sem maxLength, contador exibindo /500)`

**Como reproduzir**

1. Abrir /tasks/new.
2. Colar um texto com cerca de 1.500 caracteres na descrição (o contador vai mostrar 1500/500).
3. Salvar e conferir o documento gravado no Firestore.

**Resultado esperado:** Bloqueio acima de 500 caracteres, coerente com o contador.

**Resultado atual:** O texto é gravado por inteiro, contradizendo o próprio contador da tela.

**Como se chega nele:** Teste de limite acima do máximo + comparação entre interface e banco.

---

## BUG-017 — Prazo no passado é aceito

**Área:** Validação / Datas · **Severidade:** MÉDIA · **Dificuldade:** Baixa

**Por que acontece**

A única regra aplicada ao prazo é a obrigatoriedade. Não há comparação com a data atual nem restrição no componente de data.

**Onde está**

- `src/utils/validators.ts → validateDueDate() (só obrigatoriedade)`
- `src/pages/TaskForm.tsx (input date sem atributo min)`

**Como reproduzir**

1. Abrir /tasks/new.
2. Informar um prazo do ano anterior.
3. Salvar.

**Resultado esperado:** Recusa de datas anteriores a hoje (ou, no mínimo, um aviso explícito).

**Resultado atual:** A tarefa é criada com prazo vencido e já aparece marcada como atrasada.

**Como se chega nele:** Teste de datas: ontem, mês anterior, ano anterior.

---

## BUG-018 — Duplo clique em Salvar cria duas tarefas

**Área:** Concorrência · **Severidade:** ALTA · **Dificuldade:** Média

**Por que acontece**

O estado 'saving' é usado apenas para trocar o rótulo do botão para 'Salvando...', mas o botão continua clicável. Cada clique dispara um createTask() independente, e não há trava de idempotência no serviço.

**Onde está**

- `src/pages/TaskForm.tsx (botão de submit sem disabled={saving})`

**Como reproduzir**

1. Preencher uma nova tarefa em /tasks/new.
2. Clicar duas vezes rapidamente em Salvar.
3. Abrir /tasks e procurar o título cadastrado.

**Resultado esperado:** Apenas um registro criado; o botão deve ficar desabilitado durante o envio.

**Resultado atual:** Dois documentos idênticos são gravados no Firestore.

**Observações:** O formulário de usuários usa disabled={saving} corretamente — a comparação entre os dois ajuda a evidenciar o defeito.

---

## BUG-019 — Edição não persiste a prioridade

**Área:** CRUD · **Severidade:** ALTA · **Dificuldade:** Média

**Por que acontece**

O payload do updateDoc monta title, description, userId, status, dueDate e updatedAt — o campo priority ficou de fora. A criação (createTask) grava a prioridade normalmente, então o problema só aparece na edição.

**Onde está**

- `src/services/firebase/tasks.ts → updateTask()`

**Como reproduzir**

1. Abrir uma tarefa existente em /tasks/:id.
2. Alterar a prioridade para URGENTE (e, opcionalmente, mudar também o título).
3. Salvar — a mensagem de sucesso aparece.
4. Reabrir a mesma tarefa.

**Resultado esperado:** Prioridade atualizada junto com os demais campos.

**Resultado atual:** Título e status são salvos, mas a prioridade volta ao valor anterior.

**Como se chega nele:** Reabrir o registro após salvar / comparar com o documento no banco.

---

## BUG-020 — Exclusão de tarefa concluída não remove do banco

**Área:** CRUD · **Severidade:** ALTA · **Dificuldade:** Média

**Por que acontece**

A função tem um return antecipado quando o status é CONCLUIDA (comentado como 'histórico do período'). Ela não lança erro nem devolve indicação de falha, então a tela segue o fluxo de sucesso: mostra o toast e remove a linha do estado local.

**Onde está**

- `src/services/firebase/tasks.ts → deleteTask()`

**Como reproduzir**

1. Em /tasks, localizar uma tarefa com status Concluída.
2. Clicar em Excluir e confirmar.
3. Ver a mensagem 'Tarefa excluída com sucesso.' e a linha desaparecer.
4. Atualizar a página (F5).

**Resultado esperado:** Registro efetivamente removido do banco.

**Resultado atual:** A tarefa reaparece após o refresh — o documento nunca foi apagado.

**Como se chega nele:** Refresh após a exclusão / conferência no Firestore.

**Observações:** Com tarefas em outros status a exclusão funciona, o que faz o defeito passar despercebido em um teste rápido.

---

## BUG-021 — Status alterado na listagem volta ao original

**Área:** CRUD / Firestore · **Severidade:** ALTA · **Dificuldade:** Média

**Por que acontece**

A alteração rápida feita pelo select da listagem grava no campo 'state' em vez de 'status'. A escrita é aceita pelo Firestore (o documento ganha um campo órfão), a tela atualiza o estado local e mostra sucesso — mas o campo lido pela aplicação continua com o valor antigo.

**Onde está**

- `src/services/firebase/tasks.ts → changeTaskStatus()`

**Como reproduzir**

1. Abrir /tasks.
2. Mudar o status de uma tarefa para 'Concluída' pelo select da própria listagem.
3. Ver a mensagem 'Status atualizado com sucesso.'.
4. Atualizar a página (F5).

**Resultado esperado:** Status persistido no campo correto.

**Resultado atual:** O status volta ao valor anterior; no Firestore surge um campo 'state' que a aplicação nunca lê.

**Como se chega nele:** Refresh após a ação / comparação entre interface e banco.

**Observações:** Alterar o status pelo formulário de edição funciona. A divergência entre os dois caminhos é parte do achado.

---

## BUG-022 — Salvar tarefa redireciona para o dashboard

**Área:** Navegação · **Severidade:** BAIXA · **Dificuldade:** Baixa

**Por que acontece**

O destino pós-salvamento é fixo, independentemente da origem. Quem veio da listagem perde filtros, pesquisa e página em que estava.

**Onde está**

- `src/pages/TaskForm.tsx → navigate('/dashboard') após salvar`

**Como reproduzir**

1. Em /tasks, aplicar um filtro e ir para a página 2.
2. Abrir uma tarefa, alterar algo e salvar.

**Resultado esperado:** Retorno à listagem, preservando o contexto de navegação.

**Resultado atual:** O usuário é levado ao dashboard e precisa refazer filtro e paginação.

---

## BUG-023 — Refresh no formulário perde os dados sem aviso

**Área:** UX · **Severidade:** BAIXA · **Dificuldade:** Baixa

**Por que acontece**

O formulário mantém tudo em estado de componente, sem persistência temporária e sem interceptar a saída da página. Qualquer recarga ou navegação descarta o preenchimento silenciosamente.

**Onde está**

- `src/pages/TaskForm.tsx (sem rascunho e sem handler de beforeunload)`

**Como reproduzir**

1. Abrir /tasks/new e preencher os campos pela metade.
2. Pressionar F5 (ou o botão Voltar do navegador).

**Resultado esperado:** Aviso de alterações não salvas antes de descartar o conteúdo.

**Resultado atual:** O formulário volta vazio, sem nenhuma mensagem.

---

## BUG-024 — Edição simultânea sobrescreve sem aviso

**Área:** Concorrência · **Severidade:** ALTA · **Dificuldade:** Alta

**Por que acontece**

A gravação é um updateDoc direto, sem controle de versão: não há comparação do updatedAt carregado com o que está no banco, nem transação. Vale sempre a última escrita, mesmo que ela tenha partido de um formulário aberto com dados antigos.

**Onde está**

- `src/services/firebase/tasks.ts → updateTask()`

**Como reproduzir**

1. Abrir a mesma tarefa em duas abas do navegador.
2. Na aba 1, mudar o status para 'Em andamento' e salvar.
3. Na aba 2 (que ainda mostra os dados antigos), mudar o título e salvar.
4. Recarregar as duas abas.

**Resultado esperado:** Aviso de conflito ou mesclagem controlada das alterações.

**Resultado atual:** A segunda gravação desfaz silenciosamente a alteração feita na primeira.

**Como se chega nele:** Abertura do mesmo registro em múltiplas abas.

---

## BUG-025 — Troca rápida de status gera estado inconsistente

**Área:** Concorrência · **Severidade:** MÉDIA · **Dificuldade:** Alta

**Por que acontece**

A atualização da lista usa setTasks(tasks.map(...)) — lendo 'tasks' do closure do render — em vez da forma funcional setTasks(current => ...). Quando duas alterações acontecem antes de um novo render, a segunda parte de um retrato desatualizado e desfaz a primeira na tela.

**Onde está**

- `src/pages/Tasks.tsx → handleQuickStatus()`

**Como reproduzir**

1. Abrir /tasks.
2. Alterar rapidamente o status de duas tarefas diferentes, uma logo após a outra.
3. Observar as duas linhas.

**Resultado esperado:** As duas linhas refletem os novos status.

**Resultado atual:** Uma das alterações desaparece da tela, embora a requisição tenha sido enviada.

**Como se chega nele:** Execução de duas ações em sequência rápida.

---

## BUG-026 — Criar usuário derruba a sessão do ADMIN

**Área:** Autenticação · **Severidade:** CRÍTICA · **Dificuldade:** Média

**Por que acontece**

A criação usa createUserWithEmailAndPassword no SDK do cliente, que autentica automaticamente a conta recém-criada na mesma instância do Firebase Auth. O administrador é substituído pelo novo usuário sem qualquer aviso. O caminho correto seria criar a conta pelo Admin SDK (backend/Cloud Function).

**Onde está**

- `src/pages/UserForm.tsx`
- `src/services/firebase/auth.ts → createAuthAccount()`

**Como reproduzir**

1. Logar como ADMIN.
2. Abrir /users/new e cadastrar um usuário qualquer.
3. Salvar e observar a topbar e o menu lateral.

**Resultado esperado:** O administrador permanece autenticado após cadastrar o usuário.

**Resultado atual:** A sessão passa a ser a do novo usuário (perfil USER) e o menu administrativo desaparece.

**Como se chega nele:** Observar o usuário logado depois de uma ação administrativa.

---

## BUG-027 — Perfil não é obrigatório ao criar usuário

**Área:** Validação · **Severidade:** MÉDIA · **Dificuldade:** Baixa

**Por que acontece**

O select começa em 'Selecione', cujo value é string vazia, e a validação cobre apenas nome, e-mail e senha. O documento é gravado com role vazio, que não corresponde a nenhum perfil válido.

**Onde está**

- `src/utils/validators.ts → validateUser() (não valida role)`
- `src/pages/UserForm.tsx (opção 'Selecione' com valor vazio)`

**Como reproduzir**

1. Abrir /users/new.
2. Preencher nome, e-mail e senha, deixando 'Perfil' em 'Selecione'.
3. Salvar e observar a coluna Perfil na listagem.

**Resultado esperado:** Mensagem 'O perfil é obrigatório.' e bloqueio do envio.

**Resultado atual:** Usuário gravado com role vazio; a listagem exibe '—' e a conta se comporta como perfil não identificado.

---

## BUG-028 — Alterar o e-mail do usuário não altera o login

**Área:** CRUD / Sincronismo · **Severidade:** ALTA · **Dificuldade:** Alta

**Por que acontece**

O e-mail é um dado duplicado: existe no documento do Firestore (usado pela interface) e na conta do Firebase Authentication (usada para autenticar). A edição atualiza apenas o Firestore, então as duas fontes passam a divergir.

**Onde está**

- `src/services/firebase/users.ts → updateUser()`

**Como reproduzir**

1. Como ADMIN, editar um usuário em /users/:id e trocar o e-mail.
2. Salvar — a interface passa a exibir o e-mail novo.
3. Sair e tentar logar com o e-mail novo.
4. Tentar logar com o e-mail antigo.

**Resultado esperado:** O login passa a funcionar com o novo e-mail.

**Resultado atual:** O e-mail novo não existe no Authentication; só o antigo autentica, enquanto a tela mostra o novo.

**Como se chega nele:** Comparação entre o dado exibido e o comportamento real de autenticação.

---

## BUG-029 — Exclusão de usuário sem confirmação

**Área:** UX · **Severidade:** MÉDIA · **Dificuldade:** Baixa

**Por que acontece**

O componente ConfirmDialog existe e é usado no módulo de tarefas, mas a tela de usuários chama a exclusão diretamente no clique do botão, sem etapa intermediária.

**Onde está**

- `src/pages/Users.tsx → handleDelete() chamado direto pelo onClick`

**Como reproduzir**

1. Abrir /users como ADMIN.
2. Clicar em Excluir em qualquer linha.

**Resultado esperado:** Modal de confirmação antes de uma ação irreversível, como exige o escopo de UX.

**Resultado atual:** O usuário é excluído imediatamente, no primeiro clique.

**Observações:** A exclusão de tarefas pede confirmação — a inconsistência entre os módulos reforça o achado.

---

## BUG-030 — Exclusão de usuário deixa tarefas órfãs

**Área:** CRUD · **Severidade:** ALTA · **Dificuldade:** Média

**Por que acontece**

A exclusão remove só o documento do usuário; não existe cascata, reatribuição, nem bloqueio quando há tarefas vinculadas. A tela de edição do usuário até mostra a contagem de 'Tarefas vinculadas', mas essa informação não é usada em nenhuma regra.

**Onde está**

- `src/services/firebase/users.ts → deleteUser()`
- `src/pages/Tasks.tsx (exibe o UID quando o usuário não é encontrado)`

**Como reproduzir**

1. Como ADMIN, abrir /users/:id de um usuário e anotar quantas tarefas vinculadas ele tem.
2. Excluir esse usuário.
3. Abrir /tasks e observar a coluna Responsável.

**Resultado esperado:** Tratamento explícito: impedir a exclusão, reatribuir ou remover as tarefas em conjunto.

**Resultado atual:** As tarefas continuam existindo e a coluna Responsável passa a exibir o UID cru do usuário excluído.

---

## BUG-031 — Nome composto apenas por espaços é aceito

**Área:** Validação · **Severidade:** BAIXA · **Dificuldade:** Média

**Por que acontece**

A regra de mínimo mede value.length sem aplicar trim(). Três espaços em branco têm comprimento 3 e passam pela validação de 'mínimo 3 caracteres'.

**Onde está**

- `src/utils/validators.ts → validateName()`

**Como reproduzir**

1. Abrir /users/new (ou editar um usuário).
2. Preencher o nome com três espaços.
3. Salvar e observar a listagem.

**Resultado esperado:** Rejeição por nome inválido — espaços não são conteúdo.

**Resultado atual:** Usuário gravado com nome em branco na listagem.

**Como se chega nele:** Teste de limite com espaços.

---

## BUG-032 — Validação de e-mail aceita formato inválido

**Área:** Validação · **Severidade:** BAIXA · **Dificuldade:** Média

**Por que acontece**

A expressão exige apenas 'algo, arroba, algo' sem espaços. Endereços sem domínio completo, como 'a@b', passam pela validação do front-end.

**Onde está**

- `src/utils/validators.ts → EMAIL_REGEX = /^\S+@\S+$/`

**Como reproduzir**

1. Abrir /users/new.
2. Informar o e-mail 'a@b' com os demais campos válidos.
3. Salvar.

**Resultado esperado:** Mensagem 'Informe um e-mail válido.'

**Resultado atual:** A validação do formulário aceita o valor.

**Como se chega nele:** Teste com caracteres especiais e formatos inválidos de e-mail.

---

## BUG-033 — Perfil próprio não valida tamanho do nome

**Área:** Validação · **Severidade:** BAIXA · **Dificuldade:** Média

**Por que acontece**

A tela de perfil não usa a função validateName() compartilhada: verifica apenas se o campo está preenchido, e o input não tem maxLength. A mesma entidade acaba com regras diferentes em telas diferentes.

**Onde está**

- `src/pages/Profile.tsx`

**Como reproduzir**

1. Abrir /profile.
2. Salvar o nome com 1 caractere.
3. Salvar o nome com 300 caracteres e observar a topbar e a listagem de usuários.

**Resultado esperado:** Mesmas regras de /users: mínimo 3 e máximo 100 caracteres.

**Resultado atual:** Ambos os valores são aceitos e gravados.

**Como se chega nele:** Testar a mesma regra em telas diferentes.

---

## BUG-034 — Último registro da página se repete na página seguinte

**Área:** Paginação · **Severidade:** MÉDIA · **Dificuldade:** Média

**Por que acontece**

O deslocamento é calculado com PAGE_SIZE - 1 (9) enquanto a fatia pega PAGE_SIZE (10) itens. Cada página começa um item antes do que deveria, sobrepondo sempre o último registro da página anterior.

**Onde está**

- `src/pages/Tasks.tsx → const start = (page - 1) * (PAGE_SIZE - 1)`

**Como reproduzir**

1. Logar como ADMIN e abrir /tasks (35 tarefas, 4 páginas).
2. Anotar o título do último item da página 1.
3. Ir para a página 2 e observar o primeiro item.

**Resultado esperado:** Páginas sem sobreposição, com todos os registros distribuídos uma única vez.

**Resultado atual:** O último item da página anterior reaparece como primeiro da página seguinte.

**Como se chega nele:** Conferir o encadeamento entre páginas, e não apenas a contagem total.

---

## BUG-035 — Aplicar filtro não retorna para a primeira página

**Área:** Paginação · **Severidade:** MÉDIA · **Dificuldade:** Baixa

**Por que acontece**

O número da página é um estado independente dos filtros. Quando o conjunto filtrado fica menor que o deslocamento atual, a fatia devolve um array vazio e a tela exibe o estado vazio.

**Onde está**

- `src/pages/Tasks.tsx (nenhum setPage(1) nos handlers de filtro e pesquisa)`

**Como reproduzir**

1. Abrir /tasks e navegar até a página 3.
2. Aplicar um filtro que retorne poucos resultados (ex.: prioridade Urgente).

**Resultado esperado:** Voltar automaticamente para a página 1 ao mudar o filtro.

**Resultado atual:** Permanece na página 3 e mostra 'Nenhuma tarefa encontrada', sugerindo que o filtro não tem resultados.

---

## BUG-036 — Contador de resultados ignora os filtros

**Área:** Filtros · **Severidade:** MÉDIA · **Dificuldade:** Baixa

**Por que acontece**

O rótulo usa a lista completa carregada do servidor, e não a lista após pesquisa e filtros (que fica em outra variável, usada apenas para montar a tabela).

**Onde está**

- `src/pages/Tasks.tsx → texto '{tasks.length} tarefa(s) encontrada(s)'`

**Como reproduzir**

1. Abrir /tasks.
2. Aplicar qualquer filtro de status ou prioridade.
3. Comparar o número exibido com a quantidade real de linhas.

**Resultado esperado:** O total acompanha os filtros aplicados.

**Resultado atual:** O contador mostra sempre o total geral de tarefas.

**Observações:** Na tela de usuários o mesmo contador está correto — comparar as duas telas evidencia o defeito.

---

## BUG-037 — Filtro 'Cancelada' nunca retorna resultados

**Área:** Filtros · **Severidade:** MÉDIA · **Dificuldade:** Baixa

**Por que acontece**

O valor da opção foi escrito no masculino ('CANCELADO'), enquanto o domínio gravado no banco é 'CANCELADA'. A comparação exata nunca casa, então o filtro devolve lista vazia.

**Onde está**

- `src/pages/Tasks.tsx → STATUS_OPTIONS, opção com value 'CANCELADO'`

**Como reproduzir**

1. Abrir /tasks (existem tarefas canceladas na base).
2. Selecionar o status 'Cancelada' no filtro.

**Resultado esperado:** Listagem das tarefas com status CANCELADA.

**Resultado atual:** Estado vazio, como se não houvesse nenhuma tarefa cancelada.

**Observações:** Os outros três status funcionam, o que faz o problema passar despercebido em um teste superficial.

---

## BUG-038 — Pesquisa de tarefas é sensível a maiúsculas

**Área:** Pesquisa · **Severidade:** MÉDIA · **Dificuldade:** Baixa

**Por que acontece**

O título é comparado com task.title.includes(search), sem normalização, enquanto a descrição usa toLowerCase() nos dois lados. O mesmo campo de busca tem, portanto, dois comportamentos diferentes — e nenhum dos dois trata espaços nas pontas ou acentuação.

**Onde está**

- `src/pages/Tasks.tsx → filtro de busca`

**Como reproduzir**

1. Abrir /tasks.
2. Pesquisar 'revisar', depois 'Revisar' e depois 'REVISAR'.
3. Repetir com um termo que só exista na descrição.

**Resultado esperado:** Mesmo resultado nas três formas, independentemente de caixa e acentos.

**Resultado atual:** Resultados diferentes conforme a caixa e conforme o termo estar no título ou na descrição.

**Como se chega nele:** Variações de caixa, acentuação e espaços no termo pesquisado.

---

## BUG-039 — Pesquisa de usuários trata nome e e-mail de formas diferentes

**Área:** Pesquisa · **Severidade:** MÉDIA · **Dificuldade:** Média

**Por que acontece**

O nome é comparado sem normalização nenhuma (casa apenas com a grafia exata gravada), e o e-mail força o termo para minúsculas apenas de um lado da comparação. O mesmo campo entrega dois comportamentos.

**Onde está**

- `src/pages/Users.tsx → user.name.includes(search) || user.email.includes(search.toLowerCase())`

**Como reproduzir**

1. Abrir /users como ADMIN.
2. Pesquisar 'João', depois 'joão' e depois 'JOÃO'.
3. Pesquisar parte de um e-mail em maiúsculas.

**Resultado esperado:** Resultado idêntico, independentemente de caixa e acentuação.

**Resultado atual:** Só a grafia exata encontra o registro pelo nome; o e-mail responde de forma diferente à mesma entrada.

---

## BUG-040 — Ordenação por prioridade é alfabética

**Área:** Ordenação · **Severidade:** BAIXA · **Dificuldade:** Média

**Por que acontece**

A ordenação compara os textos dos enums em vez de um peso de negócio. Alfabeticamente, ALTA vem antes de BAIXA, que vem antes de MEDIA e URGENTE.

**Onde está**

- `src/pages/Tasks.tsx → a.priority.localeCompare(b.priority)`

**Como reproduzir**

1. Abrir /tasks.
2. Selecionar a ordenação por 'Prioridade'.
3. Observar a sequência das prioridades exibidas.

**Resultado esperado:** BAIXA → MEDIA → ALTA → URGENTE (ou o inverso), seguindo a criticidade.

**Resultado atual:** ALTA → BAIXA → MEDIA → URGENTE (ordem alfabética dos códigos).

---

## BUG-041 — Dashboard considera no máximo 20 tarefas

**Área:** Dashboard · **Severidade:** ALTA · **Dificuldade:** Média

**Por que acontece**

Os indicadores são calculados no cliente a partir de uma consulta limitada a 20 documentos — uma amostra, não o total. A listagem usa outra consulta, sem limite, então as duas telas discordam.

**Onde está**

- `src/services/firebase/tasks.ts → listTasksForMetrics() com limit(20)`

**Como reproduzir**

1. Logar como ADMIN e abrir o dashboard.
2. Anotar o valor de 'Total de tarefas'.
3. Abrir /tasks e comparar com o total real (35 tarefas na base do seed).

**Resultado esperado:** Os números do dashboard refletem toda a base visível ao usuário.

**Resultado atual:** Todos os indicadores são calculados sobre 20 registros; o total exibido é 20 contra 35 da listagem.

**Como se chega nele:** Comparação cruzada entre dashboard e listagem.

---

## BUG-042 — 'Concluídas' soma as tarefas canceladas

**Área:** Dashboard · **Severidade:** MÉDIA · **Dificuldade:** Média

**Por que acontece**

O contador de concluídas foi escrito como status === 'CONCLUIDA' || status === 'CANCELADA', misturando dois desfechos distintos no mesmo indicador.

**Onde está**

- `src/pages/Dashboard.tsx (filtro do card done inclui CANCELADA)`

**Como reproduzir**

1. Abrir o dashboard e anotar o valor de 'Concluídas'.
2. Em /tasks, filtrar por Concluída e contar os registros.
3. Somar com as tarefas canceladas e comparar.

**Resultado esperado:** O card conta apenas tarefas com status CONCLUIDA.

**Resultado atual:** Total inflado; a soma dos cards não corresponde à listagem por status.

---

## BUG-043 — Dashboard exibe números em cache (inclusive de outro usuário)

**Área:** Cache / Estado · **Severidade:** ALTA · **Dificuldade:** Alta

**Por que acontece**

Os indicadores são gravados em sessionStorage com validade de 10 minutos e, enquanto o cache está válido, não são recalculados — mas a tabela 'Tarefas recentes', logo abaixo, continua vindo do servidor. Pior: a chave não é segmentada por usuário e o logout não a limpa, então a sessão seguinte na mesma aba herda os números da anterior.

**Onde está**

- `src/pages/Dashboard.tsx → cache em sessionStorage, chave taskflow:dashboard-metrics`

**Como reproduzir**

1. Cenário A — dado desatualizado: abrir o dashboard, criar uma tarefa e voltar ao dashboard (inclusive com F5).
2. Cenário B — vazamento entre sessões: logar como USER e abrir o dashboard; sair; logar como ADMIN na mesma aba e abrir o dashboard.

**Resultado esperado:** Indicadores sempre atualizados e sempre referentes ao usuário autenticado.

**Resultado atual:** A: os cards mantêm os valores antigos enquanto a nova tarefa já aparece na lista logo abaixo — a mesma tela se contradiz. B: o ADMIN vê por até 10 minutos os indicadores calculados para o USER anterior.

**Como se chega nele:** Comparação entre partes da mesma tela e troca de usuário na mesma aba.

---

## BUG-044 — Data salva aparece um dia antes

**Área:** Datas / Timezone · **Severidade:** ALTA · **Dificuldade:** Média

**Por que acontece**

new Date('2026-09-20') é interpretado pelo JavaScript como meia-noite em UTC. Gravado assim, o horário equivale às 21h do dia anterior em UTC-3, e formatDate() converte para o fuso local ao exibir. Já o formulário usa toISOString(), que devolve a data em UTC — por isso ele mostra o dia 'certo' enquanto listagem e detalhe mostram o dia anterior.

**Onde está**

- `src/utils/date.ts → parseDateInput() (new Date('AAAA-MM-DD'))`
- `src/utils/date.ts → formatDate() / toDateInputValue()`

**Como reproduzir**

1. Criar uma tarefa com prazo 20/09/2026.
2. Observar o prazo na listagem /tasks e no card de detalhes.
3. Reabrir o formulário de edição da mesma tarefa.
4. Conferir o valor gravado no Firestore.

**Resultado esperado:** 20/09/2026 em todas as telas e no banco.

**Resultado atual:** Listagem e detalhes exibem 19/09/2026 (em fusos negativos, como o do Brasil), enquanto o formulário exibe 20/09/2026.

**Como se chega nele:** Comparação entre telas e entre interface e banco; testes de timezone.

---

## BUG-045 — Tarefa com prazo para hoje aparece como atrasada

**Área:** Datas · **Severidade:** MÉDIA · **Dificuldade:** Média

**Por que acontece**

A função compara dueDate.getTime() com Date.now(), incluindo o horário. Como o prazo é gravado à meia-noite UTC (ver BUG-044), qualquer momento do dia corrente no Brasil já é 'maior' que o prazo.

**Onde está**

- `src/utils/date.ts → isOverdue()`

**Como reproduzir**

1. Criar uma tarefa com prazo para hoje.
2. Abrir /tasks e observar a coluna Prazo.

**Resultado esperado:** Nenhuma marcação de atraso no próprio dia do vencimento.

**Resultado atual:** A tarefa recebe a tag vermelha 'Atrasada' já no dia do prazo.

**Como se chega nele:** Testes de data de fronteira: hoje, ontem, amanhã.

---

## BUG-046 — Estado vazio aparece durante o carregamento

**Área:** UX / Loading · **Severidade:** BAIXA · **Dificuldade:** Baixa

**Por que acontece**

A tela mostra o spinner e, em paralelo, decide entre tabela e estado vazio apenas pelo tamanho da lista — que começa vazia. Os dois elementos convivem enquanto os dados não chegam.

**Onde está**

- `src/pages/Tasks.tsx (EmptyState renderizado sem checar loading)`

**Como reproduzir**

1. Abrir o DevTools e ativar a limitação de rede (Slow 3G).
2. Acessar /tasks e observar a área da tabela durante o carregamento.

**Resultado esperado:** Apenas o indicador de carregamento até os dados chegarem.

**Resultado atual:** 'Nenhuma tarefa encontrada' pisca junto com o spinner, sugerindo base vazia.

**Observações:** Em /users o comportamento está correto — a comparação evidencia o defeito.

---

## BUG-047 — URL inexistente exibe tela em branco

**Área:** Rotas · **Severidade:** MÉDIA · **Dificuldade:** Baixa

**Por que acontece**

O layout autenticado é uma rota sem path, que só renderiza quando alguma rota filha casa. Sem rota curinga, um endereço desconhecido não casa com nada e a aplicação não renderiza absolutamente nada.

**Onde está**

- `src/App.tsx (não há rota curinga path="*")`

**Como reproduzir**

1. Autenticado, acessar /tarefas, /qualquercoisa ou /users/abc/def.

**Resultado esperado:** Página 404 com caminho de volta, ou redirecionamento.

**Resultado atual:** Tela totalmente branca, sem menu, sem mensagem e sem forma de navegar.

**Como se chega nele:** Alteração manual da URL / erros de digitação.

---

## BUG-048 — Layout não é responsivo

**Área:** Responsividade · **Severidade:** MÉDIA · **Dificuldade:** Baixa

**Por que acontece**

Existe um breakpoint em 768px que esconde a barra lateral, mas o contêiner principal tem largura mínima fixa de 1180px, que prevalece. Os filtros também mantêm quatro colunas fixas e as tabelas não têm rolagem própria.

**Onde está**

- `src/styles/global.css → .app-shell { min-width: 1180px }`
- `src/styles/global.css → .filters { grid-template-columns: 2fr 1fr 1fr 1fr }`
- `tabelas sem contêiner com overflow-x`

**Como reproduzir**

1. Abrir a aplicação em 375×812 (mobile) e em 768×1024 (tablet).
2. Percorrer dashboard, tarefas e usuários.

**Resultado esperado:** Layout adaptado, sem rolagem horizontal da página.

**Resultado atual:** A página inteira rola na horizontal, os filtros ficam espremidos e as tabelas estouram a área visível.

**Como se chega nele:** Testes de responsividade em desktop, tablet e mobile.

---
