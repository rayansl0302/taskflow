# -*- coding: utf-8 -*-
"""Gera o PDF de briefing entregue ao profissional de QA.

Saida: docs/TaskFlow_Briefing_QA.pdf

    pip install reportlab
    python scripts/gerar-briefing-pdf.py

O conteudo acompanha docs/BRIEFING_QA.md e NAO deve conter pistas dos defeitos
inseridos no sistema — apenas o escopo funcional, os acessos e o formato do
relatorio esperado.
"""
import os

from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

SAIDA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                     "docs", "TaskFlow_Briefing_QA.pdf")

ROXO = colors.HexColor("#4f46e5")
ROXO_ESCURO = colors.HexColor("#4338ca")
TINTA = colors.HexColor("#0f172a")
CINZA = colors.HexColor("#64748b")
BORDA = colors.HexColor("#e2e8f0")
FUNDO_SUAVE = colors.HexColor("#f8fafc")
FUNDO_DESTAQUE = colors.HexColor("#eef2ff")

estilos = getSampleStyleSheet()


def estilo(nome, **kwargs):
    kwargs.setdefault("parent", estilos["Normal"])
    return ParagraphStyle(nome, **kwargs)


TITULO = estilo("TituloCapa", fontName="Helvetica-Bold", fontSize=26, leading=30,
                textColor=TINTA, spaceAfter=6)
SUBTITULO = estilo("SubtituloCapa", fontName="Helvetica", fontSize=12.5, leading=17,
                   textColor=CINZA, spaceAfter=18)
H1 = estilo("H1", fontName="Helvetica-Bold", fontSize=15, leading=19, textColor=ROXO_ESCURO,
            spaceBefore=15, spaceAfter=7, keepWithNext=1)
H2 = estilo("H2", fontName="Helvetica-Bold", fontSize=11.5, leading=15, textColor=TINTA,
            spaceBefore=11, spaceAfter=5, keepWithNext=1)
CORPO = estilo("Corpo", fontName="Helvetica", fontSize=10, leading=15, textColor=TINTA,
               alignment=TA_JUSTIFY, spaceAfter=6)
CORPO_CINZA = estilo("CorpoCinza", parent=CORPO, textColor=CINZA)
ITEM = estilo("Item", fontName="Helvetica", fontSize=10, leading=14.5, textColor=TINTA)
CELULA = estilo("Celula", fontName="Helvetica", fontSize=9.5, leading=13, textColor=TINTA)
CELULA_FORTE = estilo("CelulaForte", parent=CELULA, fontName="Helvetica-Bold")
CELULA_CAB = estilo("CelulaCab", fontName="Helvetica-Bold", fontSize=8.5, leading=11,
                    textColor=CINZA)
MONO = estilo("Mono", fontName="Courier-Bold", fontSize=10.5, leading=14, textColor=ROXO_ESCURO)
NOTA = estilo("Nota", fontName="Helvetica", fontSize=9.5, leading=13.5, textColor=CINZA)


def lista(itens, estilo_item=ITEM):
    return ListFlowable(
        [ListItem(Paragraph(t, estilo_item), leftIndent=12) for t in itens],
        bulletType="bullet",
        bulletColor=ROXO,
        bulletFontSize=9,
        bulletOffsetY=-1.5,
        leftIndent=14,
        spaceAfter=8,
    )


def tabela(dados, larguras, destaque_primeira=False):
    corpo = [[Paragraph(c, CELULA_CAB) for c in dados[0]]]
    for linha in dados[1:]:
        corpo.append([
            Paragraph(c, CELULA_FORTE if (destaque_primeira and i == 0) else CELULA)
            for i, c in enumerate(linha)
        ])

    t = Table(corpo, colWidths=larguras, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), FUNDO_SUAVE),
        ("LINEBELOW", (0, 0), (-1, 0), 0.8, BORDA),
        ("LINEBELOW", (0, 1), (-1, -2), 0.4, BORDA),
        ("BOX", (0, 0), (-1, -1), 0.8, BORDA),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t


def caixa(flowables, fundo=FUNDO_DESTAQUE, borda=ROXO):
    t = Table([[flowables]], colWidths=[165 * mm], hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), fundo),
        ("LINEBEFORE", (0, 0), (0, -1), 3, borda),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDA),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
    ]))
    return t


