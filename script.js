"use strict";

// ---- audio (procedural 8-bit, no files) ----
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function blip(op, f0, f1, dur, vol, delay) {
  ensureAudio();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = op;
  const t0 = audioCtx.currentTime + (delay || 0);
  o.frequency.setValueAtTime(f0, t0);
  o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(g).connect(audioCtx.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
}

function noiseBurst(dur, vol) {
  ensureAudio();
  const sr = audioCtx.sampleRate;
  const buf = audioCtx.createBuffer(1, sr * dur | 0, sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) {
    const tt = i / sr;
    const env = 1 - tt / dur;
    d[i] = (Math.random() * 2 - 1) * env * env;
  }
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  const g = audioCtx.createGain();
  g.gain.value = vol;
  src.connect(g).connect(audioCtx.destination);
  src.start();
}

function sfxShoot() {
  ensureAudio();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = Math.random() < 0.5 ? 'square' : 'triangle';
  o.frequency.setValueAtTime(jz(880, 4), audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.08);
  g.gain.setValueAtTime(0.12, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
  o.connect(g).connect(audioCtx.destination);
  o.start(); o.stop(audioCtx.currentTime + 0.08);
}

function sfxBounce() {
  ensureAudio();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(mf(84 + PENTA[(Math.random() * PENTA.length) | 0]), audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.05);
  g.gain.setValueAtTime(0.08, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
  o.connect(g).connect(audioCtx.destination);
  o.start(); o.stop(audioCtx.currentTime + 0.05);
}

function sfxHitTarget(type) {
  switch (type) {
    case TYPE.MINE: sfxBomb(); return;
    case TYPE.RUNNER: blip('square', jz(500, 4), jz(1100, 4), 0.07, 0.1); return;
    case TYPE.SHIELD: sfxDing(); return;
    case TYPE.TIMED: blip('triangle', jz(400, 4), 1200, 0.1, 0.1); return;
    default: {
      ensureAudio();
      const sr = audioCtx.sampleRate;
      const len = 0.12;
      const buf = audioCtx.createBuffer(1, sr * len | 0, sr);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        const t = i / sr;
        const env = 1 - t / len;
        d[i] = (Math.random() * 2 - 1) * env * env * 0.15
             + Math.sin(t * jz(600, 2) * Math.PI * 2) * env * 0.1;
      }
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      src.connect(audioCtx.destination);
      src.start();
    }
  }
}

function sfxBomb() {
  ensureAudio();
  noiseBurst(0.3, 0.22);
  blip('sine', 200, 45, 0.28, 0.2);
}

function sfxDing() {
  ensureAudio();
  blip('square', 1180, 1180, 0.05, 0.08);
  blip('square', 1475, 1475, 0.07, 0.08, 0.06);
}

function sfxSpikeUp() {
  ensureAudio();
  blip('triangle', 140, 760, 0.38, 0.11);
  blip('triangle', 140, 760, 0.14, 0.06, 0.12);
  blip('triangle', 140, 760, 0.14, 0.06, 0.24);
}

function sfxSpikeOut() {
  ensureAudio();
  noiseBurst(0.08, 0.12);
  blip('square', 320, 70, 0.12, 0.14);
}

function sfxHurt() {
  ensureAudio();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(200, audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.2);
  g.gain.setValueAtTime(0.15, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
  o.connect(g).connect(audioCtx.destination);
  o.start(); o.stop(audioCtx.currentTime + 0.2);
}

function sfxSpark() {
  ensureAudio();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'square';
  o.frequency.setValueAtTime(jz(2400, 8), audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.03);
  g.gain.setValueAtTime(0.06, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
  o.connect(g).connect(audioCtx.destination);
  o.start(); o.stop(audioCtx.currentTime + 0.03);
}

function sfxStart() {
  ensureAudio();
  const notes = [523, 659, 784, 1047];
  for (let i = 0; i < notes.length; i++) {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'square';
    const t0 = audioCtx.currentTime + i * 0.08;
    o.frequency.setValueAtTime(notes[i], t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.1, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.12);
    o.connect(g).connect(audioCtx.destination);
    o.start(t0); o.stop(t0 + 0.12);
  }
}

function sfxGameOver() {
  ensureAudio();
  const notes = [440, 349, 262, 196];
  for (let i = 0; i < notes.length; i++) {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'triangle';
    const t0 = audioCtx.currentTime + i * 0.15;
    o.frequency.setValueAtTime(notes[i], t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.12, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.2);
    o.connect(g).connect(audioCtx.destination);
    o.start(t0); o.stop(t0 + 0.2);
  }
}

// ---- music: chiptune sequencer (Am-F-C-G loop) ----
const mf = n => 440 * Math.pow(2, (n - 69) / 12);
const jz = (base, spr) => base * Math.pow(2, (Math.random() * 2 - 1) * spr / 12);
const PENTA = [0, 2, 4, 7, 9];
const BASS = [45, 41, 48, 43];              // A2 F2 C3 G2
const ARPS = [                               // chord tones, cycling
  [64, 60, 57, 60],                          // Am
  [60, 57, 53, 57],                          // F
  [67, 64, 60, 64],                          // C
  [62, 59, 55, 59],                          // G
];
let musicFireLast = 5.0;   // последний интервал стрельбы, драйвер темпа
let musicRef = 5.0;        // сглаженная частота стрельбы
let musicBpm = 95;         // сглаженный темп

function musicBpmTarget(ref) {
  const b = 95 + 20 * (5.5 - ref);           // ~95 при медленной, ~190 при максимальной
  return Math.max(90, Math.min(200, b));
}

let hatBuf = null;
function musicTone(type, freq, t, dur, vol) {
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(audioCtx.destination);
  o.start(t); o.stop(t + dur + 0.02);
}

function musicKick(t) {
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(50, t + 0.1);
  g.gain.setValueAtTime(0.22, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
  o.connect(g).connect(audioCtx.destination);
  o.start(t); o.stop(t + 0.13);
}

function musicHat(t) {
  if (!hatBuf) {
    hatBuf = audioCtx.createBuffer(1, 2048, audioCtx.sampleRate);
    const d = hatBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = audioCtx.createBufferSource();
  src.buffer = hatBuf;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.05, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
  src.connect(g).connect(audioCtx.destination);
  src.start(t); src.stop(t + 0.045);
}

function musicStep(step, t) {
  const chord = (step / 16) | 0;
  const pos = step % 16;
  if (pos % 2 === 0) musicTone('triangle', mf(BASS[chord]), t, 0.16,
    pos % 4 === 0 ? 0.09 : 0.05);
  const tri = ARPS[chord];
  musicTone('square', mf(tri[pos % 4]), t, 0.09, 0.035);
  if (pos % 4 === 0) musicKick(t);
  if (pos % 4 === 2) musicHat(t);
  const hot = musicRef < 2 || over() > 0;
  if (hot && pos % 2 === 1) musicHat(t);
  if (hot && pos % 4 === 3) musicTone('square', mf(tri[pos % 4]) * 2, t, 0.06, 0.022);
}

const musicSched = {
  timer: null,
  step: 0,
  nextTime: 0,
};

function startMusic() {
  ensureAudio();
  if (musicSched.timer) return;
  musicSched.step = 0;
  musicRef = 5.0;
  musicBpm = 95;
  musicSched.nextTime = audioCtx.currentTime + 0.1;
  musicSched.timer = setInterval(() => {
    while (musicSched.nextTime < audioCtx.currentTime + 0.1) {
      musicRef += (musicFireLast - musicRef) * 0.05;
      const tgt = musicBpmTarget(musicRef);
      musicBpm += (tgt - musicBpm) * 0.05;
      const dur = 60 / musicBpm / 4;
      musicStep(musicSched.step, musicSched.nextTime);
      musicSched.step = (musicSched.step + 1) % 64;
      musicSched.nextTime += dur;
    }
  }, 25);
}

function stopMusic() {
  if (musicSched.timer) { clearInterval(musicSched.timer); musicSched.timer = null; }
}

// ---- canvas + pixel rendering ----
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const W = 160, H = 144;

// ---- background starfield (fills the letterbox bars around the game) ----
const bgCv = document.getElementById('bg');
const bgCtx = bgCv.getContext('2d');
let bgW = 1, bgH = 1;
let bgStars = [];
const BG_DENSITY = 0.012;

function bgResize() {
  const scale = Math.min(innerWidth, innerHeight * 160 / 144) / 160;
  bgW = Math.max(1, Math.ceil(innerWidth / scale));
  bgH = Math.max(1, Math.ceil(innerHeight / scale));
  bgCv.width = bgW;
  bgCv.height = bgH;
  bgStars.length = 0;
  const n = Math.round(bgW * bgH * BG_DENSITY);
  for (let i = 0; i < n; i++) {
    bgStars.push({
      x: Math.random() * bgW | 0,
      y: Math.random() * bgH | 0,
      base: Math.random() < 0.3 ? 0.8 : Math.random() < 0.5 ? 0.55 : 0.35,
      ph: Math.random() * Math.PI * 2,
      sp: 0.5 + Math.random() * 1.5,
    });
  }
  drawBgStars(performance.now() / 1000);
}

function drawBgStars(now) {
  bgCtx.fillStyle = '#000';
  bgCtx.fillRect(0, 0, bgW, bgH);
  bgCtx.fillStyle = '#fff';
  for (const s of bgStars) {
    bgCtx.globalAlpha = s.base * (0.6 + 0.4 * Math.sin(now * s.sp + s.ph));
    bgCtx.fillRect(s.x, s.y, 1, 1);
  }
  bgCtx.globalAlpha = 1;
}

bgResize();
addEventListener('resize', bgResize);
addEventListener('orientationchange', bgResize);

// ---- palette (8-bit) ----
const COL = {
  bg:       '#000',
  wall:     '#fff',
  player:   '#f33',
  bullet:   '#0ff',
  target:   '#ff0',
  targetHi: '#fff',
  orange:   '#f90',
  green:    '#3f3',
  purple:   '#c7f',
  blue:     '#5bf',
};

// ---- balance helpers ----
const lerp = (a, b, k) => a + (b - a) * k;
const tA = () => score / 1200;
const tensionOf = () => Math.min(1, tA());
const over = () => Math.max(0, tA() - 1);

// ---- arena ----
const CX = 80, CY = 72;
const R_WALL = 60;
const R_PLAYER = 45;

// ---- starfield in the corners (outside the wall ring) ----
const starField = [];
for (let i = 0; i < 30; i++) {
  let x, y;
  let ok = false;
  while (!ok) {
    x = Math.random() * W | 0;
    y = Math.random() * H | 0;
    ok = Math.hypot(x - CX, y - CY) >= 63 && !(y < 20 && (x < 30 || x > 130));
  }
  starField.push({
    x, y,
    base: Math.random() < 0.3 ? 0.8 : Math.random() < 0.5 ? 0.55 : 0.35,
    ph: Math.random() * Math.PI * 2,
    sp: 0.5 + Math.random() * 1.5,
  });
}

// ---- wall: verlet particles + springs ----
const N = 408;
const particles = [];
const home = [];
for (let i = 0; i < N; i++) {
  const a = (i / N) * Math.PI * 2;
  const x = CX + Math.cos(a) * R_WALL;
  const y = CY + Math.sin(a) * R_WALL;
  particles.push({ x, y, px: x, py: y });
  home.push({ x, y });
}
const restLen = (2 * Math.PI * R_WALL) / N;

// ---- state ----
let state = 'menu';
let time = 0;
let score = 0;
let lives = 3;
let invuln = 0;
let autoFire = 0;
const bullets = [];
const ebullets = [];
const targets = [];
const sparks = [];
const popups = [];

// ---- hi-score ----
let hiScore = 0;
let newBest = false;
try { hiScore = parseInt(localStorage.getItem('ricochet.hi') || '0', 10) || 0; } catch (e) {}

// ---- wall spikes ----
const RIM_R = 40;
const CAMP_TIME = 3.0;
const SPIKE_WINDUP = 0.4;
const SPIKE_LIFE = 1.1;
const SPIKE_COOLDOWN = 2.5;
const SPIKE_HALF = 70 * Math.PI / 180;
const SPIKE_TIP_R = 40;
const SPIKE_FOLLOW = 40 * Math.PI / 180;
let rimTime = 0;
let spikeTimer = 0;
const spike = { active: false, ang: 0, born: 0, up: false, out: false };

// ---- player ----
const player = { x: CX, y: CY - 38, vx: 0, vy: 0 };

// ---- input ----
const keys = {};
const TOUCH = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Space') e.preventDefault();
  if (e.code === 'KeyR' && state === 'gameover') reset();
  if ((e.code === 'Space' || e.code === 'Enter') && state === 'menu') start();
});
addEventListener('keyup', e => { keys[e.code] = false; });

// ---- virtual joystick (whole screen: touch anywhere + mouse LMB) ----
const joy = { active: false, ox: 0, oy: 0, dx: 0, dy: 0, id: -1 };
let mouseJoy = false;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function toGame(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  return {
    x: clamp((clientX - r.left) / r.width * W, 0, W),
    y: clamp((clientY - r.top) / r.height * H, 0, H),
  };
}

function toGameRaw(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (clientX - r.left) / r.width * W,
    y: (clientY - r.top) / r.height * H,
  };
}

function setJoyDelta(px, py) {
  let dx = px - joy.ox, dy = py - joy.oy;
  const d = Math.hypot(dx, dy);
  if (d > 8) { dx = dx / d * 8; dy = dy / d * 8; }
  joy.dx = dx / 8;
  joy.dy = dy / 8;
}

function endJoy() {
  joy.active = false; joy.dx = 0; joy.dy = 0; joy.id = -1; mouseJoy = false;
}

function findTouch(e, id) {
  for (let i = 0; i < e.touches.length; i++) if (e.touches[i].identifier === id) return e.touches[i];
  for (let i = 0; i < e.changedTouches.length; i++) if (e.changedTouches[i].identifier === id) return e.changedTouches[i];
  return null;
}

addEventListener('touchstart', e => {
  e.preventDefault();
  const t = e.changedTouches[0];
  if (state === 'menu') { start(); return; }
  if (state === 'gameover') { reset(); return; }
  if (joy.active) return;
  const p = toGame(t.clientX, t.clientY);
  joy.active = true; joy.ox = p.x; joy.oy = p.y; joy.id = t.identifier;
  joy.dx = 0; joy.dy = 0;
}, { passive: false });

addEventListener('touchmove', e => {
  e.preventDefault();
  if (!joy.active || joy.id < 0) return;
  const t = findTouch(e, joy.id);
  if (!t) return;
  const p = toGameRaw(t.clientX, t.clientY);
  setJoyDelta(p.x, p.y);
}, { passive: false });

addEventListener('touchend', e => { if (joy.id >= 0 && findTouch(e, joy.id)) endJoy(); });
addEventListener('touchcancel', e => { if (joy.id >= 0 && findTouch(e, joy.id)) endJoy(); });

// ---- mouse joystick (PC): LMB hold to move, LMB click to start/restart ----
addEventListener('mousedown', e => {
  if (e.button !== 0) return;
  e.preventDefault();
  if (state === 'menu') { start(); return; }
  if (state === 'gameover') { reset(); return; }
  if (joy.active) return;
  const p = toGame(e.clientX, e.clientY);
  joy.active = true; joy.ox = p.x; joy.oy = p.y; joy.dx = 0; joy.dy = 0;
  mouseJoy = true;
});

addEventListener('mousemove', e => {
  if (!joy.active || !mouseJoy) return;
  const p = toGameRaw(e.clientX, e.clientY);
  setJoyDelta(p.x, p.y);
});

addEventListener('mouseup', e => {
  if (e.button !== 0 || !mouseJoy) return;
  endJoy();
});

// ---- actions ----
function autoShoot() {
  if (bullets.length >= 20) return;
  const dx = CX - player.x, dy = CY - player.y;
  const d = Math.hypot(dx, dy) || 1;
  const spd = 175 + 40 * tensionOf() + 25 * over() + 20 * Math.sin(Math.PI * 2 * time / 24);
  bullets.push({
    x: player.x + dx / d * 4,
    y: player.y + dy / d * 4,
    vx: dx / d * spd,
    vy: dy / d * spd,
    life: 6,
    age: 0,
    bounces: 0,
    hit: false,
  });
  sfxShoot();
}

function fireInterval() {
  const ph = 0.5 + 0.5 * Math.sin(Math.PI * 2 * time / 24);
  const base = lerp(3.0, 0.55, tensionOf()) * (1 + 0.15 * over()) * (1.35 - 0.7 * ph);
  const iv = Math.max(0.25, Math.min(5, base * (0.8 + Math.random() * 0.4)));
  musicFireLast = iv;
  return iv;
}

function spawnSparks(x, y, color) {
  for (let i = 0; i < 8; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 20 + Math.random() * 30;
    sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.35, color });
  }
}

function loseLife() {
  lives--;
  invuln = 1.6;
  spawnSparks(player.x, player.y, COL.player);
  sfxHurt();
  if (lives <= 0) {
    state = 'gameover';
    if (score > hiScore) { hiScore = score; newBest = true; try { localStorage.setItem('ricochet.hi', String(hiScore)); } catch (e) {} }
    stopMusic(); sfxGameOver();
  }
}

function start() { resetRun(); state = 'playing'; sfxStart(); startMusic(); }
function reset() { start(); }

function resetRun() {
  score = 0; lives = 3; invuln = 0; autoFire = fireInterval(); time = 0;
  newBest = false;
  rimTime = 0; spikeTimer = 0; spike.active = false; spike.up = false; spike.out = false;
  bullets.length = 0;
  ebullets.length = 0;
  sparks.length = 0;
  popups.length = 0;
  targets.length = 0;
  player.vx = 0; player.vy = 0;
  player.x = CX; player.y = CY - 38;
  for (let i = 0; i < N; i++) {
    particles[i].x = home[i].x; particles[i].y = home[i].y;
    particles[i].px = home[i].x; particles[i].py = home[i].y;
  }
  updateTargets(0);
}

// ---- targets ----
const TYPE = { BASIC: 0, MINE: 1, RUNNER: 2, SHIELD: 3, TIMED: 4 };
const TYPE_BONUS = [0, 60, 80, 120, 100];
const TYPE_COL = [COL.target, COL.orange, COL.green, COL.purple, COL.blue];

function makeTarget() {
  return {
    x: 0, y: 0, alive: false, respawn: 0, born: 0,
    type: TYPE.BASIC, hp: 1, vx: 0, vy: 0, v0: 100, value: 100, win: 18, life: 0,
  };
}

function targetColor(t) { return TYPE_COL[t.type]; }
function targetCount() { return 1 + Math.round(2 * tensionOf()); }
function respawnDelay() { return Math.max(0.2, lerp(1.0, 0.4, tensionOf()) - 0.15 * over()); }

function pickType() {
  const t = tensionOf();
  const r = Math.random();
  if (t < 0.25) return TYPE.BASIC;
  if (t < 0.5) return r < 0.75 ? TYPE.BASIC : TYPE.MINE;
  if (t < 0.75) {
    if (r < 0.6) return TYPE.BASIC;
    if (r < 0.8) return TYPE.MINE;
    return TYPE.RUNNER;
  }
  if (r < 0.5) return TYPE.BASIC;
  if (r < 0.7) return TYPE.MINE;
  if (r < 0.86) return TYPE.RUNNER;
  if (r < 0.97) return TYPE.SHIELD;
  return TYPE.TIMED;
}

function pickSpot(t, minDist) {
  for (let tries = 0; tries < 40; tries++) {
    const a = Math.random() * Math.PI * 2;
    const r = 12 + Math.random() * 33;
    const x = CX + Math.cos(a) * r;
    const y = CY + Math.sin(a) * r;
    if (Math.hypot(x - player.x, y - player.y) < minDist) continue;
    let clear = true;
    for (const o of targets) {
      if (o !== t && o.alive && Math.hypot(x - o.x, y - o.y) < 16) { clear = false; break; }
    }
    if (!clear) continue;
    t.x = x; t.y = y;
    return true;
  }
  return false;
}

function placeTarget(t) {
  if (!pickSpot(t, 18)) { t.alive = false; return; }
  const r = Math.hypot(t.x - CX, t.y - CY);
  t.alive = true;
  t.type = pickType();
  t.hp = t.type === TYPE.SHIELD ? 2 : 1;
  t.born = time;
  if (t.type === TYPE.RUNNER) {
    const a = Math.random() * Math.PI * 2;
    t.vx = Math.cos(a) * 18;
    t.vy = Math.sin(a) * 18;
  } else { t.vx = 0; t.vy = 0; }
  const risk = Math.round((R_WALL - r) / R_WALL * 100);
  t.v0 = 100 + risk + TYPE_BONUS[t.type];
  t.value = t.v0;
  t.win = t.type === TYPE.TIMED ? 5 : lerp(18, 9, tensionOf());
  t.life = t.win;
}

function updateTargets(dt) {
  const want = targetCount();
  while (targets.length < want) targets.push(makeTarget());
  for (let i = targets.length - 1; i >= 0; i--) {
    const t = targets[i];
    if (i >= want && !t.alive) { targets.splice(i, 1); continue; }
    if (!t.alive) {
      if (time >= t.respawn) placeTarget(t);
      continue;
    }
    if (t.type === TYPE.RUNNER) {
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      const dx = t.x - CX, dy = t.y - CY;
      const d = Math.hypot(dx, dy) || 1;
      const nx = dx / d, ny = dy / d;
      const vn = t.vx * nx + t.vy * ny;
      if ((d < 12 && vn < 0) || (d > R_WALL - 4 && vn > 0)) {
        t.vx -= 2 * vn * nx;
        t.vy -= 2 * vn * ny;
      }
    }
    t.life -= dt;
    const warn = t.type === TYPE.TIMED ? 1.5 : 0.4 * t.win;
    if (t.type !== TYPE.TIMED && t.life < warn && t.value > 25) {
      t.value = Math.max(25, Math.floor(t.value - (t.v0 - 25) / warn * dt));
    }
    if (t.life <= 0) {
      t.alive = false;
      t.respawn = time + respawnDelay();
      spawnSparks(t.x, t.y, targetColor(t));
    }
  }
}

function explodeBomb(t) {
  const n = 6 + ((Math.random() * 3) | 0);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
    ebullets.push({
      x: t.x + Math.cos(a) * 3,
      y: t.y + Math.sin(a) * 3,
      vx: Math.cos(a) * 150,
      vy: Math.sin(a) * 150,
      age: 0,
      life: 0.9,
    });
  }
  sfxBomb();
}

