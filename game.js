/* ─── NPC ROSTER ─────────────────────────────────────────── */
const NPC = {
  'Professor Oak':     '👴',
  'Rival Gary':        '😤',
  'Old Man Bob':       '🧓',
  'Nurse Joy':         '👩‍⚕️',
  'Officer Jenny':     '👮‍♀️',
  'Brock':             '🧑‍🍳',
  'Misty':             '🧜‍♀️',
  'Giovanni':          '😈',
  'Team Rocket Grunt': '🚀',
  'Scientist Bill':    '🔬',
  'Fisherman Ralph':   '🎣',
  'Hiker Taro':        '🧗',
  'Gym Leader Surge':  '⚡',
  'Erika':             '🌸',
  'Koga':              '🥷',
  'Sabrina':           '🔮',
  'Blaine':            '🌋',
  'Lorelei':           '❄️',
  'Bruno':             '💪',
  'Agatha':            '👻',
  'Lance':             '🐉',
  'Champion':          '🏆',
  'Gary':              '😤',
};

const INTRO_MSGS = [
  { speaker:'PROFESSOR OAK', npc:'Professor Oak', text:"Hello {name}! Welcome to PokéSQL — the world of T-SQL training! My name is Professor Oak, the SQL Pokémon Professor!" },
  { speaker:'PROFESSOR OAK', npc:'Professor Oak', text:"This world is inhabited by powerful data — stored in TABLES, organised in DATABASES, and tamed with QUERIES!" },
  { speaker:'PROFESSOR OAK', npc:'Professor Oak', text:"Your mission? Journey through Pallet Town, challenge SQL experts, and become a T-SQL Champion!" },
  { speaker:'PROFESSOR OAK', npc:'Professor Oak', text:"You'll learn Microsoft T-SQL — the language used by DBAs and data professionals worldwide." },
  { speaker:'PROFESSOR OAK', npc:'Professor Oak', text:"100 questions await you in this town alone. Each correct answer earns you SQL EXP — and you'll learn something real!" },
  { speaker:'PROFESSOR OAK', npc:'Professor Oak', text:"Your progress is saved automatically in your browser so you can pick up right where you left off. Now, {name}... your adventure begins!" },
];

const CORRECT_FB = ["That's right!","Excellent work!","Perfect!","Outstanding!","Correct!","You're a natural!","Great answer!","Spot on!","Impressive!","Well done!"];
const WRONG_FB   = ["Not quite...","Hmm, that's not it.","Try again next time!","Almost...","Not this time!"];

const MILESTONES = {
  25: { badge:'🥉 SQL INITIATE',   stars:'★ ★ ☆ ☆' },
  50: { badge:'🥈 QUERY TRAINER',  stars:'★ ★ ★ ☆' },
  75: { badge:'🥇 DATA WRANGLER',  stars:'★ ★ ★ ★' },
};

const SAVE_KEY = 'pokesql_save_v1';

/* ─── SAVE / LOAD ────────────────────────────────────────── */
function saveGame(s) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ playerName:s.playerName, currentQ:s.currentQ, score:s.score, streak:s.streak, maxStreak:s.maxStreak, correct:s.correct, wrong:s.wrong, savedAt:Date.now() })); } catch(_){}
}
function loadGame()  { try { const r=localStorage.getItem(SAVE_KEY); return r?JSON.parse(r):null; } catch(_){return null;} }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch(_){} }

/* ─── BACKGROUND MUSIC ───────────────────────────────────── */
const Music = (() => {
  let audio    = null;
  let muted    = false;
  let wantPlay = false;   /* true if we tried to play but were blocked */

  function getAudio() {
    if (!audio) {
      audio          = new Audio('./music.mp3');
      audio.loop     = true;
      audio.volume   = 0.5;
      audio.preload  = 'auto';
      /* If audio loads and we wanted to play, try again */
      audio.addEventListener('canplaythrough', () => {
        if (wantPlay && !muted) audio.play().catch(() => {});
      });
    }
    return audio;
  }

  function updateBtn() {
    const btn = document.getElementById('music-toggle');
    if (!btn) return;
    btn.textContent = muted ? '🔇' : '🎵';
    btn.classList.toggle('muted', muted);
  }

  return {
    play() {
      if (muted) return;
      wantPlay = true;
      const a = getAudio();
      if (a.readyState >= 3) {
        /* Enough data to play */
        if (a.paused) a.play().catch((e) => { console.warn('Music play blocked:', e); });
      }
      /* else: canplaythrough listener will fire and retry */
    },
    pause() {
      wantPlay = false;
      if (audio && !audio.paused) audio.pause();
    },
    toggle() {
      muted = !muted;
      updateBtn();
      if (muted) Music.pause();
      else       Music.play();
    },
    /* Call once on first user interaction to unblock autoplay */
    unblock() {
      const a = getAudio();
      if (wantPlay && !muted && a.paused) {
        a.play().catch(() => {});
      }
    },
  };
})();

