from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "social" / "instagram" / "instagram-visuals.json"
OUT_DIR = ROOT / "social" / "instagram" / "exports"
SIZE = 1080


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    names = ["arialbd.ttf", "arial.ttf"] if bold else ["arial.ttf", "calibri.ttf"]
    for name in names:
        path = Path("C:/Windows/Fonts") / name
        if path.exists():
            return ImageFont.truetype(str(path), size=size)
    return ImageFont.load_default()


FONT = {
    "label": font(25, True),
    "title": font(72, True),
    "title_small": font(60, True),
    "hook": font(43, True),
    "body": font(29),
    "cta": font(26, True),
    "footer": font(22, True),
}


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.strip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def rgba(hex_value: str, alpha: int) -> tuple[int, int, int, int]:
    return (*hex_to_rgb(hex_value), alpha)


def cover_image(path: Path, size: tuple[int, int]) -> Image.Image:
    img = Image.open(path).convert("RGB")
    return ImageOps.fit(img, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5)).convert("RGBA")


def paste_overlay(base: Image.Image, color: tuple[int, int, int, int]) -> None:
    overlay = Image.new("RGBA", base.size, color)
    base.alpha_composite(overlay)


def vertical_gradient(base: Image.Image, top: tuple[int, int, int, int], bottom: tuple[int, int, int, int]) -> None:
    grad = Image.new("RGBA", base.size)
    px = grad.load()
    for y in range(base.height):
        t = y / max(1, base.height - 1)
        c = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(4))
        for x in range(base.width):
            px[x, y] = c
    base.alpha_composite(grad)


def text_width(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.ImageFont) -> int:
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0]


def wrap(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.ImageFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        attempt = word if not current else f"{current} {word}"
        if text_width(draw, attempt, fnt) <= max_width:
            current = attempt
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_wrapped(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    fnt: ImageFont.ImageFont,
    fill: str | tuple[int, int, int, int],
    max_width: int,
    line_gap: int = 8,
) -> int:
    x, y = xy
    for line in wrap(draw, text, fnt, max_width):
        draw.text((x, y), line, font=fnt, fill=fill)
        box = draw.textbbox((x, y), line, font=fnt)
        y = box[3] + line_gap
    return y


def rounded(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], fill, radius: int = 34, outline=None, width: int = 1) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def logo_chip(base: Image.Image, brand: dict, x: int, y: int, w: int = 230) -> None:
    logo_path = ROOT / brand["logo"]
    logo = Image.open(logo_path).convert("RGBA")
    logo.thumbnail((w, 92), Image.Resampling.LANCZOS)
    chip_w = logo.width + 40
    chip_h = logo.height + 28
    chip = Image.new("RGBA", (chip_w, chip_h), (255, 255, 255, 235))
    chip_draw = ImageDraw.Draw(chip)
    chip_draw.rounded_rectangle((0, 0, chip_w - 1, chip_h - 1), radius=24, fill=(255, 255, 255, 235))
    chip.alpha_composite(logo, (20, 14))
    base.alpha_composite(chip, (x, y))


def footer(draw: ImageDraw.ImageDraw, brand: dict, accent: str, dark: bool = False) -> None:
    fill = "#FFFFFF" if dark else brand["colors"]["blue"]
    draw.text((64, 1014), brand["website"], font=FONT["footer"], fill=fill)
    draw.rounded_rectangle((793, 992, 1016, 1040), radius=24, fill=accent)
    draw.text((827, 1004), "Rejoindre TVF", font=FONT["footer"], fill="#FFFFFF")


def draw_cta(draw: ImageDraw.ImageDraw, x: int, y: int, text: str, accent: str, inverse: bool = False) -> None:
    fnt = FONT["cta"]
    padding_x = 24
    padding_y = 13
    w = text_width(draw, text, fnt) + padding_x * 2
    h = 56
    fill = "#FFFFFF" if inverse else accent
    txt = accent if inverse else "#FFFFFF"
    draw.rounded_rectangle((x, y, x + w, y + h), radius=28, fill=fill)
    draw.text((x + padding_x, y + padding_y), text, font=fnt, fill=txt)


def diagonal_marks(draw: ImageDraw.ImageDraw, accent: str) -> None:
    color = rgba(accent, 90)
    for i in range(-240, 1080, 160):
        draw.line((i, 1080, i + 420, 0), fill=color, width=3)