function updateEbullets(dt) {
  for (let i = ebullets.length - 1; i >= 0; i--) {
    const e = ebullets[i];
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    e.age += dt;
    e.life -= dt;
    if (e.life <= 0) { ebullets.splice(i, 1); continue; }
    if (Math.hypot(e.x - CX, e.y - CY) > R_WALL - 1) { ebullets.splice(i, 1); continue; }
    if (e.age > 0.15 && invuln <= 0 && Math.hypot(e.x - player.x, e.y - player.y) < 7) {
      ebullets.splice(i, 1);
      loseLife();
    }
  }
}

// ---- updates ----
function updatePlayer(dt) {
  let ax = 0, ay = 0;
  if (keys['KeyW'] || keys['ArrowUp']) ay -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) ay += 1;
  if (keys['KeyA'] || keys['ArrowLeft']) ax -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) ax += 1;
  if (joy.active) { ax += joy.dx; ay += joy.dy; }
  const len = Math.hypot(ax, ay);
  if (len > 1) { ax /= len; ay /= len; }
  const m = 1150;
  player.vx += ax * m * dt;
  player.vy += ay * m * dt;
  player.vx *= 0.86;
  player.vy *= 0.86;
  player.x += player.vx * dt;
  player.y += player.vy * dt;
  const dx = player.x - CX, dy = player.y - CY;
  const d = Math.hypot(dx, dy);
  if (d > R_PLAYER) {
    player.x = CX + dx / d * R_PLAYER;
    player.y = CY + dy / d * R_PLAYER;
  }
}

