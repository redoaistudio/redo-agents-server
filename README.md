# REDO агенты на сервере (пилот: AI News)

Без браузера и без ноутбука: темы и сценарии — Claude по API с веб-поиском, голос — ElevenLabs API, картинки — fal.ai (Seedream 4.5, та же модель, что в Higgsfield), сборка — тот же рендерер, что сейчас (Chromium без окна + ffmpeg), загрузка — YouTube Data API, запись — Sheets API. Проверок «я не робот» нет: везде официальные API.

## Как устроено
`pipeline/run.py` (каждый день 08:31 МСК, systemd-таймер):
1. `script.py` — 3 свежие ИИ-новости и сценарии по `content/ainews_rules.md` (правила канала, реклама только бегущей строкой).
2. `voice.py` — голос + тайминг слов.  3. `images.py` — 4–6 картинок 9:16.  4. `mix.py` — фон и сведение.
5. `render/render.js` — ролик 1080×1920.  6. `youtube.py` — загрузка (спорный факт → Private), метка «ИИ-контент».
7. `sheets.py` — строка в «Результаты роликов».  8. отчёт `reports/ГГГГ-ММ-ДД.md` (формат «Сделано N роликов из M» — его читает диспетчер/дашборд).

## Ключи (`/etc/redo/agents.env`, вписывает Жанна, в репозиторий не попадают)
| Переменная | Где взять |
|---|---|
| ANTHROPIC_API_KEY | console.anthropic.com → API keys |
| ELEVENLABS_API_KEY | elevenlabs.io → Profile → API keys |
| FAL_KEY | fal.ai → Dashboard → Keys (пополнение от $10, списание за картинку ~$0,04) |
| KLING_ACCESS_KEY, KLING_SECRET_KEY | необязательно: запасной вариант, нужен пакет API-кредитов |
| YT_CLIENT_ID, YT_CLIENT_SECRET | Google Cloud, проект redo-dashboard → OAuth-клиент типа Desktop |
| YT_REFRESH_TOKEN | `python3 setup/youtube_token.py <id> <secret>` на Маке, вход под каналом AI News |
| GOOGLE_SERVICE_ACCOUNT_JSON | ключ робота dashboard-reader (у папки таблиц право «Редактор») |

## Запуск
`sudo bash deploy/setup.sh` на Ubuntu 24.04 → вписать ключи → проверка без загрузки: `python -m pipeline.run --n 1 --dry`.

## Стоимость (оценка на 90 роликов в месяц)
картинки ~$18 (450 шт × $0,04), ElevenLabs ~$22 (тариф Creator), Claude API ~$20–45, VPS ~$8–10 → ~$70–95 в месяц.

## Ограничения
- YouTube API: ~6 загрузок в день на проект Google (квота 10 000 единиц) — для 3 роликов AI News хватает.
- TikTok: официальная публикация только после одобрения приложения TikTok; до этого TikTok остаётся через браузер.
