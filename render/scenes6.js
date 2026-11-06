// Rebuild of 06.11 AI News agent videos in REDO style
function anchor(tt, d, t) { full(anchorFrame(t), tt, d, { z0: 1.1, z1: 1.15, oy: 0.3 }); }
function sceneOf6(seg, sp, accent) {
  const base = sceneOf(seg, sp.hook ? Object.assign({}, sp, { big: null }) : sp, accent);
  return (tt, d, t) => {
    base(tt, d, t);
    if (sp.hook && sp.big) bigLow(sp.big[0], sp.big[1], tt, Math.max(2.6, (sp.at ? wt(seg, sp.at) : 0) - 0.15), sp.c2);
    if (sp.q) bigQ(sp.q[0], sp.q[1], tt, 0.2, 430);
    if (sp.lt2) lowerThird(sp.lt2[0], sp.lt2[1], tt, Math.max(0.3, d - 2.4));
    if (sp.banner) { const p = inA(tt, sp.bAt || 0.6) * (1 - cl((tt - d + 0.5) / 0.3)); if (p > 0) { ctx.save(); ctx.globalAlpha *= p; ctx.translate(0, (1 - p) * 30); pill('Made with AI · free tool list in profile', W / 2, 1460, 36, 'rgba(10,12,18,.82)', '#fff', 40, 84, 700); ctx.restore(); } }
    if (sp.pillCta) { const lp = inA(tt, wt(seg, 'link') - 0.2); if (lp > 0) { ctx.save(); ctx.globalAlpha *= lp; ctx.translate(0, (1 - lp) * 30); pill('Free AI tool list · link in profile', W / 2, 1460, 40, NB, '#00151a', 44, 96, 800); ctx.restore(); } }
  };
}
function mkCfg6(brand, specs, extra = {}) { const c = mkCfg(brand, specs, extra); c.scenes = specs.map((s, i) => sceneOf6(i, s, extra.accent || '#fff')); return c; }
function tailCta(t) { const e = R.words[R.words.length - 1].b + 0.25; const p = cl((t - e) / 0.4); if (p <= 0) return; ctx.save(); ctx.globalAlpha = 0.6 * p; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); ctx.save(); rise(p); T('Made with AI.', W / 2, 820, 92, '#fff', 800, 'center', -2); T('Every story on this channel.', W / 2, 920, 44, 'rgba(255,255,255,.8)', 600); ctx.restore(); const q = cl((t - e - 0.35) / 0.45); if (q > 0) { ctx.save(); ctx.translate(W / 2, 1100); const sc = 0.6 + 0.4 * eb(q); ctx.scale(sc, sc); ctx.globalAlpha *= cl(q * 2); pill('Get the free AI tool list  →', 0, 0, 46, NB, '#00151a', 50, 116, 800); ctx.restore(); ctx.save(); ctx.globalAlpha *= q; T('link in profile', W / 2, 1210, 34, 'rgba(255,255,255,.75)', 600); ctx.restore(); } }
CFGS.AN_uber = mkCfg6(AN6, [
  { img: 'AN_u1', hook: ['BREAKING', 'AI agents booked Uber rides'], big: ['Just 4 rides', 'booked by AI agents'], at: 'that' },
  { img: 'AN_u2', tag: 'HALLOWEEN WEEK', big: ['~320 million', 'trips and orders'], at: 'three' },
  { img: 'AN_u3', tag: 'UBER EATS', big: ['~500 food orders', 'placed by AI agents'], at: 'five' },
  { img: 'ANCHOR', lt: ['QUICK PAUSE', 'This channel is made with AI'], pillCta: true },
  { img: 'AN_u4', tag: 'THE WILD PART', big: ['Every AI company', 'is talking to Uber'], at: 'every' },
  { img: 'ANCHOR', lt: ['REALITY CHECK', 'A ride in the app: ~50 seconds'] },
  { img: 'AN_u5', big: ['Like the movie "Her"', "AI runs a whole life"], at: 'movie' },
  { img: 'ANCHOR', q: ['Would you let AI', 'book your ride?'], lt2: ['YOUR TURN', 'Tell me in the comments'] },
], { news: 'Uber: AI agents booked about 4 rides and ~500 food orders in Halloween week  •  Uber CEO: AI companies are talking to us  •  Booking in the app takes ~50 seconds' });
CFGS.AN_goncourt = mkCfg6(AN6, [
  { img: 'AN_k3', hook: ['BREAKING', 'A prize novel hides a ChatGPT line'], big: ['Top book prize', 'ChatGPT inside'], at: 'chatgpt' },
  { img: 'AN_k2', tag: 'PRIX GONCOURT 2026', big: ['Prix Goncourt', 'won this week'], at: 'won' },
  { img: 'ANCHOR', lt: ['ON FRENCH RADIO', 'He used AI 3 times'] },
  { img: 'AN_k5', tag: 'HOW HE USED IT', big: ['Research · mock answers', '+ one hidden sentence'], at: 'once', banner: true, bAt: 1.2 },
  { img: 'AN_k1', tag: 'THE WILD PART', big: ['Only 9 jurors', 'reportedly know where'], at: 'nine' },
  { img: 'ANCHOR', lt: ['ALSO', 'Another novel was pulled'] },
  { img: 'AN_k4', tag: 'LIKE SHERLOCK', big: ['The clue was written', 'by a machine'], at: 'clue', banner: true, bAt: 0.8 },
  { img: 'ANCHOR', q: ['Could you spot', 'the sentence?'], lt2: ['YOUR TURN', 'Tell me in the comments'] },
], { news: 'Prix Goncourt winner says he used AI three times on the novel  •  One sentence was written with ChatGPT  •  Only the jurors reportedly know where', tail: true });
CFGS.AN_948 = mkCfg6(AN6, [
  { img: 'AN_o1', hook: ['BREAKING', 'AI found 948 Linux holes'], big: ['948', 'Linux security holes'], at: 'linux' },
  { img: 'ANCHOR', lt: ['SOURCE', 'A claim by OpenAI'] },
  { img: 'AN_o5', tag: 'UNRELEASED MODEL', big: ['2,000+ flaws flagged', '948 working attacks'], at: 'two' },
  { img: 'ANCHOR', lt: ['THE CATCH', 'Needs an account on the machine'] },
  { img: 'AN_o3', big: ['The bill: ~$1.2M', '~$1,280 per bug'], at: 'one' },
  { img: 'AN_o4', tag: 'GOOD NEWS', big: ['100+', 'patched or getting patches'], at: 'over' },
  { img: 'AN_o2', tag: 'LIKE THE MATRIX', big: ['Machines hunting', 'cracks in the code'], at: 'machines' },
  { img: 'ANCHOR', q: ['Would you trust AI', 'to guard your PC?'] },
  { img: 'ANCHOR', lt: ['FREE LIST', 'Every video here is made with AI'], pillCta: true },
], { news: 'OpenAI: its unreleased model found and exploited 948 Linux kernel flaws  •  Attacks need an existing account  •  100+ already patched or in progress' });