function updateSpikes(dt) {
  if (!spike.active) {
    if (spikeTimer > 0) spikeTimer -= dt;
    const dx = player.x - CX, dy = player.y - CY;
    const r = Math.hypot(dx, dy);
    if (r >= RIM_R) rimTime += dt;
    else rimTime = Math.max(0, rimTime - 2 * dt);
    if (rimTime >= CAMP_TIME && spikeTimer <= 0) {
      spike.active = true;
      spike.up = false;
      spike.out = false;
      spike.ang = Math.atan2(dy, dx);
      spike.born = time;
    }
    return;
  }
  const t = time - spike.born;
  if (t >= SPIKE_WINDUP + SPIKE_LIFE) {
    spike.active = false;
    spikeTimer = SPIKE_COOLDOWN;
    rimTime = 0;
    return;
  }
  if (!spike.up) { spike.up = true; sfxSpikeUp(); }
  if (t < SPIKE_WINDUP) return;
  if (!spike.out) { spike.out = true; sfxSpikeOut(); }
  const pa = Math.atan2(player.y - CY, player.x - CX);
  const turn = Math.atan2(Math.sin(pa - spike.ang), Math.cos(pa - spike.ang));
  const maxTurn = SPIKE_FOLLOW * dt;
  spike.ang += Math.max(-maxTurn, Math.min(maxTurn, turn));
  const r = Math.hypot(player.x - CX, player.y - CY);
  const pd = Math.abs(Math.atan2(Math.sin(pa - spike.ang), Math.cos(pa - spike.ang)));
  if (r >= SPIKE_TIP_R - 2 && pd < SPIKE_HALF && invuln <= 0) {
    loseLife();
  }
}

