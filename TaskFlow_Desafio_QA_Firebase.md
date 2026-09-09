# 🧪 TaskFlow — Desafio Prático de QA

## 1. Objetivo

Criar um sistema web fictício chamado **TaskFlow**, utilizado como ambiente de testes para avaliar as habilidades de um profissional de QA.

O sistema deve possuir funcionalidades reais de autenticação, autorização e CRUD, porém conter **erros propositalmente inseridos** para que o QA precise identificá-los.

> **Importante:** os bugs não devem ser documentados na versão entregue ao QA. O desenvolvedor deve manter um **gabarito separado**.

---

# 2. Stack

## Frontend

- React
- TypeScript
- React Router
- Vite
- CSS/SCSS ou Tailwind

## Backend / Banco

Usar **Firebase** para simplificar a infraestrutura:

- Firebase Authentication
- Cloud Firestore
- Firebase Storage, se necessário
- Firebase Hosting, opcional
- Firebase Emulator Suite, recomendado para desenvolvimento

Não é necessário criar um backend Node/Express separado para o MVP.

---

# 3. Perfis de acesso

O sistema deverá possuir dois perfis:

### ADMIN

Pode:

- visualizar dashboard;
- listar usuários;
- criar usuários;
- editar usuários;
- excluir usuários;
- visualizar todas as tarefas;
- criar tarefas;
- editar tarefas;
- excluir tarefas.

### USER

Pode:

- visualizar dashboard;
- visualizar suas próprias tarefas;
- criar tarefas;
- editar suas próprias tarefas;
- excluir suas próprias tarefas;
- editar seu próprio perfil.

O sistema deve utilizar o Firebase Authentication para autenticação e o Firestore para armazenar os dados.

---

# 4. Estrutura de rotas

Implementar as seguintes rotas:

```text
/login
/dashboard
/tasks
/tasks/new
/tasks/:id
/users
/users/:id
/profile
```

Rotas protegidas devem exigir autenticação.

Rotas administrativas devem exigir perfil `ADMIN`.

O usuário não autenticado deve ser redirecionado para `/login`.

---

# 5. Autenticação

Implementar:

- Login com email e senha;
- Logout;
- Persistência da sessão;
- Recuperação de senha;
- Exibição do usuário logado;
- Redirecionamento após login;
- Proteção das rotas.

### Requisitos

Login válido:

```text
email: admin@taskflow.com
senha: senha definida no ambiente
```

Criar também pelo menos um usuário comum.

As credenciais reais devem ficar fora deste documento, em `.env` ou configuração local.

---

# 6. Dashboard

O dashboard deve apresentar:

```text
Total de tarefas
Tarefas pendentes
Tarefas em andamento
Tarefas concluídas
Total de usuários
```

Somente ADMIN deve visualizar métricas relacionadas a usuários.

O USER deve visualizar somente informações relacionadas às próprias tarefas.

---

# 7. CRUD de usuários

Campos:

```text
Nome
Email
Perfil
Status
Data de criação
```

Perfil:

```text
ADMIN
USER
```

Status:

```text
ATIVO
INATIVO
```

Funcionalidades:

- Listar usuários;
- Pesquisar usuários;
- Filtrar por perfil;
- Filtrar por status;
- Criar usuário;
- Editar usuário;
- Visualizar usuário;
- Excluir usuário.

---

# 8. CRUD de tarefas

Campos:

```text
Título
Descrição
Responsável
Status
Prioridade
Prazo
Data de criação
Data de atualização
```

### Status

```text
PENDENTE
EM_ANDAMENTO
CONCLUIDA
CANCELADA
```

### Prioridade

```text
BAIXA
MEDIA
ALTA
URGENTE
```

Funcionalidades:

- Listagem;
- Pesquisa;
- Filtros;
- Ordenação;
- Paginação;
- Criar;
- Editar;
- Visualizar;
- Excluir;
- Alterar status.

