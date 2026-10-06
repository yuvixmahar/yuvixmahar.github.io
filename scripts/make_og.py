"""Render public/og.png (1200x630), the link-preview card for social sites.

Draws the LED-matrix portrait from public/portrait.bin next to the name.

    uv run --no-project --with pillow python scripts/make_og.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PORTRAIT = ROOT / "public" / "portrait.bin"
OUT = ROOT / "public" / "og.png"
PW, PH = 220, 240
W, H = 1200, 630
BG = (11, 15, 12)

FONTS = [
    "C:/Windows/Fonts/consolab.ttf",
    "/System/Library/Fonts/Menlo.ttc",
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
]


def font(size: int) -> ImageFont.FreeTypeFont:
    for path in FONTS:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    raise FileNotFoundError("no monospace font found; add one to FONTS")


def led_layer(scale: float) -> Image.Image:
    data = PORTRAIT.read_bytes()
    img = Image.new("RGBA", (int(PW * scale), int(PH * scale)), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    step = 4.4
    for j in range(int(PH / step)):
        for i in range(int(PW / step)):
            x, y = 3 + i * step, 3 + j * step
            b = data[int(y) * PW + int(x)] / 255
            r = (0.45 + b * 1.75) * scale
            a = int(255 * (0.08 + b * 0.9))
            cx, cy = x * scale, y * scale
            d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(134, 239, 172, a))
    return img


def main() -> None:
    card = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(card)

    # Faint scope grid.
    for x in range(0, W, 60):
        d.line([(x, 0), (x, H)], fill=(18, 30, 21))
    for y in range(0, H, 60):
        d.line([(0, y), (W, y)], fill=(18, 30, 21))

    # Portrait with a soft phosphor glow.
    leds = led_layer(2.1)
    glow = leds.filter(ImageFilter.GaussianBlur(6))
    px, py = W - leds.width - 70, (H - leds.height) // 2
    card.paste(glow, (px, py), glow)
    card.paste(leds, (px, py), leds)
    d.rounded_rectangle((px - 12, py - 12, px + leds.width + 12, py + leds.height + 12), 14, outline=(31, 58, 37), width=2)

    # Text.
    d.text((80, 170), "> ~ whoami", font=font(28), fill=(74, 222, 128))
    name = "Yuvraj Singh"
    name_font = font(84)
    glow_text = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow_text).text((80, 215), name, font=name_font, fill=(74, 222, 128, 160))
    glow_text = glow_text.filter(ImageFilter.GaussianBlur(10))
    card.paste(glow_text, (0, 0), glow_text)
    d.text((80, 215), name, font=name_font, fill=(236, 253, 245))
    d.text((80, 330), "software engineer // embedded systems", font=font(26), fill=(159, 179, 162))
    d.text((80, 372), "// ai/ml loading_", font=font(26), fill=(167, 139, 250))
    d.text((80, 470), "yuvixmahar.github.io", font=font(26), fill=(95, 111, 97))

    card.save(OUT, optimize=True)
    print(f"wrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
