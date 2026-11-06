#!/bin/bash
# Вписать ключи на сервер. Запуск: bash /opt/redo-agents-server/deploy/keys.sh
# Ключи вводятся скрыто (на экране не видны). Пустой ввод = оставить как было.
F=/etc/redo/agents.env; [ -f "$F" ] || { cp /opt/redo-agents-server/deploy/agents.env.example "$F"; }
ask() { local k="$1" title="$2" v; read -r -s -p "$title (Enter — пропустить): " v; echo
  [ -z "$v" ] && return; v="${v//$'\r'/}"
  if grep -q "^$k=" "$F"; then sed -i "s|^$k=.*|$k=${v//|/\\|}|" "$F"; else echo "$k=$v" >> "$F"; fi; echo "  ✓ $k сохранён"; }
ask ANTHROPIC_API_KEY "Ключ Claude API (sk-ant-…)"
ask ELEVENLABS_API_KEY "Ключ ElevenLabs (sk_…)"
ask KLING_ACCESS_KEY "Kling Access Key"
ask KLING_SECRET_KEY "Kling Secret Key"
chmod 600 "$F"; chown redo "$F"
echo; echo "Что заполнено:"; grep -E '^[A-Z_]+=' "$F" | sed -E 's/=(.+)$/ = есть/; s/=$/ = пусто/'
