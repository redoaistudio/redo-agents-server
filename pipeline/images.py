"""Картинки через официальный API Kling (без браузера и без проверок Cloudflare)."""
import time, jwt, requests, pathlib
from PIL import Image
from io import BytesIO
from .config import env, KLING_BASE, KLING_MODEL

def _token():
    ak, sk = env('KLING_ACCESS_KEY', required=True), env('KLING_SECRET_KEY', required=True)
    now = int(time.time())
    return jwt.encode({'iss': ak, 'exp': now + 1800, 'nbf': now - 5}, sk, algorithm='HS256', headers={'alg': 'HS256', 'typ': 'JWT'})

def generate(prompt, out_jpg, size=(1080, 1922)):
    h = {'Authorization': 'Bearer ' + _token(), 'Content-Type': 'application/json'}
    r = requests.post(KLING_BASE + '/v1/images/generations', headers=h,
                      json={'model_name': KLING_MODEL, 'prompt': prompt[:2400], 'aspect_ratio': '9:16', 'n': 1}, timeout=60)
    r.raise_for_status(); tid = r.json()['data']['task_id']
    for _ in range(90):
        time.sleep(4)
        g = requests.get(f'{KLING_BASE}/v1/images/generations/{tid}', headers={'Authorization': 'Bearer ' + _token()}, timeout=30).json()['data']
        if g['task_status'] == 'succeed':
            url = g['task_result']['images'][0]['url']
            im = Image.open(BytesIO(requests.get(url, timeout=60).content)).convert('RGB')
            w, hgt = im.size; tw = int(hgt * size[0] / size[1])
            if tw < w: im = im.crop(((w - tw) // 2, 0, (w - tw) // 2 + tw, hgt))
            im.resize(size, Image.LANCZOS).save(out_jpg, quality=92); return out_jpg
        if g['task_status'] == 'failed': raise RuntimeError('Kling: ' + str(g.get('task_status_msg')))
    raise TimeoutError('Kling: картинка не готова за 6 минут')
