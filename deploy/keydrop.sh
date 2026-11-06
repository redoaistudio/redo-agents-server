#!/bin/bash
# Ключи через страницу дашборда /keys (в консоль Hetzner вставка не работает). Запуск от root: bash deploy/keydrop.sh
cd /opt/redo-agents-server
if [ -z "$REDO_PULLED" ]; then sudo -u redo git pull -q; REDO_PULLED=1 exec bash "$0"; fi
mkdir -p /etc/redo
[ -f /etc/redo/agents.env ] || cp deploy/agents.env.example /etc/redo/agents.env
exec .venv/bin/python deploy/keydrop.py
