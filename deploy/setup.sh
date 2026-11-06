#!/bin/bash
# Установка на чистый Ubuntu 24.04 (VPS). Запуск: sudo bash deploy/setup.sh
set -e
apt-get update && apt-get install -y python3-pip python3-venv ffmpeg fonts-inter fonts-dejavu-core git curl
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs
useradd -m -s /bin/bash redo 2>/dev/null || true
cd /opt && [ -d redo-agents-server ] || git clone https://github.com/redoaistudio/redo-agents-server.git
chown -R redo:redo /opt/redo-agents-server
sudo -u redo bash -c 'cd /opt/redo-agents-server && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt && cd render && npm init -y >/dev/null && npm i playwright@1.48.2 && npx playwright install --with-deps chromium'
mkdir -p /etc/redo && touch /etc/redo/agents.env && chmod 600 /etc/redo/agents.env && chown redo /etc/redo/agents.env
cp deploy/redo-ainews.service deploy/redo-ainews.timer /etc/systemd/system/ && systemctl daemon-reload && systemctl enable --now redo-ainews.timer
echo "Готово. Ключи вписать в /etc/redo/agents.env (см. README), затем проверка: sudo -u redo /opt/redo-agents-server/.venv/bin/python -m pipeline.run --n 1 --dry"
