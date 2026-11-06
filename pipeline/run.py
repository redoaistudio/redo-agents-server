"""Ежедневный запуск AI News на сервере: темы -> голос -> картинки -> сборка -> YouTube -> таблица -> отчёт.
python -m pipeline.run [--n 3] [--dry]   (--dry: всё, кроме загрузки и записи в таблицу)"""
import argparse, datetime, json, pathlib, subprocess, traceback
from .config import WORK, ROOT
from . import script, voice, images, mix, youtube, sheets

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--n', type=int, default=3); ap.add_argument('--dry', action='store_true'); a = ap.parse_args()
    day = datetime.date.today().isoformat(); out = WORK / day; out.mkdir(parents=True, exist_ok=True)
    rep = [f'# AI News (сервер) — {day}', '']
    done_slugs = [p.name for p in WORK.glob('*/*') if p.is_dir()]
    say = lambda m: print('  …', m, flush=True)
    say('Claude ищет новости и пишет сценарии (2–5 мин)')
    vids, usage = script.write_scripts(a.n, done_slugs[-30:])
    rep.append(f'Claude: вход {usage.input_tokens}, выход {usage.output_tokens} токенов')
    ok = 0
    for i, v in enumerate(vids, 1):
        d = out / f"{i}_{v['slug']}"; (d / 'img').mkdir(parents=True, exist_ok=True)
        try:
            json.dump(v, open(d / 'script.json', 'w'), ensure_ascii=False, indent=1)
            say(f"ролик {i}: {v['story']} — озвучка")
            timing, chars = voice.tts(v['segs'], d / 'voice.mp3', d / 'timing.json')
            mix.mix(str(d / 'voice.mp3'), timing, str(d / 'mix.wav'))
            say(f'ролик {i}: картинки в Kling'); 
            for k, p in v['image_prompts'].items(): images.generate(p, d / 'img' / f'news_{k}.jpg')
            spec = {'right': datetime.date.today().strftime('%b %-d').upper(), 'ticker': v['ticker'], 'scenes': v['scenes'], 'ad': v.get('ad')}
            json.dump(spec, open(d / 'spec.json', 'w'), ensure_ascii=False)
            say(f'ролик {i}: монтаж')
            subprocess.run(['node', str(ROOT / 'render' / 'render.js'), str(d)], check=True)
            line = f"{i}. {v['story']} — голос {chars} симв., картинок {len(v['image_prompts'])}"
            if a.dry: rep.append(line + ' — DRY, не загружено'); ok += 1; continue
            privacy = 'private' if v.get('disputed') else 'public'
            vid, url = youtube.upload(str(d / 'video.mp4'), v['title'], v['description'], ['ai', 'ainews'], privacy)
            sheets.append_results([[day, 'AI News', vid, url, '', v.get('format', ''), v.get('hook', ''), v.get('topic', ''), '', '', '', '', '', '', '', 'сервер; ' + v['story'], 'YouTube']])
            rep.append(f'{line} — {privacy}: {url}'); ok += 1
        except Exception as e:
            rep.append(f"{i}. {v.get('story','?')} — СБОЙ: {e}"); traceback.print_exc()
    rep.insert(2, f'Сделано {ok} роликов из {len(vids)}.')
    (ROOT / 'reports').mkdir(exist_ok=True); (ROOT / 'reports' / f'{day}.md').write_text('\n'.join(rep) + '\n', encoding='utf-8')
    print('\n'.join(rep))

if __name__ == '__main__': main()
