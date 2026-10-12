// Touch Gregg: pet the egg until it hatches, then keep petting Gregg.
(() => {
  'use strict';
  const main = document.getElementById('scene');
  const mctx = main.getContext('2d');
  const actors = document.createElement('canvas');
  const actx = actors.getContext('2d');
  ctx = mctx;
  const Q = new URLSearchParams(location.search);
  const REC = Q.has('record'), SHOT = Q.get('shot');
  const $ = s => document.querySelector(s);
  const R2 = (a, b) => a + (b - a) * Math.random();
  const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

  // ---------------- palettes ----------------
  const PAL = {
    morning: { sky: [[110, 166, 226], [176, 211, 241], [234, 241, 240]], sun: [0.8, 0.17], sunCol: [255, 251, 238], glow: 0.55, moon: 0, far1: [168, 205, 178], far2: [128, 180, 132], hillTop: [128, 178, 76], hillBase: [46, 98, 36], grass: [[58, 118, 40], [84, 148, 52], [112, 176, 64], [152, 204, 92]], haze: [214, 230, 222], tree: [[86, 128, 62], [42, 84, 42]], cloud: [255, 255, 255], cloudA: 0.85, light: [255, 255, 255], lightA: 0, fog: 0.28, fire: 0, flowers: 1 },
    golden: { sky: [[226, 140, 120], [244, 184, 148], [251, 222, 180]], sun: [0.82, 0.3], sunCol: [255, 242, 214], glow: 0.9, moon: 0, far1: [214, 170, 126], far2: [182, 158, 96], hillTop: [176, 178, 62], hillBase: [72, 102, 30], grass: [[88, 118, 30], [128, 152, 40], [172, 178, 58], [218, 196, 92]], haze: [242, 204, 164], tree: [[104, 110, 48], [58, 72, 32]], cloud: [255, 214, 196], cloudA: 0.65, light: [255, 168, 96], lightA: 0.16, fog: 0.08, fire: 0, flowers: 1 },
    night: { sky: [[8, 16, 56], [22, 42, 108], [50, 78, 142]], sun: [0.2, 0.15], sunCol: [238, 244, 255], glow: 0.5, moon: 1, far1: [34, 56, 98], far2: [20, 46, 72], hillTop: [22, 74, 74], hillBase: [6, 32, 38], grass: [[8, 58, 56], [16, 84, 76], [26, 110, 96], [48, 142, 122]], haze: [40, 70, 122], tree: [[22, 44, 60], [10, 24, 36]], cloud: [70, 92, 156], cloudA: 0.35, light: [70, 92, 204], lightA: 0.32, fog: 0, fire: 1, flowers: 0.35 },
  };
  function mixPal(a, b, t) {
    const o = {};
    for (const k in a) {
      const va = a[k], vb = b[k];
      if (typeof va === 'number') o[k] = va + (vb - va) * t;
      else if (typeof va[0] === 'number') o[k] = mixc(va, vb, t);
      else o[k] = va.map((c, i) => mixc(c, vb[i], t));
    }
    return o;
  }

  // ---------------- state ----------------
  const S = { mode: 'golden', from: 'golden', mt: 1, phase: 'egg', eggPets: 0, greggPets: 0, hatchT: -99, t: 0, muted: false, glasses: false, glassT: -99, legsT: -99 };
  const KEY = 'touch-gregg-v1';
  const hour = new Date().getHours();
  S.mode = S.from = hour >= 5 && hour < 12 ? 'morning' : hour >= 12 && hour < 20 ? 'golden' : 'night';
  if (!REC && !SHOT) { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) { S.eggPets = s.eggPets | 0; S.greggPets = s.greggPets | 0; S.muted = !!s.muted; S.glasses = !!s.glasses; if (s.phase === 'gregg') S.phase = 'gregg'; } } catch (e) { } }
  if (Q.get('mode') && PAL[Q.get('mode')]) S.mode = S.from = Q.get('mode');
  function save() { if (REC || SHOT) return; try { localStorage.setItem(KEY, JSON.stringify({ phase: S.phase === 'egg' ? 'egg' : 'gregg', eggPets: S.eggPets, greggPets: S.greggPets, muted: S.muted, glasses: S.glasses })); } catch (e) { } }
  const EV = []; window.__events = EV;
  const log = (type, extra) => EV.push(Object.assign({ t: +S.t.toFixed(3), type }, extra || {}));

  // ---------------- layout ----------------
  let W = 0, H = 0, DPR = 1;
  const L = { cx: 0, ground: 0, U: 0 };
  const crest = x => H * 0.4 + Math.pow(x / W - 0.42, 2) * H * 0.34;
  let blades = [], splitIdx = 0, flowers = [], stars = [], clouds = [], flies = [], glowFl = [];
  function layout() {
    if (SHOT) { W = +Q.get('w') || 1024; H = +Q.get('h') || 1024; }
    else if (REC) { W = +Q.get('w') || 1080; H = +Q.get('h') || 1080; }
    else { W = window.innerWidth; H = window.innerHeight; }
    DPR = REC || SHOT ? 1 : Math.min(window.devicePixelRatio || 1, 1.75);
    for (const c of [main, actors]) { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); }
    main.style.width = W + 'px'; main.style.height = H + 'px';
    L.cx = W / 2; L.ground = H * 0.7; L.U = Math.min(H * 0.29, W * 0.4) / 1.76;
    if (SHOT === 'banner') { L.cx = W * 0.8; L.ground = H * 0.86; L.U = H * 0.6 / 1.9; }
    if (SHOT === 'social') { L.cx = W * 0.8; L.ground = H * 0.86; L.U = H * 0.5 / 1.9; }
    if (SHOT === 'avatar' || SHOT === 'avatar-egg') { L.cx = W / 2; L.ground = H * 0.9; L.U = H * 0.78 / 1.95; }
    build();
  }
  function build() {
    const k = clamp(W * H / (1080 * 1080), 0.3, 1.4);
    const n = Math.round(6500 * k);
    blades = [];
    for (let i = 0; i < n; i++) {
      const X = Math.random() * (W + 80) - 40, yc = crest(X);
      const d = Math.pow(Math.random(), 0.85);
      const Y = lerp(yc + 1, H + 40, Math.pow(d, 1.3));
      const t = clamp((Y - yc) / (H - yc));
      const s = (5 + 215 * Math.pow(t, 1.85)) * (H / 1080) * R2(0.7, 1.25) * (W < 700 ? 0.85 : 1);
      // clearing around the egg so it reads clearly
      const ex = (X - L.cx) / (L.U * 1.25), ey = (Y - L.ground) / (L.U * 0.45);
      const clear = ex * ex + ey * ey < 1 ? 0.45 : 1;
      blades.push({ X, Y, s: s * clear, w: Math.max(1.1, s * R2(0.05, 0.085)), sh: (Math.random() * 4) | 0, ph: Math.random() * TAU, lean: R2(-0.3, 0.3), t });
    }
    blades.sort((a, b) => a.Y - b.Y);
    splitIdx = blades.findIndex(b => b.Y > L.ground + L.U * 0.04); if (splitIdx < 0) splitIdx = blades.length;
    flowers = [];
    for (let i = 0; i < 70; i++) { const X = Math.random() * W, yc = crest(X); const t = R2(0.12, 0.85); const Y = lerp(yc, H, Math.pow(t, 1.3)); if (Math.abs(X - L.cx) < L.U * 1.2 && Math.abs(Y - L.ground) < L.U * 0.6) continue; flowers.push({ X, Y, t, c: pick(['#FF6B8B', '#E64561', '#B58CFF', '#7C8CFF', '#FFD34E', '#FF9A5A']), s: (3 + 16 * Math.pow(t, 1.6)) * (H / 1080), ph: Math.random() * TAU }); }
    flowers.sort((a, b) => a.Y - b.Y);
    glowFl = []; for (let c = 0; c < 3; c++) { const cxp = R2(0.15, 0.85) * W, cyp = lerp(crest(cxp), H, R2(0.15, 0.45)); for (let i = 0; i < 26; i++) glowFl.push({ X: cxp + R2(-1, 1) * W * 0.06, Y: cyp + R2(-1, 1) * H * 0.02, r: R2(1, 2.4) * (H / 1080), ph: Math.random() * TAU }); }
    stars = []; for (let i = 0; i < 140; i++) stars.push({ x: Math.random() * W, y: Math.random() * H * 0.42, r: R2(0.5, 1.6) * (H / 1080) + 0.3, ph: Math.random() * TAU, sp: R2(1, 3) });
    clouds = []; for (let i = 0; i < 6; i++) clouds.push({ x: Math.random() * W, y: R2(0.06, 0.26) * H, w: R2(0.18, 0.32) * W, sp: R2(4, 10) * (W / 1080), seed: Math.random() * 1000 });
    flies = []; for (let i = 0; i < 34; i++) flies.push({ x: Math.random(), y: R2(0.3, 0.95), ph: Math.random() * TAU, sp: R2(0.2, 0.6), r: R2(2, 4.5) * (H / 1080) });
  }

  // ---------------- input ----------------
  const hand = { x: -200, y: -200, down: false, seen: false, vx: 0, ang: 0, press: 0, touch: false, lastMove: -9 };
  const trail = [];
  let petAcc = 0;
  function onMove(x, y, down, touch) {
    const dx = x - hand.x, dy = y - hand.y;
    if (!hand.seen) { hand.x = x; hand.y = y; hand.seen = true; return; }
    hand.vx = lerp(hand.vx, dx, 0.5); hand.x = x; hand.y = y; hand.down = down; hand.touch = touch; hand.lastMove = S.t;
    const lt = trail[trail.length - 1];
    if (!lt || Math.hypot(x - lt.x, y - lt.y) > 10) { trail.push({ x, y, t: S.t }); if (trail.length > 26) trail.shift(); }
    // petting
    const tg = target();
    if (tg && Math.hypot((x - tg.x) / tg.rx, (y - tg.y) / tg.ry) < 1) {
      const dist = Math.min(Math.hypot(dx, dy), tg.rx * 0.6);
      petAcc += dist * (down || touch ? 1 : 0.75);
      const need = tg.rx * 1.4;
      while (petAcc >= need) { petAcc -= need; pet(Math.sign(dx) || 1); }
    }
  }
  function target() {
    if (S.phase === 'egg') return { x: L.cx, y: L.ground - EGG_RY * L.U, rx: EGG_RX * L.U * 1.12, ry: EGG_RY * L.U * 1.08 };
    if (S.phase === 'gregg') { const ext = greggExt(); return { x: L.cx, y: L.ground + 0.12 * L.U - (1.05 + ext) * L.U, rx: 0.78 * L.U, ry: 0.85 * L.U }; }
    return null;
  }
  if (!REC && !SHOT) {
    window.addEventListener('pointermove', e => onMove(e.clientX, e.clientY, e.buttons > 0, e.pointerType === 'touch'), { passive: true });
    window.addEventListener('pointerdown', e => { audioOn(); hand.down = true; hand.touch = e.pointerType === 'touch'; if (hand.touch) { hand.seen = false; onMove(e.clientX, e.clientY, true, true); } }, { passive: true });
    window.addEventListener('pointerup', () => { hand.down = false; }, { passive: true });
    window.addEventListener('pointerleave', () => { hand.x = -300; }, { passive: true });
    window.addEventListener('resize', layout);
  }

  // ---------------- pets ----------------
  const hearts = [], sparks = [], confetti = [], shards = [];
  let wig = 0, wigV = 0, squish = 0, squishV = 0, love = 0, crackShown = 0, shake = 0;
  const CRACKS = [6, 12, 18], HATCH = 24;
  function pet(dir) {
    if (S.phase === 'egg') {
      S.eggPets++; wigV += dir * 2.4; log('pat'); sfx.pat();
      spawnHearts(1 + (Math.random() < 0.35 ? 1 : 0));
      if (CRACKS.includes(S.eggPets)) { shake = 1; log('crack', { n: CRACKS.indexOf(S.eggPets) + 1 }); sfx.crack(); for (let i = 0; i < 10; i++) spawnSpark(L.cx + R2(-1, 1) * L.U * 0.6, L.ground - EGG_RY * L.U * R2(0.7, 1.4), '#FFF2C8'); }
      if (S.eggPets >= HATCH) startHatch();
    } else if (S.phase === 'gregg') {
      S.greggPets++; love = 1; squishV -= 2.2; log('purr'); sfx.pet();
      spawnHearts(1 + (Math.random() < 0.5 ? 1 : 0));
      if (S.greggPets % 4 === 0) { log('chirp'); sfx.chirp(); }
      if (S.greggPets % 12 === 0 && S.t - S.legsT > 3.6) { S.legsT = S.t; log('boing'); sfx.boing(); }
      if (S.greggPets >= 40 && !S.glasses) { S.glasses = true; S.glassT = S.t; log('glasses'); setTimeout(() => sfx.drop(), REC ? 0 : 520); }
    }
    updateUI(); save();
  }
  function spawnHearts(n) { for (let i = 0; i < n; i++) hearts.push({ x: hand.x + R2(-14, 14), y: hand.y - 18, vx: R2(-30, 30), vy: R2(-120, -80), s: R2(16, 26) * (H / 1080) * 1.2, age: 0, life: R2(1.0, 1.5), ph: Math.random() * TAU, col: pick(['#FF5C8A', '#FF7AA2', '#FF4D6D', '#FF9BB8']) }); }
  function spawnSpark(x, y, col, sp = 140) { const a = Math.random() * TAU, v = R2(0.3, 1) * sp; sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, s: R2(5, 13) * (H / 1080) * 1.3, age: 0, life: R2(0.6, 1.2), rot: Math.random() * 3, col }); }
  function startHatch() {
    S.phase = 'hatching'; S.hatchT = S.t; log('pop'); sfx.pop(); shake = 1.4;
    const ex = L.cx, ey = L.ground - EGG_RY * L.U;
    for (let i = 0; i < 70; i++) confetti.push({ x: ex, y: ey, vx: R2(-1, 1) * 620 * (H / 1080), vy: R2(-1100, -420) * (H / 1080), rot: Math.random() * TAU, vr: R2(-9, 9), fl: R2(8, 16), w: R2(9, 15) * (H / 1080), col: pick(['#FF7A3D', '#FFC23D', '#FF5E7E', '#FFFFFF', '#2EC4B6', '#8C6BFF', '#FFE45C']), age: 0, life: R2(2.4, 3.4) });
    for (let i = 0; i < 46; i++) spawnSpark(ex, ey, pick(['#FFFFFF', '#FFE7A8', '#FFC77A']), 520 * (H / 1080));
    for (let i = 0; i < 22; i++) { const q = ZIG[1 + ((Math.random() * 15) | 0)]; const pts = []; const n = 3 + (i % 3), rr = R2(0.05, 0.11); for (let k = 0; k < n; k++) { const a = k / n * TAU + R2(-0.3, 0.3), r = rr * R2(0.6, 1.25); pts.push([Math.cos(a) * r, Math.sin(a) * r]); } shards.push({ x: ex + q[0] * L.U, y: L.ground - (EGG_RY - q[1]) * L.U, vx: R2(-1, 1) * 380 * (H / 1080), vy: R2(-700, -260) * (H / 1080), rot: Math.random() * TAU, vr: R2(-12, 12), pts, col: Math.random() < 0.35 ? pick(SPOT_COL) : '#FBEBD3', gy: L.ground + R2(-0.15, 0.35) * L.U, landed: false }); }
    updateUI(); save();
  }
  function newEgg() { S.phase = 'egg'; S.eggPets = 0; S.greggPets = 0; S.glasses = false; S.legsT = -99; crackShown = 0; shards.length = 0; confetti.length = 0; log('newegg'); sfx.click(); updateUI(); save(); }
  function setMode(m) { if (m === S.mode || !PAL[m]) return; S.from = curModeBlend(); S.mode = m; S.mt = 0; log('mode', { m }); sfx.click(); updateUI(); save(); }
  let blendCache = null;
  function curModeBlend() { return blendCache; }
  function greggExt() { const u = S.t - S.legsT; if (u < 0 || u > 3.4) return 0; if (u < 3.0) return 1.25 * (1 - Math.exp(-10 * u) * Math.cos(16 * u)); return 1.25 * (1 - smooth(3.0, 3.4, u)); }

  // ---------------- audio ----------------
  let AC = null, MG = null, purrG = null;
  function audioOn() { if (REC || SHOT) return; try { if (!AC) { AC = new (window.AudioContext || window.webkitAudioContext)(); MG = AC.createGain(); MG.gain.value = S.muted ? 0 : 0.7; MG.connect(AC.destination); } if (AC.state === 'suspended') AC.resume(); } catch (e) { } }
  function env(g, t0, a, peak, d) { g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(peak, t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d); }
  function tone(type, f0, f1, dur, vol, delay = 0) { if (!AC || S.muted) return; const t0 = AC.currentTime + delay; const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur); env(g, t0, 0.008, vol, dur); o.connect(g); g.connect(MG); o.start(t0); o.stop(t0 + dur + 0.05); }
  function noise(dur, vol, freq, q = 1, delay = 0) { if (!AC || S.muted) return; const t0 = AC.currentTime + delay; const n = Math.floor(AC.sampleRate * dur); const b = AC.createBuffer(1, n, AC.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; const s = AC.createBufferSource(); s.buffer = b; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q; const g = AC.createGain(); env(g, t0, 0.004, vol, dur); s.connect(f); f.connect(g); g.connect(MG); s.start(t0); }
  const sfx = {
    pat() { noise(0.09, 0.22, 900, 0.8); tone('sine', 260, 170, 0.08, 0.12); },
    pet() { noise(0.08, 0.16, 1200, 0.9); tone('sine', 330, 220, 0.09, 0.08); },
    crack() { for (let i = 0; i < 8; i++) noise(0.02, 0.5, 3200, 2, i * 0.018 + Math.random() * 0.01); tone('triangle', 900, 500, 0.12, 0.06); },
    pop() { tone('sine', 140, 40, 0.9, 0.9); noise(0.5, 0.35, 600, 0.5); [84, 88, 91, 96, 100].forEach((m, i) => tone('sine', 440 * Math.pow(2, (m - 69) / 12), 440 * Math.pow(2, (m - 69) / 12), 0.7, 0.12, 0.05 + i * 0.06)); },
    chirp() { const f = R2(820, 1100); tone('sine', f, f * 1.6, 0.16, 0.12); },
    boing() { if (!AC || S.muted) return; const t0 = AC.currentTime; const o = AC.createOscillator(), g = AC.createGain(), l = AC.createOscillator(), lg = AC.createGain(); o.frequency.setValueAtTime(180, t0); o.frequency.exponentialRampToValueAtTime(700, t0 + 0.6); l.frequency.value = 22; lg.gain.setValueAtTime(120, t0); lg.gain.exponentialRampToValueAtTime(1, t0 + 0.7); l.connect(lg); lg.connect(o.frequency); env(g, t0, 0.01, 0.35, 0.7); o.connect(g); g.connect(MG); o.start(t0); l.start(t0); o.stop(t0 + 0.8); l.stop(t0 + 0.8); },
    drop() { tone('sine', 1500, 420, 0.5, 0.1); tone('sine', 110, 45, 1.2, 0.8, 0.5); noise(1.0, 0.18, 6000, 0.4, 0.5); },
    click() { tone('triangle', 1400, 1100, 0.05, 0.07); },
  };

  // ---------------- UI ----------------
  const ui = { hint: $('#hint'), pets: $('#pets'), dots: [...document.querySelectorAll('#dots i')], sound: $('#sound'), egg: $('#newegg') };
  function updateUI() {
    if (!ui.hint) return;
    document.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('on', b.dataset.mode === S.mode));
    document.body.dataset.mode = S.mode;
    const e = S.eggPets;
    let h = 'pet the egg';
    if (S.phase === 'egg') h = e === 0 ? 'pet the egg' : e < 6 ? 'it likes that' : e < 12 ? 'something moved…' : e < 18 ? 'keep going!' : 'almost there!!';
    else if (S.phase === 'hatching') h = '!!!';
    else h = S.greggPets === 0 ? 'say hi to Gregg' : S.glasses ? 'Gregg is too cool now' : S.greggPets < 12 ? 'Gregg loves you' : 'keep petting… something happens every 12';
    ui.hint.textContent = h;
    ui.pets.textContent = S.phase === 'egg' ? `${S.eggPets} / ${HATCH}` : `${S.greggPets}`;
    ui.dots.forEach((d, i) => d.classList.toggle('on', S.phase !== 'egg' || S.eggPets >= (i + 1) * 6));
    document.body.classList.toggle('hatched', S.phase !== 'egg');
    ui.sound.classList.toggle('off', S.muted);
  }
  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { audioOn(); setMode(b.dataset.mode); }));
  if (ui.sound) ui.sound.addEventListener('click', () => { audioOn(); S.muted = !S.muted; if (MG) MG.gain.value = S.muted ? 0 : 0.7; updateUI(); save(); });
  if (ui.egg) ui.egg.addEventListener('click', () => { audioOn(); newEgg(); });

  // ---------------- drawing ----------------
  function drawSky(P) {
    const g = ctx.createLinearGradient(0, 0, 0, H * 0.55); g.addColorStop(0, rgb(P.sky[0])); g.addColorStop(0.55, rgb(P.sky[1])); g.addColorStop(1, rgb(P.sky[2]));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // stars
    if (P.moon > 0.01) for (const s of stars) { const a = P.moon * (0.45 + 0.55 * Math.sin(S.t * s.sp + s.ph)); ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill(); }
    // sun / moon
    const sx = P.sun[0] * W, sy = P.sun[1] * H, sr = Math.min(W, H) * 0.035;
    let gg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 9); gg.addColorStop(0, rgb(P.sunCol, 0.55 * P.glow)); gg.addColorStop(0.25, rgb(P.sunCol, 0.18 * P.glow)); gg.addColorStop(1, rgb(P.sunCol, 0));
    ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = rgb(P.sunCol, 0.97); ctx.beginPath(); ctx.arc(sx, sy, sr, 0, TAU); ctx.fill();
    if (P.moon > 0.01) { ctx.fillStyle = `rgba(190,200,225,${0.35 * P.moon})`; for (const [dx, dy, r] of [[-0.3, -0.2, 0.22], [0.25, 0.15, 0.16], [-0.05, 0.38, 0.12]]) { ctx.beginPath(); ctx.arc(sx + dx * sr, sy + dy * sr, r * sr, 0, TAU); ctx.fill(); } }
    // clouds
    for (const c of clouds) {
      const x = ((c.x + S.t * c.sp) % (W + c.w * 2)) - c.w, y = c.y;
      ctx.save(); ctx.globalAlpha = P.cloudA;
      const lg = ctx.createLinearGradient(0, y - c.w * 0.18, 0, y + c.w * 0.06); lg.addColorStop(0, rgb(mixc(P.cloud, [255, 255, 255], 0.5))); lg.addColorStop(1, rgb(mixc(P.cloud, P.sky[1], 0.35)));
      ctx.fillStyle = lg; ctx.beginPath();
      for (let i = 0; i < 6; i++) { const u = i / 5 - 0.5; const r = c.w * (0.17 - Math.abs(u) * 0.14) * (0.85 + 0.3 * Math.sin(c.seed + i * 1.7)); const cx2 = x + u * c.w * 0.85, cy2 = y - r * 0.5; ctx.moveTo(cx2 + r, cy2); ctx.arc(cx2, cy2, r, 0, TAU); }
      ctx.rect(x - c.w * 0.4, y - c.w * 0.04, c.w * 0.8, c.w * 0.04);
      ctx.fill(); ctx.restore();
    }
  }
  function hillPath(off, amp, freq, ph) { ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W + 10; x += 10) { const y = crest(x) - off * H + Math.sin(x / W * freq + ph) * amp * H; ctx.lineTo(x, y); } ctx.lineTo(W, H); ctx.closePath(); }
  function drawLand(P) {
    hillPath(0.06, 0.025, 5, 1); ctx.fillStyle = rgb(mixc(P.far1, P.haze, 0.35)); ctx.fill();
    hillPath(0.025, 0.018, 7, 3); ctx.fillStyle = rgb(mixc(P.far2, P.haze, 0.2)); ctx.fill();
    if (P.fog > 0.01) { const fg = ctx.createLinearGradient(0, H * 0.3, 0, H * 0.48); fg.addColorStop(0, 'rgba(255,255,255,0)'); fg.addColorStop(0.6, `rgba(255,255,255,${P.fog})`); fg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = fg; ctx.fillRect(0, H * 0.3, W, H * 0.2); }
    // tree on the crest
    const tx = W * 0.4, ty = crest(tx) + 2, ts = H * 0.17;
    ctx.fillStyle = rgb(mixc(P.tree[1], [40, 25, 15], 0.4)); ctx.beginPath(); ctx.moveTo(tx - ts * 0.04, ty); ctx.quadraticCurveTo(tx - ts * 0.02, ty - ts * 0.4, tx - ts * 0.08, ty - ts * 0.62); ctx.lineTo(tx + ts * 0.02, ty - ts * 0.62); ctx.quadraticCurveTo(tx + ts * 0.03, ty - ts * 0.35, tx + ts * 0.05, ty); ctx.fill();
    const blobs = [[0, -0.78, 0.36], [-0.3, -0.66, 0.26], [0.3, -0.68, 0.28], [-0.16, -0.95, 0.24], [0.18, -0.96, 0.25], [0.45, -0.82, 0.18], [-0.45, -0.8, 0.19]];
    for (const [bx, by, br] of blobs) { const X = tx + bx * ts, Y = ty + by * ts, r = br * ts; const g = ctx.createRadialGradient(X - r * 0.4, Y - r * 0.4, r * 0.1, X, Y, r); g.addColorStop(0, rgb(mixc(P.tree[0], [240, 255, 170], 0.25))); g.addColorStop(1, rgb(P.tree[1])); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X, Y, r, 0, TAU); ctx.fill(); }
    // main hill base
    ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W + 10; x += 10) ctx.lineTo(x, crest(x)); ctx.lineTo(W, H); ctx.closePath();
    const g = ctx.createLinearGradient(0, H * 0.36, 0, H); g.addColorStop(0, rgb(mixc(P.hillTop, P.haze, 0.25))); g.addColorStop(0.35, rgb(P.hillTop)); g.addColorStop(1, rgb(P.hillBase));
    ctx.fillStyle = g; ctx.fill();
  }
  function influence(x, y, s) {
    let push = 0, press = 0;
    for (let i = 0; i < trail.length; i++) { const p = trail[i]; const age = S.t - p.t; if (age > 1.8) continue; const r = 60 * (H / 1080) + s * 0.4; const dx = x - p.x; if (dx > r || dx < -r) continue; const dy = (y - p.y) * 1.3; const d2 = dx * dx + dy * dy; if (d2 > r * r) continue; const f = (1 - Math.sqrt(d2) / r) * Math.exp(-age * 2.0); push += (dx >= 0 ? 1 : -1) * f; if (f > press) press = f; }
    return [clamp(push, -1.2, 1.2) * s * 0.6, press];
  }
  const NB = 9;
  function drawGrass(P, i0, i1) {
    if (i1 <= i0) return;
    const yTop = blades[i0].Y, yBot = blades[i1 - 1].Y + 1;
    let band = -1, paths = null, bt = 0;
    const flush = () => { if (!paths) return; for (let k = 0; k < 4; k++) { const hz = Math.pow(1 - bt, 2.2) * 0.55; ctx.fillStyle = rgb(mixc(mixc(P.grass[k], P.hillBase, 0.15 * (1 - bt)), P.haze, hz)); ctx.fill(paths[k]); } };
    for (let i = i0; i < i1; i++) {
      const b = blades[i];
      const nb = Math.min(NB - 1, Math.floor(b.t * NB));
      if (nb !== band) { flush(); band = nb; bt = (nb + 0.5) / NB; paths = [new Path2D(), new Path2D(), new Path2D(), new Path2D()]; }
      let bend = (Math.sin(S.t * 1.5 + b.X * 0.011 + b.Y * 0.006 + b.ph * 0.4) * 0.11 + Math.sin(S.t * 0.6 + b.X * 0.004) * 0.07 + b.lean * 0.25) * b.s;
      let hgt = b.s;
      if (trail.length) { const [pu, pr] = influence(b.X, b.Y - b.s * 0.5, b.s); bend += pu; hgt *= 1 - pr * 0.5; }
      const p = paths[b.sh], hw = b.w * 0.5;
      p.moveTo(b.X - hw, b.Y); p.quadraticCurveTo(b.X - hw * 0.3 + bend * 0.3, b.Y - hgt * 0.55, b.X + bend, b.Y - hgt); p.quadraticCurveTo(b.X + hw * 0.3 + bend * 0.3, b.Y - hgt * 0.55, b.X + hw, b.Y); p.closePath();
    }
    flush();
    // flowers in this range
    for (const f of flowers) {
      if (f.Y < yTop || f.Y >= yBot) continue;
      let bend = Math.sin(S.t * 1.5 + f.X * 0.011 + f.ph) * f.s * 0.6; if (trail.length) bend += influence(f.X, f.Y - f.s * 3, f.s * 5)[0] * 0.3;
      const hx = f.X + bend, hy = f.Y - f.s * 3.2;
      ctx.strokeStyle = rgb(mixc(P.grass[1], P.haze, 0.2)); ctx.lineWidth = Math.max(1, f.s * 0.15); ctx.beginPath(); ctx.moveTo(f.X, f.Y); ctx.quadraticCurveTo(f.X, f.Y - f.s * 1.8, hx, hy); ctx.stroke();
      ctx.save(); ctx.globalAlpha = 0.25 + 0.75 * P.flowers; ctx.fillStyle = f.c;
      for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + f.ph; ctx.beginPath(); ctx.arc(hx + Math.cos(a) * f.s * 0.45, hy + Math.sin(a) * f.s * 0.45, f.s * 0.42, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#FFE9A8'; ctx.beginPath(); ctx.arc(hx, hy, f.s * 0.3, 0, TAU); ctx.fill(); ctx.restore();
    }
  }
  function drawNight(P) {
    if (P.fire < 0.01) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const g of glowFl) { const a = P.fire * (0.5 + 0.5 * Math.sin(S.t * 2 + g.ph)); const r = g.r * 4; const gr = ctx.createRadialGradient(g.X, g.Y, 0, g.X, g.Y, r); gr.addColorStop(0, `rgba(235,255,245,${0.9 * a})`); gr.addColorStop(1, 'rgba(200,255,230,0)'); ctx.fillStyle = gr; ctx.fillRect(g.X - r, g.Y - r, 2 * r, 2 * r); }
    for (const f of flies) { const x = (f.x + 0.04 * Math.sin(S.t * f.sp + f.ph)) * W, y = (f.y + 0.03 * Math.sin(S.t * f.sp * 1.3 + f.ph * 2)) * H; const a = P.fire * (0.35 + 0.65 * Math.max(0, Math.sin(S.t * 1.7 + f.ph))); const r = f.r * 5; const gr = ctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(240,255,140,${a})`); gr.addColorStop(0.25, `rgba(200,255,90,${0.45 * a})`); gr.addColorStop(1, 'rgba(180,255,80,0)'); ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
    ctx.restore();
  }
  function shadowAt(x, y, rx, a) { ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.24); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, `rgba(20,30,10,${a})`); g.addColorStop(1, 'rgba(20,30,10,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, TAU); ctx.fill(); ctx.restore(); }

  // pose for Gregg at time t
  let blinkNext = 2, blinkT = -1, lookX = 0, lookY = 0;
  function greggState() {
    const p = greggPose(); const U = L.U;
    let x = L.cx, y = L.ground + 0.12 * U;
    const T = S.t - S.hatchT;
    if (S.phase === 'hatching' && T < 0.8) {
      const s = clamp(T / 0.8);
      x = L.cx; y = lerp(L.ground - 0.2 * U, L.ground + 0.12 * U, s) - 1.4 * U * 4 * s * (1 - s);
      p.rot = TAU * eio(clamp((s - 0.1) / 0.75)); p.sc = lerp(0.72, 1, smooth(0, 0.3, s)); p.sy = 1 + 0.22 * (1 - smooth(0, 0.4, s)); p.raiseL = p.raiseR = 1; p.expr = 'shock'; p.legL = p.legR = 0.6 * Math.sin(Math.PI * s); p.hat = false;
      return { p, x, y };
    }
    const u = S.phase === 'hatching' ? T - 0.8 : 9;
    p.sy = 1 - 0.27 * Math.exp(-6 * u) * Math.cos(15 * u) + 0.018 * Math.sin(S.t * 2.3);
    p.hat = !(S.phase === 'hatching' && T < 1.1);
    if (S.phase === 'hatching') { const u2 = T - 1.1; if (u2 > 0) p.sy -= 0.12 * Math.exp(-8 * u2) * Math.sin(20 * u2); p.raiseL = p.raiseR = 1 - smooth(0.8, 1.1, T); p.expr = T < 1.0 ? 'shock' : 'happy'; }
    // look at hand
    const tg = target() || { x: L.cx, y: L.ground - U };
    const hx = hand.seen ? clamp((hand.x - x) / (W * 0.35), -1, 1) : 0, hy = hand.seen ? clamp((hand.y - (y - 1.1 * U)) / (H * 0.35), -1, 1) : 0;
    lookX = lerp(lookX, hx, 0.15); lookY = lerp(lookY, hy, 0.15);
    p.lookX = lookX; p.lookY = lookY; p.yaw = lookX * 0.22 * (1 - love);
    p.sy -= squish; p.blush = 0.7 + 0.3 * love;
    if (love > 0.15 && S.phase === 'gregg') { p.expr = 'love'; p.lean = clamp(hand.vx * 0.004, -0.12, 0.12); p.raiseL = p.raiseR = 0.25 * love; }
    // blink
    if (S.t > blinkNext) { blinkT = S.t; blinkNext = S.t + R2(2.2, 4.5); }
    const bd = S.t - blinkT; if (bd >= 0 && bd < 0.14) p.blink = 0.1 + 0.9 * Math.abs(bd - 0.07) / 0.07;
    // legs
    const ext = greggExt(); if (ext > 0.001) { p.ext = ext; const lu = S.t - S.legsT; p.dance = lu * 2.1; p.danceAmt = smooth(0.4, 0.8, lu) * (1 - smooth(2.7, 3.0, lu)); p.raiseL = 0.55 + 0.4 * Math.sin(lu * 13); p.raiseR = 0.55 - 0.4 * Math.sin(lu * 13); p.expr = 'grin'; p.lift = 0.08 * Math.abs(Math.sin(lu * TAU * 1.05)) * p.danceAmt; p.yaw = 0.15 * Math.sin(lu * 6.6) * p.danceAmt; }
    if (S.glasses) { const gu = S.t - S.glassT; p.glass = gu < 0.5 ? -3.0 * (1 - Math.pow(gu / 0.5, 2)) : -0.06 * Math.exp(-9 * (gu - 0.5)) * Math.abs(Math.sin((gu - 0.5) * 18)); if (gu > 0.5 && p.expr !== 'love' && p.expr !== 'grin') p.expr = 'cool'; }
    return { p, x, y };
  }
  function drawActors(P) {
    const U = L.U;
    actx.setTransform(DPR, 0, 0, DPR, 0, 0); actx.clearRect(0, 0, W, H);
    ctx = actx;
    const ex = L.cx, ey = L.ground;
    // egg / cup
    let wobble = wig + (S.phase === 'egg' ? 0.03 * Math.sin(S.t * 2.1) * (0.3 + crackShown) : 0);
    if (S.phase === 'egg' && S.eggPets >= 18) wobble += 0.04 * Math.sin(S.t * 34) * smooth(18, 23, S.eggPets);
    ctx.save(); ctx.translate(ex, ey); ctx.scale(U, U); ctx.rotate(wobble);
    let sy = 1, sx = 1;
    if (S.phase === 'egg') { const pre = smooth(20, 24, S.eggPets); sy = 1 + 0.05 * pre + 0.015 * Math.sin(S.t * 40) * pre; }
    else { const u = S.t - S.hatchT; sy = 1 - 0.12 * Math.exp(-9 * u) * Math.cos(22 * u); sx = 1 + 0.06 * Math.exp(-9 * u) * Math.cos(22 * u); }
    ctx.scale(sx, sy); ctx.translate(0, -EGG_RY);
    const glow = S.phase === 'egg' ? smooth(16, 24, S.eggPets) * (0.75 + 0.25 * Math.sin(S.t * 8)) : 0;
    if (S.phase === 'egg') drawEggPiece('full', wobble * 0.6, crackShown, glow); else drawEggPiece('bottom', 0, 0, 0);
    ctx.restore();
    // gregg
    if (S.phase !== 'egg') {
      const g = greggState();
      ctx.save(); ctx.translate(g.x, g.y); ctx.scale(U, U); drawGregg(g.p); ctx.restore();
      // flying hat
      const T = S.t - S.hatchT;
      if (S.phase === 'hatching' && T < 1.1) {
        const s = T / 1.1; const bx = ex, by = ey - (EGG_RY + 0.45) * U - (4.0 * T - 3.0 * T * T) * U;
        const ax = g.x + 0.02 * U, ay = g.y - 1.5 * g.p.sy * U;
        const w = smooth(0.6, 1, s); const x = lerp(bx, ax, w), y = lerp(by, ay, w), rot = lerp(-2 * TAU * eoc(s), 0.16, w), sc = lerp(1, 0.72, smooth(0.1, 0.9, s));
        ctx.save(); ctx.translate(x, y); ctx.scale(U * sc, U * sc); ctx.rotate(rot); ctx.translate(0, 0.45); drawEggPiece('top', 0, 0, 0); ctx.restore();
      }
    }
    // shards
    for (const s of shards) { ctx.save(); ctx.translate(s.x, s.y); ctx.scale(U, U); ctx.rotate(s.rot); if (s.landed) ctx.scale(1, 0.45); ctx.fillStyle = s.col; ctx.beginPath(); s.pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fill(); ctx.restore(); }
    // mood lighting
    if (P.lightA > 0.01) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = rgb(P.light, P.lightA); ctx.fillRect(0, 0, actors.width, actors.height); ctx.restore(); }
    ctx = mctx;
    // glow from crack before hatching
    if (glow > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const cy2 = ey - EGG_RY * U, r = U * 1.7; const gr = ctx.createRadialGradient(ex, cy2, r * 0.3, ex, cy2, r); gr.addColorStop(0, `rgba(255,200,110,${0.3 * glow})`); gr.addColorStop(1, 'rgba(255,190,100,0)'); ctx.fillStyle = gr; ctx.fillRect(ex - r, cy2 - r, 2 * r, 2 * r); ctx.restore(); }
    ctx.drawImage(actors, 0, 0, W, H);
  }
  function drawFX() {
    const U = L.U, ex = L.cx, ey = L.ground - EGG_RY * U;
    const u = S.t - S.hatchT;
    if (u > 0 && u < 1.3) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const ra = Math.max(0, 1 - u / 1.1);
      for (let i = 0; i < 16; i++) { const ang = i / 16 * TAU + u * 0.35; const len = (2.2 + 3.4 * eoc(clamp(u / 0.5))) * U * (0.75 + 0.25 * Math.sin(i * 7.3)); const gg = ctx.createRadialGradient(ex, ey, 0, ex, ey, len); gg.addColorStop(0, `rgba(255,236,170,${0.5 * ra * ra})`); gg.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + Math.cos(ang - 0.08) * len, ey + Math.sin(ang - 0.08) * len); ctx.lineTo(ex + Math.cos(ang + 0.08) * len, ey + Math.sin(ang + 0.08) * len); ctx.closePath(); ctx.fill(); }
      const fl = Math.max(0, 1 - u / 0.55); if (fl > 0) { const r = (0.8 + 3.2 * eoc(clamp(u / 0.55))) * U; const gg = ctx.createRadialGradient(ex, ey, 0, ex, ey, r); gg.addColorStop(0, `rgba(255,255,245,${0.9 * fl})`); gg.addColorStop(0.3, `rgba(255,226,160,${0.55 * fl})`); gg.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = gg; ctx.fillRect(ex - r, ey - r, 2 * r, 2 * r); }
      const ring = clamp(u / 0.55); if (ring < 1) { ctx.strokeStyle = `rgba(255,245,220,${0.8 * (1 - ring)})`; ctx.lineWidth = (0.12 * (1 - ring) + 0.01) * U; ctx.beginPath(); ctx.ellipse(ex, ey, (0.3 + 3 * eoc(ring)) * U, (0.3 + 3 * eoc(ring)) * U * 0.75, 0, 0, TAU); ctx.stroke(); }
      if (u < 0.12) { ctx.fillStyle = `rgba(255,250,235,${0.35 * (1 - u / 0.12)})`; ctx.fillRect(0, 0, W, H); }
      ctx.restore();
    }
    for (const c of confetti) { ctx.save(); ctx.globalAlpha = 1 - smooth(c.life - 0.6, c.life, c.age); ctx.translate(c.x, c.y); ctx.rotate(c.rot); ctx.scale(Math.cos(c.fl * c.age), 1); ctx.fillStyle = c.col; ctx.fillRect(-c.w / 2, -c.w * 0.8, c.w, c.w * 1.6); ctx.restore(); }
    for (const h of hearts) heart(h.x + Math.sin(h.age * 6 + h.ph) * 10, h.y, h.s * (0.6 + 0.4 * eoc(clamp(h.age / 0.25))), 1 - smooth(h.life * 0.6, h.life, h.age), h.col);
    for (const s of sparks) sparkle(s.x, s.y, s.s * (1 - 0.5 * s.age / s.life), 1 - s.age / s.life, s.rot + s.age * 2, s.col);
    if (S.glasses) { const gu = S.t - S.glassT; if (gu > 0.5 && gu < 1.2) { const g = greggState(); const a = Math.sin(Math.PI * (gu - 0.5) / 0.7); sparkle(g.x - 0.12 * U, g.y - (1.05 + greggExt()) * U, 0.22 * U * a, a, gu * 3, '#FFFFFF'); } }
  }
  function update(dt) {
    S.t += dt;
    if (S.mt < 1) S.mt = Math.min(1, S.mt + dt / 0.9);
    // springs
    wigV += (-wig * 60 - wigV * 6) * dt; wig += wigV * dt; wig = clamp(wig, -0.35, 0.35);
    squishV += (-squish * 120 - squishV * 9) * dt; squish += squishV * dt;
    love = Math.max(0, love - dt * 0.9); shake = Math.max(0, shake - dt * 2.5);
    const target = [0, 0.32, 0.64, 1][CRACKS.filter(c => S.eggPets >= c).length];
    crackShown = lerp(crackShown, target, 1 - Math.exp(-dt * 6));
    if (S.phase === 'hatching' && S.t - S.hatchT > 1.15) { S.phase = 'gregg'; log('ding'); sfx.chirp(); for (let i = 0; i < 9; i++) spawnSpark(L.cx + R2(-0.6, 0.6) * L.U, L.ground - 1.9 * L.U + R2(-0.3, 0.3) * L.U, '#FFF3C8', 200); updateUI(); save(); }
    for (const h of hearts) { h.age += dt; h.x += h.vx * dt; h.y += h.vy * dt; h.vy *= 1 - dt * 0.6; }
    for (const s of sparks) { s.age += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= 1 - dt * 2.5; s.vy = s.vy * (1 - dt * 2.5) + 60 * dt; }
    for (const c of confetti) { c.age += dt; c.vx *= 1 - dt * 1.6; c.vy = c.vy * (1 - dt * 1.6) + 1400 * (H / 1080) * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.rot += c.vr * dt; }
    for (const s of shards) { if (s.landed) continue; s.vy += 2200 * (H / 1080) * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.rot += s.vr * dt; if (s.y > s.gy && s.vy > 0) { s.y = s.gy; s.landed = true; } }
    for (const arr of [hearts, sparks, confetti]) for (let i = arr.length - 1; i >= 0; i--) if (arr[i].age > arr[i].life) arr.splice(i, 1);
    if (Math.random() < dt * 3 && S.phase === 'egg' && S.eggPets >= 18) spawnSpark(L.cx + R2(-0.7, 0.7) * L.U, L.ground - R2(0.3, 1.9) * L.U, '#FFF6DA', 40);
    hand.press = lerp(hand.press, hand.down ? 1 : 0, 1 - Math.exp(-dt * 14));
    hand.ang = lerp(hand.ang, clamp(hand.vx * 0.6, -18, 18), 1 - Math.exp(-dt * 10)); hand.vx *= Math.exp(-dt * 8);
  }
  function render() {
    const from = typeof S.from === 'string' ? PAL[S.from] : S.from;
    const P = S.mt >= 1 ? PAL[S.mode] : mixPal(from, PAL[S.mode], eio(S.mt));
    blendCache = P;
    ctx = mctx; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.save();
    if (shake > 0) ctx.translate(Math.sin(S.t * 71) * shake * 6, Math.cos(S.t * 57) * shake * 5);
    drawSky(P); drawLand(P);
    drawGrass(P, 0, splitIdx);
    shadowAt(L.cx, L.ground + 2, L.U * 0.9, 0.42);
    if (S.phase !== 'egg') shadowAt(L.cx, L.ground + 0.12 * L.U, L.U * 0.7 / (1 + greggExt() * 0.3), 0.4);
    drawActors(P);
    drawGrass(P, splitIdx, blades.length);
    drawNight(P);
    drawFX();
    ctx.restore();
    const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.8); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.22)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    // hand cursor
    const he = document.getElementById('hand');
    if (he) { const vis = hand.seen && hand.x > -100 && (!hand.touch || hand.down || S.t - hand.lastMove < 0.6); he.style.opacity = vis ? 1 : 0; he.style.transform = `translate(${hand.x - 22}px, ${hand.y - 26}px) rotate(${hand.ang}deg) scale(${1 - 0.12 * hand.press}, ${1 - 0.18 * hand.press})`; }
  }
  function tick(dt) { update(dt); render(); }
  window.__rec = { move: (x, y, down) => onMove(x, y, down, false), step: tick, mode: setMode, newEgg, state: () => ({ phase: S.phase, eggPets: S.eggPets, greggPets: S.greggPets, t: S.t }), events: () => EV };

  layout(); updateUI();
  if (SHOT) {
    // static compositions for avatars and banners
    if (SHOT !== 'avatar-egg') { S.phase = 'gregg'; S.hatchT = -99; }
    if (SHOT === 'avatar-egg') { S.eggPets = 18; crackShown = 1; }
    S.t = 5.3; trail.length = 0; hand.seen = false;
    for (let i = 0; i < 3; i++) render();
    window.SHOT_READY = true;
  } else if (!REC) {
    let last = performance.now();
    const loop = now => { const dt = Math.min(0.05, (now - last) / 1000); last = now; tick(dt); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  window.READY = true;
})();
