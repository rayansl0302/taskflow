# TaskFlow — Guia de testes exploratórios

Material de apoio para o profissional de QA. Pode ser entregue junto com o briefing.

> Este guia não lista defeitos. Ele descreve **técnicas** e **perguntas** que costumam
> revelar problemas em qualquer sistema — use como roteiro de investigação.

---

## A ideia central

A maior parte dos defeitos não aparece no primeiro clique. Aparece quando você **insiste**:
repete a ação, atualiza a página, compara duas telas, troca de usuário, volta para trás.

Um teste que termina em "funcionou" quase sempre parou cedo demais. Depois de cada ação
bem-sucedida, faça mais uma pergunta: *e agora, se eu...?*

---

## 1. As oito técnicas que mais rendem

### 1.1 Salvou? Atualize e confira

Mensagem de sucesso não é prova de que gravou. Depois de salvar qualquer coisa:

- pressione **F5** e confira se o valor continua lá;
- reabra o registro e compare **campo a campo** com o que você digitou;
- repare em campos que você mudou "de passagem", não só no principal.

### 1.2 Compare duas fontes da mesma informação

Quando o mesmo número ou texto aparece em dois lugares, confronte:

- o total de um painel contra a contagem real da listagem;
- a soma das partes contra o total exibido;
- o que a tela mostra contra o que você digitou;
- o que a lista mostra contra o que o detalhe mostra.

Divergência entre duas telas é defeito, mesmo que as duas pareçam plausíveis sozinhas.

### 1.3 Vá pela URL

Nem toda porta tem maçaneta visível. Anote os endereços que você vê enquanto navega e
depois tente:

- digitar o endereço direto, sem passar pelo menu;
- trocar o identificador no fim do endereço por outro;
- abrir esse mesmo endereço **depois de trocar de usuário**;
- digitar um endereço que não existe.

### 1.4 Faça o mesmo teste com cada perfil

Um roteiro executado como administrador vale pouco até ser repetido como usuário comum —
e vice-versa. Para cada tela, pergunte:

- o outro perfil enxerga isso?
- o outro perfil **consegue chegar** nisso, mesmo sem o menu?
- o outro perfil consegue **alterar** isso?

### 1.5 Duas abas

Abra o mesmo registro em duas abas e trabalhe nas duas. Altere algo na primeira, salve;
altere outra coisa na segunda, salve; recarregue as duas. O que sobreviveu?

Vale também: sair do sistema em uma aba e continuar usando a outra.

### 1.6 Seja rápido e repetido

- clique **duas vezes seguidas** no botão de salvar;
- mude duas coisas em sequência, sem esperar a tela estabilizar;
- aperte o botão de voltar do navegador logo depois de uma ação.

### 1.7 Valores de fronteira

Para cada campo, percorra a escada: **vazio → 1 caractere → o mínimo → o máximo → acima do
máximo**. E depois os casos sujos:

- só espaços em branco;
- acentos, emojis, caracteres especiais (`@#$%`);
- texto muito maior que o anunciado (cole, não digite);
- valores duplicados;
- para datas: ontem, hoje, amanhã, mês passado, ano passado, um ano muito distante.

Repare quando a tela **anuncia** um limite: o limite anunciado é uma promessa, e promessas
podem ser quebradas.

### 1.8 Saia, volte, atualize

- atualize a página no meio de um preenchimento;
- use o botão voltar depois de salvar, de excluir e de sair;
- feche e reabra o navegador;
- faça login com um usuário, saia, entre com outro **na mesma aba**.

---

## 2. Roteiros por área

Cada bloco é um conjunto de perguntas para responder com o sistema aberto. Anote o que
você encontrar — mesmo quando a resposta parecer óbvia.

### Entrada e sessão

- O que acontece com cada campo vazio, um de cada vez?
- Alguma mensagem de erro parece escrita para o programador, e não para o usuário?
- Depois de sair, o botão voltar devolve você para alguma tela interna?
- Uma conta marcada como **inativa** deveria conseguir entrar? Teste.
- O que o sistema faz quando você pede recuperação de senha para um endereço qualquer?