---

# 9. Validações esperadas

## Usuário

Nome:

```text
Obrigatório
Mínimo: 3 caracteres
Máximo: 100 caracteres
```

Email:

```text
Obrigatório
Formato válido
```

Perfil:

```text
Obrigatório
```

## Tarefa

Título:

```text
Obrigatório
Mínimo: 3 caracteres
Máximo: 100 caracteres
```

Descrição:

```text
Máximo: 500 caracteres
```

Prazo:

```text
Obrigatório
```

O sistema deve validar os dados antes de gravá-los no Firestore.

---

# 10. Firebase

## Authentication

Utilizar:

```text
Email/Password
```

## Firestore

Sugestão de estrutura:

```text
users
  └── {userId}
       ├── name
       ├── email
       ├── role
       ├── status
       ├── createdAt

tasks
  └── {taskId}
       ├── title
       ├── description
       ├── userId
       ├── status
       ├── priority
       ├── dueDate
       ├── createdAt
       └── updatedAt
```

---

# 11. Regras de segurança do Firestore

As regras devem respeitar o perfil do usuário.

Exemplo conceitual:

```text
ADMIN
→ pode acessar todos os usuários e tarefas.

USER
→ pode acessar somente suas próprias tarefas.

USER
→ não pode alterar outro usuário.

USER
→ não pode excluir outro usuário.
```

Não utilizar regras completamente abertas em produção.

Durante o desenvolvimento, o Firebase Emulator Suite pode ser utilizado para facilitar os testes.

---

# 12. Requisitos de UX

O sistema deve possuir:

- Loading durante requisições;
- Mensagens de sucesso;
- Mensagens de erro;
- Confirmação antes de exclusão;
- Estados vazios;
- Tratamento de erros;
- Layout responsivo;
- Feedback visual para ações;
- Formulários com mensagens de validação.

Exemplo:

```text
Tarefa criada com sucesso.
```

```text
Não foi possível criar a tarefa.
```

---

# 13. Bugs propositalmente esperados

A aplicação deverá receber aproximadamente **40 bugs propositalmente inseridos**.

Os bugs devem ser distribuídos entre:

- Autenticação;
- Autorização;
- CRUD;
- Firestore;
- Validação;
- Navegação;
- Rotas;
- Paginação;
- Pesquisa;
- Filtros;
- Datas;
- UX;
- Responsividade;
- Estados de loading;
- Concorrência;
- Segurança.

## Importante

Não deixar todos os bugs óbvios.

Alguns devem ser encontrados apenas através de:

- testes negativos;
- alteração manual de URL;
- refresh;
- abertura de múltiplas abas;
- manipulação dos dados;
- testes com usuários diferentes;
- testes de limite;
- testes de API/Firestore;
- comparação entre interface e banco.

---

# 14. Exemplos de bugs a inserir

## BUG-001 — Login

Em determinada condição, uma senha incorreta deve ser aceita.

Severidade esperada:

```text
CRÍTICA
```

---

## BUG-002 — Logout

Após logout, utilizar o botão voltar do navegador e verificar se uma tela protegida continua acessível.

---

## BUG-003 — Autorização

O menu administrativo deve ser escondido para USER.

Porém, propositalmente, a rota:

```text
/users
```

pode continuar acessível digitando a URL diretamente.

---

## BUG-004 — Autorização Firestore

Um USER consegue consultar ou alterar uma tarefa pertencente a outro usuário.

---

## BUG-005 — IDOR

Alterar manualmente:

```text
/tasks/ID
```

para outro ID permite visualizar dados que não pertencem ao usuário.

---

## BUG-006 — Campo obrigatório

Permitir criar uma tarefa sem título.

---

## BUG-007 — Limite de caracteres

O frontend bloqueia 100 caracteres, mas o sistema aceita uma quantidade maior em determinada situação.

---

## BUG-008 — Data

