"""Проверка готового ролика перед загрузкой: нет ли тёмных (чёрных) кусков."""
import subprocess
def dark_seconds(mp4, step=0.5, thr=25):
    """Секунды, где кадр почти чёрный (средняя яркость < thr из 255)."""
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', mp4, '-vf', f'fps={1/step},scale=16:28,format=gray', '-f', 'rawvideo', '-'], capture_output=True, check=True).stdout
    n = 16 * 28; out = []
    for i in range(len(raw) // n):
        fr = raw[i * n:(i + 1) * n]
        if sum(fr) / n < thr: out.append(round(i * step, 1))
    return out
