# -*- coding: utf-8 -*-
"""Gera o PDF do guia de testes exploratórios entregue ao profissional de QA.

Saida: docs/TaskFlow_Guia_Exploratorio.pdf

    pip install reportlab
    python scripts/gerar-guia-pdf.py

O conteudo acompanha docs/GUIA_EXPLORATORIO_QA.md. NAO deve conter pistas dos
defeitos inseridos no sistema — apenas tecnicas e perguntas que servem para
qualquer sistema.
"""
import os

from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, Spacer

from _pdf_estilo import (
    CELULA,
    CELULA_CAB,
    CORPO,
    CORPO_CINZA,
    FUNDO_SUAVE,
    H1,
    H2,
    RAIZ,
    ROXO,
    SUBTITULO,
    TITULO,
    caixa,
    construir,
    lista,
)

SAIDA = os.path.join(RAIZ, "docs", "TaskFlow_Guia_Exploratorio.pdf")

historia = []

# ---------------------------------------------------------------- capa
historia.append(Spacer(1, 8 * mm))
historia.append(Paragraph("Guia de testes exploratórios", TITULO))
historia.append(Paragraph("TaskFlow — material de apoio", SUBTITULO))
historia.append(Paragraph(
    "Este guia não lista defeitos. Ele descreve <b>técnicas</b> e <b>perguntas</b> que "
    "costumam revelar problemas em qualquer sistema — use como roteiro de investigação, "
    "ao lado do briefing do desafio.", CORPO))

historia.append(caixa([
    Paragraph("A ideia central", CELULA_CAB),
    Spacer(1, 4),
    Paragraph(
        "A maior parte dos defeitos não aparece no primeiro clique. Aparece quando você "
        "<b>insiste</b>: repete a ação, atualiza a página, compara duas telas, troca de "
        "usuário, volta para trás.", CELULA),
    Spacer(1, 6),
    Paragraph(
        "Um teste que termina em “funcionou” quase sempre parou cedo demais. Depois de cada "
        "ação bem-sucedida, faça mais uma pergunta: <i>e agora, se eu...?</i>", CELULA),
]))

# ---------------------------------------------------------------- técnicas
historia.append(Paragraph("1. As oito técnicas que mais rendem", H1))

historia.append(Paragraph("1.1 Salvou? Atualize e confira", H2))
historia.append(Paragraph(
    "Mensagem de sucesso não é prova de que gravou. Depois de salvar qualquer coisa:", CORPO))
historia.append(lista([
    "pressione <b>F5</b> e confira se o valor continua lá;",
    "reabra o registro e compare <b>campo a campo</b> com o que você digitou;",
    "repare em campos que você mudou de passagem, não só no principal.",
]))

historia.append(Paragraph("1.2 Compare duas fontes da mesma informação", H2))
historia.append(Paragraph(
    "Quando o mesmo número ou texto aparece em dois lugares, confronte:", CORPO))
historia.append(lista([
    "o total de um painel contra a contagem real da listagem;",
    "a soma das partes contra o total exibido;",
    "o que a tela mostra contra o que você digitou;",
    "o que a lista mostra contra o que o detalhe mostra.",
]))
historia.append(Paragraph(
    "Divergência entre duas telas é defeito, mesmo que as duas pareçam plausíveis sozinhas.",
    CORPO_CINZA))

historia.append(Paragraph("1.3 Vá pela URL", H2))
historia.append(Paragraph(
    "Nem toda porta tem maçaneta visível. Anote os endereços que aparecem enquanto você "
    "navega e depois tente:", CORPO))
historia.append(lista([
    "digitar o endereço direto, sem passar pelo menu;",
    "trocar o identificador no fim do endereço por outro;",
    "abrir esse mesmo endereço <b>depois de trocar de usuário</b>;",
    "digitar um endereço que não existe.",
]))

historia.append(Paragraph("1.4 Faça o mesmo teste com cada perfil", H2))
historia.append(Paragraph(
    "Um roteiro executado como administrador vale pouco até ser repetido como usuário "
    "comum — e vice-versa. Para cada tela, pergunte:", CORPO))
