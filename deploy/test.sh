#!/bin/bash
# Пробный прогон: 1 ролик целиком, но без загрузки на YouTube и без записи в таблицу. Запуск от root: bash deploy/test.sh
cd /opt/redo-agents-server
sudo -u redo git pull -q
set -a; . /etc/redo/agents.env; set +a
exec sudo -E -u redo .venv/bin/python -m pipeline.run --n 1 --dry
