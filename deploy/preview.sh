#!/bin/bash
# Посмотреть последний ролик в браузере: на 20 минут открывает короткую ссылку, потом закрывает порт.
cd /opt/redo-agents-server
V=$(ls -t work/*/*/video.mp4 2>/dev/null | head -1); [ -z "$V" ] && { echo "Роликов ещё нет"; exit 1; }
T=$(tr -dc 'a-z0-9' </dev/urandom | head -c 6)
mkdir -p /tmp/pv/$T && cp "$V" /tmp/pv/$T/video.mp4
ufw allow 8765/tcp >/dev/null 2>&1
echo; echo "  Открой в браузере:  http://46.225.179.70:8765/$T/video.mp4"; echo "  (ссылка работает 20 минут; чтобы закрыть раньше: Ctrl+C)"; echo
timeout 1200 python3 -m http.server 8765 --directory /tmp/pv >/dev/null 2>&1
ufw delete allow 8765/tcp >/dev/null 2>&1; rm -rf /tmp/pv; echo "  Ссылка закрыта."
