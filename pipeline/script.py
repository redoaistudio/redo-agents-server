"""Темы и сценарии AI News: Claude с веб-поиском выбирает свежие ИИ-новости и пишет сценарии по правилам канала."""
import json, re, datetime, anthropic
from .config import env, ANTHROPIC_MODEL, ROOT

RULES = (ROOT / 'content' / 'ainews_rules.md').read_text(encoding='utf-8')

SCHEMA = '''Верни ТОЛЬКО JSON без пояснений:
{"videos":[{
 "slug":"латиница_коротко",
 "story":"о чём новость, 1 фраза по-русски",
 "sources":[{"title":"...","url":"https://..."}],
 "segs":["текст сцены 1 для озвучки", "... всего 6–8 сцен, 90–130 слов суммарно, по-английски"],
 "scenes":[ {"img":"s1","hook":["BREAKING","заголовок до 40 знаков"],"big":["строка 1","строка 2"],"at":"слово из сцены"},
            {"img":"ANCHOR","lt":["ПЛАШКА","подпись"]},
            {"img":"s2","tag":"ТЕГ","big":["...","..."],"at":"слово"} ],
 "image_prompts":{"s1":"Pixar-style 3D animated film still, ..., vertical composition, no text, no logos"},
 "ticker":"3 факта через  •  ",
 "ad":{"seg":4,"off":0.4,"dur":5,"text":"Made with AI · full tool list free · link in profile"},
 "title":"до 60 знаков, факты, 🤯 #shorts",
 "description":"1–2 фразы по фактам + вопрос зрителю + Every video here is made with AI tools. The free AI tool guide is in the channel profile.\\n\\n#ai #ainews ...",
 "tiktok":"короче, без ссылок, + Every video here is made with AI tools. + 4 хэштега",
 "format":"из Словаря","hook":"из Словаря","topic":"из Словаря",
 "disputed": false
}]}
Число scenes = числу segs; первая сцена с hook и ОБЯЗАТЕЛЬНО со своей картинкой s1 (не ANCHOR), у каждой не-ANCHOR сцены есть свой ключ в image_prompts; 1–2 сцены ANCHOR; ссылки на продукт не нужны.'''

def write_scripts(n=3, avoid=(), recent_formats=()):
    c = anthropic.Anthropic(api_key=env('ANTHROPIC_API_KEY', required=True))
    today = datetime.date.today().isoformat()
    msg = (f'Сегодня {today}. Найди {n} свежие (за 48 часов) и проверяемые новости про ИИ для канала AI News и напиши сценарии.\n'
           f'Уже были (не повторять): {", ".join(avoid) or "—"}.\nФорматы прошлых запусков (последние): {", ".join(recent_formats) or "—"}.\n\nПРАВИЛА КАНАЛА:\n{RULES}\n\n{SCHEMA}')
    msgs = [{'role': 'user', 'content': msg}]
    tools = [{'type': 'web_search_20250305', 'name': 'web_search', 'max_uses': 12}]
    usage_in = usage_out = 0
    for attempt in range(6):
        r = c.messages.create(model=ANTHROPIC_MODEL, max_tokens=16000, tools=tools, messages=msgs)
        usage_in += r.usage.input_tokens; usage_out += r.usage.output_tokens
        if r.stop_reason == 'pause_turn':   # долгий веб-поиск: продолжить с того же места
            msgs = msgs + [{'role': 'assistant', 'content': r.content}]; continue
        text = ''.join(b.text for b in r.content if getattr(b, 'type', '') == 'text')
        data = _parse(text)
        if data and data.get('videos'):
            return data['videos'], type('U', (), {'input_tokens': usage_in, 'output_tokens': usage_out})()
        (ROOT / 'reports').mkdir(exist_ok=True); (ROOT / 'reports' / 'last_claude_raw.txt').write_text(text, encoding='utf-8')
        msgs = msgs + [{'role': 'assistant', 'content': r.content},
                       {'role': 'user', 'content': 'Верни сейчас ТОЛЬКО итоговый JSON по схеме, без текста до и после.'}]
    raise RuntimeError('Claude не вернул JSON (см. reports/last_claude_raw.txt)')

def _parse(text):
    t = re.sub(r'```(?:json)?', '', text or '')
    a, b = t.find('{'), t.rfind('}')
    if a < 0 or b <= a: return None
    try: return json.loads(t[a:b + 1])
    except json.JSONDecodeError: return None
