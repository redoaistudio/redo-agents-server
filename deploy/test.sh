#!/bin/bash
# Пробный прогон: 1 ролик целиком, но без загрузки на YouTube и без записи в таблицу. Запуск от root: bash deploy/test.sh
cd /opt/redo-agents-server
if [ -z "$REDO_PULLED" ]; then sudo -u redo git pull -q; REDO_PULLED=1 exec bash "$0"; fi
[ -f /etc/redo/.deps-ok ] || { (cd render && npx -y playwright@1.48.2 install-deps chromium >/tmp/deps.log 2>&1) && touch /etc/redo/.deps-ok; }
set -a; . /etc/redo/agents.env; set +a
exec sudo -E -u redo .venv/bin/python -m pipeline.run --n 1 --dry