function wallCollide(b) {
  for (let i = 0; i < N; i++) {
    const a = particles[i];
    const c = particles[(i + 1) % N];
    const abx = c.x - a.x, aby = c.y - a.y;
    const apx = b.x - a.x, apy = b.y - a.y;
    const l2 = abx * abx + aby * aby || 1;
    let t = (apx * abx + apy * aby) / l2;
    t = Math.max(0, Math.min(1, t));
    const cpx = a.x + abx * t, cpy = a.y + aby * t;
    const dx = b.x - cpx, dy = b.y - cpy;
    const d = Math.hypot(dx, dy);
    const hitDist = 3.5;
    if (d < hitDist) {
      const mx = cpx - CX, my = cpy - CY;
      const ml = Math.hypot(mx, my) || 1;
      const nx = mx / ml, ny = my / ml;
      const vn = b.vx * nx + b.vy * ny;
      if (vn > 0) {
        const kick = 0.28 * Math.hypot(b.vx, b.vy);
        for (const p of [a, c]) { p.px -= nx * kick; p.py -= ny * kick; }
        b.vx -= 2 * vn * nx;
        b.vy -= 2 * vn * ny;
        const s = 0.9;
        b.vx *= s; b.vy *= s;
        const push = hitDist - d + 0.5;
        b.x += nx * push;
        b.y += ny * push;
        return true;
      }
    }
  }
  return false;
}

