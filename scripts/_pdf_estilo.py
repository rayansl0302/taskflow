# -*- coding: utf-8 -*-
"""Estilo compartilhado pelos PDFs entregues ao profissional de QA.

Mantém a identidade visual em um lugar só: paleta, estilos de parágrafo,
listas, tabelas, caixas de destaque e o rodapé das páginas.
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
    ListFlowable,
    ListItem,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ROXO = colors.HexColor("#4f46e5")
ROXO_ESCURO = colors.HexColor("#4338ca")
TINTA = colors.HexColor("#0f172a")
CINZA = colors.HexColor("#64748b")
BORDA = colors.HexColor("#e2e8f0")
FUNDO_SUAVE = colors.HexColor("#f8fafc")
FUNDO_DESTAQUE = colors.HexColor("#eef2ff")

_estilos = getSampleStyleSheet()


def estilo(nome, **kwargs):
    kwargs.setdefault("parent", _estilos["Normal"])
    return ParagraphStyle(nome, **kwargs)


TITULO = estilo("Titulo", fontName="Helvetica-Bold", fontSize=26, leading=30,
                textColor=TINTA, spaceAfter=6)
SUBTITULO = estilo("Subtitulo", fontName="Helvetica", fontSize=12.5, leading=17,
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


def lista(itens, estilo_item=ITEM, numerada=False):
    comum = dict(bulletColor=ROXO, leftIndent=14, spaceAfter=8)
    if numerada:
        comum.update(bulletType="1", bulletFormat="%s.", bulletFontSize=9, leftIndent=18)
    else:
        comum.update(bulletType="bullet", bulletFontSize=9, bulletOffsetY=-1.5)
    return ListFlowable(
        [ListItem(Paragraph(t, estilo_item), leftIndent=12) for t in itens],
        **comum,
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


def construir(saida, historia, titulo, assunto, rodape_texto):
    """Monta o documento com margens, rodapé e numeração de páginas."""

    def rodape(canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(CINZA)
        canvas.drawString(20 * mm, 12 * mm, rodape_texto)
        canvas.drawRightString(190 * mm, 12 * mm, "Página %d" % doc.page)
        canvas.setStrokeColor(BORDA)
        canvas.setLineWidth(0.5)
        canvas.line(20 * mm, 16 * mm, 190 * mm, 16 * mm)
        canvas.restoreState()

    doc = BaseDocTemplate(
        saida,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=22 * mm,
        title=titulo,
        author="TaskFlow",
        subject=assunto,
    )
    quadro = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="corpo")
    doc.addPageTemplates([PageTemplate(id="padrao", frames=[quadro], onPage=rodape)])
    doc.build(historia)
    print("PDF gerado em", saida)
