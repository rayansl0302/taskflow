# -*- coding: utf-8 -*-
"""Gera o PDF de dicas para o próximo ciclo de testes.

Diferente do guia exploratório, que ensina técnica em geral, este material é
recortado sobre o que ainda está plantado no sistema: sete frentes, o número
de achados que cada uma rende e os experimentos que levam até eles.

Nenhum defeito é nomeado nem descrito. O que o documento entrega é o
endereço da caça — onde procurar e com qual gesto —, não a presa.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from reportlab.lib.units import mm
from reportlab.platypus import KeepTogether, Paragraph, Spacer

from _pdf_estilo import (
    CELULA_CAB,
    CORPO,
    CORPO_CINZA,
    H1,
    H2,
    NOTA,
    RAIZ,
    SUBTITULO,
    TITULO,
    caixa,
    construir,
    lista,
    tabela,
)

# ------------------------------------------------------------------
# Cobertura
#
# Cada frente aponta para os defeitos que ela pretende revelar. O mapa não
# entra no PDF: serve para conferir, a cada ciclo, que as sete frentes ainda
# cobrem exatamente o que continua plantado — e para que os números impressos
# venham daqui, em vez de serem digitados à mão e envelhecerem em silêncio.
# ------------------------------------------------------------------
FRENTES = [
    ("Confirme no recarregar",
     "Salvar não é o fim do teste. Recarregue e confira.",
     ["BUG-019", "BUG-020", "BUG-021"]),
    ("O mesmo endereço, outro crachá",
     "Repita como usuário comum o que você fez como administrador.",
     ["BUG-008", "BUG-009", "BUG-010", "BUG-012", "BUG-013"]),
    ("Para onde o sistema te leva",
     "Observe onde você parou depois de cada ação.",
     ["BUG-007", "BUG-022", "BUG-023", "BUG-046", "BUG-047"]),
    ("Listas grandes",
     "Páginas, filtros e ordenação, opção por opção.",
     ["BUG-034", "BUG-037", "BUG-040"]),
    ("Conte você mesma",
     "Confira na mão o que os números do painel afirmam.",
     ["BUG-042", "BUG-045"]),
    ("Ao mesmo tempo",
     "Duas abas e cliques rápidos.",
     ["BUG-024", "BUG-025"]),
    ("O rastro que fica",
     "Depois de mudar algo, procure os vestígios no resto do sistema.",
     ["BUG-028", "BUG-030"]),
]


def conferir_cobertura():
    """Aborta se as frentes e o gabarito discordarem sobre o que falta."""
    caminho = os.path.join(RAIZ, "docs", "gabarito.json")
    with open(caminho, encoding="utf-8") as arquivo:
        bugs = json.load(arquivo)["bugs"]

    plantados = {b["id"] for b in bugs if b.get("status", "pendente") != "corrigido"}
    cobertos = {bug for _, _, ids in FRENTES for bug in ids}

    repetidos = [
        bug for bug in cobertos
        if sum(ids.count(bug) for _, _, ids in FRENTES) > 1
    ]
    faltando = sorted(plantados - cobertos)
    sobrando = sorted(cobertos - plantados)

    if faltando or sobrando or repetidos:
        print("As frentes não batem com o gabarito:", file=sys.stderr)
        if faltando:
            print("  plantados e sem frente:", ", ".join(faltando), file=sys.stderr)
        if sobrando:
            print("  em frente mas já corrigidos:", ", ".join(sobrando), file=sys.stderr)
        if repetidos:
            print("  em mais de uma frente:", ", ".join(sorted(set(repetidos))), file=sys.stderr)
        print("Ajuste FRENTES antes de gerar o PDF.", file=sys.stderr)
        sys.exit(1)

    return len(plantados)


TOTAL = conferir_cobertura()
PRIMEIRAS_DUAS = len(FRENTES[0][2]) + len(FRENTES[1][2])

historia = []
A = historia.append

# ---------------------------------------------------------------- abertura
A(Paragraph("Onde procurar agora", TITULO))
A(Paragraph("TaskFlow — apoio ao próximo ciclo de testes", SUBTITULO))

A(caixa([
    Paragraph("Como usar este material", CELULA_CAB),
    Spacer(1, 5),
    Paragraph(
        "O sistema ainda tem <b>%d defeitos</b> que nenhum ciclo encontrou até agora. "
        "Eles não estão espalhados por igual: concentram-se em sete frentes, e este "
        "documento diz quantos moram em cada uma." % TOTAL,
        CORPO,
    ),
    Paragraph(
        "O que você não vai achar aqui é o defeito em si. Cada frente traz o "
        "<b>gesto</b> que o revela e a <b>pergunta</b> que faz você olhar para o lugar "
        "certo. Faça o gesto, observe com calma e compare com o que o sistema deveria "
        "fazer. O julgamento continua sendo seu.",
        CORPO,
    ),
    Paragraph(
        "Sugestão de ordem: comece pelas frentes 1 e 2, que sozinhas respondem por "
        "%d dos %d." % (PRIMEIRAS_DUAS, TOTAL),
        CORPO_CINZA,
    ),
]))

A(Spacer(1, 12))
A(Paragraph("O mapa", H1))
A(Paragraph(
    "Quanto cada frente rende, do mais denso para o menos denso:",
    CORPO,
))
A(Spacer(1, 4))
A(tabela(
    [["FRENTE", "O GESTO", "ACHADOS"]] + [
        ["%d. %s" % (i, nome), gesto, str(len(ids))]
        for i, (nome, gesto, ids) in enumerate(FRENTES, start=1)
    ],
    larguras=[52 * mm, 86 * mm, 22 * mm],
    destaque_primeira=True,
))

# ---------------------------------------------------------------- frente 1
A(Paragraph("1. Confirme no recarregar", H1))
A(Paragraph(
    "A mensagem verde de sucesso é uma promessa da tela, não um recibo do banco de "
    "dados. Os dois nem sempre combinam.",
    CORPO,
))
A(Paragraph("Os experimentos", H2))
A(lista([
    "Abra uma tarefa, mude <b>um campo por vez</b>, salve, e aperte F5. "
    "Faça isso com cada campo do formulário, separadamente. Algum deles volta "
    "sozinho ao valor antigo?",
    "Mude o status de uma tarefa <b>direto na listagem</b>, pelo seletor da linha. "
    "Agora saia da tela e volte. Ficou como você deixou?",
    "Exclua uma tarefa de cada um dos quatro status — pendente, em andamento, "
    "concluída e cancelada. Recarregue depois de cada exclusão. Todas sumiram mesmo?",
]))
A(Paragraph("A pergunta", H2))
A(Paragraph(
    "<i>Se eu fechasse o navegador agora e abrisse de novo amanhã, encontraria o que "
    "a tela está me mostrando?</i>",
    CORPO,
))

# ---------------------------------------------------------------- frente 2
A(Paragraph("2. O mesmo endereço, outro crachá", H1))
A(Paragraph(
    "A frente mais densa. Um botão escondido não é a mesma coisa que uma porta "
    "trancada: quem souber o endereço pode bater nela direto.",
    CORPO,
))
A(Paragraph("Os experimentos", H2))
A(lista([
    "Entre como administrador e <b>anote todos os endereços</b> que aparecem na barra "
    "enquanto você navega. Faça uma lista.",
    "Saia, entre com uma conta comum e <b>digite cada endereço da lista</b> na barra, "
    "um por um. Alguma tela abre que não deveria?",
    "Abra uma tarefa sua e olhe o endereço: ele termina com um código. "
    "Pegue o código de uma tarefa <b>de outra pessoa</b> e coloque no lugar.",
    "Tente não só <b>ver</b> a tela de outra pessoa, mas <b>salvar</b> uma alteração nela.",
    "Coloque o painel do administrador e o do usuário comum lado a lado. "
    "Compare cartão por cartão: tem algum número ali que o usuário comum não "
    "teria por que enxergar?",
]))
A(Paragraph("A pergunta", H2))
A(Paragraph(
    "<i>Esconder o botão é o mesmo que proibir a ação?</i>",
    CORPO,
))

# ---------------------------------------------------------------- frente 3
A(Paragraph("3. Para onde o sistema te leva", H1))
A(Paragraph(
    "Depois de cada ação o sistema decide onde você vai parar. Essa decisão erra com "
    "frequência, e é fácil não reparar porque a tela que aparece funciona bem.",
    CORPO,
))
A(Paragraph("Os experimentos", H2))
A(lista([
    "<b>Antes</b> de fazer login, cole na barra o endereço de uma tela interna. "
    "O sistema vai pedir que você entre. Depois de entrar, você caiu onde queria ir?",
    "Estando na listagem de tarefas, edite uma e salve. Você voltou para a listagem, "
    "de onde tinha saído?",
    "Preencha metade de um formulário longo e aperte F5 sem salvar. "
    "O sistema avisou alguma coisa antes de perder o que você digitou?",
    "Digite um endereço que não existe, algo como uma palavra inventada depois da "
    "barra. O que aparece?",
    "Olhe o <b>primeiro segundo</b> de cada tela que mostra lista. Vale a pena simular "
    "internet lenta (F12, aba Rede, opção de limitar a velocidade). O que o sistema "
    "afirma enquanto ainda está buscando os dados?",
]))
A(Paragraph("A pergunta", H2))
A(Paragraph(
    "<i>O sistema está me dizendo que não há nada, ou que ainda não sabe?</i>",
    CORPO,
))

# ---------------------------------------------------------------- frente 4
A(Paragraph("4. Listas grandes", H1))
A(Paragraph(
    "Filtro, ordenação e paginação parecem detalhe, mas é onde o usuário passa o dia. "
    "Teste cada opção, não só a primeira.",
    CORPO,
))
A(Paragraph("Os experimentos", H2))
A(lista([
    "Com tarefas suficientes para passar de uma página, <b>anote o título do último "
    "item da página 1</b> e vá para a página 2. Olhe o primeiro item dela.",
    "Abra cada seletor de filtro e percorra <b>todas</b> as opções, uma por uma. "
    "Alguma delas nunca traz resultado, mesmo existindo registros naquela situação?",
    "Ordene a lista por cada critério disponível. Para cada um, pergunte-se se "
    "aquela ordem serve para quem usa o sistema de verdade — em especial quando a "
    "ordem envolve <b>níveis</b>, e não palavras ou datas.",
]))
A(Paragraph("A pergunta", H2))
A(Paragraph(
    "<i>Essa ordem é a que o computador acha fácil, ou a que o trabalho pede?</i>",
    CORPO,
))

# ---------------------------------------------------------------- frente 5
A(Paragraph("5. Conte você mesma", H1))
A(Paragraph(
    "Os cartões do painel afirmam números. Trate cada um como uma declaração a ser "
    "conferida, e não como um fato.",
    CORPO,
))
A(Paragraph("Os experimentos", H2))
A(lista([
    "Abra a listagem, filtre por cada status e <b>conte na mão</b>. "
    "Compare com o cartão correspondente no painel. Bate?",
    "Preste atenção especial nos status que parecem vizinhos mas significam coisas "
    "opostas para quem usa o sistema. Confira um por um se o cartão conta só o que "
    "o nome dele promete.",
    "Crie três tarefas com prazo para <b>ontem</b>, para <b>hoje</b> e para "
    "<b>amanhã</b>. Olhe como cada uma é apresentada na listagem.",
]))
A(Paragraph("A pergunta", H2))
A(Paragraph(
    "<i>Cada cartão conta exatamente o que o título dele promete? E o que significa, "
    "para quem usa, uma tarefa que vence hoje?</i>",
    CORPO,
))

# ---------------------------------------------------------------- frente 6
A(Paragraph("6. Ao mesmo tempo", H1))
A(Paragraph(
    "Sistemas costumam ser testados por uma pessoa calma, fazendo uma coisa de cada "
    "vez. O mundo real não é assim.",
    CORPO,
))
A(Paragraph("Os experimentos", H2))
A(lista([
    "Abra a <b>mesma tarefa em duas abas</b>. Na aba 1 mude um campo; na aba 2 mude "
    "um campo diferente. Salve a aba 1, depois salve a aba 2. "
    "Agora recarregue as duas. O que sobrou de cada alteração?",
    "Troque o status de uma tarefa <b>várias vezes seguidas, bem rápido</b>, sem "
    "esperar a tela responder entre um clique e outro. Depois recarregue e veja "
    "onde a tarefa parou.",
]))
A(Paragraph("A pergunta", H2))
A(Paragraph(
    "<i>O sistema avisou que outra pessoa tinha mexido antes de mim, ou simplesmente "
    "passou por cima?</i>",
    CORPO,
))

# ---------------------------------------------------------------- frente 7
A(Paragraph("7. O rastro que fica", H1))
A(Paragraph(
    "Mudar um cadastro costuma ter consequências em outros cantos do sistema. "
    "Vá atrás delas: o defeito quase nunca está na tela onde você fez a mudança.",
    CORPO,
))
A(Paragraph("Os experimentos", H2))
A(lista([
    "Altere o <b>e-mail</b> de um usuário pela tela de edição. Saia e tente entrar "
    "com o e-mail novo. Depois tente com o antigo. Qual dos dois funciona?",
    "Exclua um usuário que <b>tinha tarefas atribuídas</b> a ele. "
    "Em seguida vá até a listagem de tarefas e procure as tarefas que eram dele. "
    "O que aparece na coluna de responsável?",
]))
A(Paragraph("A pergunta", H2))
A(Paragraph(
    "<i>Quando um cadastro muda, quem mais no sistema precisava ficar sabendo?</i>",
    CORPO,
))

# ---------------------------------------------------------------- fechamento
A(Spacer(1, 10))
A(KeepTogether([
    caixa([
        Paragraph("Ao registrar o que encontrar", CELULA_CAB),
        Spacer(1, 5),
        Paragraph(
            "Para cada achado, escreva os <b>passos</b> na ordem exata, o que você "
            "<b>esperava</b>, o que <b>aconteceu</b> e anexe a evidência. "
            "O passo que mais se esquece é o último: diga se você recarregou a página "
            "antes de concluir, porque isso muda o diagnóstico.",
            CORPO,
        ),
        Paragraph(
            "Separe o que é <b>defeito</b> (o sistema faz diferente do que deveria) do "
            "que é <b>sugestão</b> (o sistema está correto, mas poderia ser melhor). "
            "As duas coisas são bem-vindas, em listas separadas.",
            CORPO,
        ),
    ]),
    Spacer(1, 8),
    Paragraph(
        "Se uma frente não render o número indicado, não force: volte a ela depois de "
        "percorrer as outras. É comum um experimento de uma frente revelar o caminho "
        "de outra.",
        NOTA,
    ),
]))

construir(
    os.path.join(RAIZ, "docs", "TaskFlow_Dicas_Proximo_Ciclo.pdf"),
    historia,
    titulo="TaskFlow — Onde procurar agora",
    assunto="Material de apoio para o próximo ciclo de testes",
    rodape_texto="TaskFlow — onde procurar agora",
)
