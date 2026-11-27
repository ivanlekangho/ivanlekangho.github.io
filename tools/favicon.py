"""
The tab icon, cut from the headshot.

Run by hand, like the page renderer and the share card, and the output is
committed: `python3 tools/favicon.py`.

A favicon is sixteen pixels across on the tab strip where it matters, so
the portrait cannot be used as it is: head and shoulders at that size is
a dark smudge with no face in it. The crop is the face alone, framed with
just enough room that the chin and the hair both sit inside — the first
attempt cut the chin off at the bottom edge, which at 16px reads as a
blur rather than as a mistake and is therefore easy to ship.

On the red rather than on the transparency it came with. An icon with an
alpha channel is composited onto whatever the browser's tab strip happens
to be, which is dark in dark mode and would have put black hair on near
black; the red is the site's own and makes the tab findable in a row of
twenty white ones.
"""
from PIL import Image
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RED = (196, 48, 48)

# Settled by eye against renderings at 16, 32 and 64, which is the only
# way to settle it: nothing about this crop can be judged at full size.
FACE = (236, 130, 906, 800)

# 16 and 32 are the tab. 180 is what iOS uses when the site is saved to a
# home screen, and it must not be transparent or iOS fills it with black.
SIZES = {"favicon-16.png": 16, "favicon-32.png": 32, "apple-touch-icon.png": 180}

shot = Image.open(ROOT / "public" / "ivan-ho.webp").convert("RGBA")
face = shot.crop(FACE)

card = Image.new("RGB", face.size, RED)
card.paste(face, (0, 0), face)

for name, size in SIZES.items():
    out = ROOT / "public" / name
    card.resize((size, size), Image.LANCZOS).save(out, "PNG", optimize=True)
    print(f"wrote public/{name} — {size}px, {out.stat().st_size // 1024 or 1}KB")
