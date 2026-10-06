"""Turn scripts/source/photo.jpg into public/portrait.bin for the hero portrait.

The output is a raw 220x240 grid of 8-bit brightness values (row-major). The
browser draws it as signal lines or LED dots, so the photo itself never ships.

    uv run --no-project --with pillow python scripts/make_portrait.py [--preview]

--preview also writes PNG renders of both styles to scripts/preview/.
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "source" / "photo.jpg"
OUT = ROOT / "public" / "portrait.bin"
PREVIEW = ROOT / "scripts" / "preview"

PW, PH = 220, 240

# Hair and beard are as dark as the background curtain, so colour can't find
# them. These outlines (in 220x240 space) are traced by hand for this photo.
HAIR = [(45, 57), (46, 39), (59, 23), (82, 11), (107, 5), (132, 9), (154, 21), (162, 39), (164, 62),
        (161, 87), (154, 86), (146, 64), (136, 54), (107, 50), (82, 57), (68, 71), (64, 93), (55, 104), (50, 82)]
BEARD = [(66, 104), (73, 143), (86, 164), (107, 180), (125, 180), (146, 164), (157, 137), (160, 111),
         (150, 118), (118, 118), (79, 118)]


def crop_head(img: Image.Image) -> Image.Image:
    """Head-and-shoulders crop, centred on the face."""
    w, h = img.size
    cx, top, cw = int(w * 0.455), int(h * 0.085), int(w * 0.66)
    ch = int(cw * PH / PW)
    return img.crop((cx - cw // 2, top, cx + cw // 2, top + ch))


def subject_mask(small: Image.Image) -> Image.Image:
    """Skin is saturated and the shirt is bright; the curtain is dark grey."""
    hsv = small.convert("HSV")
    mask = Image.new("L", (PW, PH))
    hp, mp = hsv.load(), mask.load()
    for y in range(PH):
        for x in range(PW):
            _, s, v = hp[x, y]
            mp[x, y] = 255 if (s > 70 and v > 70) or v > 165 else 0
    return mask.filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(2))


def dark_regions() -> Image.Image:
    dark = Image.new("L", (PW, PH))
    draw = ImageDraw.Draw(dark)
    draw.polygon(HAIR, fill=255)
    draw.polygon(BEARD, fill=255)
    return dark.filter(ImageFilter.GaussianBlur(2))


def brightness_map(img: Image.Image) -> list[list[float]]:
    small = crop_head(img).resize((PW, PH), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.8))
    gray = ImageOps.autocontrast(ImageOps.grayscale(small), cutoff=1).load()
    mask, dark = subject_mask(small).load(), dark_regions().load()
    black, gamma, cap = 0.12, 0.7, 0.85
    rows = []
    for y in range(PH):
        row = []
        for x in range(PW):
            g = gray[x, y] / 255
            v = max(0.0, (g - black) / (1 - black))
            lit = min(cap, v**gamma) / cap * (mask[x, y] / 255)
            dim = (0.26 + 0.25 * g) * (dark[x, y] / 255)  # hair/beard: dim but present
            row.append(max(lit, dim))
        rows.append(row)
    return rows


def render_previews(m: list[list[float]]) -> None:
    PREVIEW.mkdir(exist_ok=True)
    s, bg, fg = 3, (7, 16, 10), (187, 247, 208)

    lines = Image.new("RGB", (PW * s, PH * s), bg)
    d = ImageDraw.Draw(lines)
    for y0 in range(10, PH, 4):
        pts = [(x * s, (y0 - m[y0][min(x, PW - 1)] ** 1.3 * 14) * s) for x in range(0, PW + 1, 2)]
        d.polygon(pts + [(PW * s, (y0 + 10) * s), (0, (y0 + 10) * s)], fill=bg)
        d.line(pts, fill=fg, width=3)
    lines.save(PREVIEW / "lines.png")

    led = Image.new("RGB", (PW * s, PH * s), bg)
    d = ImageDraw.Draw(led)
    step = 4.4
    for j in range(int(PH / step)):
        for i in range(int(PW / step)):
            x, y = 3 + i * step, 3 + j * step
            b = m[int(y)][int(x)]
            r, g = (0.45 + b * 1.75) * s, int(30 + b * 225)
            d.ellipse((x * s - r, y * s - r, x * s + r, y * s + r), fill=(g // 2, g, int(g * 0.7)))
    led.save(PREVIEW / "led.png")


def main() -> None:
    m = brightness_map(Image.open(SRC).convert("RGB"))
    OUT.write_bytes(bytes(int(min(1.0, v) * 255) for row in m for v in row))
    print(f"wrote {OUT.relative_to(ROOT)} ({PW}x{PH})")
    if "--preview" in sys.argv:
        render_previews(m)
        print(f"wrote previews to {PREVIEW.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
