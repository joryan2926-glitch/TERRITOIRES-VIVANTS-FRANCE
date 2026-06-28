import csv
import html
import json
import math
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "marketing" / "social-visuals" / "campaigns.json"
OUT_ROOT = ROOT / "marketing" / "social-visuals"

NAVY = "#08243D"
DEEP_GREEN = "#1F5F2A"
GREEN = "#2E7D32"
LIGHT_GREEN = "#E8F3E8"
PAPER = "#FFFDF8"
GOLD = "#EF9D10"
TEAL = "#16717C"
WHITE = "#FFFFFF"

FORMAT_CONFIGS = [
    {
        "key": "instagram-post",
        "folder": "instagram/post",
        "size": (1080, 1080),
        "layout": "square",
        "label": "Instagram publication",
    },
    {
        "key": "instagram-story",
        "folder": "instagram/story",
        "size": (1080, 1920),
        "layout": "story",
        "label": "Instagram story",
    },
    {
        "key": "instagram-reel-cover",
        "folder": "instagram/reel-cover",
        "size": (1080, 1920),
        "layout": "story",
        "label": "Instagram reel cover",
    },
    {
        "key": "facebook-feed",
        "folder": "facebook/feed",
        "size": (1200, 630),
        "layout": "wide",
        "label": "Facebook feed",
    },
    {
        "key": "linkedin-feed",
        "folder": "linkedin/feed",
        "size": (1200, 627),
        "layout": "wide",
        "label": "LinkedIn feed",
    },
    {
        "key": "x-post",
        "folder": "x/post",
        "size": (1600, 900),
        "layout": "wide",
        "label": "X publication",
    },
    {
        "key": "tiktok-cover",
        "folder": "tiktok/cover",
        "size": (1080, 1920),
        "layout": "story",
        "label": "TikTok cover",
    },
    {
        "key": "meta-ads-square",
        "folder": "meta-ads/square",
        "size": (1080, 1080),
        "layout": "square",
        "label": "Meta Ads square",
    },
    {
        "key": "meta-ads-story",
        "folder": "meta-ads/story",
        "size": (1080, 1920),
        "layout": "story",
        "label": "Meta Ads story",
    },
]

STYLE_SEQUENCE = [
    "institutionnel",
    "urbain",
    "appel-a-action",
    "proprietaires",
    "ecologique",
    "collectivites",
    "entreprises",
    "emotionnel",
    "premium",
    "commerce",
    "avant-apres",
    "ecologique",
    "humain",
    "chiffres-cles",
    "methode",
    "finance",
    "cadre",
    "reseau",
    "vision",
    "mobilisation",
]

