from pathlib import Path
from runpy import run_path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
DATA = run_path(str(ROOT / "scripts" / "build-brochures-poles-tvf.py"))
POLES = DATA["POLES"]
OUT_DIR = ROOT / "output" / "documents" / "brochures-poles"
OUT_DIR.mkdir(parents=True, exist_ok=True)
LOGO = ROOT / "assets" / "logo-territoires-vivants-france-web.png"
PHOTO_DIR = ROOT / "assets" / "photos"

GREEN = colors.HexColor("#183f22")
GREEN2 = colors.HexColor("#2E7D32")
BLUE = colors.HexColor("#071e30")
MUTED = colors.HexColor("#59645e")
LIGHT_GREEN = colors.HexColor("#EAF3EA")
LIGHT_BLUE = colors.HexColor("#EEF4F7")
GOLD = colors.HexColor("#B28418")
BORDER = colors.HexColor("#B8C8BC")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle("Kicker", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8.5, leading=10, textColor=GOLD, spaceAfter=4, alignment=TA_LEFT))
styles.add(ParagraphStyle("TitleTVF", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=28, leading=32, textColor=BLUE, spaceAfter=8, alignment=TA_LEFT))
styles.add(ParagraphStyle("SubtitleTVF", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=12.5, leading=16, textColor=GREEN, spaceAfter=10))
styles.add(ParagraphStyle("H1TVF", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=16, leading=20, textColor=GREEN, spaceBefore=12, spaceAfter=7))
styles.add(ParagraphStyle("H2TVF", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=12.3, leading=15, textColor=BLUE, spaceBefore=8, spaceAfter=5))
styles.add(ParagraphStyle("BodyTVF", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.7, leading=13, textColor=BLUE, spaceAfter=6))
styles.add(ParagraphStyle("SmallTVF", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.2, leading=10, textColor=MUTED, spaceAfter=4))
styles.add(ParagraphStyle("TableHead", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8, leading=10, textColor=GREEN))
styles.add(ParagraphStyle("TableCell", parent=styles["Normal"], fontName="Helvetica", fontSize=7.7, leading=9.4, textColor=BLUE))
styles.add(ParagraphStyle("TableLead", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=7.8, leading=9.5, textColor=BLUE))
styles.add(ParagraphStyle("CalloutTitle", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=10.2, leading=12, textColor=GREEN, spaceAfter=3))
styles.add(ParagraphStyle("CalloutBody", parent=styles["Normal"], fontName="Helvetica", fontSize=8.7, leading=11, textColor=BLUE))
styles.add(ParagraphStyle("CenterSmall", parent=styles["SmallTVF"], alignment=TA_CENTER))


def p(text, style="BodyTVF"):
    return Paragraph(str(text).replace("&", "&amp;"), styles[style])


def bullet(text):
    return Paragraph("• " + str(text).replace("&", "&amp;"), styles["BodyTVF"])


def header_footer(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.4)
    canvas.line(1.5*cm, h - 1.25*cm, w - 1.5*cm, h - 1.25*cm)
    if LOGO.exists():
        canvas.drawImage(str(LOGO), 1.5*cm, h - 1.08*cm, width=3.8*cm, height=1.18*cm, preserveAspectRatio=True, mask='auto')
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(w - 1.5*cm, h - 0.68*cm, "Territoires Vivants France - Brochure pôle")
    canvas.line(1.5*cm, 1.25*cm, w - 1.5*cm, 1.25*cm)
    canvas.drawString(1.5*cm, 0.82*cm, "contact@territoiresvivantsfrance.fr - 04 65 81 54 69 - territoiresvivantsfrance.fr")
    canvas.drawRightString(w - 1.5*cm, 0.82*cm, f"Page {doc.page}")
    canvas.restoreState()


def callout(title, body, fill=LIGHT_GREEN):
    t = Table([[p(title, "CalloutTitle")], [p(body, "CalloutBody")]], colWidths=[17.1*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), fill),
        ("BOX", (0,0), (-1,-1), 0.7, BORDER),
        ("LEFTPADDING", (0,0), (-1,-1), 10),
        ("RIGHTPADDING", (0,0), (-1,-1), 10),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
    ]))
    return t


def data_table(headers, rows, widths, fill=LIGHT_GREEN):
    data = [[p(h, "TableHead") for h in headers]]
    for row in rows:
        data.append([p(row[0], "TableLead")] + [p(cell, "TableCell") for cell in row[1:]])
    t = Table(data, colWidths=[w*cm for w in widths], repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), fill),
        ("GRID", (0,0), (-1,-1), 0.45, BORDER),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING", (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ]))
    return t


