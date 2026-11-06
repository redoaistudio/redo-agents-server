#!/bin/bash
# Проверка доступа к YouTube: грузит последний собранный ролик на AI News как ЗАКРЫТЫЙ (private). Никто его не увидит.
cd /opt/redo-agents-server
if [ -z "$REDO_PULLED" ]; then sudo -u redo git pull -q; REDO_PULLED=1 exec bash "$0"; fi
set -a; . /etc/redo/agents.env; set +a
V=$(ls -t work/*/*/video.mp4 2>/dev/null | head -1)
echo "  … гружу закрытым: $V"
sudo -E -u redo .venv/bin/python -c "
from pipeline import youtube
vid, url = youtube.upload('$V', 'TEST server upload (private)', 'test', ['test'], 'private')
print('  ГОТОВО, закрытый ролик:', url)"
