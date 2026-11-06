#!/bin/bash
# Доустановить системные библиотеки для браузера-монтажёра и пересобрать последний ролик (без новых трат на Claude/Kling).
cd /opt/redo-agents-server
if [ -z "$REDO_PULLED" ]; then sudo -u redo git pull -q; REDO_PULLED=1 exec bash "$0"; fi
if [ ! -f /etc/redo/.deps-ok ]; then
  echo "  … ставлю библиотеки для монтажа (1–3 мин)"
  (cd render && npx -y playwright@1.48.2 install-deps chromium >/tmp/deps.log 2>&1) && touch /etc/redo/.deps-ok || { echo "  не получилось, хвост лога:"; tail -5 /tmp/deps.log; }
fi
D=$(dirname "$(ls -t work/*/*/spec.json 2>/dev/null | head -1)")/
echo "  … монтаж: $D"
sudo -u redo node render/render.js "$D" && echo "  ГОТОВО: ${D}video.mp4"
