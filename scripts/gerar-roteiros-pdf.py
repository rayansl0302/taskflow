# -*- coding: utf-8 -*-
"""Gera o PDF de roteiros de execução para o ciclo final.

O material de dicas diz *onde* procurar. Este diz *como executar* — passo a
passo numerado, com o estado a anotar antes de cada ação e o ponto exato onde
olhar. Existe porque o que sobrou no sistema não aparece fazendo uma coisa de
cada vez: depende de duas abas, de pressa, de contagem conferida e do intervalo
antes de a tela terminar de carregar.

Nenhum defeito é nomeado nem descrito. O documento ensina o procedimento e diz
o que registrar; a conclusão continua sendo de quem testa.
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
    MONO,
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
# Cobertura — mesma trava do material de dicas.
#
# Cada roteiro aponta para os defeitos que pretende revelar. O mapa nao entra
# no PDF: serve para conferir que os roteiros cobrem exatamente o que continua
# plantado, e aborta a geracao se o gabarito e este arquivo discordarem.
# ------------------------------------------------------------------
ROTEIROS = [
    ("Duas abas e pressa", ["BUG-024", "BUG-025"]),
    ("Excluir em cada situação", ["BUG-020"]),
    ("Conferir os números", ["BUG-042"]),
    ("O primeiro segundo", ["BUG-046"]),
]


def conferir_cobertura():
    caminho = os.path.join(RAIZ, "docs", "gabarito.json")
    with open(caminho, encoding="utf-8") as arquivo:
        bugs = json.load(arquivo)["bugs"]

    invisiveis = {"corrigido", "fora-de-escopo"}
    plantados = {b["id"] for b in bugs if b.get("status", "pendente") not in invisiveis}
    cobertos = {bug for _, ids in ROTEIROS for bug in ids}

    faltando = sorted(plantados - cobertos)
    sobrando = sorted(cobertos - plantados)
    if faltando or sobrando:
        print("Os roteiros não batem com o gabarito:", file=sys.stderr)
        if faltando:
            print("  plantados e sem roteiro:", ", ".join(faltando), file=sys.stderr)
        if sobrando:
            print("  em roteiro mas fora da conta:", ", ".join(sobrando), file=sys.stderr)
        sys.exit(1)

    return len(plantados)


TOTAL = conferir_cobertura()

historia = []
A = historia.append


def passos(itens):
    return lista(itens, numerada=True)


def anotar(texto):
    return Paragraph("<b>Anote:</b> " + texto, CORPO_CINZA)


# ---------------------------------------------------------------- abertura
A(Paragraph("Roteiros de execução", TITULO))
A(Paragraph("TaskFlow — ciclo final", SUBTITULO))

A(caixa([
    Paragraph("Por que este material é diferente", CELULA_CAB),
    Spacer(1, 5),
    Paragraph(
        "Os <b>%d defeitos</b> que ainda estão no sistema não aparecem do jeito que um "
        "teste costuma ser feito: uma ação de cada vez, esperando a tela responder e "
        "olhando o resultado final. Eles vivem no intervalo entre uma coisa e outra." % TOTAL,
        CORPO,
    ),
    Paragraph(
        "Por isso aqui não há dicas soltas, e sim <b>procedimento</b>: a preparação, os "
        "passos na ordem, o que anotar antes de agir e o instante exato de olhar. Siga "
        "cada roteiro inteiro, mesmo quando parecer que nada aconteceu — em três dos "
        "quatro, o defeito só fica visível quando você compara o que anotou antes com o "
        "que vê depois.",
        CORPO,
    ),
    Paragraph(
        "O que o sistema deveria fazer continua sendo julgamento seu. Nenhum roteiro diz "
        "qual é o problema; eles colocam você no lugar de onde dá para enxergar.",
        CORPO_CINZA,
    ),
]))

# ---------------------------------------------------------------- preparacao
A(Paragraph("Antes de começar", H1))
A(Paragraph(
    "Cinco minutos de preparação evitam que um roteiro trave no meio por falta de dados.",
    CORPO,
))
A(Paragraph("O que você precisa ter em mãos", H2))
A(lista([
    "Uma conta <b>administradora</b> e uma conta <b>comum</b>, com as senhas à mão.",
    "Pelo menos <b>uma tarefa em cada um dos quatro status</b>: pendente, em andamento, "
    "concluída e cancelada. Se faltar alguma situação, crie a tarefa e mude o status pelo "
    "seletor da própria linha da listagem.",
    "Papel e caneta, ou um bloco de notas aberto. Três dos quatro roteiros dependem de "
    "comparar um valor anotado antes com o que aparece depois — de memória não funciona.",
]))
A(Paragraph(
    "Faça a preparação com a conta administradora, que enxerga todas as tarefas.",
    CORPO_CINZA,
))

# ---------------------------------------------------------------- roteiro 1
A(Paragraph("Roteiro 1 — Duas abas e pressa", H1))
A(Paragraph(
    "O roteiro mais longo e o que mais rende. Ele simula duas situações que acontecem "
    "todo dia num time e quase nunca em um teste: duas pessoas mexendo no mesmo registro, "
    "e alguém com pressa demais para esperar a tela.",
    CORPO,
))

A(Paragraph("Preparação — a mesma tarefa em duas abas", H2))
A(passos([
    "Na listagem de tarefas, escolha uma tarefa qualquer.",
    "Clique com o <b>botão direito</b> sobre o título dela e escolha "
    "<i>Abrir link em uma nova aba</i>.",
    "Repita: botão direito no mesmo título, abrir em outra aba nova.",
    "Você agora tem a mesma tarefa aberta em duas abas. Chame-as de <b>aba 1</b> e "
    "<b>aba 2</b>, na ordem em que abriu.",
]))

A(Paragraph("Teste 1A — duas gravações em sequência", H2))
A(passos([
    "Na <b>aba 1</b>, altere o <b>título</b> da tarefa. Não salve ainda.",
    "Vá para a <b>aba 2</b>. Repare que ela ainda mostra os dados antigos. "
    "Altere ali a <b>prioridade</b>. Não salve ainda.",
    "Volte à aba 1 e clique em <b>Salvar</b>.",
    "Vá à aba 2 e clique em <b>Salvar</b>.",
    "Recarregue as duas abas com F5.",
]))
A(anotar(
    "o título que você digitou na aba 1 continua lá? E a prioridade que escolheu na "
    "aba 2? Escreva as duas respostas antes de seguir."
))
A(Paragraph(
    "<b>Onde olhar:</b> em nenhum momento entre o passo 3 e o passo 4 o sistema disse "
    "alguma coisa sobre o registro ter mudado. Isso é parte do que você está avaliando.",
    CORPO,
))

A(Paragraph("Teste 1B — a mesma coisa, ordem invertida", H2))
A(passos([
    "Repita o teste 1A do começo, com outra tarefa.",
    "Desta vez salve a <b>aba 2 primeiro</b> e a aba 1 depois.",
    "Recarregue as duas.",
]))
A(anotar("o resultado foi igual ao do teste 1A, ou mudou conforme quem salva por último?"))

A(Paragraph("Teste 1C — dois cliques sem esperar", H2))
A(passos([
    "Volte à listagem de tarefas, em uma aba só.",
    "Escolha <b>duas tarefas vizinhas</b> na lista. Chame-as de A e B.",
    "Anote o status atual de cada uma, antes de mexer.",
    "Mude o status de A pelo seletor da linha e, <b>sem esperar a tela responder</b>, "
    "mude o status de B. O intervalo entre os dois cliques precisa ser o menor possível.",
    "Sem recarregar, olhe as duas linhas e anote o que cada uma mostra agora.",
    "Agora recarregue com F5 e olhe as mesmas duas linhas de novo.",
]))
A(anotar(
    "os três estados — o de antes, o da tela logo após os cliques e o de depois do F5. "
    "A comparação entre os dois últimos é o ponto do teste."
))

# ---------------------------------------------------------------- roteiro 2
A(Paragraph("Roteiro 2 — Excluir em cada situação", H1))
A(Paragraph(
    "Você já excluiu tarefas em ciclos anteriores. A diferença aqui é variar <b>em qual "
    "situação</b> a tarefa está quando é excluída, e confirmar cada exclusão com um "
    "recarregamento antes de passar para a próxima.",
    CORPO,
))
A(Paragraph("O procedimento, repetido quatro vezes", H2))
A(passos([
    "Escolha uma tarefa que esteja em <b>pendente</b>. Anote o título.",
    "Clique em <b>Excluir</b> e confirme.",
    "Confirme que a linha desapareceu da listagem.",
    "Aperte <b>F5</b>.",
    "Procure a tarefa de novo, pelo título anotado, usando o campo de pesquisa.",
    "Repita os passos 1 a 5 com uma tarefa <b>em andamento</b>, depois com uma "
    "<b>concluída</b>, depois com uma <b>cancelada</b>.",
]))
A(Spacer(1, 4))
A(tabela(
    [
        ["SITUAÇÃO DA TAREFA", "TÍTULO", "SUMIU DA TELA?", "CONTINUA FORA APÓS O F5?"],
        ["Pendente", "", "", ""],
        ["Em andamento", "", "", ""],
        ["Concluída", "", "", ""],
        ["Cancelada", "", "", ""],
    ],
    larguras=[34 * mm, 48 * mm, 32 * mm, 46 * mm],
    destaque_primeira=True,
))
A(Spacer(1, 6))
A(Paragraph(
    "<b>Onde olhar:</b> as duas últimas colunas podem não dar a mesma resposta. Se em "
    "alguma linha elas divergirem, repita só aquele caso para ter certeza antes de "
    "registrar.",
    CORPO,
))

# ---------------------------------------------------------------- roteiro 3
A(Paragraph("Roteiro 3 — Conferir os números", H1))
A(Paragraph(
    "Os cartões do painel afirmam quantidades. Trate cada um como uma declaração a ser "
    "conferida. A regra deste roteiro é fazer a sua contagem <b>inteira</b> antes de "
    "olhar o painel — assim o número dele não influencia a sua leitura.",
    CORPO,
))
A(Paragraph("Primeiro a sua contagem", H2))
A(passos([
    "Abra a listagem de tarefas com a conta administradora.",
    "Aplique o filtro de status <b>Pendente</b> e anote o número que aparece em "
    "<i>X tarefa(s) encontrada(s)</i>.",
    "Repita para <b>Em andamento</b>, <b>Concluída</b> e <b>Cancelada</b>, anotando cada "
    "número.",
    "Some os quatro.",
]))
A(Paragraph("Agora o painel", H2))
A(passos([
    "Abra o dashboard e anote o valor de cada cartão.",
    "Compare cartão por cartão com a sua contagem.",
    "Compare também os dois totais.",
]))
A(Spacer(1, 4))
A(tabela(
    [
        ["SITUAÇÃO", "SUA CONTAGEM", "CARTÃO DO PAINEL", "DIFERENÇA"],
        ["Pendente", "", "", ""],
        ["Em andamento", "", "", ""],
        ["Concluída", "", "", ""],
        ["Cancelada", "", "(não há cartão)", ""],
        ["Total", "", "", ""],
    ],
    larguras=[34 * mm, 38 * mm, 44 * mm, 44 * mm],
    destaque_primeira=True,
))
A(Spacer(1, 6))
A(Paragraph(
    "<b>Onde olhar:</b> se algum cartão ficar maior que a sua contagem, calcule a "
    "diferença exata e procure qual das outras situações tem precisamente esse número. "
    "E pergunte-se se as duas significam a mesma coisa para quem usa o sistema.",
    CORPO,
))

# ---------------------------------------------------------------- roteiro 4
A(Paragraph("Roteiro 4 — O primeiro segundo", H1))
A(Paragraph(
    "Quase todo teste olha a tela depois que ela terminou de carregar. O que o sistema "
    "afirma <b>enquanto ainda está buscando</b> também é informação — e numa conexão "
    "rápida esse instante passa rápido demais para ser lido. O roteiro começa deixando a "
    "conexão lenta de propósito.",
    CORPO,
))
A(Paragraph("Preparação — deixar a conexão lenta", H2))
A(passos([
    "Com o sistema aberto, aperte <b>F12</b> para abrir as ferramentas do navegador.",
    "Clique na aba <b>Network</b> (ou <b>Rede</b>, se estiver em português).",
    "Procure na barra dessa aba um seletor escrito <b>No throttling</b> "
    "(ou <b>Sem limitação</b>).",
    "Troque o valor para <b>Slow 3G</b>.",
    "Deixe as ferramentas abertas: fechá-las desfaz a limitação.",
]))
A(Paragraph(
    "A partir daqui o sistema fica propositalmente lento. É assim que deve ficar.",
    CORPO_CINZA,
))
A(Paragraph("O teste", H2))
A(passos([
    "Entre com uma conta que <b>tenha tarefas</b> — isso importa.",
    "Vá para a listagem de tarefas e aperte F5.",
    "Olhe a área onde a tabela costuma aparecer, no intervalo entre a página desenhar e "
    "os dados chegarem.",
    "Leia o que está escrito ali e anote a <b>frase exata</b>, palavra por palavra.",
    "Espere terminar de carregar e veja o que ficou no lugar.",
    "Repita no dashboard e em qualquer outra tela que mostre lista.",
]))
A(anotar(
    "a frase do primeiro segundo e o que apareceu depois. Se a segunda desmente a "
    "primeira, você encontrou o que procurava."
))
A(Paragraph(
    "<b>Ao terminar</b>, volte o seletor para <i>No throttling</i>, senão o resto dos "
    "seus testes fica lento sem motivo.",
    CORPO_CINZA,
))

# ---------------------------------------------------------------- registro
A(Spacer(1, 8))
A(Paragraph("Ao registrar o que encontrar", H1))
A(Paragraph(
    "Nestes quatro roteiros, dois detalhes mudam o diagnóstico de quem vai ler o "
    "relatório e costumam ficar de fora:",
    CORPO,
))
A(lista([
    "Se você <b>recarregou a página</b> antes de concluir. Sem isso, não dá para "
    "distinguir um problema de tela de um problema do que foi guardado.",
    "<b>Quanto tempo</b> você esperou entre uma ação e a outra. Em dois dos roteiros a "
    "pressa é a condição do teste, e um relato sem essa informação não é reproduzível.",
]))
A(Spacer(1, 4))
A(KeepTogether([
    caixa([
        Paragraph("Confira o título antes de enviar", CELULA_CAB),
        Spacer(1, 5),
        Paragraph(
            "Leia o título que você deu e os seus passos, um depois do outro, e pergunte "
            "se contam a mesma história. No ciclo passado uma ocorrência foi intitulada "
            "como um teste de duas abas, mas os passos e o resultado descreviam a "
            "paginação — são defeitos diferentes, e quem lê precisa adivinhar qual dos "
            "dois você quis dizer.",
            CORPO,
        ),
        Paragraph(
            "Regra simples: o título é o resumo do <b>resultado encontrado</b>, não do "
            "assunto que você estava testando quando tropeçou nele.",
            CORPO,
        ),
    ]),
    Spacer(1, 8),
    Paragraph(
        "Se um roteiro não render nada, não force nem invente: registre que executou e "
        "que o comportamento pareceu correto. Um roteiro executado e limpo também é "
        "resultado de teste.",
        NOTA,
    ),
]))

construir(
    os.path.join(RAIZ, "docs", "TaskFlow_Roteiros_Ciclo_Final.pdf"),
    historia,
    titulo="TaskFlow — Roteiros de execução",
    assunto="Procedimentos de teste para o ciclo final",
    rodape_texto="TaskFlow — roteiros de execução",
)
