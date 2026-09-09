# TaskFlow — Briefing do Desafio de QA

Este é o único documento que deve ser entregue ao profissional avaliado.

---

## 1. O que é o TaskFlow

Sistema web de gestão de tarefas com dois perfis de acesso (**ADMIN** e **USER**).
A aplicação já está publicada e em uso simulado. Sua missão é avaliá-la como QA.

---

## 2. Ambiente

| Item | Valor |
|---|---|
| URL da aplicação | `__PREENCHER__` (ex.: http://localhost:5173) |
| Navegador sugerido | Chrome/Edge atualizado |
| Prazo de execução | `__PREENCHER__` |

### Credenciais

| Perfil | E-mail | Senha |
|---|---|---|
| ADMIN | admin@taskflow.com | `__PREENCHER__` |
| USER | maria.silva@taskflow.com | `__PREENCHER__` |
| USER | joao.pereira@taskflow.com | `__PREENCHER__` |

---

## 3. Escopo funcional

### Autenticação
- Login com e-mail e senha
- Logout
- Persistência da sessão
- Recuperação de senha
- Exibição do usuário logado
- Redirecionamento após login
- Proteção de rotas (não autenticado vai para `/login`)

### Perfis

**ADMIN** — dashboard, listar/criar/editar/excluir usuários, visualizar e gerenciar
todas as tarefas.

**USER** — dashboard, visualizar/criar/editar/excluir **apenas as próprias tarefas**,
editar o próprio perfil. Não deve acessar áreas administrativas.

### Rotas

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

### Dashboard
Total de tarefas, tarefas pendentes, em andamento, concluídas e total de usuários.
Métricas de usuários são exclusivas do ADMIN; o USER deve ver apenas dados das
próprias tarefas.

### Usuários
Campos: nome, e-mail, perfil (ADMIN/USER), status (ATIVO/INATIVO), data de criação.
Funcionalidades: listar, pesquisar, filtrar por perfil, filtrar por status, criar,
editar, visualizar e excluir.

### Tarefas
Campos: título, descrição, responsável, status, prioridade, prazo, data de criação e
data de atualização.

- Status: `PENDENTE`, `EM_ANDAMENTO`, `CONCLUIDA`, `CANCELADA`
- Prioridade: `BAIXA`, `MEDIA`, `ALTA`, `URGENTE`

Funcionalidades: listagem, pesquisa, filtros, ordenação, paginação, criar, editar,
visualizar, excluir e alterar status.

### Regras de validação esperadas

**Usuário**
- Nome: obrigatório, mínimo 3 e máximo 100 caracteres
- E-mail: obrigatório e em formato válido
- Perfil: obrigatório

**Tarefa**
- Título: obrigatório, mínimo 3 e máximo 100 caracteres
- Descrição: máximo 500 caracteres
- Prazo: obrigatório

Os dados devem ser validados antes de serem gravados no banco.

### Requisitos de UX esperados
Loading durante requisições, mensagens de sucesso e de erro, confirmação antes de
excluir, estados vazios, tratamento de erros, layout responsivo, feedback visual das
ações e mensagens de validação nos formulários.

---

## 4. O que se espera de você

Explorar o sistema como QA e reportar tudo que divergir do escopo acima.
Não existe checklist pronta — a avaliação considera a sua capacidade de **criar cenários**,
investigar e reproduzir problemas.

Sugestões de frentes a explorar:

- Testes positivos e negativos de autenticação
- Autorização: comparar o que cada perfil vê e o que consegue fazer
- Alteração manual da URL, refresh, botão voltar, múltiplas abas
- Testes de limite (0 caractere, 1 caractere, máximo, acima do máximo, especiais, emojis, espaços)
- Pesquisa com variações de caixa e acentuação (`João`, `joão`, `JOÃO`, `Jo`, `123`, `@#$%`)
- Datas: hoje, ontem, amanhã, mês anterior, próximo mês, datas inválidas
- Comparação entre o que a interface exibe e o que está gravado no banco
- Responsividade em desktop, tablet e mobile

---

## 5. Formato do report

Cada bug encontrado deve conter:

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

### Exemplo

```text
BUG-XXX

Título:
USER consegue acessar tela administrativa

Data: 09/09/2026
Ambiente: Chrome 128 / Windows 11 / http://localhost:5173

Severidade: Crítica
Prioridade: Alta

Pré-condição:
Usuário autenticado com perfil USER.

Passos:
1. Fazer login com um usuário USER.
2. Digitar /users diretamente na barra de endereços.
3. Observar o resultado.

Resultado esperado:
Acesso negado ou redirecionamento para uma tela permitida.

Resultado atual:
A tela administrativa é exibida normalmente.

Evidência:
Screenshot / vídeo / log.
```

---

## 6. Classificação de severidade

| Severidade | Quando usar |
|---|---|
| **CRÍTICA** | Autenticação, autorização, perda de dados, exposição de dados, indisponibilidade |
| **ALTA** | Impede uma funcionalidade importante ou afeta muitos usuários |
| **MÉDIA** | Afeta uma funcionalidade, mas existe alternativa |
| **BAIXA** | Interface, texto, alinhamento, comportamento pouco relevante |

---

## 7. Critérios de avaliação

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

| Faixa | Leitura |
|---|---|
| 0–39 | Precisa desenvolver fundamentos de QA |
| 40–59 | Conhece testes básicos |
| 60–74 | Compatível com QA Júnior |
| 75–89 | Boa capacidade de investigação |
| 90–100 | Excelente capacidade de encontrar problemas funcionais e técnicos |