def map_points(draw: ImageDraw.ImageDraw, accent: str) -> None:
    points = [(770, 318), (850, 455), (725, 615), (920, 680), (660, 790)]
    for x, y in points:
        draw.ellipse((x - 12, y - 12, x + 12, y + 12), fill=accent, outline="#FFFFFF", width=3)
    for a, b in zip(points, points[1:]):
        draw.line((*a, *b), fill=rgba(accent, 190), width=4)


def render_visual(item: dict, brand: dict) -> Image.Image:
    colors = brand["colors"]
    accent = item["accent"]
    style = item["style"]
    bg = cover_image(ROOT / item["image"], (SIZE, SIZE))
    img = bg.copy()
    draw = ImageDraw.Draw(img)

    if style in {"institutional_frame", "green_overlay", "before_after_hint", "premium_finance", "data_map"}:
        vertical_gradient(img, rgba(colors["blue"], 35), rgba(colors["blue"], 210))
    elif style in {"workshop_split", "civic_blueprint"}:
        paste_overlay(img, rgba(colors["paper"], 35))
    else:
        paste_overlay(img, rgba(colors["blue"], 90))

    if style == "workshop_split":
        rounded(draw, (480, 74, 1010, 1004), colors["paper"], 40)
        draw.rectangle((0, 0, 470, 1080), fill=rgba(colors["blue"], 80))
        text_x, text_y, text_w = 526, 212, 430
        title_fill, body_fill = colors["blue"], colors["muted"]
    elif style == "urban_band":
        rounded(draw, (70, 612, 1010, 952), rgba(colors["white"], 238), 40)
        draw.rectangle((70, 612, 95, 952), fill=accent)
        text_x, text_y, text_w = 130, 665, 815
        title_fill, body_fill = colors["blue"], colors["muted"]
    elif style == "green_overlay":
        paste_overlay(img, rgba(colors["greenDark"], 95))
        rounded(draw, (78, 226, 1002, 820), rgba(colors["greenDark"], 220), 46, outline=rgba(accent, 210), width=3)
        diagonal_marks(draw, colors["gold"])
        text_x, text_y, text_w = 132, 330, 800
        title_fill, body_fill = "#FFFFFF", (255, 255, 255, 220)
    elif style == "human_card":
        rounded(draw, (68, 590, 1012, 978), rgba(colors["white"], 242), 42)
        text_x, text_y, text_w = 118, 640, 840
        title_fill, body_fill = colors["blue"], colors["muted"]
    elif style == "before_after_hint":
        draw.rectangle((0, 0, 540, 1080), fill=rgba(colors["blue"], 145))
        draw.rectangle((540, 0, 1080, 1080), fill=rgba(colors["greenDark"], 120))
        draw.line((540, 96, 540, 984), fill=accent, width=7)
        text_x, text_y, text_w = 90, 355, 880
        title_fill, body_fill = "#FFFFFF", (255, 255, 255, 225)
    elif style == "street_poster":
        rounded(draw, (92, 112, 988, 968), rgba(colors["paper"], 238), 32)
        draw.rectangle((92, 112, 988, 244), fill=accent)
        text_x, text_y, text_w = 140, 305, 800
        title_fill, body_fill = colors["blue"], colors["muted"]
    elif style == "material_catalog":
        img = Image.new("RGBA", (SIZE, SIZE), colors["paper"])
        photo = cover_image(ROOT / item["image"], (920, 470))
        img.alpha_composite(photo, (80, 80))
        draw = ImageDraw.Draw(img)
        rounded(draw, (80, 80, 1000, 550), None, 36, outline=accent, width=4)
        for idx, label in enumerate(["Bois", "Portes", "Fenêtres", "Mobilier"]):
            x = 94 + idx * 225
            draw.rounded_rectangle((x, 588, x + 196, 646), radius=28, fill=rgba(accent, 36), outline=accent, width=2)
            draw.text((x + 28, 604), label, font=FONT["footer"], fill=colors["blue"])
        text_x, text_y, text_w = 92, 700, 890
        title_fill, body_fill = colors["blue"], colors["muted"]
    elif style == "territory_map":
        paste_overlay(img, rgba(colors["greenDark"], 120))
        map_points(draw, accent)
        rounded(draw, (70, 590, 700, 960), rgba(colors["white"], 238), 36)
        text_x, text_y, text_w = 112, 632, 540
        title_fill, body_fill = colors["blue"], colors["muted"]
    elif style == "community_light":
        rounded(draw, (74, 86, 1006, 994), rgba(colors["white"], 216), 44)
        photo = cover_image(ROOT / item["image"], (852, 388))
        img.alpha_composite(photo, (114, 126))
        draw = ImageDraw.Draw(img)
        rounded(draw, (114, 126, 966, 514), None, 34, outline=accent, width=5)
        text_x, text_y, text_w = 126, 580, 820
        title_fill, body_fill = colors["blue"], colors["muted"]
    elif style == "civic_blueprint":
        img = bg.filter(ImageFilter.GaussianBlur(1.2)).convert("RGBA")
        paste_overlay(img, rgba(colors["blue"], 210))
        draw = ImageDraw.Draw(img)
        for x in range(90, 1030, 90):
            draw.line((x, 80, x, 1000), fill=(255, 255, 255, 28), width=2)
        for y in range(100, 1000, 90):
            draw.line((70, y, 1010, y), fill=(255, 255, 255, 28), width=2)
        text_x, text_y, text_w = 94, 330, 830
        title_fill, body_fill = "#FFFFFF", (255, 255, 255, 220)
    elif style == "premium_finance":
        rounded(draw, (74, 84, 1006, 996), (0, 0, 0, 0), 42, outline=accent, width=5)
        rounded(draw, (126, 570, 954, 904), rgba(colors["blue"], 228), 36)
        text_x, text_y, text_w = 170, 618, 740
        title_fill, body_fill = "#FFFFFF", (255, 255, 255, 220)
    elif style == "data_map":
        paste_overlay(img, rgba(colors["blue"], 115))
        map_points(draw, accent)
        rounded(draw, (82, 120, 690, 870), rgba(colors["white"], 232), 40)
        text_x, text_y, text_w = 126, 210, 500
        title_fill, body_fill = colors["blue"], colors["muted"]
    else:
        rounded(draw, (80, 560, 1000, 960), rgba(colors["white"], 238), 38)
        text_x, text_y, text_w = 126, 610, 830
        title_fill, body_fill = colors["blue"], colors["muted"]

    # Header elements
    label_fill = "#FFFFFF" if title_fill == "#FFFFFF" else colors["greenDark"]
    label_bg = rgba(accent, 235) if title_fill != "#FFFFFF" else rgba(accent, 200)
    draw.rounded_rectangle((64, 54, 64 + text_width(draw, item["kind"], FONT["label"]) + 42, 104), radius=25, fill=label_bg)
    draw.text((85, 66), item["kind"], font=FONT["label"], fill="#FFFFFF")
    logo_chip(img, brand, 760, 52, 238)

    # Text block
    draw_wrapped(draw, (text_x, text_y), item["title"].upper(), FONT["title"] if len(item["title"]) < 23 else FONT["title_small"], title_fill, text_w, 2)
    hook_y = text_y + 172
    hook_y = draw_wrapped(draw, (text_x, hook_y), item["hook"], FONT["hook"], accent if title_fill != "#FFFFFF" else "#FFFFFF", text_w, 6)
    body_y = hook_y + 20
    draw_wrapped(draw, (text_x, body_y), item["body"], FONT["body"], body_fill, text_w, 8)

    cta_y = min(902, body_y + 124)
    draw_cta(draw, text_x, cta_y, item["cta"], accent, inverse=(title_fill == "#FFFFFF" and style not in {"premium_finance"}))
    footer(draw, brand, accent, dark=(title_fill == "#FFFFFF"))

    return img.convert("RGB")


