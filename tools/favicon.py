"""
The tab icon, cut from the headshot.

Run by hand, like the page renderer and the share card, and the output is
committed: `python3 tools/favicon.py`.

A favicon is sixteen pixels across on the tab strip where it matters, so
the portrait cannot be used as it stands: head and shoulders at that size
is a dark smudge with no face in it. The crop is the face alone, framed
with just enough room that the chin and the hair both sit inside — the
first attempt cut the chin off at the bottom edge, which at 16px reads as
a blur rather than as a mistake and is therefore easy to ship.

The tab icons keep the cut-out's transparency. The worry about that was
dark mode, where black hair sits against a near-black tab strip and
disappears — and it does disappear, checked against Chrome's #35363A and
Safari's darker grey. It turns out not to matter: the face is the part
that identifies it and the face is light, so what reads at 16px is a
head-shaped portrait either way. On a white strip it is cleaner than any
background would be.

The home-screen icon is the exception and has to be. iOS composites an
apple-touch-icon onto black, so a transparent one arrives as a face
floating in a dark square; it gets the site's red instead.

The source is tools/source/headshot-cutout.webp rather than the one in
public/. Same photograph, wider margins, and it is a build input rather
than something the site serves — nothing should ship a 1536px image to
draw a 32px square.
"""
from PIL import Image
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RED = (196, 48, 48)

shot = Image.open(ROOT / "tools" / "source" / "headshot-cutout.webp").convert("RGBA")

# The face, found from the cut-out rather than written down, so a source
# with different margins crops to the same place. Fractions of the
# subject's own box, settled by eye against renderings at 16, 32 and 64 —
# which is the only way to settle them, since nothing about this crop can
# be judged at full size.
left, top, right, bottom = shot.getchannel("A").getbbox()
w, h = right - left, bottom - top
cx = left + w / 2
side = w * 0.634
box = (round(cx - side / 2), round(top - h * 0.042),
       round(cx + side / 2), round(top - h * 0.042 + side))
face = shot.crop(box)

# 16 and 32 are the tab, and keep their transparency.
for size in (16, 32):
    out = ROOT / "public" / f"favicon-{size}.png"
    face.resize((size, size), Image.LANCZOS).save(out, "PNG", optimize=True)
    print(f"wrote public/favicon-{size}.png — {size}px, transparent")

# 180 is iOS, and must not be.
card = Image.new("RGB", face.size, RED)
card.paste(face, (0, 0), face)
out = ROOT / "public" / "apple-touch-icon.png"
card.resize((180, 180), Image.LANCZOS).save(out, "PNG", optimize=True)
print(f"wrote public/apple-touch-icon.png — 180px on the red")