META = {
    "01-lancement-tvf": {
        "audience": "citoyens, collectivites, proprietaires, entreprises",
        "objective": "faire connaitre TVF",
        "style": "institutionnel",
        "icon": "spark",
        "problem": "Des lieux, materiaux et espaces utiles restent disperses ou inemployes.",
        "solution": "TVF structure une plateforme nationale de coordination et de passage a l'action.",
        "hashtags": ["#Revitalisation", "#Territoires", "#Association"],
    },
    "02-saint-etienne-pilote": {
        "audience": "collectivites, financeurs, acteurs locaux",
        "objective": "positionner Saint-Etienne comme territoire pilote",
        "style": "urbain",
        "icon": "map",
        "problem": "Un territoire pilote est necessaire pour tester la methode sur le terrain.",
        "solution": "Saint-Etienne permet de documenter les besoins, les ressources et les premiers parcours.",
        "hashtags": ["#SaintEtienne", "#TerritoirePilote", "#InnovationTerritoriale"],
    },
    "03-signaler-lieu-vacant": {
        "audience": "habitants, citoyens, associations locales",
        "objective": "encourager le signalement citoyen",
        "style": "appel-a-action",
        "icon": "pin",
        "problem": "Les biens vacants sont souvent connus localement mais rarement qualifies.",
        "solution": "Le signalement citoyen aide a reperer, documenter et orienter les lieux a etudier.",
        "hashtags": ["#Signalement", "#PatrimoineVacant", "#Citoyens"],
    },
    "04-proposer-un-bien": {
        "audience": "proprietaires, bailleurs, familles",
        "objective": "convaincre les proprietaires de prendre contact",
        "style": "proprietaires",
        "icon": "key",
        "problem": "Un bien vacant peut se degrader lorsqu'aucun usage ou financement n'est identifie.",
        "solution": "TVF prepare un cadre d'etude, de convention et de remise en usage adaptee.",
        "hashtags": ["#Proprietaires", "#BienVacant", "#UsagePartage"],
    },
    "05-banque-materiaux": {
        "audience": "entreprises, collectivites, particuliers, artisans",
        "objective": "expliquer le role de la banque de materiaux",
        "style": "ecologique",
        "icon": "recycle",
        "problem": "Des materiaux encore utiles sont stockes, jetes ou mal orientes.",
        "solution": "TVF les qualifie, trace et affecte a des projets territoriaux valides.",
        "hashtags": ["#Reemploi", "#EconomieCirculaire", "#Materiaux"],
    },
    "06-collectivites": {
        "audience": "communes, EPCI, departements, regions",
        "objective": "attirer les collectivites",
        "style": "collectivites",
        "icon": "city",
        "problem": "Les collectivites doivent coordonner de nombreux acteurs et dispositifs.",
        "solution": "TVF apporte une methode, des outils, des dossiers et un suivi d'impact.",
        "hashtags": ["#Collectivites", "#EPCI", "#ActionPublique"],
    },
    "07-entreprises-engagees": {
        "audience": "entreprises, artisans, promoteurs, industriels",
        "objective": "developper les contributions d'entreprises",
        "style": "entreprises",
        "icon": "handshake",
        "problem": "Les entreprises cherchent des actions RSE concretes et utiles localement.",
        "solution": "TVF permet de contribuer par des materiaux, competences, locaux ou financements.",
        "hashtags": ["#RSE", "#EntreprisesEngagees", "#Mecenat"],
    },
    "08-devenir-benevole": {
        "audience": "citoyens, etudiants, actifs, retraites",
        "objective": "recruter des benevoles",
        "style": "emotionnel",
        "icon": "group",
        "problem": "Beaucoup veulent agir localement mais ne savent pas comment etre utiles.",
        "solution": "TVF propose des missions encadrees : reperage, documentation, chantier, animation.",
        "hashtags": ["#Benevolat", "#EngagementCitoyen", "#AgirLocal"],
    },
    "09-habitat-vivant": {
        "audience": "proprietaires, collectivites, habitants",
        "objective": "presenter le pole Habitat Vivant",
        "style": "premium",
        "icon": "home",
        "problem": "La vacance et la degradation du logement fragilisent les centres et les habitants.",
        "solution": "Habitat Vivant etudie les biens, les usages possibles et les conventions adaptees.",
        "hashtags": ["#Habitat", "#LogementsVacants", "#Renovation"],
    },
    "10-commerce-vivant": {
        "audience": "commercants, collectivites, porteurs de projet",
        "objective": "reactiver les commerces vacants",
        "style": "commerce",
        "icon": "shop",
        "problem": "Les vitrines fermees affaiblissent l'attractivite des rues et des centralites.",
        "solution": "Commerce Vivant aide a qualifier les locaux et a imaginer des usages utiles.",
        "hashtags": ["#CommerceLocal", "#CentresVilles", "#Artisans"],
    },
    "11-friches-vivantes": {
        "audience": "collectivites, urbanistes, associations, citoyens",
        "objective": "montrer le potentiel des friches",
        "style": "avant-apres",
        "icon": "factory",
        "problem": "Les friches immobilisent du foncier et peuvent degrader l'image d'un quartier.",
        "solution": "TVF aide a passer du diagnostic au scenario d'usage progressif.",
        "hashtags": ["#Friches", "#Urbanisme", "#ZAN"],
    },
    "12-jardins-partages": {
        "audience": "habitants, associations, collectivites",
        "objective": "valoriser les espaces verts urbains",
        "style": "ecologique",
        "icon": "leaf",
        "problem": "Des terrains inoccupes peuvent rester sans usage alors que les besoins sociaux augmentent.",
        "solution": "Ils peuvent devenir jardins, vergers, lieux pedagogiques ou espaces de rencontre.",
        "hashtags": ["#JardinsPartages", "#Biodiversite", "#CadreDeVie"],
    },
    "13-solidarite-insertion": {
        "audience": "associations, structures d'insertion, benevoles",
        "objective": "lier projets territoriaux et parcours humains",
        "style": "humain",
        "icon": "hands",
        "problem": "Les projets locaux peuvent manquer de bras, de transmission et de parcours encadres.",
        "solution": "TVF relie chantiers, formation, benevolat et accompagnement vers l'emploi.",
        "hashtags": ["#Insertion", "#ESS", "#Solidarite"],
    },
    "14-observatoire": {
        "audience": "collectivites, experts, financeurs",
        "objective": "installer l'observatoire comme outil credible",
        "style": "chiffres-cles",
        "icon": "chart",
        "problem": "Sans donnees fiables, les decisions restent lentes et fragiles.",
        "solution": "L'observatoire TVF prepare des cartes, signalements, indicateurs et sources verifiees.",
        "hashtags": ["#Observatoire", "#DataTerritoriale", "#Cartographie"],
    },
    "15-methode-tvf": {
        "audience": "tous publics professionnels",
        "objective": "clarifier la methode TVF",
        "style": "methode",
        "icon": "route",
        "problem": "Un projet territorial echoue souvent lorsqu'il saute l'etape de qualification.",
        "solution": "TVF suit un parcours : reperer, qualifier, conventionner, financer, agir, mesurer.",
        "hashtags": ["#Methode", "#ProjetTerritorial", "#Impact"],
    },
    "16-financer-projets": {
        "audience": "mecenes, fondations, investisseurs solidaires",
        "objective": "attirer les financements a impact",
        "style": "finance",
        "icon": "euro",
        "problem": "Des projets utiles restent bloques faute de budget et de cadre de suivi.",
        "solution": "TVF prepare des projets qualifies, budgets, conventions et indicateurs de reporting.",
        "hashtags": ["#Mecenat", "#InvestissementSolidaire", "#Impact"],
    },
    "17-documents-conventions": {
        "audience": "administrations, collectivites, partenaires",
        "objective": "rassurer sur le cadre operationnel",
        "style": "cadre",
        "icon": "document",
        "problem": "Un projet sans dossier clair inspire peu confiance.",
        "solution": "TVF structure fiches projet, conventions, pieces a fournir et suivi tracable.",
        "hashtags": ["#Convention", "#Gouvernance", "#Transparence"],
    },
    "18-antennes-locales": {
        "audience": "referents locaux, collectivites, benevoles",
        "objective": "preparer le reseau national",
        "style": "reseau",
        "icon": "network",
        "problem": "Le deploiement local doit eviter l'improvisation.",
        "solution": "TVF prevoit des antennes avec cadre commun, formation et methodes partagees.",
        "hashtags": ["#AntennesLocales", "#ReseauNational", "#Territoires"],
    },
    "19-vision-2035": {
        "audience": "institutionnels, financeurs, citoyens",
        "objective": "presenter la vision de long terme",
        "style": "vision",
        "icon": "globe",
        "problem": "La vacance, les friches et le gaspillage des ressources appellent une reponse durable.",
        "solution": "TVF porte une vision nationale de reutilisation, cooperation et impact territorial.",
        "hashtags": ["#Vision2035", "#FranceDesTerritoires", "#Transition"],
    },
    "20-appel-general": {
        "audience": "tous publics",
        "objective": "generer une prise de contact",
        "style": "mobilisation",
        "icon": "arrow",
        "problem": "Chaque territoire dispose de ressources dormantes qui peuvent redevenir utiles.",
        "solution": "TVF invite chacun a contribuer selon son role : bien, materiaux, temps, expertise ou soutien.",
        "hashtags": ["#RejoindreTVF", "#Mobilisation", "#TerritoiresVivants"],
    },
}

ACCENT_REPLACEMENTS = [
    ("Saint-Etienne", "Saint-Étienne"),
    ("collectivites", "collectivités"),
    ("Collectivites", "Collectivités"),
    ("proprietaires", "propriétaires"),
    ("Proprietaires", "Propriétaires"),
    ("materiaux", "matériaux"),
    ("Materiaux", "Matériaux"),
    ("benevoles", "bénévoles"),
    ("Benevoles", "Bénévoles"),
    ("mecenes", "mécènes"),
    ("Mecenes", "Mécènes"),
    ("donnees", "données"),
    ("Donnees", "Données"),
    ("methode", "méthode"),
    ("Methode", "Méthode"),
    ("reseau", "réseau"),
    ("Reseau", "Réseau"),
    ("referents", "référents"),
    ("reemploi", "réemploi"),
    ("Reemploi", "Réemploi"),
    ("dechets", "déchets"),
    ("Dechets", "Déchets"),
    ("economie", "économie"),
    ("Economie", "Économie"),
    ("operationnel", "opérationnel"),
    ("operationnelle", "opérationnelle"),
    ("inutilisees", "inutilisées"),
    ("utilisees", "utilisées"),
    ("utilises", "utilisés"),
    ("reutilisation", "réutilisation"),
    ("degradees", "dégradées"),
    ("degrades", "dégradés"),
    ("degrade", "dégradé"),
    ("stockes", "stockés"),
    ("jetes", "jetés"),
    ("orientes", "orientés"),
    ("traces", "tracés"),
    ("valides", "validés"),
    ("bloques", "bloqués"),
    ("echoue", "échoue"),
    ("etape", "étape"),
    ("reperage", "repérage"),
    ("reperer", "repérer"),
    ("prevoit", "prévoit"),
    ("prepare", "prépare"),
    ("preparer", "préparer"),
    ("partages", "partagés"),
    ("decisions", "décisions"),
    ("verifiees", "vérifiées"),
    ("benefices", "bénéfices"),
]


