// Gregg drawing kit: the spotted egg and Gregg himself.
// Everything is drawn in "units" (Gregg's body is ~1.2 units wide) with y pointing down.
// Uses the global `ctx` set by the app.
var ctx = null;
const TAU = Math.PI * 2;
let _seed = 11;
const rnd = () => { _seed = (_seed * 16807) % 2147483647; return (_seed - 1) / 2147483646; };
const R = (a, b) => a + (b - a) * rnd();
const pick = a => a[Math.floor(rnd() * a.length)];
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, s) => a + (b - a) * s;
const smooth = (a, b, x) => { const s = clamp((x - a) / (b - a)); return s * s * (3 - 2 * s); };
const eio = s => s < .5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2;
const eoc = s => 1 - Math.pow(1 - s, 3);

// ---------------- egg ----------------
const EGG_RX = 0.68, EGG_RY = 0.88, CUT_Y = -0.1;
const eggHW = a => EGG_RX * Math.sin(a) * (1 + 0.1 * Math.cos(a));
const EGG_PTS = [];
for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI; EGG_PTS.push([eggHW(a), EGG_RY * Math.cos(a)]); }
for (let i = 63; i >= 1; i--) { const a = i / 64 * Math.PI; EGG_PTS.push([-eggHW(a), EGG_RY * Math.cos(a)]); }
function eggOutline() { ctx.beginPath(); EGG_PTS.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); }
const SPOT_COL = ['#F07A35', '#E8662B', '#F59A3E', '#D4552A', '#F6B34A'];
const SPOTS = [];
for (let i = 0; i < 24; i++) { const k = (i + 0.5) / 24; SPOTS.push({ a: Math.acos(1 - 2 * k), lon: (i * 2.39996) % TAU, r: i % 3 ? R(0.2, 0.31) : R(0.1, 0.14), col: pick(SPOT_COL), h0: R(0, TAU), h1: R(0.06, 0.14), h2: R(0, TAU), h3: R(0.03, 0.07) }); }
for (let i = 0; i < 26; i++) SPOTS.push({ a: R(0.3, 2.8), lon: R(0, TAU), r: R(0.025, 0.045), col: pick(['#E8662B', '#C9502A', '#F59A3E']), h0: 0, h1: 0.1, h2: 0, h3: 0.05 });
function drawSpot(sp, spin) {
  const l0 = ((sp.lon + spin + Math.PI) % TAU + TAU) % TAU - Math.PI;
  if (Math.abs(l0) > Math.PI / 2 + sp.r * 1.8) return;
  ctx.fillStyle = sp.col; ctx.beginPath();
  for (let k = 0; k <= 30; k++) {
    const ph = k / 30 * TAU;
    const rr = sp.r * (1 + sp.h1 * Math.sin(3 * ph + sp.h0) + sp.h3 * Math.sin(5 * ph + sp.h2));
    const a = clamp(sp.a + rr * Math.sin(ph), 0.03, Math.PI - 0.03);
    const lon = clamp(l0 + rr * Math.cos(ph) / Math.max(0.35, Math.sin(sp.a)), -Math.PI / 2, Math.PI / 2);
    const x = eggHW(a) * Math.sin(lon), y = EGG_RY * Math.cos(a);
    k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath(); ctx.fill();
}
function drawEggSkin(spin) {
  let g = ctx.createRadialGradient(-0.25, -0.35, 0.02, -0.05, 0, 1.15);
  g.addColorStop(0, '#FFFEF8'); g.addColorStop(0.45, '#FCF1DE'); g.addColorStop(0.8, '#F0D9B6'); g.addColorStop(1, '#DCBD94');
  ctx.fillStyle = g; ctx.fillRect(-1, -1.1, 2, 2.2);
  for (const sp of SPOTS) drawSpot(sp, spin);
  ctx.globalCompositeOperation = 'multiply';
  g = ctx.createRadialGradient(-0.22, -0.32, 0.05, -0.05, 0.02, 1.1);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.5, '#FFFFFF'); g.addColorStop(0.82, '#EBDAC4'); g.addColorStop(1, '#C3A07C');
  ctx.fillStyle = g; ctx.fillRect(-1, -1.1, 2, 2.2);
  g = ctx.createLinearGradient(0, 0.4, 0, 0.9); g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#C9AA85');
  ctx.fillStyle = g; ctx.fillRect(-1, 0.4, 2, 0.6);
  ctx.globalCompositeOperation = 'source-over';
  g = ctx.createRadialGradient(-0.2, -0.05, 0.5, -0.2, -0.05, 0.93);
  g.addColorStop(0, 'rgba(210,235,255,0)'); g.addColorStop(0.72, 'rgba(210,235,255,0)'); g.addColorStop(0.92, 'rgba(220,240,255,0.55)'); g.addColorStop(1, 'rgba(220,240,255,0)');
  ctx.fillStyle = g; ctx.fillRect(-1, -1.1, 2, 2.2);
  ctx.save(); ctx.translate(-0.28, -0.46); ctx.rotate(0.45); ctx.scale(1, 1.6);
  g = ctx.createRadialGradient(0, 0, 0, 0, 0, 0.16); g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.45, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 0.16, 0, TAU); ctx.fill(); ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.beginPath(); ctx.ellipse(-0.37, -0.52, 0.032, 0.05, 0.45, 0, TAU); ctx.fill();
}
const ZIG = []; for (let i = 0; i <= 16; i++) ZIG.push([-0.86 + 1.72 * i / 16, CUT_Y + (i % 2 ? -1 : 1) * R(0.05, 0.085) + R(-0.012, 0.012)]);
const BRANCH = [6, 10, 3, 13].map(i => ({ i, pts: [[ZIG[i][0], ZIG[i][1]], [ZIG[i][0] + R(-0.06, 0.06), ZIG[i][1] + (i % 2 ? -1 : 1) * R(0.08, 0.12)], [ZIG[i][0] + R(-0.1, 0.1), ZIG[i][1] + (i % 2 ? -1 : 1) * R(0.16, 0.22)]] }));
function regionPath(top) { ctx.beginPath(); ctx.moveTo(-1.2, top ? -1.3 : 1.3); for (const p of ZIG) ctx.lineTo(p[0], p[1]); ctx.lineTo(1.2, top ? -1.3 : 1.3); ctx.closePath(); }
function crackPath(p) {
  ctx.beginPath();
  for (const dir of [-1, 1]) {
    ctx.moveTo(ZIG[8][0], ZIG[8][1]); const n = p * 8, full = Math.floor(n);
    for (let k = 1; k <= full; k++) { const q = ZIG[8 + dir * k]; ctx.lineTo(q[0], q[1]); }
    if (full < 8) { const a = ZIG[8 + dir * full], b = ZIG[8 + dir * (full + 1)], f = n - full; ctx.lineTo(lerp(a[0], b[0], f), lerp(a[1], b[1], f)); }
  }
  for (const b of BRANCH) { const need = Math.abs(b.i - 8) / 8 + 0.06; const f = clamp((p - need) / 0.25); if (f <= 0) continue; ctx.moveTo(b.pts[0][0], b.pts[0][1]); const q1 = b.pts[1], q2 = b.pts[2]; if (f < 0.5) ctx.lineTo(lerp(b.pts[0][0], q1[0], f * 2), lerp(b.pts[0][1], q1[1], f * 2)); else { ctx.lineTo(q1[0], q1[1]); ctx.lineTo(lerp(q1[0], q2[0], f * 2 - 1), lerp(q1[1], q2[1], f * 2 - 1)); } }
}
// piece: 'full' | 'top' | 'bottom'; drawn around the egg centre (bottom of the egg at y = +EGG_RY)
function drawEggPiece(piece, spin, crack, glow) {
  ctx.save(); eggOutline(); ctx.clip();
  if (piece !== 'full') { regionPath(piece === 'top'); ctx.clip(); }
  drawEggSkin(spin);
  if (piece === 'bottom') {
    const hw = eggHW(Math.acos(CUT_Y / EGG_RY)) * 0.97;
    const g = ctx.createLinearGradient(0, CUT_Y - 0.08, 0, CUT_Y + 0.09);
    g.addColorStop(0, '#C9AB86'); g.addColorStop(1, '#F1DEC0');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, CUT_Y + 0.02, hw, 0.075, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,250,240,0.95)'; ctx.lineWidth = 0.022; ctx.lineJoin = 'round';
    ctx.beginPath(); ZIG.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
  }
  if (piece === 'top') { ctx.strokeStyle = 'rgba(255,250,240,0.9)'; ctx.lineWidth = 0.02; ctx.lineJoin = 'round'; ctx.beginPath(); ZIG.forEach((p, i) => i ? ctx.lineTo(p[0], p[1] - 0.008) : ctx.moveTo(p[0], p[1] - 0.008)); ctx.stroke(); }
  if (crack > 0) {
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    crackPath(crack); ctx.strokeStyle = '#5B2D14'; ctx.lineWidth = 0.024; ctx.stroke();
    if (glow > 0) {
      ctx.globalCompositeOperation = 'lighter'; ctx.shadowColor = `rgba(255,170,50,${glow})`; ctx.shadowBlur = 30 * glow;
      ctx.strokeStyle = `rgba(255,214,120,${glow})`; ctx.lineWidth = 0.02 + 0.02 * glow; crackPath(crack); ctx.stroke();
      ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'source-over';
    }
  }
  ctx.restore();
}