function updateBullets(dt) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    b.age += dt;
    let dead = b.life <= 0;
    if (!dead && wallCollide(b)) {
      b.bounces++;
      spawnSparks(b.x, b.y, COL.wall);
      sfxBounce();
      const maxB = 6 + Math.round(4 * tensionOf());
      if (b.bounces > maxB) dead = true;
    }
    if (!dead) {
      for (const t of targets) {
        if (t.alive && Math.hypot(b.x - t.x, b.y - t.y) < 6) {
          if (t.type === TYPE.MINE) explodeBomb(t);
          t.hp--;
          if (t.hp <= 0) {
            t.alive = false;
            t.respawn = time + respawnDelay();
            score += t.value;
            popups.push({ x: t.x, y: t.y - 6, text: '+' + t.value, life: 0.8 });
            spawnSparks(t.x, t.y, targetColor(t));
            sfxHitTarget(t.type);
          } else {
            spawnSparks(t.x, t.y, targetColor(t));
            sfxDing();
            t.born = time;
            pickSpot(t, 24);
            t.life = t.win;
          }
          dead = true;
          break;
        }
      }
    }
    if (!dead && invuln <= 0 && b.age > 0.3 && Math.hypot(b.x - player.x, b.y - player.y) < 7) {
      dead = true;
      loseLife();
    }
    if (dead) b.hit = true;
  }
  for (let i = 0; i < bullets.length; i++) {
    const a = bullets[i];
    if (a.hit) continue;
    for (let j = i + 1; j < bullets.length; j++) {
      const c = bullets[j];
      if (c.hit) continue;
      if (Math.hypot(a.x - c.x, a.y - c.y) < 5) {
        a.hit = c.hit = true;
        spawnSparks((a.x + c.x) / 2, (a.y + c.y) / 2, COL.bullet);
        sfxSpark();
        break;
      }
    }
  }
  for (let i = bullets.length - 1; i >= 0; i--) {
    if (bullets[i].hit) bullets.splice(i, 1);
  }
}

