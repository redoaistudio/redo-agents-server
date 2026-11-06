"""Запись в «Результаты роликов» через Sheets API (сервисный аккаунт с правом редактора на папку таблиц)."""
import json, time, jwt, requests
from .config import env, SHEET_ID

def _token():
    sa = json.loads(env('GOOGLE_SERVICE_ACCOUNT_JSON', required=True)); now = int(time.time())
    a = jwt.encode({'iss': sa['client_email'], 'scope': 'https://www.googleapis.com/auth/spreadsheets', 'aud': 'https://oauth2.googleapis.com/token', 'iat': now, 'exp': now + 3600}, sa['private_key'], algorithm='RS256')
    return requests.post('https://oauth2.googleapis.com/token', data={'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer', 'assertion': a}, timeout=30).json()['access_token']

def append_results(rows):
    """rows: списки по колонкам A–Q листа «Результаты роликов»."""
    r = requests.post(f'https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/' + requests.utils.quote("'Результаты роликов'!A:Q") + ':append',
                      params={'valueInputOption': 'USER_ENTERED', 'insertDataOption': 'INSERT_ROWS'},
                      headers={'Authorization': 'Bearer ' + _token()}, json={'values': rows}, timeout=30)
    r.raise_for_status(); return r.json().get('updates', {}).get('updatedRange')
