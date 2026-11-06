"""Настройки из переменных окружения (файл /etc/redo/agents.env на сервере). Ключи в репозиторий не кладём."""
import os, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
def env(k, default=None, required=False):
    v = os.environ.get(k, default)
    if required and not v: raise SystemExit(f'Нет переменной {k} (см. README, раздел «Ключи»)')
    return v
ANTHROPIC_MODEL = env('ANTHROPIC_MODEL', 'claude-sonnet-5-5')
ELEVEN_VOICE = env('ELEVEN_VOICE', 'CwhRBWXzGAHq8TQ4Fs17')   # голос AI News
KLING_BASE = env('KLING_BASE', 'https://api-singapore.klingai.com')
KLING_MODEL = env('KLING_MODEL', 'kling-v2-1')
AI_NEWS_CHANNEL = 'UCFh4CvBlvyThGUcchTmMBTQ'
SHEET_ID = '1gUvLH_knAoyYrwRCAQCa-9nVrcYBaf8U0_bXAcLjQaI'
WORK = pathlib.Path(env('REDO_WORK', str(ROOT / 'work')))