function updateSparks(dt) {
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vx *= 0.92;
    s.vy *= 0.92;
    s.life -= dt;
    if (s.life <= 0) sparks.splice(i, 1);
  }
}

function updatePopups(dt) {
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    p.life -= dt;
    p.y -= 9 * dt;
    if (p.life <= 0) popups.splice(i, 1);
  }
}

function updateWall() {
  const damping = 0.965;
  for (const p of particles) {
    let vx = (p.x - p.px) * damping;
    let vy = (p.y - p.py) * damping;
    p.px = p.x; p.py = p.y;
    p.x += vx; p.y += vy;
  }
  const k = 0.05;
  for (let i = 0; i < N; i++) {
    const p = particles[i], h = home[i];
    p.x += (h.x - p.x) * k;
    p.y += (h.y - p.y) * k;
  }
  for (let iter = 0; iter < 3; iter++) {
    for (let i = 0; i < N; i++) {
      const a = particles[i];
      const b = particles[(i + 1) % N];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 0.001;
      const diff = (d - restLen) / d;
      const ox = dx * 0.5 * diff, oy = dy * 0.5 * diff;
      a.x += ox; a.y += oy;
      b.x -= ox; b.y -= oy;
    }
  }
}

// ---- drawing ----
function drawRing(x, y, r, color) {
  ctx.fillStyle = color;
  for (let py = Math.floor(y - r); py <= Math.ceil(y + r); py++) {
    for (let px = Math.floor(x - r); px <= Math.ceil(x + r); px++) {
      const d = Math.hypot(px - x, py - y);
      if (d <= r + 0.4 && d >= r - 1.2) ctx.fillRect(px, py, 1, 1);
    }
  }
}

