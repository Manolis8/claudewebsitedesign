#!/usr/bin/env python3
"""Sample a palette from a hero image.

Usage: palette.py IMAGE [--colors 10]
Prints a quantized palette (most common first) and a 3x5 grid of point samples,
so you can name roles (background, ink, accent) from the real image.
"""
import sys
from PIL import Image

def hexc(c):
    return '#%02X%02X%02X' % c[:3]

def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    n = int(sys.argv[sys.argv.index('--colors') + 1]) if '--colors' in sys.argv else 10
    im = Image.open(sys.argv[1]).convert('RGB')
    small = im.resize((160, max(1, int(160 * im.height / im.width))))
    q = small.quantize(n).convert('RGB').getcolors(1 << 20)
    total = sum(c for c, _ in q)
    print('Quantized palette (share, hex):')
    for count, col in sorted(q, reverse=True):
        print(f'  {count / total:5.1%}  {hexc(col)}')
    print('\nPoint samples (rows top→bottom, cols left→right):')
    w, h = im.size
    for r in range(3):
        row = []
        for c in range(5):
            x, y = int(w * (c + .5) / 5), int(h * (r + .5) / 3)
            px = [im.getpixel((min(w - 1, max(0, x + i)), min(h - 1, max(0, y + j)))) for i in range(-3, 4) for j in range(-3, 4)]
            row.append(hexc(tuple(sum(p[k] for p in px) // len(px) for k in range(3))))
        print('  ' + '  '.join(row))

if __name__ == '__main__':
    main()
