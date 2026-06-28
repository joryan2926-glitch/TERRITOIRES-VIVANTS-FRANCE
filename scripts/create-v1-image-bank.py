from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps


ROOT = Path.cwd()
OUT_DIR = ROOT / "assets" / "photos" / "v1"
OUT_DIR.mkdir(parents=True, exist_ok=True)
for old_file in OUT_DIR.glob("*.webp"):
    old_file.unlink()

TARGET_WIDTH = 1280
TARGET_HEIGHT = 800
TARGET_RATIO = TARGET_WIDTH / TARGET_HEIGHT


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")[:80] or "image"


def crop_to_ratio(img: Image.Image, seed: int) -> Image.Image:
    width, height = img.size
    ratio = width / height
    if ratio > TARGET_RATIO:
        crop_width = int(height * TARGET_RATIO)
        max_left = max(0, width - crop_width)
        left = int(max_left * ((seed % 997) / 996)) if max_left else 0
        box = (left, 0, left + crop_width, height)
    else:
        crop_height = int(width / TARGET_RATIO)
        max_top = max(0, height - crop_height)
        top = int(max_top * (((seed // 7) % 997) / 996)) if max_top else 0
        box = (0, top, width, top + crop_height)
    return img.crop(box)


def make_variant(src: Path, dst: Path, seed: int) -> None:
    with Image.open(src) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        image = crop_to_ratio(image, seed)
        image = image.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)

        color_factor = 1.03 + ((seed % 9) - 4) * 0.01
        contrast_factor = 1.04 + ((seed % 7) - 3) * 0.008
        brightness_factor = 1.0 + ((seed % 5) - 2) * 0.006
        image = ImageEnhance.Color(image).enhance(color_factor)
        image = ImageEnhance.Contrast(image).enhance(contrast_factor)
        image = ImageEnhance.Brightness(image).enhance(brightness_factor)

        image.save(dst, "WEBP", quality=76, method=4)


img_pattern = re.compile(r'<img\b(?P<attrs>[^>]*?)\s+src="(?P<src>assets/photos/[^"]+)"(?P<tail>[^>]*)>', re.I)
manifest = []
changed_pages = 0
state = {"variant_count": 0}

for html_path in sorted(ROOT.glob("*.html")):
    html = html_path.read_text(encoding="utf-8")
    page_state = {"changed": False}
    page_occurrence = {"count": 0}

    def replace(match: re.Match[str]) -> str:
        tag = match.group(0)
        src = match.group("src")
        if "data-france-photo=\"verified\"" not in tag:
            return tag

        source_match = re.search(r'\s+data-france-source="([^"]*)"', tag, re.I)
        source_src = source_match.group(1) if source_match else src
        source_path = ROOT / source_src
        if not source_path.exists():
            return tag

        page_occurrence["count"] += 1
        alt_match = re.search(r'\s+alt="([^"]*)"', tag, re.I)
        alt = alt_match.group(1) if alt_match else ""
        key = f"{html_path.name}:{page_occurrence['count']}:{source_src}:{alt}"
        seed = int(hashlib.sha256(key.encode("utf-8")).hexdigest()[:8], 16)
        out_name = f"{slugify(html_path.stem)}-{page_occurrence['count']:02d}.webp"
        out_path = OUT_DIR / out_name
        make_variant(source_path, out_path, seed)

        new_src = f"assets/photos/v1/{out_name}"
        new_tag = tag.replace(f'src="{src}"', f'src="{new_src}"')
        new_tag = re.sub(r'\s+width="\d+"', f' width="{TARGET_WIDTH}"', new_tag, count=1)
        new_tag = re.sub(r'\s+height="\d+"', f' height="{TARGET_HEIGHT}"', new_tag, count=1)
        new_tag = re.sub(r'\s+data-france-source="[^"]*"', "", new_tag)
        new_tag = new_tag.replace('data-france-photo="verified"', f'data-france-photo="verified" data-france-source="{source_src}"')

        manifest.append({
            "page": html_path.name,
            "variant": new_src,
            "source": source_src,
            "alt": alt,
            "width": TARGET_WIDTH,
            "height": TARGET_HEIGHT,
        })
        state["variant_count"] += 1
        page_state["changed"] = True
        return new_tag

    updated = img_pattern.sub(replace, html)
    if page_state["changed"] and updated != html:
        html_path.write_text(updated, encoding="utf-8")
        changed_pages += 1

(OUT_DIR / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

md_lines = [
    "# Banque d'images TVF - Version 1.0",
    "",
    "Cette banque regroupe les variantes web utilisées par la version 1.0 du site.",
    "Chaque variante est générée à partir d'une photographie française vérifiée et conserve son fichier source dans l'attribut `data-france-source` des pages HTML.",
    "",
    "| Page | Variante | Source | Usage |",
    "| --- | --- | --- | --- |",
]

for item in manifest:
    md_lines.append(f"| {item['page']} | {item['variant']} | {item['source']} | {item['alt'].replace('|', '/')} |")

(OUT_DIR / "BANQUE_IMAGES_V1.md").write_text("\n".join(md_lines) + "\n", encoding="utf-8")

print(json.dumps({"changed_pages": changed_pages, "variants": state["variant_count"], "manifest": "assets/photos/v1/manifest.json"}, ensure_ascii=False, indent=2))
