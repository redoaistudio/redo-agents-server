"""Получить ключи со страницы https://redo-agents-dashboard.vercel.app/keys и записать в /etc/redo/agents.env.
Закрытый ключ RSA живёт только в памяти этого процесса; ключи приходят зашифрованными."""
import base64, hashlib, json, os, secrets, socket, sys, time, urllib.request, urllib.error
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

BASE = "https://redo-agents-dashboard.vercel.app/api/keydrop"
ENV = "/etc/redo/agents.env"
ALLOWED = {"ANTHROPIC_API_KEY", "ELEVENLABS_API_KEY", "KLING_API_KEY", "KLING_ACCESS_KEY", "KLING_SECRET_KEY",
           "YT_AUTH_CODE", "YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN", "FAL_KEY"}

def req(url, data=None):
    r = urllib.request.Request(url, data=json.dumps(data).encode() if data else None,
                               headers={"content-type": "application/json", "user-agent": "redo-server"})
    try:
        with urllib.request.urlopen(r, timeout=20) as f:
            return f.status, f.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()

key = rsa.generate_private_key(public_exponent=65537, key_size=3072)
pub = base64.b64encode(key.public_key().public_bytes(serialization.Encoding.DER,
                       serialization.PublicFormat.SubjectPublicKeyInfo)).decode()
tok = secrets.token_urlsafe(32)
st, body = req(BASE + "?op=pub", {"pub": pub, "tokhash": hashlib.sha256(tok.encode()).hexdigest(), "host": socket.gethostname()})
if st == 409:
    sys.exit("Занято старой попыткой. На странице /keys нажми «сбросить» и запусти команду снова.")
if st != 200:
    sys.exit(f"Не удалось связаться с дашбордом (код {st}).")
fp = json.loads(body)["fp"]
print(f"\n  Готово. Код сервера: {fp}\n  Открой на компьютере: redo-agents-dashboard.vercel.app/keys\n  Вставь ключи и нажми «Отправить». Жду до 30 минут…\n", flush=True)

for _ in range(360):
    time.sleep(5)
    st, body = req(BASE + "?op=box&tok=" + tok)
    if st == 204:
        continue
    if st != 200:
        sys.exit(f"Ошибка при получении (код {st}). Запусти команду снова.")
    box = json.loads(body)["box"]
    ak = key.decrypt(base64.b64decode(box["k"]), padding.OAEP(mgf=padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None))
    keys = json.loads(AESGCM(ak).decrypt(base64.b64decode(box["iv"]), base64.b64decode(box["ct"]), None))
    keys = {k: v.strip().replace("\n", "") for k, v in keys.items() if k in ALLOWED and v.strip()}
    lines = open(ENV).read().splitlines() if os.path.exists(ENV) else []
    code = keys.pop("YT_AUTH_CODE", None)
    if code:   # обменять одноразовый код YouTube на постоянный (refresh) токен
        cur = dict(l.split("=", 1) for l in lines if "=" in l and not l.startswith("#"))
        cid = keys.get("YT_CLIENT_ID") or cur.get("YT_CLIENT_ID"); sec = keys.get("YT_CLIENT_SECRET") or cur.get("YT_CLIENT_SECRET")
        import urllib.parse
        r = urllib.request.Request("https://oauth2.googleapis.com/token", data=urllib.parse.urlencode({
            "code": code, "client_id": cid, "client_secret": sec, "grant_type": "authorization_code",
            "redirect_uri": "https://redo-agents-dashboard.vercel.app/keys"}).encode())
        try:
            with urllib.request.urlopen(r, timeout=30) as f: tj = json.loads(f.read())
            if tj.get("refresh_token"): keys["YT_REFRESH_TOKEN"] = tj["refresh_token"]; print("  YouTube: доступ получен ✓")
            else: print("  YouTube: Google не выдал постоянный токен, нужно разрешить заново")
        except urllib.error.HTTPError as e:
            print("  YouTube: ошибка обмена кода:", json.loads(e.read() or b"{}").get("error_description") or e.code)
    done = set()
    for i, l in enumerate(lines):
        k = l.split("=", 1)[0]
        if k in keys:
            lines[i] = f"{k}={keys[k]}"; done.add(k)
    lines += [f"{k}={v}" for k, v in keys.items() if k not in done]
    old = os.umask(0o077)
    with open(ENV, "w") as f:
        f.write("\n".join(lines) + "\n")
    os.umask(old)
    os.chmod(ENV, 0o600)
    try:
        import pwd; os.chown(ENV, pwd.getpwnam("redo").pw_uid, -1)
    except Exception:
        pass
    print(f"  Ключи получены и сохранены: {len(keys)} шт.\n\n  Что заполнено:")
    for l in lines:
        if "=" in l and not l.startswith("#"):
            k, v = l.split("=", 1)
            print(f"    {k} = {'есть' if v.strip() else 'пусто'}")
    sys.exit(0)
sys.exit("Ключи не пришли за 30 минут. Запусти команду снова.")
