#!/bin/bash
# Пересобрать последний ролик (без чёрных кадров) и выложить его на AI News публично с названием и описанием от Claude.
cd /opt/redo-agents-server
if [ -z "$REDO_PULLED" ]; then sudo -u redo git pull -q; REDO_PULLED=1 exec bash "$0"; fi
set -a; . /etc/redo/agents.env; set +a
D=$(dirname "$(ls -t work/*/*/spec.json | head -1)")
echo "  … пересобираю: $D"
sudo -u redo node render/render.js "$D" || exit 1
sudo -E -u redo .venv/bin/python - "$D" <<'PY'
import json, sys
from pipeline import youtube, sheets
import datetime
d = sys.argv[1]; v = json.load(open(d + '/script.json'))
vid, url = youtube.upload(d + '/video.mp4', v['title'], v['description'], ['ai', 'ainews'], 'public')
print('  ГОТОВО, новый ролик:', url)
try:
    j, r = sheets.rows_for(datetime.date.today().isoformat(), 1, v, len(' '.join(v['segs'])), vid, url, 'public'); print('  таблица:', sheets.log([j], [r]))
except Exception as e: print('  таблица не записана:', e)
PY