def rodape(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(CINZA)
    canvas.drawString(20 * mm, 12 * mm, "TaskFlow — Desafio Prático de QA")
    canvas.drawRightString(190 * mm, 12 * mm, "Página %d" % doc.page)
    canvas.setStrokeColor(BORDA)
    canvas.setLineWidth(0.5)
    canvas.line(20 * mm, 16 * mm, 190 * mm, 16 * mm)
    canvas.restoreState()


historia = []

# ---------------------------------------------------------------- capa
historia.append(Spacer(1, 10 * mm))
historia.append(Paragraph("TaskFlow", TITULO))
historia.append(Paragraph("Desafio Prático de QA — guia do avaliado", SUBTITULO))
historia.append(Paragraph(
    "Este documento reúne tudo o que você precisa para executar o teste: o escopo funcional "
    "do sistema, os acessos de cada perfil e o formato esperado do seu relatório. "
    "Leia antes de começar e mantenha por perto durante a execução.", CORPO))

# ---------------------------------------------------------------- ambiente
historia.append(Paragraph("1. Ambiente e acessos", H1))
historia.append(Paragraph(
    "O sistema já está publicado e populado com dados de demonstração. Você não precisa "
    "instalar nada — basta um navegador atualizado.", CORPO))

historia.append(KeepTogether([
    caixa([
        Paragraph("Endereço da aplicação", CELULA_CAB),
        Spacer(1, 3),
        Paragraph("https://taskflow-lovat-two.vercel.app", MONO),
    ]),
    Spacer(1, 10),
    Paragraph("Credenciais", H2),
    tabela([
        ["Perfil", "E-mail", "Senha"],
        ["ADMIN", "admin@taskflow.com", "Taskflow@2024"],
        ["USER", "maria.silva@taskflow.com", "Taskflow@2024"],
        ["USER", "joao.pereira@taskflow.com", "Taskflow@2024"],
    ], [25 * mm, 78 * mm, 42 * mm], destaque_primeira=True),
]))
historia.append(Spacer(1, 8))
historia.append(Paragraph(
    "Use os três acessos. Boa parte dos cenários só aparece quando se compara o que cada "
    "perfil enxerga e consegue fazer. Como ADMIN você também pode criar outros usuários.",
    CORPO_CINZA))

historia.append(Paragraph("Prazo e entrega", H2))
historia.append(tabela([
    ["Item", "Valor"],
    ["Prazo de execução", "_______________________"],
    ["Formato da entrega", "Documento com a lista de defeitos (ver seção 6)"],
    ["Enviar para", "_______________________"],
], [45 * mm, 100 * mm], destaque_primeira=True))

# ---------------------------------------------------------------- escopo
historia.append(Paragraph("2. O que é o TaskFlow", H1))
historia.append(Paragraph(
    "Um sistema web de gestão de tarefas com dois perfis de acesso. Cada tarefa tem um "
    "responsável, um status, uma prioridade e um prazo; administradores gerenciam os "
    "usuários que têm acesso ao sistema.", CORPO))

historia.append(Paragraph("Perfis de acesso", H2))
historia.append(tabela([
    ["Perfil", "O que pode fazer"],
    ["ADMIN", "Visualizar o dashboard; listar, criar, editar e excluir usuários; "
              "visualizar, criar, editar e excluir todas as tarefas do sistema."],
    ["USER", "Visualizar o dashboard; visualizar, criar, editar e excluir apenas as "
             "próprias tarefas; editar o próprio perfil. Não deve acessar áreas "
             "administrativas."],
], [25 * mm, 120 * mm], destaque_primeira=True))

historia.append(Paragraph("Rotas da aplicação", H2))
historia.append(tabela([
    ["Rota", "Descrição"],
    ["/login", "Autenticação"],
    ["/dashboard", "Indicadores gerais"],
    ["/tasks", "Listagem de tarefas"],
    ["/tasks/new", "Cadastro de tarefa"],
    ["/tasks/:id", "Detalhe e edição de uma tarefa"],
    ["/users", "Listagem de usuários (administrativo)"],
    ["/users/:id", "Detalhe e edição de um usuário (administrativo)"],
    ["/profile", "Perfil do usuário autenticado"],
], [38 * mm, 107 * mm], destaque_primeira=True))

# ---------------------------------------------------------------- funcionalidades
historia.append(Paragraph("3. Funcionalidades esperadas", H1))

historia.append(Paragraph("Autenticação", H2))
historia.append(lista([
    "Login com e-mail e senha",
    "Logout",
    "Persistência da sessão",
    "Recuperação de senha",
    "Exibição do usuário autenticado",
    "Redirecionamento após o login",
    "Proteção de rotas — quem não está autenticado vai para <b>/login</b>",
]))

historia.append(Paragraph("Dashboard", H2))
historia.append(Paragraph(
    "Apresenta total de tarefas, tarefas pendentes, em andamento, concluídas e total de "
    "usuários. As métricas de usuários são exclusivas do ADMIN; o USER deve ver apenas "
    "informações das próprias tarefas.", CORPO))

historia.append(Paragraph("Usuários", H2))
historia.append(Paragraph(
    "Campos: nome, e-mail, perfil (ADMIN ou USER), status (ATIVO ou INATIVO) e data de "
    "criação. Funcionalidades: listar, pesquisar, filtrar por perfil, filtrar por status, "
    "criar, editar, visualizar e excluir.", CORPO))

historia.append(Paragraph("Tarefas", H2))
historia.append(Paragraph(
    "Campos: título, descrição, responsável, status, prioridade, prazo, data de criação e "
    "data de atualização. Funcionalidades: listagem, pesquisa, filtros, ordenação, "
    "paginação, criar, editar, visualizar, excluir e alterar status.", CORPO))
historia.append(tabela([
    ["Domínio", "Valores"],
    ["Status", "PENDENTE, EM_ANDAMENTO, CONCLUIDA, CANCELADA"],
    ["Prioridade", "BAIXA, MEDIA, ALTA, URGENTE"],
], [28 * mm, 117 * mm], destaque_primeira=True))

historia.append(Paragraph("Regras de validação", H2))
historia.append(tabela([
    ["Entidade", "Campo", "Regra"],
    ["Usuário", "Nome", "Obrigatório, mínimo 3 e máximo 100 caracteres"],
    ["Usuário", "E-mail", "Obrigatório e em formato válido"],
    ["Usuário", "Perfil", "Obrigatório"],
    ["Tarefa", "Título", "Obrigatório, mínimo 3 e máximo 100 caracteres"],
    ["Tarefa", "Descrição", "Máximo 500 caracteres"],
    ["Tarefa", "Prazo", "Obrigatório"],
], [24 * mm, 26 * mm, 95 * mm], destaque_primeira=True))
historia.append(Spacer(1, 6))
historia.append(Paragraph(
    "Os dados devem ser validados antes de serem gravados no banco.", CORPO_CINZA))

historia.append(Paragraph("Requisitos de experiência de uso", H2))
historia.append(lista([
    "Indicação de carregamento durante as requisições",
    "Mensagens de sucesso e de erro",
    "Confirmação antes de excluir",
    "Estados vazios",
    "Tratamento de erros",
    "Layout responsivo",
    "Retorno visual para as ações",
    "Mensagens de validação nos formulários",
]))

# ---------------------------------------------------------------- o que se espera
historia.append(Paragraph("4. O que se espera de você", H1))
historia.append(Paragraph(
    "Explorar o sistema como QA e reportar tudo que divergir do escopo acima. Não existe "
    "checklist pronta: a avaliação considera sua capacidade de criar cenários, investigar e "
    "reproduzir problemas — e não apenas de executar passos prontos.", CORPO))

historia.append(Paragraph("Frentes sugeridas", H2))
historia.append(lista([
    "Testes positivos e negativos de autenticação",
    "Autorização: comparar o que cada perfil vê e o que consegue fazer",
    "Alteração manual da URL, atualização da página, botão voltar e múltiplas abas",
    "Testes de limite: 0 caractere, 1 caractere, tamanho máximo, acima do máximo, "
    "caracteres especiais, emojis, espaços e valores duplicados",
    "Pesquisa com variações de caixa e acentuação: <b>João</b>, <b>joão</b>, <b>JOÃO</b>, "
    "<b>Jo</b>, <b>123</b>, <b>@#$%</b>",
    "Datas: hoje, ontem, amanhã, mês anterior, próximo mês e datas inválidas",
    "Comparação entre o que a interface exibe e o que está gravado",
    "Responsividade em desktop, tablet e celular",
]))

historia.append(caixa([
    Paragraph("Uma dica de método", CELULA_CAB),
    Spacer(1, 4),
    Paragraph(
        "Boa parte do que diferencia um relatório forte não aparece no primeiro clique. "
        "Repita ações, atualize a página depois de salvar, abra o mesmo registro em duas "
        "abas e confira se o que a tela diz corresponde ao que ficou gravado.", CELULA),
], fundo=FUNDO_SUAVE, borda=ROXO))

# ---------------------------------------------------------------- report
historia.append(Paragraph("5. Formato do relatório", H1))
historia.append(Paragraph(
    "Não basta informar que algo está com problema. Cada defeito encontrado deve permitir "
    "que outra pessoa reproduza o cenário sem falar com você. Registre:", CORPO))

historia.append(tabela([
    ["Campo", "O que preencher"],
    ["ID", "Identificador sequencial (BUG-001, BUG-002...)"],
    ["Título", "Uma frase objetiva descrevendo o problema"],
    ["Data", "Data em que o defeito foi encontrado"],
    ["Ambiente", "Navegador, versão, sistema operacional e URL"],
    ["Severidade", "Crítica, Alta, Média ou Baixa (ver seção 6)"],
    ["Prioridade", "Sua sugestão de urgência para a correção"],
    ["Pré-condições", "O estado necessário antes de começar"],
    ["Passos", "Sequência numerada para reproduzir"],
    ["Resultado esperado", "O que deveria acontecer, segundo este documento"],
    ["Resultado atual", "O que de fato acontece"],
    ["Evidência", "Captura de tela, vídeo ou log"],
    ["Observações", "Hipótese de causa, frequência, casos relacionados"],
], [38 * mm, 107 * mm], destaque_primeira=True))

exemplo = [
    "<b>ID:</b> BUG-001",
    "<b>Título:</b> Usuário comum acessa tela administrativa pela URL",
    "<b>Data:</b> 14/09/2026",
    "<b>Ambiente:</b> Chrome 128 / Windows 11 / https://taskflow-lovat-two.vercel.app",
    "<b>Severidade:</b> Crítica &nbsp;&nbsp; <b>Prioridade:</b> Alta",
    "<b>Pré-condição:</b> Usuário autenticado com perfil USER.",
    "<b>Passos:</b> 1. Fazer login com um usuário USER. "
    "2. Digitar /users diretamente na barra de endereços. 3. Observar o resultado.",
    "<b>Resultado esperado:</b> Acesso negado ou redirecionamento para uma tela permitida.",
    "<b>Resultado atual:</b> A tela administrativa é exibida normalmente.",
    "<b>Evidência:</b> captura de tela anexa.",
]
historia.append(KeepTogether([
    Paragraph("Exemplo preenchido", H2),
    caixa([Paragraph(linha, CELULA) for linha in exemplo], fundo=FUNDO_SUAVE, borda=BORDA),
]))
historia.append(Spacer(1, 6))
historia.append(Paragraph(
    "O exemplo acima é apenas ilustrativo do formato — não indica um defeito real do sistema.",
    NOTA))

# ---------------------------------------------------------------- avaliacao
historia.append(Paragraph("6. Severidade e avaliação", H1))

historia.append(Paragraph("Como classificar a severidade", H2))
historia.append(tabela([
    ["Severidade", "Quando usar"],
    ["CRÍTICA", "Autenticação, autorização, perda de dados, exposição de dados ou "
                "indisponibilidade total"],
    ["ALTA", "Impede uma funcionalidade importante ou afeta grande parte dos usuários"],
    ["MÉDIA", "Afeta uma funcionalidade, mas existe alternativa"],
    ["BAIXA", "Interface, texto, alinhamento ou comportamento pouco relevante"],
], [28 * mm, 117 * mm], destaque_primeira=True))

historia.append(Paragraph("Distribuição da pontuação", H2))
pontuacao = [
    ["Área", "Pontos", "Área", "Pontos"],
    ["Login e autenticação", "10", "Paginação", "5"],
    ["Autorização", "15", "Datas", "5"],
    ["CRUD", "15", "Experiência de uso", "5"],
    ["Validações", "10", "Responsividade", "5"],
    ["Pesquisa e filtros", "10", "Segurança", "15"],
    ["", "", "Qualidade dos relatórios", "5"],
    ["", "", "Total", "100"],
]
t_pontos = tabela(pontuacao, [52 * mm, 16 * mm, 52 * mm, 16 * mm])
t_pontos.setStyle(TableStyle([
    ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
    ("FONTNAME", (2, 1), (2, -1), "Helvetica-Bold"),
    ("LINEAFTER", (1, 0), (1, -1), 0.8, BORDA),
    ("BACKGROUND", (2, -1), (3, -1), FUNDO_DESTAQUE),
]))
historia.append(t_pontos)

historia.append(Spacer(1, 10))
historia.append(caixa([
    Paragraph("O que estamos avaliando", CELULA_CAB),
    Spacer(1, 4),
    Paragraph(
        "Entender requisitos, criar cenários de teste, encontrar e priorizar problemas, "
        "investigar a causa provável, reproduzir de forma confiável, identificar questões de "
        "segurança e inconsistências entre a interface e os dados — e comunicar tudo isso "
        "com clareza.", CELULA),
    Spacer(1, 8),
    Paragraph("Bom teste.", CELULA_FORTE),
]))


doc = BaseDocTemplate(
    SAIDA,
    pagesize=A4,
    leftMargin=20 * mm,
    rightMargin=20 * mm,
    topMargin=20 * mm,
    bottomMargin=22 * mm,
    title="TaskFlow — Desafio Prático de QA",
    author="TaskFlow",
    subject="Guia do profissional avaliado",
)
quadro = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="corpo")
doc.addPageTemplates([PageTemplate(id="padrao", frames=[quadro], onPage=rodape)])
doc.build(historia)
print("PDF gerado em", SAIDA)
