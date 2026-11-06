"""Один раз: получить refresh token для загрузки на канал AI News.
Запуск на Маке: python3 youtube_token.py <CLIENT_ID> <CLIENT_SECRET>
Откроется браузер: выбрать аккаунт tukzhanovazhanna@gmail.com и канал AI News, нажать «Разрешить».
Токен запишется в файл yt_refresh_token.txt рядом — его содержимое Жанна сама вставляет в настройки сервера (YT_REFRESH_TOKEN), потом файл удаляет."""
import sys, http.server, urllib.parse, webbrowser, json, urllib.request, pathlib
cid, secret = sys.argv[1], sys.argv[2]; port = 8765; redirect = f'http://localhost:{port}/'
url = 'https://accounts.google.com/o/oauth2/v2/auth?' + urllib.parse.urlencode({'client_id': cid, 'redirect_uri': redirect, 'response_type': 'code',
      'scope': 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly', 'access_type': 'offline', 'prompt': 'consent'})
code = {}
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query); code['c'] = q.get('code', [''])[0]
        self.send_response(200); self.send_header('Content-Type', 'text/html; charset=utf-8'); self.end_headers()
        self.wfile.write('Готово, окно можно закрыть.'.encode())
    def log_message(self, *a): pass
webbrowser.open(url); print('Открываю браузер…'); http.server.HTTPServer(('localhost', port), H).handle_request()
data = urllib.parse.urlencode({'code': code['c'], 'client_id': cid, 'client_secret': secret, 'redirect_uri': redirect, 'grant_type': 'authorization_code'}).encode()
tok = json.load(urllib.request.urlopen('https://oauth2.googleapis.com/token', data))
p = pathlib.Path(__file__).with_name('yt_refresh_token.txt'); p.write_text(tok['refresh_token']); print('Токен сохранён в', p)
