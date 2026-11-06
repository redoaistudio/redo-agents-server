// Night batch 06.11: generic scene builder (image per segment + tag + big text in the lower band, faces stay clear).
function tagTop(s, tt, at = 0.1, c = '#fff', fg = '#0b0c10') { const p = inA(tt, at, 0.3); if (p <= 0) return; ctx.save(); ctx.globalAlpha *= p; ctx.font = '800 32px ' + F; const w = tw(s, 32, 800, F, 3) + 64; rr(W / 2 - w / 2, 300, w, 68, 34, c); T(s, W / 2, 335, 32, fg, 800, 'center', 3); ctx.restore(); }
function bigLow(l1, l2, tt, at, c2) { if (!l1) return; ctx.save(); rise(inA(tt, at)); ctx.shadowColor = 'rgba(0,0,0,.85)'; ctx.shadowBlur = 34; let s1 = 86; while (tw(l1, s1, 800) > W - 120) s1 -= 4; T(l1, W / 2, 1210, s1, '#fff', 800, 'center', -2); if (l2) { let s2 = 64; while (tw(l2, s2, 800) > W - 120) s2 -= 4; T(l2, W / 2, 1310, s2, c2 || '#FFD400', 800, 'center', -1); } ctx.restore(); }
function sceneOf(seg, sp, accent) {
  return (tt, d, t) => {
    if (sp.hook) hookAnchor(tt, d, t, sp.hook[0], sp.hook[1], sp.img, 2.4, { z0: 1.04, z1: 1.14 });
    else if (sp.img === 'ANCHOR') { anchor(tt, d, t); vignette(); }
    else { full(BR[sp.img], tt, d, sp.zo || (seg % 2 ? { z0: 1.14, z1: 1.03 } : { z0: 1.03, z1: 1.14 })); vignette(); }
    if (sp.lt) lowerThird(sp.lt[0], sp.lt[1], tt, 0.25);
    if (sp.tag) tagTop(sp.tag, tt, sp.hook ? 2.5 : 0.1, accent, accent === '#fff' ? '#0b0c10' : '#fff');
    if (sp.big) bigLow(sp.big[0], sp.big[1], tt, Math.max(0.15, (sp.at ? wt(seg, sp.at) : 0.3) - 0.15), sp.c2);
    if (sp.cta) { const p = inA(tt, 0.2); ctx.save(); ctx.globalAlpha *= 0.55 * p; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); rise(inA(tt, 0.2)); GT('GEO', W / 2, 1180, 150, '#ff6b5b', '#C11E1B', 800, 'center', -6); T('make AI recommend you', W / 2, 1285, 44, 'rgba(255,255,255,.85)', 600); ctx.restore();
      ctx.save(); rise(inA(tt, wt(seg, 'free') - 0.1), 40); rr(110, 1330, 860, 130, 36, 'rgba(10,10,14,.85)'); T('FREE AI Visibility Audit', W / 2, 1396, 54, '#fff', 800); ctx.restore();
      const lp = cl((tt - wt(seg, 'link') + 0.2) / 0.45); if (lp > 0) { ctx.save(); ctx.translate(W / 2, 1560); const sc = 0.6 + 0.4 * eb(lp); ctx.scale(sc, sc); ctx.globalAlpha *= cl(lp * 2); rr(-300, -60, 600, 120, 60, '#C11E1B'); T('Link in profile  →', 0, 3, 50, '#fff', 800); ctx.restore(); } }
  };
}
function mkCfg(brand, specs, extra = {}) { const imgs = [...new Set(specs.map(s => s.img).filter(k => k && k !== 'ANCHOR'))]; return Object.assign({ brand, scenes: specs.map((s, i) => sceneOf(i, s, extra.accent || '#fff')), imgs }, extra); }
const AN6 = Object.assign({}, AI_BRAND, { right: 'NOV 6' });
const PAUSE = { img: 'ANCHOR', lt: ['QUICK PAUSE', 'Free AI tool list · link in profile'] };
const RG_BRAND = { mark: '#C11E1B', markText: 'R', name: 'Redo Growth', right: 'GEO' };
const NC_BRAND = { mark: '#E5262B', markText: 'N', name: 'Night Files', right: 'EP 1' };
CFGS.RG_two_ais = mkCfg(RG_BRAND, [
  { img: 'RG_r1', tag: 'MEET NORA', big: ['Two AI assistants.', 'One tiny café.'], at: 'two' },
  { img: 'RG_r2', tag: 'THE FAST ONE', big: ['"Done."', 'The same ad, 40 times'], at: 'posted' },
  { img: 'RG_r3', tag: 'THE CAREFUL ONE', big: ['"Who are your customers?"', 'a whole minute of questions'], at: 'who' },
  { img: 'RG_r4', tag: '9:40 PM', big: ['"Best café near me?"', "Nora isn't in the answer"], at: 'neither' },
  { img: 'RG_r5', tag: 'HOW AI PICKS', big: ['Clear website · real reviews', 'mentions around the web'], at: 'clear' },
  { img: 'RG_r1', cta: true },
], { accent: '#C11E1B', noCapsFrom: 5 });
CFGS.AN_cost = mkCfg(AN6, [
  { img: 'AN_c1', hook: ['BREAKING', 'What does an AI video cost?'], big: ['"How much is a car?"', 'Depends on the car'], at: 'like' },
  { img: 'AN_c2', tag: 'NOT THE PRICE', big: ['15 sec · 4K · Pixar', 'length · quality · look'], at: 'fifteen' },
  PAUSE,
  { img: 'AN_c4', tag: 'THE REAL PRICE', big: ['The goal.', 'Selling = more versions, more tests'], at: 'goal' },
  { img: 'AN_c5', tag: 'BLACK MIRROR LESSON', big: ['The tool is cheap.', "Knowing what you want isn't."], at: 'tool' },
  { img: 'ANCHOR', lt: ['YOUR TURN', 'What would you make first?'] },
], { news: 'What really sets the price of an AI video  •  Length, 4K and style are just settings  •  Creators: the goal decides the budget' });
CFGS.AN_genie = mkCfg(AN6, [
  { img: 'AN_g1', hook: ['STORY', 'He wanted to make videos full time'], big: ['"Not before you', 'finish school."'], at: 'not' },
  { img: 'AN_g2', tag: '2:00 AM', big: ['1 video a week', 'almost no views'], at: 'one' },
  { img: 'AN_g3', tag: '???', big: ['Future him.', '10 years older'], at: 'ten' },
  { img: 'AN_g4', tag: 'THE ADVICE', big: ['Let AI do', 'the boring parts'], at: 'let' },
  PAUSE,
  { img: 'AN_g6', tag: 'ALADDIN, BUT…', big: ['The wish:', 'more free time'], at: 'wish' },
], { news: 'Viral story: a creator gets advice from his future self  •  Script, voice, visuals, edits: AI does the boring parts' });
CFGS.AN_dayone = mkCfg(AN6, [
  { img: 'AN_d1', hook: ['VIRAL', '12 tiny cartoons, millions of views'], big: ['12 cartoons', '~5M views in 20 days (reported)'], at: 'according' },
  { img: 'AN_d2', tag: 'THE FORMAT', big: ['Stick figure.', 'Black screen.'], at: 'white' },
  { img: 'AN_d3', tag: 'DAY ONE', big: ['No narrator.', 'Captions + music'], at: 'no' },
  PAUSE,
  { img: 'AN_d5', tag: 'WHY IT WORKS', big: ['Simple drawing.', 'Real feeling.'], at: 'drawing' },
  { img: 'AN_d6', tag: 'YOUR TURN', big: ["What's your", 'day one?'], at: "what's" },
], { news: 'Minimal stick-figure cartoons about discipline go viral  •  No narrator, just captions and music' });
CFGS.AN_series = mkCfg(AN6, [
  { img: 'AN_s1', hook: ['TREND', 'AI mini-series made by one person'], big: ['A whole series', 'made by one person'], at: 'made' },
  { img: 'AN_s2', tag: 'STEPS 1–2', big: ["A situation you can't skip", 'a cliffhanger every episode'], at: 'step' },
  { img: 'AN_s3', tag: 'STEPS 3–4', big: ['AI voice', 'AI scenes · camera · sound'], at: 'step' },
  PAUSE,
  { img: 'AN_s5', tag: 'THE CATCH', big: ["Views don't pay alone", 'schedule + real audience'], at: 'views' },
  { img: 'AN_s6', tag: 'YOUR TURN', big: ['What series', 'would you make?'], at: 'what' },
], { news: 'AI mini-series are pulling huge views  •  Idea, script, voice, scenes: a four-step workflow' });
CFGS.NC_700k = mkCfg(NC_BRAND, [
  { img: 'NC_n1', tag: '3:17 AM', big: ['+$700,000', 'just landed in your account'], at: 'seven', c2: '#ff5a4f' },
  { img: 'NC_n2', zo: { z0: 1.32, z1: 1.36, oy: 1 }, tag: 'IT\'S STILL THERE', big: ['A house. A car.', 'No more work.'], at: 'first', c2: '#ff5a4f' },
  { img: 'NC_n3', tag: 'TRANSFER NOTE', big: ['"Contract #17"', 'You never signed one'], at: 'payment', c2: '#ff5a4f' },
  { img: 'NC_n4', tag: 'UNKNOWN NUMBER', big: ['"Wrong transfer.', 'Send it back."'], at: 'wrong', c2: '#ff5a4f' },
  { img: 'NC_n5', tag: 'YOUR BANK', big: ['"Don\'t send anything."', '"You shouldn\'t have called."'], at: 'they', c2: '#ff5a4f' },
  { img: 'NC_n6', tag: '3:57 AM', big: ['The handle', 'starts to turn.'], at: 'handle', c2: '#ff5a4f' },
], { accent: '#E5262B' });
CFGS.NC_700k_np2 = CFGS.NC_700k;
CFGS.NC_shipping = mkCfg(NC_BRAND, [
  { img: 'NC_h1', tag: 'WHY PRICES ROSE', big: ['Part of the answer', 'is in the ocean'], at: 'part' },
  { img: 'NC_h2', tag: 'LATE 2023', big: ['Red Sea attacks', 'ships avoid Suez'], at: 'attacks' },
  { img: 'NC_h3', tag: 'AROUND AFRICA', big: ['~10 extra days', 'more fuel · fewer free ships'], at: "that's" },
  { img: 'NC_h4', tag: 'FREIGHT', big: ['Prices from Asia ↑', 'profit forecasts ↑'], at: 'freight' },
  { img: 'NC_h5', tag: 'HIDDEN IN THE PRICE', big: ['Groceries · car parts', 'even medicine'], at: 'groceries' },
  { img: 'NC_h6', tag: 'YOUR TURN', big: ['Prices climbing', 'where you live?'], at: 'did' },
], { accent: '#E5262B' });
CFGS.NC_holdout = mkCfg(NC_BRAND, [
  { img: 'NC_o1', tag: 'SEATTLE, 2006', big: ['$1,000,000', 'She said no.'], at: 'she' },
  { img: 'NC_o2', tag: 'EDITH MACEFIELD', big: ['A shopping center', 'planned around her home'], at: 'whole' },
  { img: 'NC_o3', tag: 'MORE MONEY?', big: ['Still no.', 'She just wanted to stay'], at: 'still' },
  { img: 'NC_o4', tag: 'SO THEY BUILT', big: ['Around her house', 'on three sides'], at: 'around' },
  { img: 'NC_o5', tag: 'THE TWIST', big: ['The builder', 'became her friend'], at: 'construction' },
  { img: 'NC_o6', tag: 'THE REAL-LIFE "UP" HOUSE', big: ['Would you', 'have sold?'], at: 'would' },
], { accent: '#E5262B' });
CFGS.NC_prison = mkCfg(NC_BRAND, [
  { img: 'NC_p1', tag: 'DAY 1', big: ['The safest place', 'on Earth?'], at: 'safest', c2: '#7CFF6B' },
  { img: 'NC_p2', tag: '30 FT WALLS · 4 TOWERS', big: ['Officer Mike Sullivan', 'night shift'], at: 'officer', c2: '#7CFF6B' },
  { img: 'NC_p3', tag: '11:52 PM', big: ['"Nobody in.', 'Nobody out."'], at: 'nobody', c2: '#7CFF6B' },
  { img: 'NC_p4', tag: 'CAM 07', big: ['The city', 'is falling'], at: 'burning', c2: '#7CFF6B' },
  { img: 'NC_p5', tag: '12:00 AM', big: ['The gate holds.', 'food · water · power'], at: 'holds', c2: '#7CFF6B' },
  { img: 'NC_p6', tag: '3:07 AM', big: ['What did', 'he forget?'], at: 'what', c2: '#7CFF6B' },
], { accent: '#E5262B' });
// v2 06.11: реклама бегущей строкой (без паузы в озвучке), строка поднята в безопасную зону Shorts/TikTok.
const _ticker0 = ticker;
ticker = function (t, text) {
  const y = CFG.tickY || 1800; const ad = CFG.ad && R.segs[CFG.ad.seg] ? CFG.ad : null;
  let a = 0; if (ad) { const s = R.segs[ad.seg].a + (ad.off || 0.4); a = cl((t - s) / 0.35) * (1 - cl((t - s - ad.dur) / 0.35)); }
  rr(0, y, W, 64, 0, 'rgba(10,12,18,.85)');
  ctx.save(); ctx.beginPath(); ctx.rect(190, y, W - 190, 64); ctx.clip();
  if (a < 1) { ctx.save(); ctx.globalAlpha *= 1 - a; const s = text + '   •   '; const w = tw(s, 30, 600); let x = 210 - (t * 110) % w; while (x < W) { T(s, x, y + 33, 30, '#fff', 600, 'left'); x += w; } ctx.restore(); }
  if (a > 0) { ctx.save(); ctx.globalAlpha *= a; ctx.translate(0, (1 - a) * 20); T(ad.text, 210, y + 33, 31, '#fff', 700, 'left'); ctx.restore(); }
  ctx.restore();
  rr(0, y, 190, 64, 0, a > 0.5 ? '#ff3b5c' : NB); T(a > 0.5 ? 'FREE' : 'AI NEWS', 95, y + 33, 28, a > 0.5 ? '#fff' : '#00151a', 800, 'center', 2);
};
const AD_TEXT = 'Made with AI · full tool list free · link in profile';
CFGS.AN_cost2 = mkCfg(AN6, [
  { img: 'AN_c1', hook: ['BREAKING', 'What does an AI video cost?'], big: ['"How much is a car?"', 'Depends on the car'], at: 'like' },
  { img: 'AN_c2', tag: 'NOT THE PRICE', big: ['15 sec · 4K · Pixar', 'length · quality · look'], at: 'fifteen' },
  { img: 'AN_c4', tag: 'THE REAL PRICE', big: ['The goal.', 'Selling = more versions, more tests'], at: 'goal' },
  { img: 'AN_c5', tag: 'BLACK MIRROR LESSON', big: ['The tool is cheap.', "Knowing what you want isn't."], at: 'tool' },
  { img: 'ANCHOR', lt: ['YOUR TURN', 'What would you make first?'] },
], { news: 'What really sets the price of an AI video  •  Length, 4K and style are just settings  •  Creators: the goal decides the budget', tickY: 1430, ad: { seg: 3, off: 0.4, dur: 5, text: AD_TEXT } });
CFGS.AN_genie2 = mkCfg(AN6, [
  { img: 'AN_g1', hook: ['STORY', 'He wanted to make videos full time'], big: ['"Not before you', 'finish school."'], at: 'not' },
  { img: 'AN_g2', tag: '2:00 AM', big: ['1 video a week', 'almost no views'], at: 'one' },
  { img: 'AN_g3', tag: '???', big: ['Future him.', '10 years older'], at: 'ten' },
  { img: 'AN_g4', tag: 'THE ADVICE', big: ['Let AI do', 'the boring parts'], at: 'let' },
  { img: 'AN_g6', tag: 'ALADDIN, BUT…', big: ['The wish:', 'more free time'], at: 'wish' },
], { news: 'Viral story: a creator gets advice from his future self  •  Script, voice, visuals, edits: AI does the boring parts', tickY: 1430, ad: { seg: 3, off: 1.0, dur: 5, text: AD_TEXT } });