/* ─── CHIPTUNE SOUND ENGINE ──────────────────────────────── */
const SFX = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* Core: play a tone with envelope */
  function tone(freq, type, vol, attack, sustain, release, when) {
    const c   = getCtx();
    const t   = when ?? c.currentTime;
    const osc = c.createOscillator();
    const gain= c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type      = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + attack);
    gain.gain.setValueAtTime(vol, t + attack + sustain);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + sustain + release);
    osc.start(t);
    osc.stop(t + attack + sustain + release + 0.01);
  }

  /* Sequence of notes: [{f, d}...] */
  function seq(notes, type='square', vol=0.18) {
    const c = getCtx();
    let t = c.currentTime + 0.02;
    notes.forEach(n => {
      if (n.f) tone(n.f, type, vol, 0.01, n.d * 0.6, n.d * 0.4, t);
      t += n.d;
    });
  }

  return {
    /* Boot jingle — classic rising fanfare */
    boot() {
      seq([
        {f:262,d:.1},{f:330,d:.1},{f:392,d:.1},{f:523,d:.25}
      ], 'square', 0.2);
    },

    /* Overworld bgm loop — simple cheerful melody */
    overworldStart() {
      seq([
        {f:392,d:.12},{f:440,d:.12},{f:494,d:.12},{f:523,d:.18},
        {f:494,d:.1}, {f:440,d:.1}, {f:392,d:.18},
        {f:330,d:.12},{f:392,d:.12},{f:440,d:.12},{f:392,d:.24},
      ], 'square', 0.12);
    },

    /* Footstep click — tiny blip each walk tick */
    step() {
      tone(180, 'square', 0.04, 0.005, 0.02, 0.03);
    },

    /* NPC encounter — ascending two-note ding */
    encounter() {
      seq([{f:523,d:.1},{f:659,d:.18}], 'square', 0.22);
    },

    /* Typewriter blip per character */
    type() {
      tone(880 + Math.random()*200, 'square', 0.03, 0.005, 0.01, 0.02);
    },

    /* Select / menu move */
    select() {
      tone(440, 'square', 0.12, 0.005, 0.03, 0.04);
    },

    /* Correct answer — happy ascending chord */
    correct() {
      seq([
        {f:523,d:.08},{f:659,d:.08},{f:784,d:.08},{f:1047,d:.2}
      ], 'square', 0.18);
    },

    /* Streak bonus — extra flourish */
    streak() {
      seq([
        {f:523,d:.06},{f:659,d:.06},{f:784,d:.06},
        {f:1047,d:.06},{f:1319,d:.2}
      ], 'square', 0.18);
    },

    /* Wrong answer — descending buzz */
    wrong() {
      seq([
        {f:330,d:.1},{f:277,d:.1},{f:233,d:.18}
      ], 'sawtooth', 0.15);
    },

    /* Badge / level up fanfare */
    levelUp() {
      seq([
        {f:523,d:.1},{f:659,d:.1},{f:784,d:.1},{f:659,d:.1},
        {f:784,d:.1},{f:1047,d:.3}
      ], 'square', 0.2);
    },

    /* Champion / completion — full fanfare */
    complete() {
      seq([
        {f:523,d:.1},{f:659,d:.1},{f:784,d:.1},{f:1047,d:.1},
        {f:784,d:.08},{f:880,d:.08},{f:1047,d:.08},{f:1319,d:.4}
      ], 'square', 0.2);
    },

    /* Menu confirm (name entry OK) */
    confirm() {
      seq([{f:523,d:.08},{f:784,d:.15}], 'square', 0.18);
    },
  };
})();

/* ─── GAME ───────────────────────────────────────────────── */
class Game {
  constructor() {
    this.state = {
      screen:'boot', playerName:'', questions:[], currentQ:0,
      score:0, streak:0, maxStreak:0, correct:0, wrong:0,
      answering:false, introStep:0, twTimer:null,
      /* map — world coords in px, camera follows player */
      worldX: 0,          /* player's X in world-px */
      worldY: 0,          /* player's Y in world-px (0 = path centre) */
      npcWorldX: 0,       /* NPC world-px X */
      npcWorldY: 0,
      lastDir: 'right',
      /* battle cursor */
      cursor:0,
    };

    this.screens = {};
    document.querySelectorAll('.screen').forEach(s => {
      this.screens[s.id.replace('screen-','')] = s;
    });

    this._heldKeys    = new Set();
    this._walkLoop    = null;
    this._introClick  = null;
    this._introKey    = null;
    this._gpLoop      = null;

    this._bindController();
    this._bindGlobalKeys();
    this._bindGamepad();
    this.boot();
  }

  /* ══════════════════════════════════════════════════════════
     CONTROLLER OVERLAY — wires D-pad, A, B, SELECT, START
     ══════════════════════════════════════════════════════════ */
  _bindController() {
    const ctrl = document.getElementById('gba-controller');

    const dpadMap = { 'dp-up':'up', 'dp-down':'down', 'dp-left':'left', 'dp-right':'right' };

    Object.entries(dpadMap).forEach(([id, dir]) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      const start = (e) => { e.preventDefault(); this._dpadStart(dir); btn.classList.add('pressed'); };
      const end   = (e) => { e.preventDefault(); this._dpadEnd(dir);   btn.classList.remove('pressed'); };

      btn.addEventListener('pointerdown',  start, {passive:false});
      btn.addEventListener('pointerup',    end,   {passive:false});
      btn.addEventListener('pointerleave', end,   {passive:false});
      btn.addEventListener('pointercancel',end,   {passive:false});
    });

    const aBtn = document.getElementById('btn-a');
    const bBtn = document.getElementById('btn-b');

    aBtn.addEventListener('pointerdown', (e)=>{ e.preventDefault(); aBtn.classList.add('pressed'); this._pressA(); });
    aBtn.addEventListener('pointerup',   (e)=>{ e.preventDefault(); aBtn.classList.remove('pressed'); });
    aBtn.addEventListener('pointercancel',(e)=>{ aBtn.classList.remove('pressed'); });

    bBtn.addEventListener('pointerdown', (e)=>{ e.preventDefault(); bBtn.classList.add('pressed'); this._pressB(); });
    bBtn.addEventListener('pointerup',   (e)=>{ e.preventDefault(); bBtn.classList.remove('pressed'); });
    bBtn.addEventListener('pointercancel',(e)=>{ bBtn.classList.remove('pressed'); });