def accent_text(value):
    text = str(value)
    for source, target in ACCENT_REPLACEMENTS:
        text = text.replace(source, target)
    return text


def load_data():
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    for index, item in enumerate(data["campaigns"]):
        meta = META.get(item["id"], {})
        item["objective"] = meta.get("objective", "developper la notoriete")
        item["audience"] = meta.get("audience", "public TVF")
        item["style"] = meta.get("style", STYLE_SEQUENCE[index % len(STYLE_SEQUENCE)])
        item["icon"] = meta.get("icon", "spark")
        item["problem"] = meta.get("problem", item["subtitle"])
        item["solution"] = meta.get("solution", item["caption"])
        for field in ["objective", "audience", "problem", "solution"]:
            item[field] = accent_text(item[field])
        item["hashtags"] = [
            "#TerritoiresVivantsFrance",
            "#Revitalisation",
            "#EconomieCirculaire",
            *meta.get("hashtags", []),
        ]
    return data


def font(size, weight="regular"):
    candidates = []
    if weight == "bold":
        candidates = [
            Path("C:/Windows/Fonts/segoeuib.ttf"),
            Path("C:/Windows/Fonts/arialbd.ttf"),
            ROOT / "assets" / "fonts" / "Inter-Bold.ttf",
        ]
    elif weight == "semibold":
        candidates = [
            Path("C:/Windows/Fonts/seguisb.ttf"),
            Path("C:/Windows/Fonts/segoeuib.ttf"),
            ROOT / "assets" / "fonts" / "Inter-SemiBold.ttf",
        ]
    else:
        candidates = [
            Path("C:/Windows/Fonts/segoeui.ttf"),
            Path("C:/Windows/Fonts/arial.ttf"),
            ROOT / "assets" / "fonts" / "Inter-Regular.ttf",
        ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


def hex_to_rgb(value):
    value = value.strip().lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def safe_name(value):
    value = value.lower()
    value = re.sub(r"[^a-z0-9-]+", "-", value)
    return re.sub(r"-+", "-", value).strip("-")


def cover_image(path, size):
    with Image.open(path) as img:
        img = ImageOps.exif_transpose(img).convert("RGB")
        src_w, src_h = img.size
        target_w, target_h = size
        scale = max(target_w / src_w, target_h / src_h)
        new_size = (math.ceil(src_w * scale), math.ceil(src_h * scale))
        img = img.resize(new_size, Image.Resampling.LANCZOS)
        left = (img.width - target_w) // 2
        top = (img.height - target_h) // 2
        return img.crop((left, top, left + target_w, top + target_h))


def text_size(draw, text, font_obj):
    box = draw.textbbox((0, 0), text, font=font_obj)
    return box[2] - box[0], box[3] - box[1]


def wrap_text(draw, text, font_obj, max_width):
    lines = []
    for paragraph in str(text).split("\n"):
        words = paragraph.split()
        line = ""
        for word in words:
            test = word if not line else f"{line} {word}"
            if text_size(draw, test, font_obj)[0] <= max_width:
                line = test
            else:
                if line:
                    lines.append(line)
                line = word
        if line:
            lines.append(line)
    return lines


def draw_wrapped(draw, text, xy, font_obj, fill, max_width, line_gap=8, max_lines=None):
    x, y = xy
    lines = wrap_text(draw, text, font_obj, max_width)
    if max_lines and len(lines) > max_lines:
        lines = lines[:max_lines]
        lines[-1] = lines[-1].rstrip(".") + "..."
    line_height = text_size(draw, "Ag", font_obj)[1] + line_gap
    for line in lines:
        draw.text((x, y), line, font=font_obj, fill=fill)
        y += line_height
    return y


def fit_font(draw, text, max_width, max_lines, start_size, min_size=30, weight="bold"):
    size = start_size
    while size >= min_size:
        fnt = font(size, weight)
        if len(wrap_text(draw, text, fnt, max_width)) <= max_lines:
            return fnt
        size -= 2
    return font(min_size, weight)


def draw_shadowed_round_rect(draw, box, radius, fill, shadow=(0, 0, 0, 70), offset=12):
    x1, y1, x2, y2 = box
    draw.rounded_rectangle((x1 + offset, y1 + offset, x2 + offset, y2 + offset), radius=radius, fill=shadow)
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def paste_logo(canvas, logo_path, box, radius=22):
    x, y, w, h = box
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.rounded_rectangle((x, y, x + w, y + h), radius=radius, fill=(255, 255, 255, 242))
    canvas.alpha_composite(layer)

    logo = Image.open(logo_path).convert("RGBA")
    logo.thumbnail((w - 28, h - 22), Image.Resampling.LANCZOS)
    canvas.alpha_composite(logo, (x + (w - logo.width) // 2, y + (h - logo.height) // 2))


def add_overlay(canvas, style, accent):
    w, h = canvas.size
    navy = hex_to_rgb(NAVY)
    green = hex_to_rgb(DEEP_GREEN)
    if style in {"ecologique", "humain"}:
        base_color = green
        left_alpha, right_alpha, bottom_alpha = 178, 118, 78
    elif style in {"premium", "finance", "institutionnel"}:
        base_color = navy
        left_alpha, right_alpha, bottom_alpha = 218, 128, 58
    elif style == "avant-apres":
        left = Image.new("RGBA", (w // 2, h), (*navy, 178))
        right = Image.new("RGBA", (w - w // 2, h), (*green, 160))
        overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        overlay.alpha_composite(left, (0, 0))
        overlay.alpha_composite(right, (w // 2, 0))
        canvas.alpha_composite(overlay)
        base_color = navy
        left_alpha, right_alpha, bottom_alpha = 0, 0, 64
    else:
        base_color = navy
        left_alpha, right_alpha, bottom_alpha = 198, 114, 78

    if left_alpha or right_alpha:
        horizontal = Image.new("RGBA", (w, 1))
        hd = ImageDraw.Draw(horizontal)
        for x in range(w):
            alpha = int(left_alpha + (right_alpha - left_alpha) * (x / max(1, w - 1)))
            hd.point((x, 0), fill=(*base_color, alpha))
        canvas.alpha_composite(horizontal.resize((w, h)))

    vertical = Image.new("RGBA", (1, h))
    vd = ImageDraw.Draw(vertical)
    for y in range(h):
        alpha = int(bottom_alpha * (y / max(1, h - 1)) ** 1.7)
        vd.point((0, y), fill=(*navy, alpha))
    canvas.alpha_composite(vertical.resize((w, h)))

    if style in {"dynamique", "appel-a-action", "mobilisation"}:
        draw = ImageDraw.Draw(canvas)
        draw.polygon([(w * 0.62, 0), (w, 0), (w, h), (w * 0.84, h)], fill=hex_to_rgb(accent) + (105,))


def draw_icon(draw, cx, cy, icon, color, size=74, width=6):
    c = color
    s = size
    x = cx
    y = cy
    if icon in {"home", "key"}:
        draw.polygon([(x - s * 0.42, y), (x, y - s * 0.38), (x + s * 0.42, y), (x + s * 0.34, y + s * 0.46), (x - s * 0.34, y + s * 0.46)], outline=c, fill=None)
        draw.line([(x - s * 0.42, y), (x, y - s * 0.38), (x + s * 0.42, y)], fill=c, width=width, joint="curve")
        draw.rectangle((x - s * 0.13, y + s * 0.12, x + s * 0.13, y + s * 0.46), outline=c, width=width)
        if icon == "key":
            draw.ellipse((x + s * 0.12, y - s * 0.18, x + s * 0.42, y + s * 0.12), outline=c, width=width)
            draw.line((x + s * 0.27, y + s * 0.12, x + s * 0.27, y + s * 0.48), fill=c, width=width)
    elif icon == "recycle":
        r = s * 0.32
        for angle in [90, 210, 330]:
            rad = math.radians(angle)
            x1 = x + math.cos(rad) * r
            y1 = y + math.sin(rad) * r
            x2 = x + math.cos(rad + 1.55) * r
            y2 = y + math.sin(rad + 1.55) * r
            draw.line((x1, y1, x2, y2), fill=c, width=width)
            draw.polygon([(x2, y2), (x2 - 16, y2 + 3), (x2 - 5, y2 - 14)], fill=c)
    elif icon in {"city", "shop", "factory"}:
        draw.rectangle((x - s * 0.42, y - s * 0.18, x - s * 0.12, y + s * 0.42), outline=c, width=width)
        draw.rectangle((x - s * 0.04, y - s * 0.35, x + s * 0.34, y + s * 0.42), outline=c, width=width)
        for i in range(3):
            draw.line((x - s * 0.34, y + i * 16, x - s * 0.22, y + i * 16), fill=c, width=width - 2)
            draw.line((x + s * 0.08, y - s * 0.18 + i * 18, x + s * 0.22, y - s * 0.18 + i * 18), fill=c, width=width - 2)
        if icon == "shop":
            draw.arc((x - s * 0.44, y - s * 0.48, x + s * 0.42, y - s * 0.06), 0, 180, fill=c, width=width)
        if icon == "factory":
            draw.polygon([(x - s * 0.42, y + s * 0.42), (x - s * 0.42, y - s * 0.04), (x - s * 0.12, y + s * 0.14), (x - s * 0.12, y - s * 0.04), (x + s * 0.18, y + s * 0.14), (x + s * 0.18, y + s * 0.42)], outline=c)
    elif icon in {"group", "hands", "handshake"}:
        for dx in [-s * 0.2, s * 0.2]:
            draw.ellipse((x + dx - 16, y - 34, x + dx + 16, y - 2), outline=c, width=width)
            draw.line((x + dx, y, x + dx, y + 44), fill=c, width=width)
            draw.line((x + dx, y + 16, x + dx * 1.8, y + 34), fill=c, width=width)
        if icon == "handshake":
            draw.line((x - s * 0.45, y + 16, x + s * 0.45, y + 16), fill=c, width=width + 2)
    elif icon in {"leaf", "spark"}:
        draw.line((x, y + s * 0.42, x, y - s * 0.28), fill=c, width=width)
        draw.ellipse((x - s * 0.34, y - s * 0.38, x + s * 0.06, y + s * 0.05), outline=c, width=width)
        draw.ellipse((x - s * 0.04, y - s * 0.2, x + s * 0.36, y + s * 0.2), outline=c, width=width)
        if icon == "spark":
            draw.line((x + s * 0.42, y - s * 0.38, x + s * 0.42, y - s * 0.1), fill=c, width=width)
            draw.line((x + s * 0.28, y - s * 0.24, x + s * 0.56, y - s * 0.24), fill=c, width=width)
    elif icon == "pin":
        draw.ellipse((x - s * 0.32, y - s * 0.42, x + s * 0.32, y + s * 0.22), outline=c, width=width)
        draw.polygon([(x, y + s * 0.52), (x - s * 0.22, y + s * 0.06), (x + s * 0.22, y + s * 0.06)], outline=c)
        draw.ellipse((x - 10, y - 13, x + 10, y + 7), fill=c)
    elif icon in {"map", "chart", "route"}:
        draw.rectangle((x - s * 0.42, y - s * 0.34, x + s * 0.42, y + s * 0.34), outline=c, width=width)
        if icon == "chart":
            for i, h in enumerate([18, 42, 66]):
                draw.rectangle((x - 30 + i * 28, y + 28 - h, x - 10 + i * 28, y + 28), fill=c)
        else:
            draw.line((x - s * 0.32, y + s * 0.18, x - s * 0.08, y - s * 0.12, x + s * 0.18, y + s * 0.04, x + s * 0.33, y - s * 0.2), fill=c, width=width)
    elif icon in {"euro", "document"}:
        if icon == "euro":
            draw.arc((x - s * 0.25, y - s * 0.35, x + s * 0.32, y + s * 0.35), 80, 280, fill=c, width=width)
            draw.line((x - s * 0.38, y - 10, x + s * 0.14, y - 10), fill=c, width=width)
            draw.line((x - s * 0.38, y + 10, x + s * 0.14, y + 10), fill=c, width=width)
        else:
            draw.rectangle((x - s * 0.32, y - s * 0.42, x + s * 0.32, y + s * 0.42), outline=c, width=width)
            for i in range(4):
                draw.line((x - s * 0.18, y - s * 0.2 + i * 20, x + s * 0.18, y - s * 0.2 + i * 20), fill=c, width=width - 2)
    elif icon in {"network", "globe", "arrow"}:
        draw.ellipse((x - s * 0.36, y - s * 0.36, x + s * 0.36, y + s * 0.36), outline=c, width=width)
        if icon == "network":
            for dx, dy in [(-22, -20), (20, -14), (4, 24)]:
                draw.ellipse((x + dx - 8, y + dy - 8, x + dx + 8, y + dy + 8), fill=c)
            draw.line((x - 22, y - 20, x + 20, y - 14, x + 4, y + 24, x - 22, y - 20), fill=c, width=width - 2)
        elif icon == "arrow":
            draw.line((x - 28, y, x + 30, y), fill=c, width=width)
            draw.polygon([(x + 30, y), (x + 8, y - 18), (x + 8, y + 18)], fill=c)
        else:
            draw.line((x - s * 0.36, y, x + s * 0.36, y), fill=c, width=width - 2)
            draw.line((x, y - s * 0.36, x, y + s * 0.36), fill=c, width=width - 2)
    else:
        draw.ellipse((x - s * 0.35, y - s * 0.35, x + s * 0.35, y + s * 0.35), outline=c, width=width)


def draw_badge(draw, x, y, text, accent, small=False):
    fnt = font(22 if not small else 17, "bold")
    tw, th = text_size(draw, text.upper(), fnt)
    pad_x = 22 if not small else 16
    pad_y = 10 if not small else 7
    draw.rounded_rectangle((x, y, x + tw + pad_x * 2, y + th + pad_y * 2), radius=25, fill=hex_to_rgb(accent) + (238,))
    draw.text((x + pad_x, y + pad_y - 1), text.upper(), font=fnt, fill=(255, 255, 255, 255))
    return x + tw + pad_x * 2


def make_visual(item, brand, config, slide=None):
    w, h = config["size"]
    accent = item.get("accent", GREEN)
    style = item["style"]
    base = cover_image(ROOT / item["photo"], (w, h)).convert("RGBA")
    add_overlay(base, style, accent)
    draw = ImageDraw.Draw(base)
    logo_path = ROOT / brand["logo"]

    title = item["title"]
    subtitle = item["subtitle"]
    cta = item["cta"]
    kicker = item["kicker"]
    if slide:
        title = slide["title"]
        subtitle = slide["body"]
        kicker = slide["kicker"]
        cta = slide["cta"]

    if config["layout"] == "wide":
        margin = 58
        panel_w = int(w * 0.52)
        draw_shadowed_round_rect(
            draw,
            (margin, margin, panel_w, h - margin),
            32,
            hex_to_rgb(NAVY) + (230,),
            shadow=(0, 0, 0, 55),
            offset=10,
        )
        draw.rounded_rectangle((margin + 10, margin + 10, panel_w - 10, h - margin - 10), radius=26, outline=hex_to_rgb(accent) + (120,), width=2)
        paste_logo(base, logo_path, (margin + 28, margin + 26, 248, 76), radius=20)
        draw_badge(draw, margin + 28, margin + 126, kicker, accent, small=True)
        title_font = fit_font(draw, title, panel_w - margin - 82, 3, 48, 31, "bold")
        y = draw_wrapped(draw, title, (margin + 28, margin + 185), title_font, (255, 255, 255, 255), panel_w - margin - 82, 7, 3)
        y += 14
        draw_wrapped(draw, subtitle, (margin + 28, y), font(21), (230, 242, 230, 252), panel_w - margin - 86, 7, 4)
        draw.rounded_rectangle((margin + 28, h - margin - 74, margin + 380, h - margin - 22), radius=26, fill=(255, 255, 255, 242))
        draw.text((margin + 50, h - margin - 60), cta, font=font(19, "bold"), fill=hex_to_rgb(NAVY))
        draw_icon(draw, w - 124, h - 105, item["icon"], hex_to_rgb(accent), size=88, width=7)
    elif config["layout"] == "story":
        margin = 78
        paste_logo(base, logo_path, (margin, 78, 330, 116), radius=26)
        draw_badge(draw, margin, 270, kicker, accent)
        draw_icon(draw, margin + 78, 455, item["icon"], (255, 255, 255, 255), size=110, width=8)
        title_font = fit_font(draw, title, w - margin * 2, 5, 78, 46, "bold")
        y = draw_wrapped(draw, title, (margin, 600), title_font, (255, 255, 255, 255), w - margin * 2, 10, 5)
        y += 28
        body_font = font(34)
        draw_wrapped(draw, subtitle, (margin, y), body_font, (232, 242, 232, 255), w - margin * 2, 10, 5)
        draw.rounded_rectangle((margin, h - 290, w - margin, h - 205), radius=43, fill=(255, 255, 255, 242))
        draw.text((margin + 34, h - 263), cta, font=font(30, "bold"), fill=hex_to_rgb(NAVY))
        draw.text((margin, h - 128), brand["status"], font=font(24, "bold"), fill=(255, 255, 255, 235))
        draw.text((margin, h - 88), brand["website"], font=font(28), fill=(232, 242, 232, 240))
    else:
        margin = 62
        paste_logo(base, logo_path, (margin, 55, 310, 102), radius=24)
        draw_badge(draw, margin, 204, kicker, accent)
        draw_icon(draw, w - 154, 170, item["icon"], (255, 255, 255, 255), size=96, width=8)
        title_font = fit_font(draw, title, w - margin * 2, 4, 66, 42, "bold")
        y = draw_wrapped(draw, title, (margin, 315), title_font, (255, 255, 255, 255), w - margin * 2, 8, 4)
        y += 20
        draw_wrapped(draw, subtitle, (margin, y), font(31), (232, 242, 232, 255), w - margin * 2 - 20, 9, 4)
        draw.rounded_rectangle((margin, h - 150, margin + 460, h - 78), radius=36, fill=(255, 255, 255, 242))
        draw.text((margin + 28, h - 129), cta, font=font(26, "bold"), fill=hex_to_rgb(NAVY))
        draw.text((margin, h - 45), brand["website"], font=font(23), fill=(232, 242, 232, 240))

    draw.rectangle((0, 0, 14 if w <= 1200 else 18, h), fill=hex_to_rgb(accent) + (255,))
    return base.convert("RGB")


def carousel_slides(item):
    return [
        {
            "suffix": "slide-01",
            "kicker": item["kicker"],
            "title": item["title"],
            "body": item["subtitle"],
            "cta": "Faire défiler",
        },
        {
            "suffix": "slide-02",
            "kicker": "Pourquoi agir",
            "title": item["problem"],
            "body": item["solution"],
            "cta": "Comprendre l'enjeu",
        },
        {
            "suffix": "slide-03",
            "kicker": "Passer à l'action",
            "title": item["cta"],
            "body": item["caption"],
            "cta": brand_cta(item),
        },
    ]


def brand_cta(item):
    if "don" in item["cta"].lower() or "soutenir" in item["cta"].lower():
        return "Soutenir TVF"
    if "signaler" in item["cta"].lower():
        return "Signaler maintenant"
    if "proposer" in item["cta"].lower():
        return "Proposer une ressource"
    return "Rejoindre TVF"


def relative_href(target_path, from_dir):
    return Path(target_path).resolve().relative_to(ROOT).as_posix()


def svg_lines(text, max_chars):
    words = str(text).split()
    lines = []
    line = ""
    for word in words:
        test = word if not line else f"{line} {word}"
        if len(test) <= max_chars:
            line = test
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def svg_text(lines, x, y, size, fill, weight=700, line_height=1.15):
    parts = [f'<text x="{x}" y="{y}" fill="{fill}" font-family="Segoe UI, Arial, sans-serif" font-size="{size}" font-weight="{weight}">']
    for index, line in enumerate(lines):
        dy = 0 if index == 0 else round(size * line_height, 1)
        parts.append(f'<tspan x="{x}" dy="{dy}">{html.escape(line)}</tspan>')
    parts.append("</text>")
    return "\n".join(parts)


def make_svg_source(item, brand, config, out_dir, slide=None):
    w, h = config["size"]
    accent = item.get("accent", GREEN)
    title = item["title"] if slide is None else slide["title"]
    subtitle = item["subtitle"] if slide is None else slide["body"]
    cta = item["cta"] if slide is None else slide["cta"]
    kicker = item["kicker"] if slide is None else slide["kicker"]
    photo_href = relative_href(ROOT / item["photo"], out_dir)
    logo_href = relative_href(ROOT / brand["logo"], out_dir)
    title_size = 66 if config["layout"] != "wide" else 46
    subtitle_size = 31 if config["layout"] != "wide" else 22
    max_chars = 22 if config["layout"] != "wide" else 30
    sub_chars = 44 if config["layout"] != "wide" else 58

    if config["layout"] == "wide":
        title_y = 275
        subtitle_y = 410
        logo_w, logo_h = 250, 76
        panel = f'<rect x="58" y="58" width="{int(w * 0.52) - 58}" height="{h - 116}" rx="32" fill="{NAVY}" opacity="0.9"/>'
        badge = '<rect x="86" y="184" width="250" height="38" rx="19" fill="{0}"/>'.format(accent)
        logo = f'<rect x="86" y="84" width="{logo_w}" height="{logo_h}" rx="20" fill="#fff" opacity="0.94"/><image href="{logo_href}" x="102" y="96" width="{logo_w - 32}" height="{logo_h - 22}" preserveAspectRatio="xMidYMid meet"/>'
        cta_box = f'<rect x="86" y="{h - 132}" width="350" height="52" rx="26" fill="#fff" opacity="0.94"/><text x="108" y="{h - 99}" fill="{NAVY}" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">{html.escape(cta)}</text>'
        title_x = 86
        text_width_chars = max_chars
    else:
        title_y = 365 if config["layout"] == "square" else 650
        subtitle_y = 650 if config["layout"] == "square" else 1040
        panel = ""
        badge_y = 204 if config["layout"] == "square" else 270
        badge = f'<rect x="68" y="{badge_y}" width="350" height="50" rx="25" fill="{accent}"/>'
        logo_y = 55 if config["layout"] == "square" else 78
        logo = f'<rect x="68" y="{logo_y}" width="310" height="102" rx="24" fill="#fff" opacity="0.94"/><image href="{logo_href}" x="90" y="{logo_y + 16}" width="266" height="70" preserveAspectRatio="xMidYMid meet"/>'
        cta_y = h - 150 if config["layout"] == "square" else h - 290
        cta_box = f'<rect x="68" y="{cta_y}" width="520" height="76" rx="38" fill="#fff" opacity="0.94"/><text x="98" y="{cta_y + 49}" fill="{NAVY}" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="700">{html.escape(cta)}</text>'
        title_x = 68
        text_width_chars = max_chars

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
  <defs>
    <linearGradient id="shade" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="{NAVY}" stop-opacity="0.88"/>
      <stop offset="0.55" stop-color="{NAVY}" stop-opacity="0.58"/>
      <stop offset="1" stop-color="{DEEP_GREEN}" stop-opacity="0.78"/>
    </linearGradient>
  </defs>
  <image href="{photo_href}" x="0" y="0" width="{w}" height="{h}" preserveAspectRatio="xMidYMid slice"/>
  <rect width="{w}" height="{h}" fill="url(#shade)"/>
  <rect x="0" y="0" width="{14 if w <= 1200 else 18}" height="{h}" fill="{accent}"/>
  {panel}
  {logo}
  {badge}
  <text x="{98 if config["layout"] != "wide" else 104}" y="{(badge_y + 32) if config["layout"] != "wide" else 209}" fill="#fff" font-family="Segoe UI, Arial, sans-serif" font-size="{22 if config["layout"] != "wide" else 17}" font-weight="700">{html.escape(kicker.upper())}</text>
  {svg_text(svg_lines(title, text_width_chars), title_x, title_y, title_size, "#fff", 800)}
  {svg_text(svg_lines(subtitle, sub_chars), title_x, subtitle_y, subtitle_size, "#E8F2E8", 400, 1.22)}
  {cta_box}
  <text x="{68 if config["layout"] != "wide" else 450}" y="{h - 45 if config["layout"] != "wide" else h - 93}" fill="#E8F2E8" font-family="Segoe UI, Arial, sans-serif" font-size="{23 if config["layout"] != "wide" else 17}">{html.escape(brand["website"])}</text>
</svg>'''
    return svg


def write_visual(item, brand, config, slide=None, carousel_dir=None):
    if carousel_dir:
        out_dir = OUT_ROOT / "instagram" / "carousel" / item["id"]
        name = slide["suffix"]
    else:
        out_dir = OUT_ROOT / config["folder"]
        name = item["id"]
    jpg_dir = out_dir / "jpg"
    svg_dir = out_dir / "svg"
    jpg_dir.mkdir(parents=True, exist_ok=True)
    svg_dir.mkdir(parents=True, exist_ok=True)
    image = make_visual(item, brand, config, slide=slide)
    jpg_path = jpg_dir / f"{name}.jpg"
    image.save(jpg_path, "JPEG", quality=91, optimize=True, progressive=True)
    svg_path = svg_dir / f"{name}.svg"
    svg_path.write_text(make_svg_source(item, brand, config, svg_dir, slide=slide), encoding="utf-8")
    return [
        {
            "campaign": item["id"],
            "format": config["key"] if not carousel_dir else "instagram-carousel",
            "asset_type": "jpg",
            "path": str(jpg_path.relative_to(ROOT)).replace("\\", "/"),
            "width": config["size"][0],
            "height": config["size"][1],
        },
        {
            "campaign": item["id"],
            "format": config["key"] if not carousel_dir else "instagram-carousel",
            "asset_type": "svg",
            "path": str(svg_path.relative_to(ROOT)).replace("\\", "/"),
            "width": config["size"][0],
            "height": config["size"][1],
        },
    ]


def hashtags(item):
    return " ".join(dict.fromkeys(item["hashtags"]))


def reel_storyboard(item):
    return [
        ("0-2 s", f"Plan terrain : {item['kicker'].lower()} avec texte court a l'ecran."),
        ("2-5 s", item["problem"]),
        ("5-8 s", item["solution"]),
        ("8-11 s", f"Montrer une action concrete : photo, carte, dossier, materiau ou personne en action."),
        ("11-15 s", f"CTA final : {item['cta']} - territoiresvivantsfrance.fr"),
    ]


def make_captions_doc(data):
    lines = [
        "# Textes de publication et hashtags",
        "",
        "Banque de textes prets a adapter avant publication. Aucun chiffre, partenaire, financeur ou projet realise n'est invente.",
        "",
    ]
    for item in data["campaigns"]:
        lines.extend(
            [
                f"## {item['id']} - {item['title']}",
                "",
                f"**Objectif :** {item['objective']}",
                "",
                f"**Public prioritaire :** {item['audience']}",
                "",
                f"**Texte publication :** {item['caption']}",
                "",
                f"**CTA :** {item['cta']}",
                "",
                f"**Hashtags :** {hashtags(item)}",
                "",
            ]
        )
    path = OUT_ROOT / "captions.md"
    path.write_text("\n".join(lines), encoding="utf-8")
    return path


def make_campaigns_doc(data):
    lines = [
        "# Bibliotheque de campagnes sociales TVF",
        "",
        "Chaque campagne comprend un angle editorial, une cible, des visuels multi-formats, un carrousel Instagram et un storyboard Reel.",
        "",
    ]
    for item in data["campaigns"]:
        lines.extend(
            [
                f"## {item['id']} - {item['title']}",
                "",
                f"- Objectif : {item['objective']}",
                f"- Public cible : {item['audience']}",
                f"- Style graphique : {item['style']}",
                f"- Couleur d'accent : {item.get('accent', GREEN)}",
                f"- CTA : {item['cta']}",
                f"- Hashtags : {hashtags(item)}",
                "",
                "### Carrousel Instagram",
                "",
            ]
        )
        for index, slide in enumerate(carousel_slides(item), 1):
            lines.append(f"{index}. **{slide['title']}** - {slide['body']}")
        lines.extend(["", "### Storyboard Reel", ""])
        for timing, text in reel_storyboard(item):
            lines.append(f"- **{timing}** : {text}")
        lines.extend(
            [
                "",
                "### Adaptation par reseau",
                "",
                "- Instagram : visuel emotionnel, message court, CTA visible en story.",
                "- LinkedIn : angle institutionnel, collectivites, entreprises, partenaires, financeurs.",
                "- Facebook : message local et citoyen, incitation au partage.",
                "- X : accroche tres courte, lien vers la page concernee.",
                "- TikTok/Reel : plan terrain, geste concret, texte a l'ecran, CTA final.",
                "",
            ]
        )
    path = OUT_ROOT / "bibliotheque-campagnes.md"
    path.write_text("\n".join(lines), encoding="utf-8")
    return path


def make_strategy_doc(data):
    total = len(data["campaigns"])
    lines = [
        "# Strategie de communication reseaux sociaux - Territoires Vivants France",
        "",
        "## Positionnement",
        "",
        "Territoires Vivants France doit apparaitre comme une plateforme nationale jeune, serieuse et operationnelle : un projet capable de relier des proprietaires, collectivites, entreprises, associations, benevoles, financeurs et citoyens autour de la remise en usage des ressources dormantes.",
        "",
        "Le ton doit rester concret : moins de slogans abstraits, plus de situations de terrain, de parcours lisibles, de benefices par public et d'appels a l'action simples.",
        "",
        "## Objectifs prioritaires",
        "",
        "1. Faire connaitre TVF et son territoire pilote, Saint-Etienne.",
        "2. Attirer les collectivites et EPCI interesses par un outil de coordination.",
        "3. Convaincre les proprietaires de proposer un bien vacant ou degrade.",
        "4. Mobiliser les entreprises autour des materiaux, competences, locaux et financements.",
        "5. Recruter des benevoles et futurs referents locaux.",
        "6. Rassurer les mecenes, fondations et investisseurs solidaires par un cadre documente.",
        "",
        "## Piliers editoriaux",
        "",
        "| Pilier | Role | Formats conseilles |",
        "| --- | --- | --- |",
        "| Comprendre | Expliquer la vacance, les friches, le reemploi et l'impact territorial | Carrousels, infographies, reels pedagogiques |",
        "| Agir | Donner une action simple a chaque public | Stories, posts CTA, Meta Ads |",
        "| Prouver | Montrer la methode, les documents, les sources et les indicateurs | LinkedIn, dossiers, tableaux, graphiques |",
        "| Inspirer | Donner envie de rejoindre le mouvement | Reels, temoignages types, photos humaines |",
        "| Territorialiser | Ancrer TVF a Saint-Etienne puis ouvrir le modele national | Cartes, dossiers territoriaux, posts locaux |",
        "",
        "## Cadence recommandee Instagram",
        "",
        "- 3 publications par semaine : un carrousel pedagogique, un visuel CTA, une publication humaine ou territoriale.",
        "- 3 a 5 stories par semaine : sondage, question, appel a signalement, coulisses de constitution du projet.",
        "- 1 Reel par semaine : format court, texte a l'ecran, voix off ou musique sobre.",
        "- 1 campagne sponsorisee par mois : objectif trafic, formulaire ou prise de contact selon la cible.",
        "",
        "## Regles de credibilite",
        "",
        "- Ne jamais afficher de faux partenaires, faux financeurs, faux chiffres d'impact ou projets realises non confirmes.",
        "- Les publications chiffres cles doivent citer une source officielle visible ou renvoyer vers une page source.",
        "- Les temoignages non reels doivent etre nommes comme exemples de situation ou scenarios types.",
        "- Les visuels de partenaires restent des espaces reserves tant qu'un accord officiel n'existe pas.",
        "",
        "## Bibliotheque produite",
        "",
        f"- {total} campagnes editoriales.",
        "- Formats Instagram : publication 1080x1080, story 1080x1920, carrousel 3 slides, couverture Reel.",
        "- Formats additionnels : Facebook, LinkedIn, X, TikTok, Meta Ads square et story.",
        "- Sources modifiables : SVG.",
        "- Exports publication : JPG optimises pour les reseaux sociaux.",
        "",
        "## Parcours par public",
        "",
        "| Public | Message central | CTA principal |",
        "| --- | --- | --- |",
        "| Collectivite | TVF aide a qualifier, coordonner et suivre les projets territoriaux | Devenir territoire partenaire |",
        "| Proprietaire | Un bien vacant peut retrouver un usage sans perdre sa valeur patrimoniale | Proposer un bien |",
        "| Entreprise | Les ressources inutilisees peuvent devenir une action RSE visible et utile | Contribuer avec TVF |",
        "| Benevole | Chacun peut agir avec des missions encadrees et concretes | Devenir benevole |",
        "| Mecene / investisseur | Les projets sont qualifies, suivis et documentes | Soutenir un projet |",
        "| Citoyen | Un signalement peut declencher l'etude d'une ressource locale | Signaler un lieu |",
        "",
        "## Formats sponsorises Meta Ads",
        "",
        "- Campagne notoriete : lancement TVF, Saint-Etienne pilote, Vision 2035.",
        "- Campagne leads proprietaires : proposer un bien, Bien Solidaire, signaler un lieu.",
        "- Campagne entreprises : banque de materiaux, RSE, contribution territoriale.",
        "- Campagne benevoles : engagement local, chantiers, antennes.",
        "- Campagne financeurs : financer les projets, documents, transparence.",
        "",
        "## Indicateurs a suivre",
        "",
        "- Portee, impressions, taux d'engagement, clics vers le site, messages entrants.",
        "- Formulaires envoyes : signalements, materiaux, benevoles, partenaires, proprietaires.",
        "- Cout par contact qualifie pour les campagnes sponsorisees.",
        "- Sauvegardes et partages des carrousels pedagogiques.",
        "- Evolution des abonnes par profil : citoyens, collectivites, entreprises, acteurs ESS.",
    ]
    path = OUT_ROOT / "strategie-reseaux-sociaux.md"
    path.write_text("\n".join(lines), encoding="utf-8")
    return path


def make_calendar_doc(data):
    campaigns = data["campaigns"]
    lines = [
        "# Calendrier editorial Instagram - 8 semaines",
        "",
        "Proposition de rythme pour lancer TVF sans saturer l'audience.",
        "",
        "| Semaine | Publication 1 | Publication 2 | Publication 3 | Reel / Story |",
        "| --- | --- | --- | --- | --- |",
    ]
    for week in range(8):
        picks = [campaigns[(week * 3 + i) % len(campaigns)] for i in range(3)]
        reel = campaigns[(week * 3 + 3) % len(campaigns)]
        lines.append(
            f"| {week + 1} | {picks[0]['title']} | {picks[1]['title']} | {picks[2]['title']} | Reel : {reel['title']} |"
        )
    lines.extend(
        [
            "",
            "Chaque semaine doit melanger : une preuve de methode, un appel a l'action et un contenu humain ou territorial.",
        ]
    )
    path = OUT_ROOT / "calendrier-editorial-8-semaines.md"
    path.write_text("\n".join(lines), encoding="utf-8")
    return path


def make_manifest(rows):
    path = OUT_ROOT / "manifest.csv"
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["campaign", "format", "asset_type", "path", "width", "height"])
        writer.writeheader()
        writer.writerows(rows)
    return path


def make_preview(name, image_paths, thumb_size):
    if not image_paths:
        return None
    cols = 5
    rows = math.ceil(len(image_paths) / cols)
    gutter = 20
    canvas = Image.new("RGB", (cols * thumb_size[0] + (cols + 1) * gutter, rows * thumb_size[1] + (rows + 1) * gutter), (246, 248, 243))
    for index, path in enumerate(image_paths):
        with Image.open(path) as img:
            img = ImageOps.exif_transpose(img).convert("RGB")
            img.thumbnail(thumb_size, Image.Resampling.LANCZOS)
            x = gutter + (index % cols) * (thumb_size[0] + gutter) + (thumb_size[0] - img.width) // 2
            y = gutter + (index // cols) * (thumb_size[1] + gutter) + (thumb_size[1] - img.height) // 2
            canvas.paste(img, (x, y))
    out = OUT_ROOT / f"preview-{name}.jpg"
    canvas.save(out, "JPEG", quality=88, optimize=True)
    return out


def update_readme():
    lines = [
        "# Kit de communication reseaux sociaux TVF",
        "",
        "Ce dossier contient une bibliotheque de campagnes publicitaires et editoriales pour Territoires Vivants France.",
        "",
        "## Contenu",
        "",
        "- `strategie-reseaux-sociaux.md` : strategie globale, publics, messages, cadence, KPI.",
        "- `bibliotheque-campagnes.md` : 20 campagnes avec objectifs, textes, hashtags, carrousels et storyboards Reels.",
        "- `calendrier-editorial-8-semaines.md` : proposition de lancement Instagram.",
        "- `captions.md` : textes de publications prets a adapter.",
        "- `manifest.csv` : inventaire de tous les exports.",
        "- `campaigns.json` : fichier central pour modifier titres, photos, couleurs et CTA.",
        "",
        "## Formats generes",
        "",
        "- Instagram publication : 1080 x 1080.",
        "- Instagram story : 1080 x 1920.",
        "- Instagram carrousel : 3 slides par campagne en 1080 x 1080.",
        "- Instagram Reel : couverture 1080 x 1920 + storyboard dans la bibliotheque de campagnes.",
        "- Facebook feed : 1200 x 630.",
        "- LinkedIn feed : 1200 x 627.",
        "- X : 1600 x 900.",
        "- TikTok cover : 1080 x 1920.",
        "- Meta Ads square : 1080 x 1080.",
        "- Meta Ads story : 1080 x 1920.",
        "",
        "## Fichiers modifiables",
        "",
        "Chaque visuel est fourni en deux versions :",
        "",
        "- `.jpg` : export pret a publier.",
        "- `.svg` : source modifiable dans Figma, Illustrator, Inkscape ou un editeur de texte.",
        "",
        "## Regenerer le kit",
        "",
        "Modifier `campaigns.json`, puis lancer :",
        "",
        "```powershell",
        '& "C:\\Users\\jowst\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe" scripts\\generate-social-visuals.py',
        "```",
        "",
        "## Regle de credibilite",
        "",
        "Ne pas publier de faux chiffres, faux partenaires, faux financeurs ou projets realises non confirmes. Les formats statistiques sont prevus pour recevoir des donnees sourcees.",
    ]
    path = OUT_ROOT / "README.md"
    path.write_text("\n".join(lines), encoding="utf-8")
    return path


def main():
    data = load_data()
    brand = data["brand"]
    created_rows = []
    preview_post = []
    preview_story = []
    preview_linkedin = []

    for item in data["campaigns"]:
        for config in FORMAT_CONFIGS:
            rows = write_visual(item, brand, config)
            created_rows.extend(rows)
            jpg = ROOT / rows[0]["path"]
            if config["key"] == "instagram-post":
                preview_post.append(jpg)
            elif config["key"] == "instagram-story":
                preview_story.append(jpg)
            elif config["key"] == "linkedin-feed":
                preview_linkedin.append(jpg)

        carousel_config = {
            "key": "instagram-carousel",
            "folder": "instagram/carousel",
            "size": (1080, 1080),
            "layout": "square",
            "label": "Instagram carousel",
        }
        for slide in carousel_slides(item):
            created_rows.extend(write_visual(item, brand, carousel_config, slide=slide, carousel_dir=True))

    docs = [
        make_captions_doc(data),
        make_campaigns_doc(data),
        make_strategy_doc(data),
        make_calendar_doc(data),
        make_manifest(created_rows),
        update_readme(),
        make_preview("instagram-posts", preview_post, (220, 220)),
        make_preview("instagram-stories", preview_story, (150, 266)),
        make_preview("linkedin-feed", preview_linkedin, (260, 136)),
    ]
    print(
        json.dumps(
            {
                "campaigns": len(data["campaigns"]),
                "visual_files": len(created_rows),
                "documents": len([doc for doc in docs if doc]),
                "formats": len(FORMAT_CONFIGS) + 1,
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
