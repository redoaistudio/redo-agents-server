"""Запись роликов в таблицу «Гипотезы связок» через дашборд (/api/log): лист «Журнал AI News» (A–M) и «Результаты роликов» (A–Q).
У сервера нет своего доступа к Google: дашборд пишет от имени своего робота. Сервер подтверждает себя токеном,
который создаётся при первом запуске и хранится только здесь (.logtoken, не в git)."""
import hashlib, os, secrets, requests
from .config import ROOT
BASE = 'https://redo-agents-dashboard.vercel.app/api/log'
TOK = ROOT / '.logtoken'

def _token():
    if TOK.exists(): return TOK.read_text().strip()
    t = secrets.token_urlsafe(32)
    r = requests.post(BASE + '?op=register', json={'tokhash': hashlib.sha256(t.encode()).hexdigest()}, timeout=30)
    if r.status_code != 200: raise RuntimeError(f'регистрация в дашборде: {r.status_code} {r.text[:100]}')
    TOK.write_text(t); os.chmod(TOK, 0o600); return t

def log(journal=None, results=None):
    r = requests.post(BASE, json={'token': _token(), 'journal': journal or [], 'results': results or []}, timeout=60)
    if r.status_code != 200: raise RuntimeError(f'таблица: {r.status_code} {r.text[:200]}')
    return r.json().get('done')

def rows_for(day, n, v, chars, vid, url, privacy):
    """Строка журнала (13 колонок) и строка «Результатов роликов» (17 колонок) для одного ролика."""
    src = ' ; '.join(s.get('url', '') for s in v.get('sources', []))[:1500]
    vis = 'Public' if privacy == 'public' else 'Private — спорный факт'
    journal = [day, n, v['story'], 'бегущая строка', v.get('hook', ''), 'сервер: ' + v['slug'], chars, src, 'готово', 'AI News', url, v.get('hypothesis', ''), vis]
    results = [day, 'AI News', vid, url, v.get('hypothesis', ''), v.get('format', ''), v.get('hook', ''), v.get('topic', ''), '', '', '', '', '', '', '', 'сервер; ' + v['story'], 'YouTube']
    return journal, results