    document.getElementById('btn-start').addEventListener('pointerdown', (e)=>{ e.preventDefault(); });
    document.getElementById('btn-select').addEventListener('pointerdown', (e)=>{ e.preventDefault(); });
  }

  /* A — map: talk to NPC | battle: confirm cursor | elsewhere: advance */
  _pressA() {
    const s = this.state.screen;
    if (s === 'map')                             { this._talkToNPC(); return; }
    if (s === 'battle' && !this.state.answering) { this._confirmCursor(); return; }
    if (s === 'intro')   { this.advanceIntro(); return; }
    if (s === 'result')  { document.getElementById('btn-result-cont')?.click(); return; }
    if (s === 'levelup') { document.getElementById('btn-lu-cont')?.click(); return; }
  }

  /* B — map: talk to NPC (same as A) | battle: no-op while answering | intro/result: advance */
  _pressB() {
    const s = this.state.screen;
    if (s === 'map')                            { this._talkToNPC(); return; }
    if (s === 'battle' && this.state.answering) { return; }
    if (s === 'intro')  { this.advanceIntro(); return; }
    if (s === 'result') { document.getElementById('btn-result-cont')?.click(); return; }
  }

  /* D-pad start hold */
  _dpadStart(dir) {
    this._heldKeys.add(dir);
    if (!this._walkLoop) this._startWalkLoop();

    const s = this.state.screen;
    if (s === 'battle') { this._moveCursor(dir); }
  }

  _dpadEnd(dir) {
    this._heldKeys.delete(dir);
    if (this._heldKeys.size === 0) this._stopWalkLoop();
  }

  /* ══════════════════════════════════════════════════════════
     MAP WALKING — 16-step loop, collision, NPC proximity
     ══════════════════════════════════════════════════════════ */
  _startWalkLoop() {
    if (this._walkLoop) return;
    this._walkLoop = setInterval(() => this._walkTick(), 30);
  }

  _stopWalkLoop() {
    clearInterval(this._walkLoop);
    this._walkLoop = null;
    if (this.state.screen === 'map') {
      const p = document.getElementById('map-player');
      if (p) {
        p.className = 'map-player idle';
        /* Show the idle/middle frame for the last direction walked
           Frames at 2× scale (32px each): down=32, up=128, left=224, right=320 */
        const idleFrames = { down:'-32px', left:'-128px', up:'-224px', right:'-320px' };
        p.style.backgroundPositionX = idleFrames[this.state.lastDir] || '-32px';
      }
    }
  }

  _walkTick() {
    if (this.state.screen !== 'map') return;

    const world  = document.getElementById('map-inner');
    if (!world) return;
    const viewW  = world.parentElement.offsetWidth  || 420;
    const viewH  = world.parentElement.offsetHeight || 300;

    const SPEED = 8; /* px per tick */
    let dx = 0, dy = 0, dir = '';

    if (this._heldKeys.has('right')) { dx =  SPEED; dir = 'right'; }
    if (this._heldKeys.has('left'))  { dx = -SPEED; dir = 'left';  }
    if (this._heldKeys.has('up'))    { dy = -SPEED; dir = 'up';    }
    if (this._heldKeys.has('down'))  { dy =  SPEED; dir = 'down';  }
    if (!dir) return;

    /* Clamp world X — left edge is 0, right edge is npcWorldX + half screen
       so the player can always walk far enough to reach the NPC */
    const maxWorldX = this.state.npcWorldX - Math.round(viewW / 2) + 100;
    this.state.worldX = Math.max(0, Math.min(maxWorldX, this.state.worldX + dx));
    /* Clamp Y within a narrow vertical band (path area) */
    this.state.worldY = Math.max(-30, Math.min(30, this.state.worldY + dy));
    this.state.lastDir = dir;

    this._applyCamera();

    /* Player sprite stays horizontally centred; only Y shifts */
    const p = document.getElementById('map-player');
    if (p) {
      const centreX = viewW / 2 - 16;
      const centreY = viewH * 0.65 + this.state.worldY;
      p.style.left   = centreX + 'px';
      p.style.bottom = (viewH - centreY - 40) + 'px';
      p.className    = `map-player walk-${dir}`;
    }

    this._checkNPCProximity();
  }

  /* Slide the world and reposition NPC in screen-space every tick */
  _applyCamera() {
    const world = document.getElementById('map-inner');
    if (world) world.style.transform = `translateX(${-this.state.worldX}px)`;
    this._positionNPCOnScreen();
  }

  _positionNPCOnScreen() {
    const world = document.getElementById('map-inner');
    const viewH = world ? world.parentElement.offsetHeight : 300;
    const npcWrap = document.getElementById('map-npc-wrap');
    if (npcWrap) {
      const screenX = this.state.npcWorldX - this.state.worldX;
      npcWrap.style.left   = (screenX - 24) + 'px';
      npcWrap.style.bottom = (viewH * 0.28) + 'px';
    }
  }

  _checkNPCProximity() {
    const world = document.getElementById('map-inner');
    const viewW = world ? world.parentElement.offsetWidth  : 420;
    const viewH = world ? world.parentElement.offsetHeight : 300;
    const playerWorldX = this.state.worldX + viewW / 2;
    const dx   = Math.abs(playerWorldX - this.state.npcWorldX);
    const near = dx < 60;

    const hint = document.getElementById('map-talk-hint');
    const bub  = document.getElementById('npc-bubble');
    if (hint) {
      hint.style.display = near ? 'block' : 'none';
      hint.style.left   = (viewW / 2 - 28) + 'px';
      hint.style.bottom = (viewH * 0.50) + 'px';
    }
    if (bub) bub.style.opacity = near ? '0' : '1';
    this._updateDirArrow(near);
  }

  _updateDirArrow(nearNPC) {
    const arrow = document.getElementById('map-dir-arrow');
    if (!arrow) return;
    if (nearNPC) { arrow.style.display = 'none'; return; }
    const world = document.getElementById('map-inner');
    const viewH = world ? world.parentElement.offsetHeight : 300;
    arrow.textContent   = '▶';
    arrow.style.display = 'block';
    arrow.style.removeProperty('left');
    arrow.style.bottom  = (viewH * 0.28) + 'px';
  }

  _nearNPC() {
    const world = document.getElementById('map-inner');
    const viewW = world ? world.parentElement.offsetWidth : 420;
    const playerWorldX = this.state.worldX + viewW / 2;
    return Math.abs(playerWorldX - this.state.npcWorldX) < 60;
  }

  _talkToNPC() {
    const arrow = document.getElementById('map-dir-arrow');
    if (arrow) arrow.style.display = 'none';
    SFX.encounter();
    this.startQuestion();
  }

  /* Place player at viewport centre, NPC via screen-space conversion */
  _placeMapSprites() {
    const world = document.getElementById('map-inner');
    const viewW = world ? world.parentElement.offsetWidth  : 420;
    const viewH = world ? world.parentElement.offsetHeight : 300;

    const p = document.getElementById('map-player');
    if (p) {
      p.style.left      = (viewW / 2 - 16) + 'px';
      p.style.bottom    = (viewH * 0.28) + 'px';
      
      p.className       = 'map-player idle';
    }
    this._applyCamera();
    const hint = document.getElementById('map-talk-hint');
    if (hint) hint.style.display = 'none';
  }

  /* ══════════════════════════════════════════════════════════
     BATTLE CURSOR — navigate 2×2 grid with D-pad / WASD
     ══════════════════════════════════════════════════════════ */
  _moveCursor(dir) {
    const btns = document.querySelectorAll('.choice-btn:not(.disabled):not(.correct):not(.wrong)');
    if (!btns.length) return;
    let c = this.state.cursor;
    if      (dir === 'right') c = (c === 0) ? 1 : (c === 2) ? 3 : c;
    else if (dir === 'left')  c = (c === 1) ? 0 : (c === 3) ? 2 : c;
    else if (dir === 'down')  c = (c === 0) ? 2 : (c === 1) ? 3 : c;
    else if (dir === 'up')    c = (c === 2) ? 0 : (c === 3) ? 1 : c;
    c = Math.min(c, btns.length - 1);
    this.state.cursor = c;
    this._renderCursor();
    SFX.select();
  }

  _renderCursor() {
    document.querySelectorAll('.choice-btn').forEach((b,i) => {
      b.classList.toggle('cursor', i === this.state.cursor);
    });
  }

  _confirmCursor() {
    if (this.state.answering) return;
    const btns = document.querySelectorAll('.choice-btn:not(.disabled)');
    const target = btns[this.state.cursor];
    if (target) target.click();
  }

  /* ══════════════════════════════════════════════════════════
     GLOBAL KEYBOARD
     ══════════════════════════════════════════════════════════ */
  _bindGlobalKeys() {
    const DPAD_KEYS = {
      'ArrowUp':'up','ArrowDown':'down','ArrowLeft':'left','ArrowRight':'right',
      'w':'up','s':'down','a':'left','d':'right',
      'W':'up','S':'down','A':'left','D':'right',
    };

    document.addEventListener('keydown', (e) => {
      const s = this.state.screen;

      /* Name screen — character input */
      if (s === 'name') {
        if (e.key==='Backspace') { e.preventDefault(); this.delChar(); }
        else if (e.key==='Enter') this.confirmName();
        else if (e.key.length===1 && /[A-Z0-9.\-!?]/i.test(e.key)) this.addChar(e.key.toUpperCase());
        return;
      }

      /* Title */
      if (s === 'title' && (e.key==='Enter'||e.key===' ')) { document.getElementById('screen-title').click(); return; }

      /* Continue screen */
      if (s === 'continue' && (e.key==='Enter'||e.key===' ')) { document.getElementById('btn-continue-save')?.click(); return; }

      /* Intro */
      if (s === 'intro' && (e.key==='Enter'||e.key===' '||e.key==='e'||e.key==='E')) { this.advanceIntro(); return; }

      /* D-pad direction keys */
      if (DPAD_KEYS[e.key] && !e.repeat) {
        const dir = DPAD_KEYS[e.key];
        if ((s==='map' || s==='battle') && !this._heldKeys.has(dir)) {
          e.preventDefault();
          this._heldKeys.add(dir);
          if (s==='map' && !this._walkLoop) this._startWalkLoop();
          if (s==='battle') this._moveCursor(dir);
        }
        return;
      }

      /* A-button equivalent on keyboard */
      if ((e.key==='Enter'||e.key==='e'||e.key==='E') && !e.repeat) {
        e.preventDefault();
        this._pressA();
        return;
      }

      /* B-button */
      if ((e.key==='x'||e.key==='X') && !e.repeat) { this._pressB(); return; }

      /* Quick-pick numbers on battle */
      if (s==='battle' && !this.state.answering) {
        const numMap={'1':0,'2':1,'3':2,'4':3};
        if (numMap[e.key]!==undefined) {
          this.state.cursor = numMap[e.key];
          this._renderCursor();
          setTimeout(()=>this._confirmCursor(), 80);
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      const DPAD_KEYS = {
        'ArrowUp':'up','ArrowDown':'down','ArrowLeft':'left','ArrowRight':'right',
        'w':'up','s':'down','a':'left','d':'right',
        'W':'up','S':'down','A':'left','D':'right',
      };
      const dir = DPAD_KEYS[e.key];
      if (dir) {
        this._heldKeys.delete(dir);
        if (this._heldKeys.size === 0) this._stopWalkLoop();
      }
    });
  }

  /* ══════════════════════════════════════════════════════════
     XBOX / GAMEPAD SUPPORT (Gamepad API)
     Polls every animation frame. Works with Xbox, PS, and most
     USB/Bluetooth gamepads that the browser recognises.

     Xbox mapping:
       Axes 0/1  = left stick X/Y
       Button 0  = A  (confirm / talk)
       Button 1  = B  (talk / back)
       Button 12 = D-pad up
       Button 13 = D-pad down
       Button 14 = D-pad left
       Button 15 = D-pad right
       Button 9  = Start (confirm)
     ══════════════════════════════════════════════════════════ */
  _bindGamepad() {
    this._gpPrev   = {};
    this._gpActive = false;

    window.addEventListener('gamepadconnected', (e) => {
      console.log('Gamepad connected:', e.gamepad.id);
    });

    /* Start polling immediately — don't wait for the event.
       The poll function checks if any gamepad is present each frame. */
    this._startGpLoop();
  }

  _startGpLoop() {
    const poll = () => {
      this._gpLoop = requestAnimationFrame(poll);
      this._pollGamepad();
    };
    this._gpLoop = requestAnimationFrame(poll);
  }

  _pollGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = [...gamepads].find(g => g);
    if (!gp) return;

    const DEAD = 0.25;
    const axes = gp.axes;
    const btns = gp.buttons;

    const pressedNow  = (i) =>  btns[i]?.pressed;
    const wasPressed  = (i) => !!this._gpPrev[`btn_${i}`];
    const justPressed = (i) =>  pressedNow(i) && !wasPressed(i);

    const gpDirs = {
      up:    (axes[1] < -DEAD) || !!btns[12]?.pressed,
      down:  (axes[1] >  DEAD) || !!btns[13]?.pressed,
      left:  (axes[0] < -DEAD) || !!btns[14]?.pressed,
      right: (axes[0] >  DEAD) || !!btns[15]?.pressed,
    };

    const s = this.state.screen;

    /* ── NAME SCREEN — D-pad navigates keyboard grid, A selects, B deletes, Start confirms ── */
    if (s === 'name') {
      const letterKeys = Array.from(document.querySelectorAll('.key-btn'));
      const delBtn     = document.getElementById('btn-backspace');
      const okBtn      = document.getElementById('btn-confirm-name');
      const keys       = [...letterKeys, delBtn, okBtn].filter(Boolean);
      const total      = keys.length;
      const COLS       = 10;

      /* Highlight current key — works for letter keys, DEL and OK */
      keys.forEach((k, i) => {
        k.style.outline       = i === this._gpKeyCursor ? '3px solid #f8c030' : '';
        k.style.outlineOffset = i === this._gpKeyCursor ? '-2px' : '';
      });

      /* D-pad navigation with repeat delay */
      const now = Date.now();
      const moved = Object.entries(gpDirs).find(([d, active]) => active && !this._gpPrev[`axis_${d}`]);
      if (moved) {
        const [dir] = moved;
        let c = this._gpKeyCursor;
        if (dir === 'right') c = Math.min(c + 1, total - 1);
        if (dir === 'left')  c = Math.max(c - 1, 0);
        if (dir === 'down')  c = Math.min(c + COLS, total - 1);
        if (dir === 'up')    c = Math.max(c - COLS, 0);
        this._gpKeyCursor = c;
        keys.forEach((k, i) => {
          k.style.outline       = i === c ? '3px solid #f8c030' : '';
          k.style.outlineOffset = i === c ? '-2px' : '';
        });
      }

      if (justPressed(0) || justPressed(1)) { /* A or B — activate highlighted key */
        const key = keys[this._gpKeyCursor];
        if (!key) return;
        const isLetterKey = key.classList.contains('key-btn');
        if (isLetterKey) {
          key.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true }));
        } else if (key.id === 'btn-backspace') {
          this.delChar();
        } else if (key.id === 'btn-confirm-name') {
          this.confirmName();
        }
      }
      if (justPressed(2)) { /* X — delete */
        this.delChar();
      }
      if (justPressed(9) || justPressed(8)) { /* Start or Select — confirm name */
        this.confirmName();
      }

    /* ── ALL OTHER SCREENS — directional movement + button actions ── */
    } else {

      /* ── CONTINUE SCREEN — D-pad up/down switches between Continue and New Game ── */
      if (s === 'continue') {
        if (this._gpContCursor === undefined) this._gpContCursor = 0;
        const contBtn = document.getElementById('btn-continue-save');
        const newBtn  = document.getElementById('btn-new-game');

        const movedUp   = gpDirs.up   && !this._gpPrev['axis_up'];
        const movedDown = gpDirs.down  && !this._gpPrev['axis_down'];
        if (movedUp || movedDown) {
          this._gpContCursor = this._gpContCursor === 0 ? 1 : 0;
        }

        /* Highlight selected button */
        if (contBtn) contBtn.style.outline = this._gpContCursor === 0 ? '3px solid #f8c030' : '';
        if (newBtn)  newBtn.style.outline  = this._gpContCursor === 1 ? '3px solid #f8c030' : '';
      }

      /* Walk / battle cursor movement */
      Object.entries(gpDirs).forEach(([dir, active]) => {
        const key = `axis_${dir}`;
        if (active && !this._gpPrev[key]) {
          if (s === 'map') {
            this._heldKeys.add(dir);
            if (!this._walkLoop) this._startWalkLoop();
          }
          if (s === 'battle') this._moveCursor(dir);
        } else if (!active && this._gpPrev[key]) {
          this._heldKeys.delete(dir);
          if (this._heldKeys.size === 0) this._stopWalkLoop();
        }
      });

      /* A / Start — context action on every screen */
      if (justPressed(0) || justPressed(9)) {
        if      (s === 'boot')     { /* wait for title */ }
        else if (s === 'title')    { document.getElementById('screen-title')?.click(); }
        else if (s === 'continue') {
          /* 0 = CONTINUE highlighted, 1 = NEW GAME highlighted */
          if (this._gpContCursor === 0) document.getElementById('btn-continue-save')?.click();
          else                          document.getElementById('btn-new-game')?.click();
        }
        else if (s === 'intro')    { this.advanceIntro(); }
        else if (s === 'battle' && !this.state.answering) { this._confirmCursor(); }
        else if (s === 'result')   { document.getElementById('btn-result-cont')?.click(); }
        else if (s === 'levelup')  { document.getElementById('btn-lu-cont')?.click(); }
        else if (s === 'complete') { document.getElementById('btn-play-again')?.click(); }
        else { this._pressA(); }
      }

      /* B — also confirms answer in battle */
      if (justPressed(1)) {
        if      (s === 'battle' && !this.state.answering) { this._confirmCursor(); }
        else if (s === 'intro')    { this.advanceIntro(); }
        else if (s === 'result')   { document.getElementById('btn-result-cont')?.click(); }
        else { this._pressB(); }
      }

      /* Quick-pick answers X=2, Y=3, LB=4, RB=5 */
      if (s === 'battle' && !this.state.answering) {
        const quickMap = { 2:0, 3:1, 4:2, 5:3 };
        Object.entries(quickMap).forEach(([btn, idx]) => {
          if (justPressed(+btn)) {
            this.state.cursor = idx;
            this._renderCursor();
            setTimeout(() => this._confirmCursor(), 80);
          }
        });
      }
    }

    /* Store all states for next frame */
    Object.entries(gpDirs).forEach(([d, v]) => this._gpPrev[`axis_${d}`] = v);
    for (let i = 0; i < btns.length; i++) {
      this._gpPrev[`btn_${i}`] = btns[i]?.pressed;
    }
  }
  _showController(visible) {
    const ctrl = document.getElementById('gba-controller');
    if (!ctrl) return;
    if (visible) ctrl.classList.remove('hidden');
    else         ctrl.classList.add('hidden');
  }

  /* ══════════════════════════════════════════════════════════
     SCREENS
     ══════════════════════════════════════════════════════════ */
  boot() {
    this.show('boot');
    this._showController(false);
    setTimeout(() => this.showTitle(), 1800);
  }

  showTitle() {
    this.show('title');
    SFX.boot();
    this._showController(false);
    const go = () => {
      document.getElementById('screen-title').removeEventListener('click', go);
      Music.unblock();
      this.showContinueOrName();
    };
    document.getElementById('screen-title').addEventListener('click', go);
  }

  showContinueOrName() {
    const save = loadGame();
    if (save && save.playerName && save.currentQ > 0 && save.currentQ < 100) {
      this.show('continue');
      this._showController(false);
      const pct = Math.round((save.currentQ/100)*100);
      document.getElementById('save-name-disp').textContent  = save.playerName;
      document.getElementById('save-prog-disp').textContent  = `Q${save.currentQ}/100 (${pct}%)`;
      document.getElementById('save-score-disp').textContent = save.score.toLocaleString();

      document.getElementById('btn-continue-save').onclick = () => { Music.unblock(); this.restoreFromSave(save); };
      document.getElementById('btn-new-game').onclick = () => {
        document.getElementById('continue-warn').textContent = 'Starting a new game will erase your saved progress!';
        document.getElementById('btn-new-game').textContent  = '✦ CONFIRM NEW GAME';
        document.getElementById('btn-new-game').onclick      = () => { clearSave(); this.startFresh(); };
      };
      /* Reset controller cursor to CONTINUE button */
      this._gpContCursor = 0;
      setTimeout(() => {
        const c = document.getElementById('btn-continue-save');
        if (c) c.style.outline = '3px solid #f8c030';
      }, 50);
    } else {
      this.startFresh();
    }
  }

  restoreFromSave(save) {
    Object.assign(this.state, {
      playerName:save.playerName, currentQ:save.currentQ,
      score:save.score, streak:save.streak, maxStreak:save.maxStreak,
      correct:save.correct, wrong:save.wrong,
      worldX:0, worldY:0, npcWorldX:0, npcWorldY:0,
    });
    this.loadQuestions(() => this.showMap());
  }

  startFresh() {
    Object.assign(this.state, { playerName:'', currentQ:0, score:0, streak:0, maxStreak:0, correct:0, wrong:0 });
    this.showNameEntry();
  }

  /* ── NAME ─────────────────────────────────────────────── */
  showNameEntry() {
    this.show('name');
    this._showController(false);
    this._gpKeyCursor = 0;
    this.buildKeyboard();
    this.typeText('name-prompt-text', "Hello there! Welcome to PokéSQL! My name is Professor Oak — the SQL Pokémon Professor. Now tell me, what is your name?");
    document.getElementById('btn-backspace').onclick    = () => this.delChar();
    document.getElementById('btn-confirm-name').onclick = () => this.confirmName();
  }

  buildKeyboard() {
    const grid  = document.getElementById('keyboard-grid');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-!?'.split('');
    grid.innerHTML = '';
    chars.forEach(ch => {
      const b = document.createElement('button');
      b.className = 'key-btn'; b.textContent = ch;
      b.addEventListener('pointerdown', (e)=>{ e.preventDefault(); this.addChar(ch); });
      grid.appendChild(b);
    });
  }

  addChar(ch) { if (this.state.playerName.length<10){ this.state.playerName+=ch; this.refreshNameDisplay(); SFX.select(); } }
  delChar()   { this.state.playerName=this.state.playerName.slice(0,-1); this.refreshNameDisplay(); }
  refreshNameDisplay() {
    const el=document.getElementById('name-display');
    if(el) el.textContent=this.state.playerName+(this.state.playerName.length<10?'_':'');
  }
  confirmName() { if(!this.state.playerName.trim()) this.state.playerName='ASH'; SFX.confirm(); this.showIntro(); }

  /* ── INTRO ────────────────────────────────────────────── */
  showIntro() {
    this.show('intro');
    this._showController(false);
    this.state.introStep = 0;
    this.renderIntroMsg();

    const advance = () => this.advanceIntro();
    const introEl = document.getElementById('screen-intro');
    if (this._introClick) introEl.removeEventListener('click', this._introClick);
    this._introClick = advance;
    introEl.addEventListener('click', advance);
  }

  renderIntroMsg() {
    const msg = INTRO_MSGS[this.state.introStep];
    if (!msg) return;
    const npcEl = document.getElementById('intro-npc');
    if (npcEl) npcEl.textContent = NPC[msg.npc] || '👴';
    document.getElementById('intro-speaker').textContent = msg.speaker;
    document.getElementById('intro-arrow').style.display = 'none';
    this.typeText('intro-text',
      msg.text.replace(/{name}/g, this.state.playerName||'ASH'),
      ()=>{ document.getElementById('intro-arrow').style.display='block'; }
    );
  }

  advanceIntro() {
    if (this.state.twTimer) {
      clearInterval(this.state.twTimer); this.state.twTimer=null;
      const msg = INTRO_MSGS[this.state.introStep];
      document.getElementById('intro-text').textContent = msg.text.replace(/{name}/g, this.state.playerName||'ASH');
      document.getElementById('intro-arrow').style.display = 'block';
      return;
    }
    this.state.introStep++;
    if (this.state.introStep >= INTRO_MSGS.length) {
      const el = document.getElementById('screen-intro');
      if (this._introClick) el.removeEventListener('click', this._introClick);
      this.loadQuestions(() => this.showMap());
      return;
    }
    this.renderIntroMsg();
  }

  /* ── LOAD QUESTIONS ───────────────────────────────────── */
  loadQuestions(cb) {
    if (this.state.questions.length>0) { cb(); return; }
    fetch('./questions.json')
      .then(r=>r.json())
      .then(data=>{ this.state.questions=data.levels[0].questions; cb(); })
      .catch(()=>this.toast('❌ Could not load questions.json'));
  }

  /* Generate randomly placed trees across the full scrollable world */
  /* Generate trees for the current journey leg — from world origin to just past the NPC.
     Called fresh each time so trees always fill the visible path ahead. */
  _generateTrees() {
    const container = document.getElementById('map-trees');
    if (!container) return;

    /* Clear previous leg's trees */
    container.innerHTML = '';

    const world  = document.getElementById('map-inner');
    const viewW  = world ? world.parentElement.offsetWidth  : 420;
    const viewH  = world ? world.parentElement.offsetHeight : 300;

    /* World spans from 0 to just past the NPC */
    const worldW = this.state.npcWorldX + viewW;
    if (world) world.style.width = worldW + 'px';

    const treeTopMax    = viewH * 0.50;
    const treeBottomMin = viewH * 0.04;

    /* One tree roughly every 120px across the leg */
    const COUNT = Math.max(6, Math.round(worldW / 120));
    const zoneW = worldW / COUNT;

    for (let i = 0; i < COUNT; i++) {
      const span = document.createElement('span');
      span.className = 'tree';
      const size = 28 + Math.random() * 16;
      const x    = i * zoneW + Math.random() * zoneW * 0.75;
      const y    = treeBottomMin + Math.random() * (treeTopMax - treeBottomMin - size);
      span.textContent             = '🌳';
      span.style.fontSize          = size + 'px';
      span.style.left              = x + 'px';
      span.style.top               = y + 'px';
      span.style.animationDelay    = (Math.random() * 3).toFixed(2) + 's';
      span.style.animationDuration = (2.5 + Math.random() * 2).toFixed(1) + 's';
      container.appendChild(span);
    }
  }

  /* Called on result screen — pre-builds trees for the next leg */
  _preGenerateNextLeg() {
    const world = document.getElementById('map-inner');
    const viewW = world ? world.parentElement.offsetWidth : 420;
    const nextNpcX = Math.round(viewW * 3.0 + Math.random() * viewW * 0.8);
    const savedNpcX = this.state.npcWorldX;
    this.state.npcWorldX = nextNpcX;
    this._generateTrees();
    this.state.npcWorldX = savedNpcX;
  }

  showMap() {
    this.show('map');
    this._showController(true);

    /* We need the viewport size — defer a tick so the DOM is laid out */
    requestAnimationFrame(() => {
      this._generateTrees();
      const world = document.getElementById('map-inner');
      const viewW = world ? world.parentElement.offsetWidth : 420;

      if (this.state.currentQ === 0) {
        this.state.worldX    = 0;
        this.state.worldY    = 0;
        this.state.npcWorldX = Math.round(viewW * 3.5);
        this.state.npcWorldY = 0;
      } else {
        /* Always reset camera to 0 each question — keeps trees in view.
           NPC spawns off-screen right relative to fresh origin. */
        this.state.worldX    = 0;
        this.state.worldY    = 0;
        this.state.npcWorldX = Math.round(viewW * 3.0 + Math.random() * viewW * 0.8);
        this.state.npcWorldY = 0;
      }

      document.getElementById('hud-name').textContent = this.state.playerName||'ASH';
      this.updateHUD();

      const q = this.state.questions[this.state.currentQ];
      const npcEl = document.getElementById('map-npc');
      if (q && npcEl) npcEl.textContent = NPC[q.npc]||'🧑';

      this._placeMapSprites();
      this._updateDirArrow(false);
      Music.play();
      saveGame(this.state);
      this.flashSaveDot();

      const npcEl2 = document.getElementById('map-npc');
      if (npcEl2) npcEl2.onclick = ()=>this._talkToNPC();

      const musicBtn = document.getElementById('music-toggle');
      if (musicBtn) musicBtn.onclick = () => Music.toggle();
    });
  }

  updateHUD() {
    const tot=this.state.questions.length||100, done=this.state.currentQ, pct=(done/tot)*100;
    document.getElementById('hud-score').textContent   = this.state.score.toLocaleString();
    document.getElementById('hud-streak').textContent  = this.state.streak+(this.state.streak>=3?'🔥':'');
    document.getElementById('hud-correct').textContent = `${this.state.correct}/${done}`;
    document.getElementById('map-prog-text').textContent = `${done}/${tot}`;
    const bar=document.getElementById('map-prog-bar');
    if(bar){ bar.style.width=pct+'%'; bar.style.background=pct<40?'var(--hp-green)':pct<75?'var(--hp-yellow)':'#60c8ff'; }
  }

  flashSaveDot() {
    const dot=document.getElementById('save-dot');
    if(!dot)return; dot.style.opacity='1';
    setTimeout(()=>{ dot.style.opacity='.4'; },1500);
  }

  /* ── BATTLE ───────────────────────────────────────────── */
  startQuestion() {
    this._stopWalkLoop();
    this._heldKeys.clear();
    const q=this.state.questions[this.state.currentQ];
    if(!q){ this.showComplete(); return; }

    this.show('battle');
    this._showController(true);
    Music.pause();
    this.state.answering=false;
    this.state.cursor=0;

    document.getElementById('battle-npc-sprite').textContent = NPC[q.npc]||'🧑';
    document.getElementById('battle-npc-name').textContent   = q.npc.toUpperCase();
    document.getElementById('battle-speaker').textContent    = q.npc.toUpperCase();
    document.getElementById('battle-player-name').textContent= (this.state.playerName||'ASH').toUpperCase();
    document.getElementById('battle-q-num').textContent      = this.state.currentQ+1;
    document.getElementById('battle-pts').textContent        = this.state.score.toLocaleString();
    document.getElementById('battle-arrow').style.display    = 'none';
    document.getElementById('battle-choices').innerHTML      = '';

    this.typeText('battle-text', q.text, ()=>this.renderChoices(q));
  }

  renderChoices(q) {
    const container=document.getElementById('battle-choices');
    container.innerHTML='';
    this.state.cursor=0;

    /* Shuffle options so the correct answer lands in a random slot each time.
       We track which shuffled index holds the correct answer. */
    const indices = [0,1,2,3];
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const correctShuffledIdx = indices.indexOf(q.answer);

    /* Build a map from original option letter (A/B/C/D) to shuffled slot number (1/2/3/4)
       so any option text like "Both A and B" gets rewritten to e.g. "Both 2 and 4" */
    const letterToSlot = {};
    indices.forEach((origIdx, slotIdx) => {
      const letter = ['A','B','C','D'][origIdx];
      letterToSlot[letter] = slotIdx + 1;
    });

    function rewriteLetterRefs(text) {
      /* Only rewrite letters that appear in explicit option-reference patterns:
         "Both A and B", "A and B", "Both B and C", etc.
         Never replace standalone A/B/C/D in regular sentence text. */
      return text.replace(/\bBoth ([ABCD]) and ([ABCD])\b/gi, (_, l1, l2) => {
        const n1 = letterToSlot[l1.toUpperCase()];
        const n2 = letterToSlot[l2.toUpperCase()];
        return `Both ${n1 ?? l1} and ${n2 ?? l2}`;
      }).replace(/\b([ABCD]) and ([ABCD])\b/g, (_, l1, l2) => {
        const n1 = letterToSlot[l1];
        const n2 = letterToSlot[l2];
        return `${n1 ?? l1} and ${n2 ?? l2}`;
      });
    }

    /* Store display text of correct answer with letter refs rewritten */
    q._correctDisplayText = rewriteLetterRefs(q.options[q.answer]);

    indices.forEach((origIdx, slotIdx) => {
      const btn=document.createElement('button');
      btn.className='choice-btn';
      btn.setAttribute('data-letter', slotIdx + 1);
      btn.textContent=rewriteLetterRefs(q.options[origIdx]);
      btn.addEventListener('click',()=>this.pick(slotIdx, correctShuffledIdx, q, container));
      container.appendChild(btn);
    });
    this._renderCursor();
  }

  pick(chosen, correctIdx, q, container) {
    if(this.state.answering)return;
    this.state.answering=true;

    const btns=container.querySelectorAll('.choice-btn');
    const correct=chosen===correctIdx;

    btns.forEach(b=>{ b.classList.remove('cursor'); b.classList.add('disabled'); });
    btns[correctIdx].classList.remove('disabled'); btns[correctIdx].classList.add('correct');
    if(!correct) btns[chosen].classList.add('wrong');

    if(correct){
      this.state.streak++; this.state.correct++;
      this.state.maxStreak=Math.max(this.state.maxStreak,this.state.streak);
      this.state.score+=this.state.streak>=5?200:this.state.streak>=3?150:100;
      if(this.state.streak>=3) SFX.streak(); else SFX.correct();
    } else { this.state.streak=0; this.state.wrong++; SFX.wrong(); }

    setTimeout(()=>{
      /* Pre-generate trees for the next map leg while player reads result */
      this._preGenerateNextLeg();
      this.showResult(correct,q);
    },120);
  }

  /* ── RESULT ───────────────────────────────────────────── */
  showResult(correct,q) {
    this.show('result');
    this._showController(false);

    document.getElementById('result-icon').textContent  = correct?'✓':'✗';
    const lbl=document.getElementById('result-label');
    lbl.textContent = correct ? CORRECT_FB[Math.floor(Math.random()*CORRECT_FB.length)]
                              : WRONG_FB[Math.floor(Math.random()*WRONG_FB.length)];
    lbl.className   = 'result-label '+(correct?'correct':'wrong');

    const ansEl=document.getElementById('result-correct-ans');
    const ptsEl=document.getElementById('result-pts');
    if(correct){
      ptsEl.textContent=this.state.streak>=5?'+200 PTS 🔥 STREAK!':this.state.streak>=3?'+150 PTS 🔥 HOT!':'+100 PTS';
      ptsEl.style.display='block'; ansEl.classList.remove('visible');
    } else {
      ptsEl.style.display='none';
      ansEl.textContent='✓ Correct answer: '+(q._correctDisplayText||q.options[q.answer]);
      ansEl.classList.add('visible');
    }
    document.getElementById('result-explanation').textContent=q.explanation;

    document.getElementById('btn-result-cont').onclick=()=>{
      this.state.currentQ++;
      saveGame(this.state);
      if(this.state.currentQ>=this.state.questions.length){ clearSave(); this.showComplete(); }
      else if(MILESTONES[this.state.currentQ]) this.showLevelUp();
      else this.showMap();
    };
  }

  /* ── LEVEL UP ─────────────────────────────────────────── */
  showLevelUp() {
    this.show('levelup');
    SFX.levelUp();
    this._showController(false);
    const ms=MILESTONES[this.state.currentQ];
    const pct=(this.state.currentQ/(this.state.questions.length||100))*100;
    document.getElementById('lu-name').textContent     = this.state.playerName||'ASH';
    document.getElementById('lu-stars').textContent    = `${ms.stars} BADGE EARNED! ${ms.stars}`;
    document.getElementById('lu-badge').textContent    = ms.badge;
    document.getElementById('lu-prog-label').textContent=`${this.state.currentQ} / 100`;
    const bar=document.getElementById('lu-prog-inner');
    if(bar)bar.style.width=pct+'%';
    document.getElementById('btn-lu-cont').onclick=()=>this.showMap();
  }

  /* ── COMPLETE ─────────────────────────────────────────── */
  showComplete() {
    this.show('complete');
    SFX.complete();
    this._showController(false);
    const name=this.state.playerName||'ASH', tot=this.state.questions.length||100;
    const acc=tot>0?Math.round((this.state.correct/tot)*100):0;
    document.getElementById('complete-name').textContent=name;
    document.getElementById('complete-stats').textContent=
      `FINAL SCORE:   ${this.state.score.toLocaleString()}\n`+
      `CORRECT:       ${this.state.correct} / ${tot}\n`+
      `ACCURACY:      ${acc}%\n`+
      `BEST STREAK:   ${this.state.maxStreak} 🔥`;
    document.getElementById('btn-play-again').onclick=()=>{ clearSave(); this.startFresh(); };
  }

  /* ── SCREEN SWITCH ────────────────────────────────────── */
  show(name) {
    Object.values(this.screens).forEach(s=>s.classList.remove('active'));
    const t=this.screens[name]; if(t)t.classList.add('active');
    this.state.screen=name;
  }

  /* ── TYPEWRITER ───────────────────────────────────────── */
  typeText(id,text,onDone) {
    if(this.state.twTimer){clearInterval(this.state.twTimer);this.state.twTimer=null;}
    const el=document.getElementById(id); if(!el)return; el.textContent='';
    let i=0;
    this.state.twTimer=setInterval(()=>{
      if(i<text.length){el.textContent+=text[i++]; if(i%2===0) SFX.type();}
      else{clearInterval(this.state.twTimer);this.state.twTimer=null;if(onDone)onDone();}
    },26);
  }

  /* ── TOAST ────────────────────────────────────────────── */
  toast(msg,ms=2600){
    const el=document.getElementById('toast');
    el.textContent=msg; el.classList.remove('hidden');
    setTimeout(()=>el.classList.add('hidden'),ms);
  }
}

window.addEventListener('DOMContentLoaded',()=>{ new Game(); });
