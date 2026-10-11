"""Crop thesis figures listed in figures.json from build/png/p-NN.png → assets/<id>.png"""
import json, os, sys
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
figs = json.load(open(os.path.join(ROOT, 'figures.json'), encoding='utf-8'))
only = set(sys.argv[1:])
for f in figs:
    if only and f['id'] not in only:
        continue
    im = Image.open(os.path.join(ROOT, 'build', 'png', f"p-{int(f['pdf_page']):02d}.png")).convert('RGB')
    W, H = im.size
    x0, y0, x1, y1 = f['bbox_frac']
    im.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H))).save(os.path.join(ROOT, 'assets', f['id'] + '.png'))
    print(f['id'], f['pdf_page'], f['bbox_frac'])
