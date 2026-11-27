"""
The picture a link to this site shows when it is pasted somewhere.

Run by hand, like the page renderer, and the output is committed:
`python3 tools/share-card.py`. Nothing in the build depends on Pillow.

It is the front page, flattened. The same two colours, the same hairline,
the name at the size the name is set at, and the portrait bleeding off the
right edge as it does in the corner of the bar. A share card that looks
like a different site than the one it opens is worse than none.

1200x630 and a JPEG, because that is what the places this gets pasted
actually accept. The portrait is a transparent cut-out, so it is
composited onto the paper rather than pasted over it: left as it is, the
alpha flattens to black on the services that do not read it.

Everything here is measured rather than guessed. The first version placed
the lines at numbers that looked right and the longest of them ran into
the portrait, which is the failure that a card is least likely to be
looked at closely enough to catch.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
W, H = 1200, 630
PAPER = (238, 238, 238)
INK = (32, 36, 47)
INK_2 = (78, 84, 100)
RED = (196, 48, 48)

# San Francisco rather than Geist, which is served from Google Fonts and
# is not on this machine. Both are grotesques of the same temperature; at
# the size a preview card is actually looked at, the difference is not one
# anybody will see.
FACE = "/System/Library/Fonts/SFNS.ttf"

RULE_X, TEXT_X = 84, 132
TOP, BOTTOM = 96, H - 96


def face(size, weight):
    f = ImageFont.truetype(FACE, size)
    try:
        f.set_variation_by_axes([weight])
    except Exception:
        pass
    return f


def tracked(draw, xy, text, font, fill, track=0.0):
    """Letter-spaced text, which Pillow does not do and this site does.

    Every uppercase label on the site is tracked out; set solid, these
    lines read as a different typographic system from the page they are
    advertising. Returns the width, because the layout is measured.
    """
    x, y = xy
    for ch in text:
        if draw is not None:
            draw.text((x, y), ch, font=font, fill=fill)
        x += font.getlength(ch) + track
    return x - xy[0] - (track if text else 0)


def width_of(text, font, track):
    return tracked(None, (0, 0), text, font, None, track)


card = Image.new("RGB", (W, H), PAPER)

# The portrait, bottom-aligned and running off the right edge. Its width
# is what decides how much room the words get, so it is settled first.
shot = Image.open(ROOT / "public" / "ivan-ho.webp").convert("RGBA")
scale = 545 / shot.height
shot = shot.resize((round(shot.width * scale), round(shot.height * scale)), Image.LANCZOS)
shot_x = W - shot.width + 40
card.paste(shot, (shot_x, H - shot.height), shot)

d = ImageDraw.Draw(card)

# The hairline down the left, the one piece of furniture the whole site is
# built out of.
d.line([(RULE_X, TOP), (RULE_X, BOTTOM)], fill=INK, width=2)

# How much room there is between the text column and the portrait, with a
# gutter that keeps a descender clear of an ear.
ROOM = shot_x - TEXT_X - 48

EYEBROWS = [
    ("COMPUTER SCIENCE AND MATHEMATICS", INK),
    ("STANFORD UNIVERSITY", INK),
    ("COMPOSER AND PERFORMER", RED),
]

# The largest size at which the longest line still clears the portrait.
# Tracking is a proportion of the size, so it has to be inside the search.
eyebrow_size = 26
while eyebrow_size > 12:
    f = face(eyebrow_size, 500)
    track = eyebrow_size * 0.08
    if max(width_of(t, f, track) for t, _ in EYEBROWS) <= ROOM:
        break
    eyebrow_size -= 1

name_size = 128
while name_size > 40:
    if face(name_size, 600).getlength("Ivan Ho") <= ROOM:
        break
    name_size -= 2

name_font = face(name_size, 600)
eyebrow_font = face(eyebrow_size, 500)
url_font = face(23, 400)

# Set from the rule's top down, so the block is anchored to the furniture
# rather than floating in the middle of the card.
y = TOP + 76
d.text((TEXT_X, y), "Ivan Ho", font=name_font, fill=INK)
y += name_size * 1.18

for text, colour in EYEBROWS:
    tracked(d, (TEXT_X + 4, y), text, eyebrow_font, colour, eyebrow_size * 0.08)
    y += eyebrow_size * 1.7

tracked(d, (TEXT_X + 4, BOTTOM - 40), "ivanlekangho.github.io", url_font, INK_2, 0.4)

out = ROOT / "public" / "share-card.jpg"
card.save(out, "JPEG", quality=86, optimize=True, progressive=True)
print(f"wrote {out.relative_to(ROOT)} — {out.stat().st_size // 1024}KB, "
      f"name {name_size}px, labels {eyebrow_size}px in {ROOM}px")
