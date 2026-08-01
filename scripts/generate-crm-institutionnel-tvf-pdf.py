from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A3, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.enums import TA_LEFT, TA_CENTER

ROOT = Path(r'C:\Users\jowst\Documents\TERRITOIRES VIVANTS FRANCE')
OUT = ROOT / 'documents' / 'crm-institutionnel-tvf'
PDF = OUT / 'registre-crm-institutionnel-tvf-papier.pdf'
XLSX_SCRIPT = ROOT / 'scripts' / 'generate-crm-institutionnel-tvf.py'

# Reuse compact data by importing constants through execution namespace
ns = {}
code = XLSX_SCRIPT.read_text(encoding='utf-8-sig')
# Stop before workbook generation side effects when possible by executing then ignoring generated xlsx
exec(code, ns)

groups = [
    ('MINISTÈRES', ns['ministeres']),
    ('AGENCES NATIONALES', ns['agences']),
    ('PROGRAMMES NATIONAUX', ns['programmes']),
    ('ÉTABLISSEMENTS FONCIERS', ns['epf']),
    ('ACTEURS UTILES', ns['acteurs']),
]

page = landscape(A3)
doc = SimpleDocTemplate(str(PDF), pagesize=page, leftMargin=10*mm, rightMargin=10*mm, topMargin=10*mm, bottomMargin=10*mm)
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TVFTitle', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=22, leading=26, textColor=colors.HexColor('#18392F'), alignment=TA_LEFT, spaceAfter=8))
styles.add(ParagraphStyle(name='TVFSub', parent=styles['Normal'], fontName='Helvetica', fontSize=10, leading=13, textColor=colors.HexColor('#667085'), spaceAfter=6))
styles.add(ParagraphStyle(name='TVFH', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=14, leading=16, textColor=colors.HexColor('#18392F'), spaceBefore=6, spaceAfter=6))
styles.add(ParagraphStyle(name='Cell', parent=styles['Normal'], fontName='Helvetica', fontSize=6.7, leading=8, textColor=colors.HexColor('#1F2937')))
styles.add(ParagraphStyle(name='HeadCell', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=6.5, leading=7, textColor=colors.white, alignment=TA_CENTER))
styles.add(ParagraphStyle(name='Small', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=10, textColor=colors.HexColor('#1F2937')))

story = []
story.append(Paragraph('Registre CRM institutionnel TVF - version papier', styles['TVFTitle']))
story.append(Paragraph('Territoires Vivants France - Agence Territoriale de Revitalisation Immobilière', styles['TVFSub']))
story.append(Paragraph('Document imprimable en paysage pour suivre les prises de contact avec ministères, agences nationales, programmes, établissements fonciers, financeurs et acteurs utiles. Les cases vides sont prévues pour les dates, relances, réponses et notes manuscrites.', styles['Small']))
story.append(Spacer(1, 8))

mode_rows = [
    ['Priorité de départ', 'Contacter d’abord les lignes Haute : logement, aménagement du territoire, transition écologique, commerce, ANCT, Anah, ADEME, Banque des Territoires, EPORA.'],
    ['Règle de prudence', 'Ne pas présenter un partenariat comme acquis sans accord écrit. Ne pas promettre d’aide, de financement ou d’acceptation automatique.'],
    ['Utilisation papier', 'Compléter à la main : date de contact, canal utilisé, personne contactée, réponse, date de relance, prochaine action.'],
]
t = Table([[Paragraph(a, styles['HeadCell']), Paragraph(b, styles['Small'])] for a,b in mode_rows], colWidths=[45*mm, 330*mm])
t.setStyle(TableStyle([('BACKGROUND',(0,0),(0,-1),colors.HexColor('#18392F')),('GRID',(0,0),(-1,-1),0.4,colors.HexColor('#D9E0DC')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
story.append(t)
story.append(PageBreak())

selected_cols = [0,2,3,4,5,6,12,13,15,16,17,18,19]
header_labels = ['Priorité','Organisme / programme','Responsable à viser','Nom','Lien TVF','Angle contact','Date contact','Canal','Réponse','Relance','Statut','Prochaine action','Notes']
widths = [17*mm,44*mm,35*mm,26*mm,55*mm,60*mm,22*mm,20*mm,25*mm,22*mm,24*mm,42*mm,48*mm]

def make_table(title, rows):
    story.append(Paragraph(title, styles['TVFH']))
    data = [[Paragraph(h, styles['HeadCell']) for h in header_labels]]
    for row in rows:
        data.append([Paragraph(str(row[i] or ''), styles['Cell']) for i in selected_cols])
    table = Table(data, colWidths=widths, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),colors.HexColor('#18392F')),
        ('GRID',(0,0),(-1,-1),0.35,colors.HexColor('#D9E0DC')),
        ('VALIGN',(0,0),(-1,-1),'TOP'),
        ('LEFTPADDING',(0,0),(-1,-1),3),('RIGHTPADDING',(0,0),(-1,-1),3),
        ('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white, colors.HexColor('#F6F8F6')]),
    ]))
    story.append(table)
    story.append(PageBreak())

for title, rows in groups:
    make_table(title, rows)

story.append(Paragraph('SUIVI VIERGE - contacts à ajouter', styles['TVFH']))
blank = [['' for _ in header_labels] for _ in range(18)]
blank.insert(0, [Paragraph(h, styles['HeadCell']) for h in header_labels])
table = Table(blank, colWidths=widths, repeatRows=1)
table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#18392F')),('GRID',(0,0),(-1,-1),0.35,colors.HexColor('#D9E0DC')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white, colors.HexColor('#F6F8F6')]),('TOPPADDING',(0,1),(-1,-1),10),('BOTTOMPADDING',(0,1),(-1,-1),10)]))
story.append(table)

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 7)
    canvas.setFillColor(colors.HexColor('#667085'))
    canvas.drawString(10*mm, 6*mm, 'Territoires Vivants France - Registre CRM institutionnel papier')
    canvas.drawRightString(page[0]-10*mm, 6*mm, f'Page {doc.page}')
    canvas.restoreState()

doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(PDF)