historia.append(lista([
    "o outro perfil enxerga isso?",
    "o outro perfil <b>consegue chegar</b> nisso, mesmo sem o menu?",
    "o outro perfil consegue <b>alterar</b> isso?",
]))

historia.append(Paragraph("1.5 Duas abas", H2))
historia.append(Paragraph(
    "Abra o mesmo registro em duas abas e trabalhe nas duas. Altere algo na primeira e "
    "salve; altere outra coisa na segunda e salve; recarregue as duas. O que sobreviveu? "
    "Vale também sair do sistema em uma aba e continuar usando a outra.", CORPO))

historia.append(Paragraph("1.6 Seja rápido e repetido", H2))
historia.append(lista([
    "clique <b>duas vezes seguidas</b> no botão de salvar;",
    "mude duas coisas em sequência, sem esperar a tela estabilizar;",
    "aperte o botão de voltar do navegador logo depois de uma ação.",
]))

historia.append(Paragraph("1.7 Valores de fronteira", H2))
historia.append(Paragraph(
    "Para cada campo, percorra a escada: <b>vazio → 1 caractere → o mínimo → o máximo → "
    "acima do máximo</b>. Depois, os casos sujos:", CORPO))
historia.append(lista([
    "só espaços em branco;",
    "acentos, emojis e caracteres especiais;",
    "texto muito maior que o anunciado (cole, não digite);",
    "valores duplicados;",
    "para datas: ontem, hoje, amanhã, mês passado, ano passado, um ano muito distante.",
]))
historia.append(Paragraph(
    "Repare quando a tela <b>anuncia</b> um limite: o limite anunciado é uma promessa, e "
    "promessas podem ser quebradas.", CORPO_CINZA))

historia.append(Paragraph("1.8 Saia, volte, atualize", H2))
historia.append(lista([
    "atualize a página no meio de um preenchimento;",
    "use o botão voltar depois de salvar, de excluir e de sair;",
    "faça login com um usuário, saia e entre com outro <b>na mesma aba</b>.",
]))

# ---------------------------------------------------------------- roteiros
historia.append(Paragraph("2. Roteiros por área", H1))
historia.append(Paragraph(
    "Cada bloco é um conjunto de perguntas para responder com o sistema aberto. Anote o "
    "que encontrar — mesmo quando a resposta parecer óbvia.", CORPO))