Permitir cadastrar uma tarefa com prazo anterior ao permitido.

---

## BUG-009 — Timezone

Uma data selecionada pelo usuário aparece com um dia diferente depois de salvar e recarregar.

---

## BUG-010 — Exclusão

Exibir:

```text
Tarefa excluída com sucesso
```

mas manter o registro no Firestore.

---

## BUG-011 — Edição

Exibir mensagem de sucesso, mas não persistir uma determinada alteração.

---

## BUG-012 — Duplo clique

Clicar rapidamente duas vezes em:

```text
Salvar
```

cria dois registros.

---

## BUG-013 — Paginação

O último registro de uma página aparece novamente na página seguinte.

---

## BUG-014 — Filtro

Aplicar um filtro não atualiza corretamente a quantidade total de resultados.

---

## BUG-015 — Pesquisa

A pesquisa apresenta comportamento diferente para:

```text
João
joão
JOÃO
```

---

## BUG-016 — Refresh

Atualizar a página durante o preenchimento de um formulário perde os dados sem qualquer aviso.

---

## BUG-017 — Status

Uma tarefa marcada como:

```text
CONCLUIDA
```

volta para:

```text
PENDENTE
```

após atualizar a página.

---

## BUG-018 — Usuário inativo

Um usuário marcado como `INATIVO` continua conseguindo utilizar o sistema.

---

## BUG-019 — Exclusão de usuário

Excluir um usuário não trata corretamente as tarefas associadas a ele.

---

## BUG-020 — Dashboard

O contador de tarefas apresenta quantidade diferente da lista real.

---

# 15. Bugs de maior dificuldade

Inserir alguns problemas que exigem investigação.

### Concorrência

Abrir a mesma tarefa em duas abas:

```text
ABA 1 → Pendente
ABA 2 → Em andamento
```

Alterar e salvar em ambas.

Uma alteração pode sobrescrever a outra sem aviso.

---

### Falha de sincronização

Uma tela apresenta uma informação diferente daquela armazenada no Firestore.

---

### Race condition

Executar duas operações rapidamente pode gerar estado inconsistente.

---

### Cache / estado

Depois de alterar um registro, determinada tela continua exibindo o valor antigo até um refresh.

---

### Permissão

O frontend impede determinada ação, mas uma chamada direta ao Firestore consegue executá-la.

---

# 16. Cenários que o QA deve explorar

O QA deve testar pelo menos:

## Autenticação

- Login correto;
- Login incorreto;
- Email vazio;
- Senha vazia;
- Email inválido;
- Logout;
- Refresh;
- Botão voltar;
- Sessão expirada.

## Autorização

- ADMIN;
- USER;
- URL manual;
- acesso a recurso de outro usuário;
- tentativa de alteração;
- tentativa de exclusão.

## CRUD

- Criar;
- Ler;
- Editar;
- Excluir;
- Cancelar;
- Reabrir formulário;
- Atualizar página.

## Limites

- 0 caracteres;
- 1 caractere;
- tamanho máximo;
- acima do máximo;
- caracteres especiais;
- emojis;
- espaços;
- valores duplicados.

## Pesquisa

Testar:

```text
João
joão
JOÃO
Jo
João Silva
123
@#$%
```

## Datas

Testar:

- hoje;
- ontem;
- amanhã;
- mês anterior;
- próximo mês;
- datas inválidas;
- mudança de timezone.

## Responsividade

Testar:

```text
Desktop
Tablet
Mobile
```

---

# 17. Entrega esperada do QA

O profissional não deve apenas informar:

```text
"Está com problema."
```

Cada bug deve conter:

```text
ID
Título
Data
Ambiente
Severidade
Prioridade
Pré-condições
Passos para reprodução
Resultado esperado
Resultado atual
Evidência
Observações
```

Exemplo:

