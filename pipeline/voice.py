"""Голос ElevenLabs с таймингом слов -> mp3 + timing.json (формат рендерера: words/segs/dur)."""
import base64, json, requests
from .config import env, ELEVEN_VOICE

def tts(segs, out_mp3, out_timing, voice=ELEVEN_VOICE):
    text = ' '.join(s.strip() for s in segs)
    r = requests.post(f'https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps',
                      headers={'xi-api-key': env('ELEVENLABS_API_KEY', required=True)},
                      json={'text': text, 'model_id': 'eleven_multilingual_v2',
                            'voice_settings': {'stability': 0.45, 'similarity_boost': 0.8, 'style': 0.3, 'use_speaker_boost': True}}, timeout=180)
    r.raise_for_status(); j = r.json()
    open(out_mp3, 'wb').write(base64.b64decode(j['audio_base64']))
    al = j['alignment']; ch, st, en = al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']
    assert ''.join(ch) == text, 'alignment mismatch'
    words, i = [], 0
    while i < len(ch):
        if ch[i] == ' ': i += 1; continue
        j2 = i
        while j2 < len(ch) and ch[j2] != ' ': j2 += 1
        words.append({'w': text[i:j2], 'a': round(st[i], 3), 'b': round(en[j2 - 1], 3), 'c': i}); i = j2
    seg_out, off = [], 0
    for s in segs:
        s = s.strip(); ws = [w for w in words if off <= w['c'] < off + len(s)]
        seg_out.append({'a': ws[0]['a'], 'b': ws[-1]['b']}); off += len(s) + 1
    timing = {'words': words, 'segs': seg_out, 'dur': words[-1]['b']}
    json.dump(timing, open(out_timing, 'w')); return timing, len(text)