function drawShip() {
  const ang = Math.atan2(CY - player.y, CX - player.x);
  const s = 5;
  const nx = player.x + Math.cos(ang) * s;
  const ny = player.y + Math.sin(ang) * s;
  const px1 = player.x + Math.cos(ang + 2.4) * s;
  const py1 = player.y + Math.sin(ang + 2.4) * s;
  const px2 = player.x + Math.cos(ang - 2.4) * s;
  const py2 = player.y + Math.sin(ang - 2.4) * s;
  ctx.fillStyle = COL.player;
  ctx.beginPath();
  ctx.moveTo(nx, ny);
  ctx.lineTo(px1, py1);
  ctx.lineTo(px2, py2);
  ctx.closePath();
  ctx.fill();
}

function drawSpikes() {
  if (!spike.active) return;
  const t = time - spike.born;
  const a0 = spike.ang - SPIKE_HALF, a1 = spike.ang + SPIKE_HALF;
  if (t < SPIKE_WINDUP) {
    const prog = t / SPIKE_WINDUP;
    ctx.fillStyle = COL.targetHi;
    const rr = R_WALL - 1 - 2 * prog;
    for (let k = 0; k < 30; k++) {
      const a = a0 + (a1 - a0) * k / 29;
      ctx.fillRect(Math.round(CX + Math.cos(a) * rr), Math.round(CY + Math.sin(a) * rr), 2, 2);
    }
    return;
  }
  const ext = SPIKE_TIP_R + (R_WALL - SPIKE_TIP_R) * Math.min(1, (t - SPIKE_WINDUP) / 0.15);
  ctx.fillStyle = COL.wall;
  const step = 10 * Math.PI / 180;
  for (let a = a0; a <= a1; a += step) {
    const bx1 = CX + Math.cos(a - step * 0.5) * (R_WALL - 1);
    const by1 = CY + Math.sin(a - step * 0.5) * (R_WALL - 1);
    const bx2 = CX + Math.cos(a + step * 0.5) * (R_WALL - 1);
    const by2 = CY + Math.sin(a + step * 0.5) * (R_WALL - 1);
    const tx = CX + Math.cos(a) * ext;
    const ty = CY + Math.sin(a) * ext;
    ctx.beginPath();
    ctx.moveTo(bx1, by1);
    ctx.lineTo(tx, ty);
    ctx.lineTo(bx2, by2);
    ctx.closePath();
    ctx.fill();
  }
}

const softCv = document.createElement('canvas');
softCv.width = W; softCv.height = H;
const softCtx = softCv.getContext('2d', { willReadFrequently: true });
const SOFT_CUT = 60;

function softText(txt, x, y, color, align) {
  softCtx.clearRect(0, 0, W, H);
  softCtx.font = '8px monospace';
  softCtx.textBaseline = 'top';
  softCtx.textAlign = align || 'left';
  softCtx.fillStyle = '#fff';
  softCtx.fillText(txt, x, y);
  const d = softCtx.getImageData(0, 0, W, H).data;
  const adv = 8;
  if (txt.indexOf('0') >= 0) {
    const strW = txt.length * adv;
    const x0 = align === 'right' ? Math.round(x - strW) : align === 'center' ? Math.round(x - strW / 2) : Math.round(x);
    for (let i = 0; i < txt.length; i++) {
      if (txt[i] !== '0') continue;
      const cell = x0 + i * adv;
      let closed = true;
      for (let c = 0; c < adv; c++) {
        const p = (cell + c) + (y + 3) * W;
        const q = (cell + c) + (y + 4) * W;
        if (d[p * 4 + 3] < SOFT_CUT && d[q * 4 + 3] < SOFT_CUT) { closed = false; break; }
      }
      if (!closed) continue;
      let cL = -1, cR = -1;
      for (let c = 0; c < adv; c++) {
        const has = d[((cell + c) + (y + 3) * W) * 4 + 3] >= SOFT_CUT || d[((cell + c) + (y + 4) * W) * 4 + 3] >= SOFT_CUT;
        if (has) { if (cL < 0) cL = c; cR = c; }
      }
      const mid = cell + ((cL + cR) >> 1);
      d[(mid + (y + 3) * W) * 4 + 3] = 0;
      d[(mid + (y + 4) * W) * 4 + 3] = 0;
    }
  }
  ctx.fillStyle = color;
  ctx.globalAlpha = 1;
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const a = d[i + 3];
    if (a >= SOFT_CUT) {
      ctx.globalAlpha = a / 255;
      ctx.fillRect(p % W, (p / W) | 0, 1, 1);
    }
  }
  ctx.globalAlpha = 1;
}

function centerText(txt, y, color) {
  softText(txt, 80, y, color, 'center');
}

function diamond(x, y) {
  ctx.fillRect(x, y, 1, 1);
  ctx.fillRect(x - 1, y + 1, 3, 1);
  ctx.fillRect(x, y + 2, 1, 1);
}

function hr(y) {
  ctx.fillStyle = COL.wall;
  for (let x = 34; x <= 126; x++) ctx.fillRect(x, y, 1, 1);
  ctx.fillStyle = COL.wall;
  diamond(30, y - 1);
  diamond(130, y - 1);
}

function bestBar(y, label) {
  ctx.fillStyle = COL.targetHi;
  ctx.fillRect(40, y, 80, 11);
  ctx.fillStyle = COL.orange;
  ctx.fillRect(40, y, 1, 11);
  ctx.fillRect(119, y, 1, 11);
  softText(label, 80, y + 2, COL.bg, 'center');
}

