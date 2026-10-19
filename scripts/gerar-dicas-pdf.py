# -*- coding: utf-8 -*-
"""Gera o PDF de dicas para o próximo ciclo de testes.

Diferente do guia exploratório, que ensina técnica em geral, este material é
recortado sobre o que ainda está plantado no sistema: as frentes que sobraram,
o número de achados de cada uma e os experimentos que levam até eles.

Nenhum defeito é nomeado nem descrito. O que o documento entrega é o endereço
da caça — onde procurar e com qual gesto —, não a presa.
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
# entra no PDF: serve para conferir, a cada ciclo, que as frentes ainda cobrem
# exatamente o que continua plantado — e para que os números impressos venham
# daqui, em vez de serem digitados à mão e envelhecerem em silêncio.
# ------------------------------------------------------------------
FRENTES = [
    ("Ao mesmo tempo",
     "Duas abas abertas e cliques rápidos demais.",
     ["BUG-024", "BUG-025"]),
    ("Confirme no recarregar",
     "Salvar não é o fim do teste. Recarregue e confira.",
     ["BUG-020"]),
    ("Conte você mesma",
     "Confira na mão o que os números do painel afirmam.",
     ["BUG-042"]),
    ("O primeiro segundo",
     "Olhe a tela antes de ela terminar de carregar.",
     ["BUG-046"]),
]


def conferir_cobertura():
    """Aborta se as frentes e o gabarito discordarem sobre o que falta."""
    caminho = os.path.join(RAIZ, "docs", "gabarito.json")
    with open(caminho, encoding="utf-8") as arquivo:
        bugs = json.load(arquivo)["bugs"]

    # `fora-de-escopo` marca o defeito que nenhum caminho da interface revela:
    # ele existe, mas nao se pede a quem testa que o encontre.
    invisiveis = {"corrigido", "fora-de-escopo"}
    plantados = {b["id"] for b in bugs if b.get("status", "pendente") not in invisiveis}
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
            print("  em frente mas fora da conta:", ", ".join(sobrando), file=sys.stderr)
        if repetidos:
            print("  em mais de uma frente:", ", ".join(sorted(set(repetidos))), file=sys.stderr)
        print("Ajuste FRENTES antes de gerar o PDF.", file=sys.stderr)
        sys.exit(1)

    return len(plantados)


TOTAL = conferir_cobertura()

historia = []
A = historia.append

# ---------------------------------------------------------------- abertura
A(Paragraph("O que ainda resta", TITULO))
A(Paragraph("TaskFlow — apoio ao próximo ciclo de testes", SUBTITULO))

A(caixa([
    Paragraph("Como usar este material", CELULA_CAB),
    Spacer(1, 5),
    Paragraph(
        "O ciclo anterior foi o melhor até agora: quase tudo que havia para encontrar "
        "pelos caminhos comuns já foi encontrado. Sobraram <b>%d defeitos</b>, e eles "
        "são de um tipo diferente — nenhum aparece quando você faz uma coisa de cada "
        "vez, com calma, e olha o resultado final." % TOTAL,
        CORPO,
    ),
    Paragraph(
        "Eles se escondem em três lugares: no <b>meio do caminho</b> (antes de a tela "
        "terminar de carregar), na <b>repetição</b> (duas abas, cliques rápidos) e na "
        "<b>conferência</b> (o número que o sistema afirma contra o que você conta). "
        "Por isso as dicas daqui pedem mais insistência do que as anteriores.",
        CORPO,
    ),
    Paragraph(
        "Como sempre: o defeito em si não está escrito aqui. Cada frente traz o gesto e "
        "a pergunta; o julgamento continua sendo seu.",
        CORPO_CINZA,
    ),
]))

A(Spacer(1, 12))
A(Paragraph("O mapa", H1))
A(Paragraph("Quanto cada frente rende:", CORPO))
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
A(Paragraph("1. Ao mesmo tempo", H1))
A(Paragraph(
    "A frente mais densa, e a menos natural de testar. Sistemas costumam ser "
    "experimentados por uma pessoa só, fazendo uma coisa de cada vez e esperando a tela "
    "responder. O trabalho real tem duas pessoas na mesma tarefa e gente com pressa.",
    CORPO,
))
A(Paragraph("Os experimentos", H2))
A(lista([
    "Abra a <b>mesma tarefa em duas abas</b>. Na aba 1 mude um campo; na aba 2, que "
    "ainda mostra os dados antigos, mude um campo <b>diferente</b>. Salve a aba 1, "
    "depois salve a aba 2. Recarregue as duas e veja o que sobrou de cada alteração.",
    "Repita o teste acima invertendo a ordem de quem salva primeiro. O resultado é o "
    "mesmo?",
    "Na listagem, troque o status de <b>duas tarefas diferentes</b> uma logo após a "
    "outra, <b>sem esperar</b> a tela responder entre um clique e outro. Olhe as duas "
    "linhas antes de recarregar.",
    "Agora recarregue e olhe as mesmas duas linhas de novo. O que a tela mostrava e o "
    "que ficou guardado contam a mesma história?",
]))
A(Paragraph("A pergunta", H2))
A(Paragraph(
    "<i>O sistema me avisou que alguém tinha mexido antes de mim, ou passou por cima "
    "em silêncio?</i>",
    CORPO,
))

# ---------------------------------------------------------------- frente 2
A(Paragraph("2. Confirme no recarregar", H1))
A(Paragraph(
    "Você já usou esta técnica e ela rendeu. Vale uma passada final, porque falta um "
    "caso — e ele só aparece se você variar <b>em qual situação</b> a tarefa está "
    "quando você age sobre ela.",
    CORPO,
))
A(Paragraph("Os experimentos", H2))
A(lista([
    "Exclua uma tarefa de <b>cada um dos quatro status</b> — pendente, em andamento, "
    "concluída e cancelada. Uma de cada, não quatro pendentes.",
    "Depois de cada exclusão, confirme que a linha sumiu e <b>recarregue a página</b>. "
    "Ela continua sumida?",
    "Se alguma voltar, repita só com aquela para ter certeza, e anote em que situação "
    "a tarefa estava.",
]))
A(Paragraph("A pergunta", H2))
A(Paragraph(
    "<i>A mensagem de sucesso vale para qualquer tarefa, ou só para algumas?</i>",
    CORPO,
))

# ---------------------------------------------------------------- frente 3
A(Paragraph("3. Conte você mesma", H1))
A(Paragraph(
    "Os cartões do painel afirmam números. Trate cada um como uma declaração a ser "
    "conferida, não como um fato.",
    CORPO,
))
A(Paragraph("Os experimentos", H2))
A(lista([
    "Abra a listagem, filtre por <b>um status de cada vez</b> e anote quantas tarefas "
    "aparecem em cada situação. Faça a lista completa antes de olhar o painel.",
    "Agora compare com os cartões. Some os seus números e some os do painel: dá o "
    "mesmo total?",
    "Se algum cartão estiver maior do que a sua contagem, procure <b>qual outro status "
    "preencheria a diferença</b> exatamente.",
    "Vale pensar no significado: há status que parecem vizinhos mas querem dizer coisas "
    "opostas para quem usa o sistema.",
]))
A(Paragraph("A pergunta", H2))
A(Paragraph(
    "<i>Cada cartão conta exatamente o que o título dele promete?</i>",
    CORPO,
))

# ---------------------------------------------------------------- frente 4
A(Paragraph("4. O primeiro segundo", H1))
A(Paragraph(
    "Quase todo teste olha a tela depois que ela terminou de carregar. O que o sistema "
    "afirma <b>enquanto ainda está buscando</b> os dados também é informação, e também "
    "pode estar errado.",
    CORPO,
))
A(Paragraph("Os experimentos", H2))
A(lista([
    "Aperte F12, vá à aba <b>Rede</b> e ligue a opção de limitar a velocidade da "
    "conexão (procure por <i>Slow 3G</i> ou equivalente). Isso estica o primeiro "
    "segundo e dá tempo de olhar.",
    "Com a conexão lenta ligada, recarregue as telas que mostram lista e observe o "
    "intervalo entre a página aparecer e os dados chegarem.",
    "Leia o que está escrito nesse intervalo. O sistema está dizendo que <b>está "
    "buscando</b>, ou já está afirmando alguma coisa sobre o resultado?",
    "Teste também em uma conta que tem tarefas: se a afirmação do primeiro segundo for "
    "desmentida um instante depois, você encontrou algo.",
]))
A(Paragraph("A pergunta", H2))
A(Paragraph(
    "<i>O sistema está me dizendo que não há nada, ou que ainda não sabe?</i>",
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
            "<b>esperava</b>, o que <b>aconteceu</b> e anexe a evidência. Nesta etapa "
            "dois detalhes mudam o diagnóstico: diga se você <b>recarregou</b> a página "
            "antes de concluir, e diga <b>quanto tempo</b> esperou entre uma ação e "
            "outra.",
            CORPO,
        ),
        Paragraph(
            "Confira também se o título que você deu descreve o mesmo que os seus "
            "passos. Quando os dois discordam, quem lê o relatório precisa adivinhar "
            "qual dos dois é o defeito.",
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
    titulo="TaskFlow — O que ainda resta",
    assunto="Material de apoio para o próximo ciclo de testes",
    rodape_texto="TaskFlow — o que ainda resta",
)