def make_contact_sheet(paths: list[Path]) -> None:
    thumb = 248
    gap = 24
    cols = 4
    rows = math.ceil(len(paths) / cols)
    sheet = Image.new("RGB", (cols * thumb + (cols + 1) * gap, rows * (thumb + 40) + (rows + 1) * gap), "#FBFAF6")
    draw = ImageDraw.Draw(sheet)
    small = font(16, True)
    for idx, path in enumerate(paths):
        img = Image.open(path).convert("RGB")
        img.thumbnail((thumb, thumb), Image.Resampling.LANCZOS)
        x = gap + (idx % cols) * (thumb + gap)
        y = gap + (idx // cols) * (thumb + 40 + gap)
        sheet.paste(img, (x, y))
        draw.text((x, y + thumb + 8), path.stem[:28], font=small, fill="#0E2D45")
    sheet.save(OUT_DIR / "00-planche-contact.png", quality=92)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    data = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    brand = data["brand"]
    generated: list[Path] = []
    for item in data["visuals"]:
        image = render_visual(item, brand)
        out = OUT_DIR / f"{item['id']}.png"
        image.save(out, optimize=True, quality=92)
        generated.append(out)
    make_contact_sheet(generated)
    print(f"Generated {len(generated)} Instagram visuals in {OUT_DIR}")


if __name__ == "__main__":
    main()