// ---------------- Gregg ----------------
const ORG = { hi: '#FFC08C', mid: '#FA8846', lo: '#E2622A', edge: '#C24E1E' };
function limb(x1, y1, x2, y2, w, col, hi) {
  ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  if (hi) { ctx.strokeStyle = hi; ctx.lineWidth = w * 0.35; ctx.beginPath(); ctx.moveTo(x1 - w * 0.18, y1 - w * 0.12); ctx.lineTo(x2 - w * 0.18, y2 - w * 0.12); ctx.stroke(); }
}
function ball(x, y, r, c1, c2, c3) { const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r); g.addColorStop(0, c1); g.addColorStop(0.55, c2); g.addColorStop(1, c3); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
function sneaker(x, y, dir, ls, ang, far) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang * dir); ctx.scale(dir * ls, 1);
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.roundRect(-0.13, -0.035, 0.4, 0.05, 0.025); ctx.fill();
  ctx.fillStyle = far ? '#D7D9DF' : '#FFFFFF'; ctx.beginPath(); ctx.roundRect(-0.13, -0.075, 0.4, 0.06, 0.03); ctx.fill();
  const ug = ctx.createLinearGradient(0, -0.2, 0, -0.06); ug.addColorStop(0, far ? '#C0283F' : '#FF4D63'); ug.addColorStop(1, far ? '#8E1A2C' : '#D22742');
  ctx.fillStyle = ug; ctx.beginPath(); ctx.moveTo(-0.12, -0.07); ctx.lineTo(-0.12, -0.2); ctx.quadraticCurveTo(-0.02, -0.23, 0.06, -0.17); ctx.quadraticCurveTo(0.22, -0.13, 0.25, -0.07); ctx.closePath(); ctx.fill();
  ctx.fillStyle = far ? '#E6E6EA' : '#FFFFFF'; ctx.beginPath(); ctx.ellipse(0.19, -0.085, 0.065, 0.035, -0.15, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 0.014; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-0.015 + i * 0.035, -0.18 + i * 0.015); ctx.lineTo(0.02 + i * 0.035, -0.165 + i * 0.015); ctx.stroke(); }
  ctx.restore();
}
function ik2(hx, hy, fx, fy, l1, l2, bend) {
  let dx = fx - hx, dy = fy - hy; let d = Math.hypot(dx, dy); const dm = l1 + l2 - 1e-3;
  if (d > dm) { fx = hx + dx / d * dm; fy = hy + dy / d * dm; dx = fx - hx; dy = fy - hy; d = dm; }
  d = Math.max(d, 1e-4); const ux = dx / d, uy = dy / d; const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d); const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  let px = -uy, py = ux; if (px * bend < 0) { px = -px; py = -py; }
  return { kx: hx + ux * a + px * h, ky: hy + uy * a + py * h, fx, fy };
}
function longLegStand(side, hip, p, far) {
  const L = 0.33 + p.ext; const l1 = L * 0.53, l2 = L * 0.53;
  const lift = Math.max(0, Math.sin(p.dance * TAU + (side < 0 ? 0 : Math.PI))) * 0.35 * p.danceAmt;
  const fx = side * (0.3 + 0.08 * p.ext) + side * 0.06 * Math.sin(p.dance * TAU) * p.danceAmt, ankY = -lift - 0.09;
  const k = ik2(hip.x, hip.y, fx, ankY, l1, l2, side);
  const thigh = far ? '#CF5822' : '#F27A38', sock = far ? '#D9DCE3' : '#FFFFFF', stripe = far ? '#A3263A' : '#E8344F';
  const w = 0.13;
  limb(hip.x, hip.y, k.kx, k.ky, w, thigh, far ? null : 'rgba(255,190,130,0.55)');
  const sx = lerp(k.kx, k.fx, 0.28), sy2 = lerp(k.ky, k.fy, 0.28);
  limb(k.kx, k.ky, sx, sy2, w, thigh, null);
  limb(sx, sy2, k.fx, k.fy, w * 1.08, sock, null);
  for (const f of [0.06, 0.15]) { const ax = lerp(sx, k.fx, f), ay = lerp(sy2, k.fy, f), bx = lerp(sx, k.fx, f + 0.045), by = lerp(sy2, k.fy, f + 0.045); ctx.lineCap = 'butt'; ctx.strokeStyle = stripe; ctx.lineWidth = w * 1.1; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); }
  sneaker(k.fx, k.fy + 0.09, side, 0.6, 0, far);
}
function shortLeg(side, p, P3, far) {
  const sw = side < 0 ? p.legL : p.legR;
  const hip = P3(side * 0.24, 0.42, 0); const L = 0.33;
  const an = P3(side * 0.25, 0.42 - L * Math.cos(sw), L * Math.sin(sw));
  const toe = P3(side * 0.25, 0.42 - L * Math.cos(sw), L * Math.sin(sw) + 0.09);
  const c = far ? '#C9531F' : '#E66A2E';
  limb(hip[0], hip[1], an[0], an[1], 0.23, c, far ? null : 'rgba(255,170,110,0.55)');
  const fx = (an[0] + toe[0]) / 2, fy = an[1] + 0.005; const rx = 0.1 + 0.055 * Math.abs(Math.sin(p.yaw));
  ctx.save(); ctx.translate(fx, fy); const g = ctx.createRadialGradient(-0.04, -0.04, 0.01, 0, 0, rx);
  g.addColorStop(0, far ? '#E77A3F' : '#FFA463'); g.addColorStop(1, far ? '#B5481B' : '#D3591F');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, rx, 0.08, 0, 0, TAU); ctx.fill(); ctx.restore();
}
function pixelGlasses(y0) {
  const pat = ['111111111111111111', '011111110011111110', '011111110011111110', '001111100001111100'];
  const hl = [[1, 2], [2, 3], [1, 11], [2, 12]];
  const px = 0.036, w = 18 * px, x0 = -w / 2;
  ctx.fillStyle = '#0A0A0A';
  pat.forEach((row, r) => { for (let c = 0; c < 18; c++) if (row[c] === '1') ctx.fillRect(x0 + c * px - 0.001, y0 + r * px - 0.001, px + 0.002, px + 0.002); });
  ctx.fillRect(x0 - 2 * px, y0, 2 * px, px); ctx.fillRect(x0 + w, y0, 2 * px, px);
  ctx.fillStyle = '#FFFFFF'; for (const [r, c] of hl) ctx.fillRect(x0 + c * px, y0 + r * px, px, px);
}
function greggPose() { return { yaw: 0, rot: 0, lean: 0, sy: 1, sc: 1, raiseL: 0, raiseR: 0, swingL: 0, swingR: 0, legL: 0, legR: 0, blink: 1, wave: 0, waveT: 0, hat: true, ext: 0, lift: 0, dance: 0, danceAmt: 0, expr: 'happy', lookX: 0, lookY: 0, brows: 0, blush: 0.75, glass: null }; }
function drawUpper(p, cy, sn, farLeg, nearLeg) {
  const P3 = (x, y, z) => [x * cy + z * sn, -y, -x * sn + z * cy];
  const arms = [];
  for (const side of [-1, 1]) {
    const raise = side < 0 ? p.raiseL : p.raiseR, swing = side < 0 ? p.swingL : p.swingR;
    let beta = lerp(0.42, 2.55, raise);
    if (side > 0 && p.wave > 0) beta = lerp(beta, 2.6 + 0.38 * Math.sin(p.waveT * 15), p.wave);
    const vx = side * 0.33 * Math.sin(beta), vy0 = -0.33 * Math.cos(beta);
    const vy = vy0 * Math.cos(swing), vz = vy0 * Math.sin(swing) + 0.03;
    const sh = P3(side * 0.55, 0.88, 0.02), hand = P3(side * 0.55 + vx, 0.88 + vy, 0.02 + vz);
    arms.push({ sh, hand, d: sh[2] + vz * 0.5 });
  }
  arms.sort((a, b) => a.d - b.d);
  const drawArm = (a, far) => { limb(a.sh[0], a.sh[1], a.hand[0], a.hand[1], 0.17, far ? '#CF5822' : '#F57C3A', far ? null : 'rgba(255,190,130,0.6)'); ball(a.hand[0], a.hand[1], 0.1, far ? '#F08A4C' : '#FFB27A', far ? '#D9612A' : '#F57C3A', far ? '#B0461A' : '#D35A22'); };
  drawArm(arms[0], true); farLeg();
  const tl = P3(0, 0.62, -0.6); if (tl[2] < 0) ball(tl[0], tl[1], 0.12, '#FFA463', '#E66A2E', '#B5481B');
  const BX = 0, BY = -0.9, RX = 0.6, RY = 0.58;
  ctx.fillStyle = 'rgba(150,55,15,0.55)'; ctx.beginPath(); ctx.ellipse(BX, BY, RX + 0.022, RY + 0.022, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.ellipse(BX, BY, RX, RY, 0, 0, TAU); ctx.clip();
  let g = ctx.createRadialGradient(BX - 0.22, BY - 0.24, 0.03, BX - 0.05, BY + 0.02, 0.78);
  g.addColorStop(0, ORG.hi); g.addColorStop(0.42, ORG.mid); g.addColorStop(0.82, ORG.lo); g.addColorStop(1, ORG.edge);
  ctx.fillStyle = g; ctx.fillRect(-0.8, -1.6, 1.6, 1.4);
  const bc = P3(0, 0.78, 0.52); const nzb = clamp(bc[2] / 0.52, 0.15, 1);
  if (bc[2] > -0.1) {
    g = ctx.createRadialGradient(bc[0] - 0.08, bc[1] - 0.1, 0.02, bc[0], bc[1], 0.42);
    g.addColorStop(0, '#FFF1DF'); g.addColorStop(0.6, '#FFDDB8'); g.addColorStop(1, '#F7BF8E');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(bc[0], bc[1] + 0.02, 0.36 * nzb, 0.33, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.translate(bc[0], bc[1] + 0.02); ctx.scale(nzb, 1);
    const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, 0.16); sg.addColorStop(0, 'rgba(255,200,120,0.5)'); sg.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(0, 0, 0.16, 0, TAU); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; const s = 0.1, q = 0.018; ctx.beginPath(); ctx.moveTo(0, -s); ctx.quadraticCurveTo(q, -q, s * 0.8, 0); ctx.quadraticCurveTo(q, q, 0, s); ctx.quadraticCurveTo(-q, q, -s * 0.8, 0); ctx.quadraticCurveTo(-q, -q, 0, -s); ctx.fill(); ctx.restore();
  }
  ctx.globalCompositeOperation = 'multiply';
  g = ctx.createRadialGradient(BX - 0.2, BY - 0.25, 0.1, BX - 0.05, BY, 0.75); g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.6, '#FFFFFF'); g.addColorStop(1, '#E7B79A');
  ctx.fillStyle = g; ctx.fillRect(-0.8, -1.6, 1.6, 1.4);
  ctx.globalCompositeOperation = 'source-over';
  g = ctx.createRadialGradient(BX - 0.18, BY - 0.12, 0.3, BX - 0.18, BY - 0.12, 0.78);
  g.addColorStop(0, 'rgba(255,225,190,0)'); g.addColorStop(0.75, 'rgba(255,225,190,0)'); g.addColorStop(0.93, 'rgba(255,228,195,0.7)'); g.addColorStop(1, 'rgba(255,228,195,0)');
  ctx.fillStyle = g; ctx.fillRect(-0.8, -1.6, 1.6, 1.4);
  if (p.hat) { g = ctx.createRadialGradient(0, -1.27, 0.05, 0, -1.27, 0.5); g.addColorStop(0, 'rgba(120,40,10,0.35)'); g.addColorStop(1, 'rgba(120,40,10,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -1.27, 0.55, 0.16, 0, 0, TAU); ctx.fill(); }
  // eyes
  const eyes = [-1, 1].map(side => ({ side, c: P3(side * 0.2, 0.98, 0.54) })).sort((a, b) => a.c[2] - b.c[2]);
  const lx = p.lookX * 0.035, ly = p.lookY * 0.03;
  for (const e of eyes) {
    if (e.c[2] < -0.02) continue; const nz = clamp(e.c[2] / 0.54, 0.12, 1);
    const big = p.expr === 'shock' ? 1.18 : 1;
    ctx.save(); ctx.translate(e.c[0] + lx, e.c[1] + ly); ctx.scale(nz * big, big);
    if (p.expr === 'love' || p.expr === 'squint') {
      ctx.strokeStyle = '#1A0E0A'; ctx.lineWidth = 0.04; ctx.lineCap = 'round';
      ctx.beginPath(); if (p.expr === 'love') ctx.arc(0, 0.035, 0.065, Math.PI * 1.1, Math.PI * 1.9); else { ctx.moveTo(-0.07, -0.03 * e.side); ctx.lineTo(0.05, 0); ctx.lineTo(-0.07, 0.03 * e.side); }
      ctx.stroke(); ctx.restore(); continue;
    }
    ctx.scale(1, p.blink);
    g = ctx.createRadialGradient(0, -0.03, 0.01, 0, 0, 0.13); g.addColorStop(0, '#4A2E24'); g.addColorStop(0.65, '#170C08'); g.addColorStop(1, '#060302');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 0.085, 0.12, 0, 0, TAU); ctx.fill();
    if (p.blink > 0.4) {
      ctx.fillStyle = 'rgba(120,175,255,0.4)'; ctx.beginPath(); ctx.ellipse(0.01, 0.065, 0.05, 0.026, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(-0.028, -0.045, 0.033, 0.04, -0.3, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(0.032, 0.038, 0.014, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(0.0, -0.07, 0.008, 0, TAU); ctx.fill();
    }
    ctx.strokeStyle = '#1A0E0A'; ctx.lineWidth = 0.016; ctx.lineCap = 'round';
    const ox = e.side * 0.07; ctx.beginPath(); ctx.moveTo(ox, -0.085); ctx.lineTo(ox + e.side * 0.04, -0.11); ctx.moveTo(ox * 0.6, -0.105); ctx.lineTo(ox * 0.6 + e.side * 0.025, -0.135); ctx.stroke();
    ctx.restore();
  }
  for (const e of eyes) {
    if (e.c[2] < -0.02) continue; const nz = clamp(e.c[2] / 0.54, 0.12, 1);
    const bx = e.c[0] + lx * 0.6, by = e.c[1] - 0.17 - 0.05 * p.brows + ly * 0.5;
    ctx.save(); ctx.translate(bx, by); ctx.scale(nz, 1); ctx.strokeStyle = '#5A2410'; ctx.lineWidth = 0.032; ctx.lineCap = 'round';
    let tilt = 0; if (p.expr === 'determined' || p.expr === 'grin') tilt = 0.35; if (p.expr === 'shock') tilt = -0.2; if (p.expr === 'love') tilt = -0.12;
    ctx.rotate(-e.side * tilt); ctx.beginPath(); ctx.moveTo(-0.06, 0.008); ctx.quadraticCurveTo(0, -0.02, 0.06, 0.008); ctx.stroke(); ctx.restore();
  }
  for (const side of [-1, 1]) {
    const c = P3(side * 0.36, 0.84, 0.44); if (c[2] < 0) continue; const nz = clamp(c[2] / 0.44, 0.15, 1);
    ctx.save(); ctx.translate(c[0], c[1]); ctx.scale(nz, 1);
    g = ctx.createRadialGradient(0, 0, 0, 0, 0, 0.11); g.addColorStop(0, `rgba(255,95,110,${p.blush})`); g.addColorStop(1, 'rgba(255,95,110,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 0.11, 0.075, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(-0.03, -0.02, 0.012, 0, TAU); ctx.fill(); ctx.restore();
  }
  const m = P3(0, 0.86, 0.57);
  if (m[2] > 0) {
    const nz = clamp(m[2] / 0.57, 0.15, 1);
    ctx.save(); ctx.translate(m[0] + lx * 0.5, m[1]); ctx.scale(nz, 1);
    if (p.expr === 'shock') { ctx.fillStyle = '#5A1810'; ctx.beginPath(); ctx.ellipse(0, 0.03, 0.045, 0.06, 0, 0, TAU); ctx.fill(); }
    else if (p.expr === 'cool') { ctx.strokeStyle = '#5A1810'; ctx.lineWidth = 0.026; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-0.07, 0.02); ctx.quadraticCurveTo(0.0, 0.05, 0.08, -0.01); ctx.stroke(); }
    else if (p.expr === 'squint') { ctx.strokeStyle = '#5A1810'; ctx.lineWidth = 0.024; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-0.06, 0.02); ctx.lineTo(0.06, 0.02); ctx.stroke(); }
    else {
      const wide = p.expr === 'grin' || p.expr === 'love' ? 1.25 : 1;
      ctx.scale(wide, 1);
      ctx.fillStyle = '#5A1810'; ctx.beginPath(); ctx.moveTo(-0.075, -0.01); ctx.quadraticCurveTo(0, -0.025, 0.075, -0.01); ctx.quadraticCurveTo(0.07, 0.085, 0, 0.09); ctx.quadraticCurveTo(-0.07, 0.085, -0.075, -0.01); ctx.fill();
      ctx.save(); ctx.clip(); ctx.fillStyle = '#FF7C8A'; ctx.beginPath(); ctx.ellipse(0, 0.085, 0.05, 0.035, 0, 0, TAU); ctx.fill();
      if (p.expr === 'grin') { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-0.07, -0.03, 0.14, 0.035); }
      ctx.restore();
    }
    ctx.restore();
  }
  ctx.restore();
  ctx.save(); ctx.translate(BX - 0.27, BY - 0.3); ctx.rotate(-0.6);
  g = ctx.createRadialGradient(0, 0, 0, 0, 0, 0.16); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.5, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.scale(1.5, 0.85); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 0.16, 0, TAU); ctx.fill(); ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.ellipse(BX - 0.36, BY - 0.33, 0.04, 0.024, -0.6, 0, TAU); ctx.fill();
  if (tl[2] >= 0 && Math.abs(tl[0]) > 0.45) ball(tl[0], tl[1], 0.12, '#FFA463', '#E66A2E', '#B5481B');
  nearLeg(); drawArm(arms[1], false);
  if (p.hat) { const hc = P3(0.05, 1.33, 0.42); if (hc[2] > 0) { ctx.strokeStyle = '#E8642A'; ctx.lineWidth = 0.05; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(hc[0] - 0.05, hc[1] - 0.04); ctx.quadraticCurveTo(hc[0] + 0.1, hc[1] - 0.02, hc[0] + 0.06, hc[1] + 0.07); ctx.quadraticCurveTo(hc[0] + 0.02, hc[1] + 0.1, hc[0] - 0.01, hc[1] + 0.06); ctx.stroke(); } }
  if (p.hat) { ctx.save(); ctx.translate(0.02 + 0.05 * sn, -1.5); ctx.rotate(0.16 + 0.1 * sn); ctx.scale(0.72, 0.72); ctx.translate(0, 0.45); drawEggPiece('top', p.yaw * 0.9, 0, 0); ctx.restore(); }
  if (p.glass !== null) { ctx.save(); ctx.translate(0, p.glass); pixelGlasses(-1.07); ctx.restore(); }
}
// Draw Gregg with his feet at the current origin (units, y down).
function drawGregg(p) {
  const cy = Math.cos(p.yaw), sn = Math.sin(p.yaw);
  const P3 = (x, y, z) => [x * cy + z * sn, -y, -x * sn + z * cy];
  ctx.save();
  const order = [-1, 1].map(side => ({ side, d: -side * 0.24 * sn })).sort((a, b) => a.d - b.d);
  if (p.ext < 0.02) {
    ctx.rotate(p.lean);
    const sx = 1 / Math.sqrt(Math.max(0.35, p.sy)); ctx.scale(sx * p.sc, p.sy * p.sc);
    ctx.translate(0, -0.9); ctx.rotate(p.rot); ctx.translate(0, 0.9);
    drawUpper(p, cy, sn, () => shortLeg(order[0].side, p, P3, true), () => shortLeg(order[1].side, p, P3, false));
  } else {
    const rootM = ctx.getTransform();
    ctx.translate(0, -(p.ext + p.lift));
    ctx.translate(0, -0.42); ctx.rotate(p.lean); ctx.translate(0, 0.42);
    const sx = 1 / Math.sqrt(Math.max(0.35, p.sy)); ctx.translate(0, -0.35); ctx.scale(sx, p.sy); ctx.translate(0, 0.35);
    const bodyM = ctx.getTransform(); const inv = rootM.inverse();
    const hips = {}; for (const side of [-1, 1]) hips[side] = inv.transformPoint(bodyM.transformPoint(new DOMPoint(side * 0.24 * cy, -0.42)));
    const legFn = (side, far) => () => { ctx.save(); ctx.setTransform(rootM); longLegStand(side, hips[side], p, far); ctx.restore(); };
    drawUpper(p, cy, sn, legFn(order[0].side, true), legFn(order[1].side, false));
  }
  ctx.restore();
}
function sparkle(X, Y, size, alpha, rot, col) {
  if (alpha <= 0.003 || size < 0.5) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = clamp(alpha);
  ctx.translate(X, Y); ctx.rotate(rot);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.3); g.addColorStop(0, col); g.addColorStop(0.25, 'rgba(255,220,150,0.35)'); g.addColorStop(1, 'rgba(255,200,120,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, size * 1.3, 0, TAU); ctx.fill();
  ctx.fillStyle = col; ctx.beginPath(); const s = size, q = size * 0.12;
  ctx.moveTo(0, -s); ctx.quadraticCurveTo(q, -q, s, 0); ctx.quadraticCurveTo(q, q, 0, s); ctx.quadraticCurveTo(-q, q, -s, 0); ctx.quadraticCurveTo(-q, -q, 0, -s); ctx.fill();
  ctx.restore();
}
function heart(X, Y, s, alpha, col) {
  ctx.save(); ctx.globalAlpha = clamp(alpha); ctx.translate(X, Y); ctx.scale(s, s);
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 0.35); ctx.bezierCurveTo(-0.55, -0.05, -0.35, -0.55, 0, -0.25); ctx.bezierCurveTo(0.35, -0.55, 0.55, -0.05, 0, 0.35); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(-0.2, -0.22, 0.08, 0.05, -0.6, 0, TAU); ctx.fill();
  ctx.restore();
}
