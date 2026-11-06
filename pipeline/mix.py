"""Фон и сведение: голос + тихий пэд + пульс, приглушение музыки под голосом (как у нынешних роликов)."""
import json,subprocess,numpy as np,sys
SR=44100; LEAD=0.3; TAIL=1.4
def wav(path,x):
    x=np.clip(x,-1,1); d=(x*32767).astype(np.int16)
    import wave; w=wave.open(path,'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(d.tobytes()); w.close()
chords=[[261.6,329.6,392,493.9],[220,261.6,329.6,392],[174.6,220,261.6,329.6],[196,246.9,293.7,329.6]]
rng=np.random.default_rng(1)
def mix(mp3, v, out):
    tot=v['dur']+LEAD+TAIL; n=int(tot*SR); t=np.arange(n)/SR
    raw=subprocess.run(['ffmpeg','-loglevel','error','-i',mp3,'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
    voice=np.frombuffer(raw,np.float32); vo=np.zeros(n); s=int(LEAD*SR); vo[s:s+len(voice)]=voice[:n-s]
    pad=np.zeros(n)
    for i,tc in enumerate(np.arange(0,tot,4)):
        a=int(tc*SR); b=min(n,int((tc+4.6)*SR)); tt=np.arange(b-a)/SR
        env=np.minimum(1,tt/1.2)*np.clip((4.6-tt)/1.2,0,1)
        for f in chords[i%4]:
            pad[a:b]+=env*(np.sin(2*np.pi*f/2*tt)+0.5*np.sin(2*np.pi*f*tt+0.3))*0.018
    # gentle pulse
    pulse=np.zeros(n)
    for bt in np.arange(0,tot,0.5):
        a=int(bt*SR); L=int(0.12*SR); 
        if a+L<n: tt=np.arange(L)/SR; pulse[a:a+L]+=np.sin(2*np.pi*55*tt)*np.exp(-tt*30)*0.10
    fx=np.zeros(n)
    for sg in v['segs'][1:]:
        at=sg['a']+LEAD-0.35; a=int(at*SR); L=int(0.5*SR)
        if a<0 or a+L>n: continue
        noise=rng.standard_normal(L); win=np.sin(np.pi*np.arange(L)/L)**2
        # crude band sweep: diff + smoothing
        noise=np.convolve(noise,np.ones(6)/6,'same')
        fx[a:a+L]+=noise*win*0.06
    fade=np.clip((tot-t)/1.0,0,1)
    mus=(pad+pulse)*fade
    # duck music under voice
    venv=np.convolve(np.abs(vo),np.ones(4410)/4410,'same'); duck=1-0.45*np.clip(venv/0.05,0,1)
    m=vo*1.0+mus*duck+fx
    m=m/max(1,np.max(np.abs(m))/0.95)
    wav(out,np.stack([m,m],1).reshape(-1))
    return round(tot,2)
