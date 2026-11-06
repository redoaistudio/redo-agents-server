"""Проверка Kling: пробует адреса и модели, печатает ответ (ключ не печатается)."""
import os, requests
key = os.environ.get('KLING_API_KEY') or os.environ.get('KLING_ACCESS_KEY')
print('ключ есть' if key else 'КЛЮЧА НЕТ', '| длина', len(key or ''))
for base in ['https://api-singapore.klingai.com', 'https://api.klingai.com', 'https://api-beijing.klingai.com']:
    for path, body in [('/v1/images/generations', {'model_name': 'kling-v2', 'prompt': 'a red apple', 'aspect_ratio': '9:16', 'n': 1}),
                       ('/v1/images/generations', {'model_name': 'kling-v2-1', 'prompt': 'a red apple', 'aspect_ratio': '9:16', 'n': 1}),
                       ('/v1/images/omni-image', {'prompt': 'a red apple', 'aspect_ratio': '9:16'})]:
        try:
            r = requests.post(base + path, headers={'Authorization': 'Bearer ' + key}, json=body, timeout=30)
            print(r.status_code, base, path, body.get('model_name', ''), '→', r.text[:200].replace('\n', ' '))
            if r.status_code == 200: raise SystemExit
        except requests.RequestException as e:
            print('нет связи', base, e.__class__.__name__)