function drawStars() {
  ctx.fillStyle = '#fff';
  for (const s of starField) {
    ctx.globalAlpha = s.base * (0.6 + 0.4 * Math.sin(time * s.sp + s.ph));
    ctx.fillRect(s.x, s.y, 1, 1);
  }
  ctx.globalAlpha = 1;
}

function draw() {
  ctx.fillStyle = COL.bg;
  ctx.fillRect(0, 0, W, H);
  drawStars();

  for (let i = 0; i < N; i++) {
    const p = particles[i];
    ctx.fillStyle = COL.wall;
    ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 3, 3);
  }

  for (const t of targets) {
    if (!t.alive) continue;
    const warn = t.type === TYPE.TIMED ? 1.5 : 0.4 * t.win;
    const blink = t.life < warn && Math.floor(time * 6) % 2 === 0;
    const flash = time - t.born < 0.3;
    drawRing(t.x, t.y, 4, (flash || blink) ? COL.targetHi : targetColor(t));
  }

  drawSpikes();

  if (invuln <= 0 || Math.floor(time * 12) % 2 === 0) drawShip();

  ctx.fillStyle = COL.bullet;
  for (const b of bullets) {
    ctx.fillRect(Math.round(b.x) - 1, Math.round(b.y) - 1, 3, 3);
  }
  ctx.fillStyle = COL.orange;
  for (const e of ebullets) {
    ctx.fillRect(Math.round(e.x) - 1, Math.round(e.y) - 1, 2, 2);
  }

  for (const s of sparks) {
    ctx.fillStyle = s.color;
    ctx.fillRect(Math.round(s.x), Math.round(s.y), 2, 2);
  }

  for (const p of popups) {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 0.3));
    ctx.fillStyle = COL.targetHi;
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(p.text, p.x, p.y);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = COL.wall;
  ctx.font = '8px monospace';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText('SCORE ' + score, 4, 4);
  ctx.fillText('HP ' + lives, 4, 14);
  const ph = 0.5 + 0.5 * Math.sin(Math.PI * 2 * time / 24);
  ctx.fillStyle = COL.bullet;
  ctx.textAlign = 'right';
  ctx.fillText('>'.repeat(1 + Math.floor(ph * 3)), W - 2, 4);
  ctx.fillStyle = COL.wall;
  ctx.fillText('HI ' + hiScore, W - 2, 14);
  ctx.textAlign = 'left';

  if (state === 'menu') {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, W, H);
    centerText('RICOCHET', 30, COL.wall);
    centerText('AUTO-GUN', 42, COL.bullet);
    hr(54);
    centerText(TOUCH ? 'DRAG - MOVE' : 'WASD - MOVE', 64, COL.target);
    centerText(TOUCH ? 'TAP - START' : 'PRESS SPACE / TAP', 74, COL.wall);
    hr(86);
    bestBar(96, 'BEST ' + hiScore);
  } else if (state === 'gameover') {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, W, H);
    const seg = [
      { el: 8, gap: 4, f: y => centerText('GAME OVER', y, COL.player) },
      { el: 1, gap: 4, f: y => hr(y) },
      { el: 8, gap: 3, f: y => centerText('SCORE ' + score, y, COL.wall) },
      { el: 11, gap: 3, f: y => bestBar(y, 'BEST ' + hiScore) },
    ];
    if (newBest) seg.push({ el: 8, gap: 3, f: y => { if (Math.floor(time * 6) % 2 === 0) centerText('NEW BEST', y, COL.player); } });
    seg.push(
      { el: 1, gap: 4, f: y => hr(y) },
      { el: 8, gap: 0, f: y => centerText('PRESS R / TAP', y, COL.bullet) },
    );
    let total = 0;
    for (const s of seg) total += s.el + s.gap;
    let yy = Math.round(72 - total / 2);
    for (const s of seg) { s.f(yy); yy += s.el + s.gap; }
  }

  if (joy.active) {
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = COL.wall;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(joy.ox, joy.oy, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = COL.bullet;
    ctx.beginPath();
    ctx.arc(clamp(joy.ox + joy.dx * 8, 0, W), clamp(joy.oy + joy.dy * 8, 0, H), 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// ---- main loop (fixed 120Hz physics, render each frame) ----
const STEP = 1000 / 120;
let last = performance.now();
let acc = 0;

function frame(now) {
  const dtms = Math.min(now - last, 100);
  last = now;
  acc += dtms;
  drawBgStars(now / 1000);
  let steps = 0;
  while (acc >= STEP && steps < 8) {
    const sdt = STEP / 1000;
    time += sdt;
    if (state === 'playing') {
      autoFire -= sdt;
      if (autoFire <= 0) {
        autoShoot();
        autoFire = fireInterval();
      }
      if (invuln > 0) invuln -= sdt;
      updatePlayer(sdt);
      updateSpikes(sdt);
      updateBullets(sdt);
      updateEbullets(sdt);
      updateTargets(sdt);
    }
    updateSparks(sdt);
    updatePopups(sdt);
    updateWall();
    acc -= STEP;
    steps++;
  }
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---- watchdog: keep the sim alive if rAF is throttled/stopped (hidden tab, headless) ----
setInterval(() => {
  if (performance.now() - last > 500) frame(performance.now());
}, 250);