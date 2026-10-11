#!/usr/bin/env python3
"""Prepare a doctor's two photos for the site.

  python3 scripts/prep-doctor-images.py <slug> <profile-photo> [<banner-photo>] [--out DIR]

slug    : the doctor's file name without .yaml, e.g. prof-dr-k-m-akhtaruzzaman
profile : the portrait. Cropped to a square around the face (falls back to the upper middle).
banner  : the visiting card. NOT cropped, only shrunk if wider than 1600 px.
Writes <slug>.jpg and <slug>-card.jpg to src/content/doctors/images/ (or --out) and prints the YAML lines.
Never enlarges a photo: a small source stays small and gets a warning.
"""
import sys, os
from PIL import Image, ImageOps
try:
    import cv2, numpy as np
except Exception:   # no OpenCV: fall back to the upper-middle crop
    cv2 = None

def load(path):
    im = ImageOps.exif_transpose(Image.open(path))
    return im.convert('RGB')

def face_square(im):
    w, h = im.size
    faces = []
    try:   # needs opencv-python-headless < 5 (version 5 dropped the cascade classifier)
        gray = cv2.cvtColor(np.array(im), cv2.COLOR_RGB2GRAY)
        cas = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = cas.detectMultiScale(gray, 1.1, 5, minSize=(max(30, w // 12), max(30, w // 12)))
    except Exception:
        faces = []
    side = min(w, h)
    if len(faces):
        x, y, fw, fh = max(faces, key=lambda f: f[2] * f[3])
        cx, cy = x + fw / 2, y + fh / 2 + fh * 0.35      # keep some shoulders below the face
        side = int(min(max(fw * 2.6, side * 0.55), min(w, h)))
        found = True
    else:
        cx, cy, found = w / 2, h * 0.38, False           # portraits: the face is usually in the upper part
    left = int(min(max(cx - side / 2, 0), w - side)); top = int(min(max(cy - side / 2, 0), h - side))
    return im.crop((left, top, left + side, top + side)), found

def main():
    a = [x for x in sys.argv[1:]]
    out = 'src/content/doctors/images'
    if '--out' in a:
        i = a.index('--out'); out = a[i + 1]; del a[i:i + 2]
    if len(a) < 2:
        print(__doc__); sys.exit(1)
    slug, prof = a[0], a[1]; card = a[2] if len(a) > 2 else None
    os.makedirs(out, exist_ok=True)
    im = load(prof); sq, found = face_square(im)
    if sq.width > 800: sq = sq.resize((800, 800), Image.LANCZOS)
    sq.save(f'{out}/{slug}.jpg', quality=92)
    print(f'profile: {im.size} -> {sq.size} square; face {"found" if found else "NOT found (fallback crop, check it by eye)"}')
    if min(im.size) < 400: print('WARNING: profile photo is small (<400 px); it will look soft')
    yaml = [f'photo: ./images/{slug}.jpg']
    if card:
        c = load(card)
        if c.width > 1600: c = c.resize((1600, round(c.height * 1600 / c.width)), Image.LANCZOS)
        c.save(f'{out}/{slug}-card.jpg', quality=90)
        print(f'banner : {c.size} (not cropped)')
        if c.width < 800: print('WARNING: banner is narrow (<800 px); text may be hard to read')
        yaml += [f'banner: ./images/{slug}-card.jpg', 'banner_month: 2026-10-01   # month the card was photographed']
    print('\n'.join(yaml))

if __name__ == '__main__': main()
