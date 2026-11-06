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
Число scenes = числу segs; первая сцена с hook; 1–2 сцены ANCHOR; ссылки на продукт не нужны.'''

def write_scripts(n=3, avoid=()):
    c = anthropic.Anthropic(api_key=env('ANTHROPIC_API_KEY', required=True))
    today = datetime.date.today().isoformat()
    msg = (f'Сегодня {today}. Найди {n} свежие (за 48 часов) и проверяемые новости про ИИ для канала AI News и напиши сценарии.\n'
           f'Уже были (не повторять): {", ".join(avoid) or "—"}.\n\nПРАВИЛА КАНАЛА:\n{RULES}\n\n{SCHEMA}')
    r = c.messages.create(model=ANTHROPIC_MODEL, max_tokens=16000,
                          tools=[{'type': 'web_search_20250305', 'name': 'web_search', 'max_uses': 12}],
                          messages=[{'role': 'user', 'content': msg}])
    text = ''.join(b.text for b in r.content if getattr(b, 'type', '') == 'text')
    m = re.search(r'\{[\s\S]*\}\s*$', text.strip())
    data = json.loads(m.group(0) if m else text)
    return data['videos'], r.usage