### Perfis e permissões

- Liste tudo que o administrador vê e tente alcançar o mesmo como usuário comum.
- Algum campo aparece bloqueado na tela? Tente chegar nele pelo **teclado** (Tab e setas)
  e veja se ele cede.
- Um usuário comum consegue abrir o registro de outra pessoa trocando o endereço?
- O painel mostra as mesmas informações para os dois perfis? Deveria?

### Cadastro e gestão de usuários

- Depois de cadastrar alguém, **quem está logado**? Confira o topo da tela.
- O que acontece ao deixar uma seleção obrigatória sem escolher?
- Exclua um usuário que tenha tarefas. O que aconteceu com as tarefas dele?
- Depois de excluir alguém, tente **entrar com a conta excluída**.
- Troque o e-mail de uma conta. Depois tente entrar com o endereço novo. E com o antigo.
- Todas as telas pedem confirmação antes de excluir? Compare uma com a outra.

### Ciclo de vida da tarefa

- Crie, edite, mude o status, exclua — e depois de **cada** passo, atualize a página.
- Existe mais de um caminho para alterar a mesma informação? Teste os dois e compare.
- Depois de salvar uma edição, reabra e confira **todos** os campos, não só o que mudou.
- Exclua tarefas em estados diferentes. O resultado é o mesmo em todos?
- Para onde o sistema te leva depois de salvar? É para onde você esperava voltar?
- Comece a preencher um formulário e atualize a página no meio.

### Listagem, busca e filtros

- Teste **cada opção** de cada filtro, uma a uma, inclusive as que parecem menos usadas.
- Combine filtros. Depois limpe um e mantenha o outro.
- Pesquise a mesma palavra com e sem acento, em maiúsculas e minúsculas, com espaço sobrando.
- Percorra todas as páginas anotando o primeiro e o último item de cada uma.
- A ordenação faz sentido para quem usa o sistema, ou só para o computador?
- O número de resultados anunciado bate com o que está na tela?

### Painel de indicadores

- Some os indicadores e compare com o total.
- Crie uma tarefa e volte ao painel. Os números mudaram?
- Entre com um usuário, veja o painel, saia e entre com outro **na mesma aba**. Os números
  são dele mesmo?

### Datas

- Uma tarefa que vence **hoje** já deveria estar marcada como atrasada?
- Escolha uma data, salve, atualize a página e confira: é a mesma data?
- Veja a data na listagem, no detalhe e no formulário de edição. As três concordam?

### Formulários e mensagens

- Todo campo obrigatório avisa quando está vazio?
- As mensagens aparecem antes de o sistema tentar salvar, ou só depois do erro?
- Quando algo dá errado, a mensagem explica o que fazer?
- A tela mostra que está carregando, ou pisca um "nada encontrado" antes dos dados?

### Telas pequenas

- Abra em celular e tablet. Precisa rolar de lado para ler?
- Os botões e campos continuam alcançáveis?
- As tabelas cabem, rolam ou estouram?

---

## 3. Antes de fechar o ciclo

Dez perguntas para revisar o que ficou de fora:

1. Repeti cada teste com os **dois perfis**?
2. Atualizei a página depois de cada ação que gravou algo?
3. Comparei o que a tela mostra com o que eu digitei?
4. Tentei chegar em alguma tela **pelo endereço**, sem usar o menu?
5. Testei cada opção de cada filtro, uma por uma?
6. Abri o mesmo registro em **duas abas**?
7. Cliquei duas vezes em algum botão de salvar?
8. Testei os limites de cada campo — vazio, máximo, acima do máximo?
9. Olhei o sistema em uma **tela pequena**?
10. Para cada coisa que "funcionou", perguntei *e se eu...?* mais uma vez?

---

## 4. Lembre do relatório

Um defeito bem descrito vale mais que três mal descritos. Para cada achado, garanta que
outra pessoa consiga reproduzir sem falar com você: pré-condição, passos numerados, o que
você esperava, o que aconteceu e uma evidência.

E quando encontrar o mesmo problema por dois caminhos diferentes, registre **um** defeito
com os dois caminhos — não dois defeitos.