ROTEIROS = [
    ("Entrada e sessão", [
        "O que acontece com cada campo vazio, um de cada vez?",
        "Alguma mensagem de erro parece escrita para o programador, e não para o usuário?",
        "Depois de sair, o botão voltar devolve você para alguma tela interna?",
        "Uma conta marcada como <b>inativa</b> deveria conseguir entrar? Teste.",
        "O que o sistema faz ao pedir recuperação de senha para um endereço qualquer?",
    ]),
    ("Perfis e permissões", [
        "Liste tudo que o administrador vê e tente alcançar o mesmo como usuário comum.",
        "Algum campo aparece bloqueado? Tente chegar nele pelo <b>teclado</b> (Tab e setas) "
        "e veja se ele cede.",
        "Um usuário comum consegue abrir o registro de outra pessoa trocando o endereço?",
        "O painel mostra as mesmas informações para os dois perfis? Deveria?",
    ]),
    ("Cadastro e gestão de usuários", [
        "Depois de cadastrar alguém, <b>quem está logado</b>? Confira o topo da tela.",
        "O que acontece ao deixar uma seleção obrigatória sem escolher?",
        "Exclua um usuário que tenha tarefas. O que aconteceu com as tarefas dele?",
        "Depois de excluir alguém, tente <b>entrar com a conta excluída</b>.",
        "Troque o e-mail de uma conta e tente entrar com o endereço novo. E com o antigo.",
        "Todas as telas pedem confirmação antes de excluir? Compare uma com a outra.",
    ]),
    ("Ciclo de vida da tarefa", [
        "Crie, edite, mude o status, exclua — e depois de <b>cada</b> passo, atualize a página.",
        "Existe mais de um caminho para alterar a mesma informação? Teste os dois e compare.",
        "Depois de salvar uma edição, reabra e confira <b>todos</b> os campos.",
        "Exclua tarefas em estados diferentes. O resultado é o mesmo em todos?",
        "Para onde o sistema leva você depois de salvar? É para onde esperava voltar?",
        "Comece a preencher um formulário e atualize a página no meio.",
    ]),
    ("Listagem, busca e filtros", [
        "Teste <b>cada opção</b> de cada filtro, uma a uma, inclusive as menos usadas.",
        "Combine filtros. Depois limpe um e mantenha o outro.",
        "Pesquise a mesma palavra com e sem acento, em maiúsculas e minúsculas, com espaço "
        "sobrando.",
        "Percorra todas as páginas anotando o primeiro e o último item de cada uma.",
        "A ordenação faz sentido para quem usa o sistema, ou só para o computador?",
        "O número de resultados anunciado bate com o que está na tela?",
    ]),
    ("Painel de indicadores", [
        "Some os indicadores e compare com o total.",
        "Crie uma tarefa e volte ao painel. Os números mudaram?",
        "Entre com um usuário, veja o painel, saia e entre com outro <b>na mesma aba</b>. "
        "Os números são dele mesmo?",
    ]),
    ("Datas", [
        "Uma tarefa que vence <b>hoje</b> já deveria estar marcada como atrasada?",
        "Escolha uma data, salve, atualize a página e confira: é a mesma data?",
        "Veja a data na listagem, no detalhe e no formulário de edição. As três concordam?",
    ]),
    ("Formulários e mensagens", [
        "Todo campo obrigatório avisa quando está vazio?",
        "As mensagens aparecem antes de o sistema tentar salvar, ou só depois do erro?",
        "Quando algo dá errado, a mensagem explica o que fazer?",
        "A tela mostra que está carregando, ou pisca um “nada encontrado” antes dos dados?",
    ]),
    ("Telas pequenas", [
        "Abra em celular e tablet. Precisa rolar de lado para ler?",
        "Os botões e campos continuam alcançáveis?",
        "As tabelas cabem, rolam ou estouram?",
    ]),
]

for titulo, perguntas in ROTEIROS:
    historia.append(Paragraph(titulo, H2))
    historia.append(lista(perguntas))

# ---------------------------------------------------------------- fechamento
historia.append(Paragraph("3. Antes de fechar o ciclo", H1))
historia.append(Paragraph("Dez perguntas para revisar o que ficou de fora:", CORPO))
historia.append(lista([
    "Repeti cada teste com os <b>dois perfis</b>?",
    "Atualizei a página depois de cada ação que gravou algo?",
    "Comparei o que a tela mostra com o que eu digitei?",
    "Tentei chegar em alguma tela <b>pelo endereço</b>, sem usar o menu?",
    "Testei cada opção de cada filtro, uma por uma?",
    "Abri o mesmo registro em <b>duas abas</b>?",
    "Cliquei duas vezes em algum botão de salvar?",
    "Testei os limites de cada campo — vazio, máximo, acima do máximo?",
    "Olhei o sistema em uma <b>tela pequena</b>?",
    "Para cada coisa que funcionou, perguntei <i>e se eu...?</i> mais uma vez?",
], numerada=True))

historia.append(caixa([
    Paragraph("Lembre do relatório", CELULA_CAB),
    Spacer(1, 4),
    Paragraph(
        "Um defeito bem descrito vale mais que três mal descritos. Garanta que outra pessoa "
        "consiga reproduzir sem falar com você: pré-condição, passos numerados, o que você "
        "esperava, o que aconteceu e uma evidência.", CELULA),
    Spacer(1, 6),
    Paragraph(
        "E quando encontrar o mesmo problema por dois caminhos diferentes, registre "
        "<b>um</b> defeito com os dois caminhos — não dois defeitos.", CELULA),
], fundo=FUNDO_SUAVE, borda=ROXO))

construir(
    SAIDA,
    historia,
    titulo="TaskFlow — Guia de testes exploratórios",
    assunto="Material de apoio ao profissional avaliado",
    rodape_texto="TaskFlow — Guia de testes exploratórios",
)
