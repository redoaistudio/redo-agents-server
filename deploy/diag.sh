#!/bin/bash
# Диагностика последнего ролика: картинки, сцены, тёмные кадры.
cd /opt/redo-agents-server
D=$(dirname "$(ls -t work/*/*/spec.json | head -1)")
echo "== $D"; ls -la "$D/img"
.venv/bin/python - "$D" <<'PY'
import json, sys, os
from PIL import Image
d = sys.argv[1]; s = json.load(open(d + '/spec.json')); v = json.load(open(d + '/script.json'))
print('scenes:', [x.get('img') for x in s['scenes']])
print('prompts:', list(v.get('image_prompts', {})))
for f in sorted(os.listdir(d + '/img')):
    try:
        im = Image.open(d + '/img/' + f); im.load(); g = im.convert('L').resize((16, 16)); print(f, im.format, im.size, 'яркость', sum(g.getdata()) // 256)
    except Exception as e: print(f, 'ОШИБКА', e)
PY
ls render/img | grep -c af
