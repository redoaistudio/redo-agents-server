"""Картинки через официальные API (без браузера и без проверок Cloudflare).
По умолчанию fal.ai + Seedream 4.5 — та же модель, что сейчас в Higgsfield, оплата за картинку (~$0,04), без пакетов.
Запасной вариант — Kling API (IMAGE_PROVIDER=kling), у него предоплатные пакеты."""
import time, requests
from io import BytesIO
from PIL import Image
from .config import env, KLING_BASE, KLING_MODEL

FAL_MODEL = env('FAL_MODEL', 'fal-ai/bytedance/seedream/v4.5/text-to-image')

def _save(content, out_jpg, size=(1080, 1922)):
    im = Image.open(BytesIO(content)).convert('RGB'); w, h = im.size; tw = int(h * size[0] / size[1])
    if tw < w: im = im.crop(((w - tw) // 2, 0, (w - tw) // 2 + tw, h))
    elif tw > w: th = int(w * size[1] / size[0]); im = im.crop((0, (h - th) // 2, w, (h - th) // 2 + th))
    im.resize(size, Image.LANCZOS).save(out_jpg, quality=92); return out_jpg

def _fal(prompt, out_jpg):
    r = requests.post('https://fal.run/' + FAL_MODEL, headers={'Authorization': 'Key ' + env('FAL_KEY', required=True)},
                      json={'prompt': prompt, 'image_size': {'width': 1440, 'height': 2560}, 'num_images': 1, 'enable_safety_checker': True}, timeout=300)
    r.raise_for_status(); url = r.json()['images'][0]['url']
    return _save(requests.get(url, timeout=60).content, out_jpg)

def _kling(prompt, out_jpg):
    import jwt
    ak, sk = env('KLING_ACCESS_KEY', required=True), env('KLING_SECRET_KEY', required=True)
    tok = lambda: jwt.encode({'iss': ak, 'exp': int(time.time()) + 1800, 'nbf': int(time.time()) - 5}, sk, algorithm='HS256')
    r = requests.post(KLING_BASE + '/v1/images/generations', headers={'Authorization': 'Bearer ' + tok()},
                      json={'model_name': KLING_MODEL, 'prompt': prompt[:2400], 'aspect_ratio': '9:16', 'n': 1}, timeout=60)
    r.raise_for_status(); tid = r.json()['data']['task_id']
    for _ in range(90):
        time.sleep(4)
        g = requests.get(f'{KLING_BASE}/v1/images/generations/{tid}', headers={'Authorization': 'Bearer ' + tok()}, timeout=30).json()['data']
        if g['task_status'] == 'succeed': return _save(requests.get(g['task_result']['images'][0]['url'], timeout=60).content, out_jpg)
        if g['task_status'] == 'failed': raise RuntimeError('Kling: ' + str(g.get('task_status_msg')))
    raise TimeoutError('Kling: картинка не готова за 6 минут')

def generate(prompt, out_jpg):
    return _kling(prompt, out_jpg) if env('IMAGE_PROVIDER', 'fal') == 'kling' else _fal(prompt, out_jpg)