```text
BUG-001

Título:
USER consegue acessar tela administrativa

Severidade:
Alta

Pré-condição:
Usuário autenticado com perfil USER.

Passos:
1. Fazer login.
2. Acessar /users diretamente.
3. Observar o resultado.

Resultado esperado:
Usuário deve receber acesso negado ou ser redirecionado.

Resultado atual:
A tela administrativa é exibida.

Evidência:
Screenshot / vídeo / logs.
```

---

# 18. Classificação de severidade

## CRÍTICA

Problema de:

- autenticação;
- autorização;
- perda de dados;
- exposição de dados;
- indisponibilidade completa.

## ALTA

Impede uma funcionalidade importante ou afeta grande parte dos usuários.

## MÉDIA

Afeta uma funcionalidade, mas existe alternativa.

## BAIXA

Problemas menores de:

- interface;
- texto;
- alinhamento;
- comportamento pouco relevante.

---

# 19. Critérios para avaliar o QA

Pontuação sugerida:

| Área | Pontos |
|---|---:|
| Login/autenticação | 10 |
| Autorização | 15 |
| CRUD | 15 |
| Validações | 10 |
| Pesquisa/filtros | 10 |
| Paginação | 5 |
| Datas | 5 |
| UX | 5 |
| Responsividade | 5 |
| Segurança | 15 |
| Qualidade dos reports | 5 |
| **Total** | **100** |

---

# 20. Níveis

### 0–39

Precisa desenvolver fundamentos de QA.

### 40–59

Conhece testes básicos.

### 60–74

Perfil compatível com QA Júnior.

### 75–89

Boa capacidade de investigação.

### 90–100

Excelente capacidade de encontrar problemas funcionais e técnicos.

---

# 21. Gabarito interno

O desenvolvedor deverá manter um arquivo separado:

```text
QA_GABARITO.md
```

Esse arquivo deve conter:

```text
BUG-001 → Login aceita senha inválida
BUG-002 → Tela protegida após logout
BUG-003 → USER acessa /users
...
```

Para cada bug:

```text
ID
Descrição
Local
Passos
Resultado esperado
Resultado atual
Severidade
Dificuldade
```

O `QA_GABARITO.md` **não deve ser entregue ao QA durante o teste**.

---

# 22. Regra principal do desafio

O QA deve receber apenas:

```text
URL do sistema
Usuário ADMIN
Usuário USER
Escopo funcional
Prazo para execução
```

Não entregar:

- lista de bugs;
- casos de teste prontos;
- gabarito;
- localização dos problemas.

A ideia é avaliar a capacidade do profissional de **pensar como um QA**, e não apenas executar uma checklist.

---

# 23. Objetivo final

O desafio deve avaliar se o QA consegue:

1. Entender requisitos;
2. Criar cenários de teste;
3. Encontrar bugs;
4. Priorizar problemas;
5. Investigar causa provável;
6. Reproduzir problemas;
7. Identificar problemas de segurança;
8. Identificar inconsistências entre frontend e banco;
9. Testar casos positivos e negativos;
10. Produzir reports claros e reproduzíveis.

---

# 24. Estrutura sugerida do projeto

```text
taskflow/
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── routes/
│   ├── services/
│   │   └── firebase/
│   ├── hooks/
│   ├── contexts/
│   ├── types/
│   └── utils/
│
├── public/
│
├── .env
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── package.json
└── README.md
```

---

# 25. Recomendação

Para tornar o desafio realmente útil, criar inicialmente o sistema **sem bugs**, validar todo o fluxo e somente depois criar uma etapa separada para introdução dos bugs.

Sugestão:

```text
FASE 1
Sistema funcional

↓

FASE 2
Testes internos

↓

FASE 3
Inserção dos bugs

↓

FASE 4
Entrega ao QA

↓

FASE 5
Comparação dos bugs encontrados
com o gabarito

↓

FASE 6
Avaliação
```

Isso evita que um bug proposital quebre acidentalmente outra funcionalidade e dificulte a avaliação.
