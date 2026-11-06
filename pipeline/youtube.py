"""Загрузка на YouTube через официальный Data API v3 (OAuth refresh token канала AI News)."""
import json, requests
from .config import env, AI_NEWS_CHANNEL

def _access_token():
    r = requests.post('https://oauth2.googleapis.com/token', data={
        'client_id': env('YT_CLIENT_ID', required=True), 'client_secret': env('YT_CLIENT_SECRET', required=True),
        'refresh_token': env('YT_REFRESH_TOKEN', required=True), 'grant_type': 'refresh_token'}, timeout=30)
    r.raise_for_status(); return r.json()['access_token']

def check_channel(tok):
    j = requests.get('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', headers={'Authorization': 'Bearer ' + tok}, timeout=30).json()
    ids = [c['id'] for c in j.get('items', [])]
    if AI_NEWS_CHANNEL not in ids: raise SystemExit(f'Токен не от канала AI News: {ids}. Остановка, на чужой канал не грузим.')

def upload(path, title, description, tags, privacy='public', publish_at=None):
    tok = _access_token(); check_channel(tok)
    status = {'privacyStatus': 'private' if publish_at else privacy, 'selfDeclaredMadeForKids': False, 'containsSyntheticMedia': True}
    if publish_at: status['publishAt'] = publish_at   # RFC3339, ролик выйдет сам
    meta = {'snippet': {'title': title[:100], 'description': description, 'tags': tags, 'categoryId': '28'}, 'status': status}
    init = requests.post('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
                         headers={'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': 'video/mp4'},
                         data=json.dumps(meta), timeout=60)
    init.raise_for_status()
    with open(path, 'rb') as f:
        r = requests.put(init.headers['Location'], data=f, headers={'Authorization': 'Bearer ' + tok, 'Content-Type': 'video/mp4'}, timeout=900)
    r.raise_for_status(); vid = r.json()['id']
    return vid, f'https://youtube.com/shorts/{vid}'