def cover_story(pole):
    story = []
    if LOGO.exists():
        story.append(Image(str(LOGO), width=6.0*cm, height=1.85*cm, kind="proportional"))
        story.append(Spacer(1, 0.25*cm))
    story.append(p("BROCHURE PÔLE TVF", "Kicker"))
    story.append(p(pole["name"], "TitleTVF"))
    story.append(p(pole["subtitle"], "SubtitleTVF"))
    story.append(data_table(["Document", "Information"], [["Type", "Brochure de présentation du pôle"], ["Public", pole["public"]], ["Version", "Juillet 2026"]], [4.6, 12.2], LIGHT_BLUE))
    story.append(Spacer(1, 0.35*cm))
    photo = PHOTO_DIR / pole["photo"]
    if photo.exists():
        story.append(Image(str(photo), width=15.8*cm, height=6.7*cm, kind="proportional"))
        story.append(p(pole["caption"], "CenterSmall"))
    story.append(callout("Positionnement", "Cette brochure présente le rôle du pôle, les situations concernées, les documents à préparer et les cadres de coopération possibles. Elle ne vaut pas acceptation automatique d'une demande, partenariat officiel ou engagement de réalisation."))
    return story


def section(story, kicker, title, lead):
    story.append(p(kicker.upper(), "Kicker"))
    story.append(p(title, "H1TVF"))
    story.append(p(lead, "BodyTVF"))


def build_pdf(pole):
    path = OUT_DIR / f"brochure-pole-{pole['slug']}-tvf.pdf"
    doc = SimpleDocTemplate(str(path), pagesize=A4, rightMargin=1.85*cm, leftMargin=1.85*cm, topMargin=1.7*cm, bottomMargin=1.55*cm)
    story = cover_story(pole)
    story.append(PageBreak())
    section(story, "Comprendre", "Pourquoi ce pôle existe", pole["why"][0])
    for paragraph in pole["why"][1:]:
        story.append(p(paragraph))
    story.append(callout("Repère public", pole["repere"], LIGHT_BLUE))
    story.append(Spacer(1, 0.18*cm))
    section(story, "Action", "Ce que TVF peut faire", "Le pôle transforme une situation vague en dossier instruit : informations collectées, besoin clarifié, pièces demandées, partenaires identifiés, décision préparée.")
    story.append(data_table(["Mission", "Rôle opérationnel"], pole["missions"], [4.2, 12.6], LIGHT_GREEN))
    section(story, "Parcours", "Déroulé type d'un dossier", "Le traitement d'une demande suit une logique progressive. Chaque étape peut aboutir à une poursuite, une demande de pièces, une orientation vers un acteur compétent ou un classement sans suite.")
    steps = [("1. Réception", "Formulaire, e-mail, appel, signalement mobile ou contact direct."),("2. Qualification", "Vérification du profil, du lieu, du besoin, des pièces et du niveau d'urgence."),("3. Instruction", "Analyse de faisabilité, risques, partenaires, documents et modalités possibles."),("4. Décision", "Poursuite, rendez-vous, visite, convention, orientation ou classement."),("5. Suivi", "Historique, pièces, relances, preuves, impacts et clôture du dossier.")]
    story.append(data_table(["Étape", "Objectif"], steps, [4.2, 12.6], LIGHT_BLUE))
    section(story, "Pièces", "Documents à préparer", "Ces pièces permettent à TVF de comprendre la demande sans créer d'engagement immédiat.")
    for item in pole["documents"]:
        story.append(bullet(item))
    story.append(p("TVF peut demander des pièces complémentaires selon le profil, la nature du bien, l'état apparent, le statut juridique, les contraintes de sécurité et le niveau d'avancement du dossier.", "SmallTVF"))
    section(story, "Cadre", "Conventions et modalités possibles", "Les conventions servent à préciser les rôles, durées, responsabilités, limites, assurances, conditions de communication, suivi et modalités de fin d'action.")
    story.append(data_table(["Document", "Utilité"], pole["conventions"], [5.1, 11.7], LIGHT_GREEN))
    section(story, "Bénéfices", "Ce que le pôle apporte aux acteurs", "L'utilité du pôle dépend de sa capacité à rendre les demandes lisibles, traçables et orientées vers une suite réaliste.")
    story.append(data_table(["Bénéfice", "Lecture concrète"], [(b, "Apport direct pour le porteur de demande, le territoire ou les partenaires mobilisés.") for b in pole["benefits"]], [5.1, 11.7], LIGHT_BLUE))
    section(story, "Limites", "Points à verrouiller avant toute action", "TVF doit rester clair sur ce qu'elle peut faire et sur ce qui relève d'acteurs techniques, juridiques, financiers ou publics compétents.")
    for item in pole["limits"]:
        story.append(bullet(item))
    story.append(callout("Contact", pole["cta"], LIGHT_GREEN))
    story.append(p("Sources et références à mobiliser", "H1TVF"))
    for source in ["INSEE : données publiques locales, population, logements, emploi, équipements.", "Ministère de la Transition écologique : filière PMCB, économie circulaire, sobriété foncière.", "Cerema : Cartofriches et ressources méthodologiques territoriales.", "Collectivités locales : documents d'urbanisme, diagnostics, programmes et données de terrain lorsque disponibles."]:
        story.append(bullet(source))
    story.append(p("Les sources servent de cadrage. Les chiffres, partenaires et résultats TVF ne doivent être publiés que lorsqu'ils sont vérifiés, documentés et validés.", "SmallTVF"))
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    return path

for pole in POLES:
    out = build_pdf(pole)
    print(out.relative_to(ROOT))
