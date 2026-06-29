from __future__ import annotations

import os
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf"
LOGO = ROOT / "assets" / "logo-territoires-vivants-france.png"

PDFS = [
    (
        ROOT / "documents" / "dossier-presentation-tvf.md",
        OUTPUT / "dossier-presentation-tvf.pdf",
        "Dossier institutionnel",
    ),
    (
        ROOT / "documents" / "dossier-collectivite-tvf.md",
        OUTPUT / "dossier-collectivite-tvf.pdf",
        "Dossier collectivité",
    ),
    (
        ROOT / "documents" / "dossier-entreprise-mecene-tvf.md",
        OUTPUT / "dossier-entreprise-mecene-tvf.pdf",
        "Dossier entreprise et mécène",
    ),
    (
        ROOT / "documents" / "dossier-proprietaire-tvf.md",
        OUTPUT / "dossier-proprietaire-tvf.pdf",
        "Dossier propriétaire",
    ),
]


def clean_inline(text: str) -> str:
    text = text.strip()
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    return text


def build_styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "TVFTitle",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=28,
            textColor=colors.HexColor("#0e2d45"),
            alignment=TA_CENTER,
            spaceAfter=10,
        ),
        "subtitle": ParagraphStyle(
            "TVFSubtitle",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#2a6c30"),
            alignment=TA_CENTER,
            spaceAfter=14,
        ),
        "h2": ParagraphStyle(
            "TVFH2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=19,
            textColor=colors.HexColor("#183f22"),
            spaceBefore=10,
            spaceAfter=7,
            keepWithNext=True,
        ),
        "h3": ParagraphStyle(
            "TVFH3",
            parent=base["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=15,
            textColor=colors.HexColor("#0e2d45"),
            spaceBefore=8,
            spaceAfter=5,
            keepWithNext=True,
        ),
        "body": ParagraphStyle(
            "TVFBody",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9.4,
            leading=13.5,
            textColor=colors.HexColor("#14212b"),
            alignment=TA_LEFT,
            spaceAfter=6,
        ),
        "bullet": ParagraphStyle(
            "TVFBullet",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9.2,
            leading=13,
            leftIndent=12,
            firstLineIndent=-8,
            textColor=colors.HexColor("#14212b"),
            spaceAfter=4,
        ),
        "small": ParagraphStyle(
            "TVFSmall",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=7.7,
            leading=10,
            textColor=colors.HexColor("#5a6872"),
        ),
        "cell": ParagraphStyle(
            "TVFCell",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=7.7,
            leading=9.4,
            textColor=colors.HexColor("#14212b"),
        ),
        "cell_header": ParagraphStyle(
            "TVFCellHeader",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=7.7,
            leading=9.4,
            textColor=colors.white,
        ),
    }


def flush_paragraph(buffer: list[str], story: list, styles: dict) -> None:
    if not buffer:
        return
    text = " ".join(line.strip() for line in buffer if line.strip())
    if text:
        story.append(Paragraph(clean_inline(text), styles["body"]))
    buffer.clear()


def make_table(rows: list[list[str]], styles: dict):
    if not rows:
        return None
    col_count = max(len(row) for row in rows)
    normalized = [row + [""] * (col_count - len(row)) for row in rows]
    table_rows = []
    for r, row in enumerate(normalized):
        style = styles["cell_header"] if r == 0 else styles["cell"]
        table_rows.append([Paragraph(clean_inline(cell), style) for cell in row])
    table = Table(table_rows, repeatRows=1, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0e2d45")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#dfe6df")),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def parse_markdown(path: Path, subtitle: str, styles: dict) -> list:
    lines = path.read_text(encoding="utf-8").splitlines()
    story: list = []
    paragraph: list[str] = []
    table_rows: list[list[str]] = []
    first_title = True

    if LOGO.exists():
        logo = Image(str(LOGO), width=72 * mm, height=48 * mm)
        logo.hAlign = "CENTER"
        story.append(logo)
        story.append(Spacer(1, 4))

    story.append(Paragraph(subtitle, styles["subtitle"]))

    def flush_table():
        nonlocal table_rows
        if table_rows:
            table = make_table(table_rows, styles)
            if table:
                story.append(table)
                story.append(Spacer(1, 8))
            table_rows = []

    for raw in lines:
        line = raw.rstrip()
        stripped = line.strip()

        if stripped.startswith("|") and stripped.endswith("|"):
            flush_paragraph(paragraph, story, styles)
            cells = [cell.strip() for cell in stripped.strip("|").split("|")]
            if all(set(cell) <= {"-", ":", " "} for cell in cells):
                continue
            table_rows.append(cells)
            continue

        flush_table()

        if not stripped:
            flush_paragraph(paragraph, story, styles)
            story.append(Spacer(1, 2))
            continue

        if stripped == "---":
            flush_paragraph(paragraph, story, styles)
            story.append(Spacer(1, 8))
            continue

        if stripped.startswith("# "):
            flush_paragraph(paragraph, story, styles)
            text = stripped[2:].strip()
            story.append(Paragraph(clean_inline(text), styles["title"]))
            first_title = False
            continue

        if stripped.startswith("## "):
            flush_paragraph(paragraph, story, styles)
            story.append(Paragraph(clean_inline(stripped[3:]), styles["h2"]))
            continue

        if stripped.startswith("### "):
            flush_paragraph(paragraph, story, styles)
            story.append(Paragraph(clean_inline(stripped[4:]), styles["h3"]))
            continue

        if stripped.startswith("- [ ]"):
            flush_paragraph(paragraph, story, styles)
            story.append(Paragraph("□ " + clean_inline(stripped[5:].strip()), styles["bullet"]))
            continue

        if stripped.startswith("- "):
            flush_paragraph(paragraph, story, styles)
            story.append(Paragraph("• " + clean_inline(stripped[2:]), styles["bullet"]))
            continue

        paragraph.append(stripped)

    flush_paragraph(paragraph, story, styles)
    flush_table()
    return story


def footer(canvas, doc):
    canvas.saveState()
    width, _height = A4
    canvas.setStrokeColor(colors.HexColor("#dfe6df"))
    canvas.line(18 * mm, 15 * mm, width - 18 * mm, 15 * mm)
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(colors.HexColor("#5a6872"))
    canvas.drawString(18 * mm, 9 * mm, "Territoires Vivants France - Document de travail institutionnel")
    canvas.drawRightString(width - 18 * mm, 9 * mm, f"Page {doc.page}")
    canvas.restoreState()


def build_pdf(source: Path, target: Path, subtitle: str) -> None:
    styles = build_styles()
    story = parse_markdown(source, subtitle, styles)
    doc = SimpleDocTemplate(
        str(target),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=20 * mm,
        title=source.stem,
        author="Territoires Vivants France",
    )
    doc.build(story, onFirstPage=footer, onLaterPages=footer)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for source, target, subtitle in PDFS:
        build_pdf(source, target, subtitle)
        print(f"Generated {target.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
