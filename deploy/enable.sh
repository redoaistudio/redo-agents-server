#!/bin/bash
# Включить ежедневный запуск AI News (05:31 UTC = 08:31 МСК) и перезагрузить сервер для обновлений системы.
cd /opt/redo-agents-server
if [ -z "$REDO_PULLED" ]; then sudo -u redo git pull -q; REDO_PULLED=1 exec bash "$0"; fi
cp deploy/redo-ainews.service deploy/redo-ainews.timer /etc/systemd/system/
systemctl daemon-reload && systemctl enable redo-ainews.timer >/dev/null 2>&1
echo "  Включено. Следующий запуск:"; systemctl list-timers redo-ainews.timer --no-pager | sed -n 2p
echo "  Сервер перезагрузится через 5 секунд (это нормально, окно консоли на минуту погаснет)."; sleep 5; reboot
