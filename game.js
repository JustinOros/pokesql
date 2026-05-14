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

    this._bindController();
    this._bindGlobalKeys();
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
    this._walkLoop = setInterval(() => this._walkTick(), 80);
  }

  _stopWalkLoop() {
    clearInterval(this._walkLoop);
    this._walkLoop = null;
    if (this.state.screen === 'map') {
      const p = document.getElementById('map-player');
      if (p) {
        p.className = 'map-player idle';
        /* keep facing the last direction moved */
        p.style.transform = this.state.lastDir === 'right' ? 'scaleX(-1)' : 'scaleX(1)';
      }
    }
  }

  _walkTick() {
    if (this.state.screen !== 'map') return;

    const world  = document.getElementById('map-inner');
    if (!world) return;
    const viewW  = world.parentElement.offsetWidth  || 420;
    const viewH  = world.parentElement.offsetHeight || 300;
    const worldW = world.offsetWidth || viewW * 4;

    const SPEED = 10; /* px per tick */
    let dx = 0, dy = 0, dir = '';

    if (this._heldKeys.has('right')) { dx =  SPEED; dir = 'right'; }
    if (this._heldKeys.has('left'))  { dx = -SPEED; dir = 'left';  }
    if (this._heldKeys.has('up'))    { dy = -SPEED; dir = 'up';    }
    if (this._heldKeys.has('down'))  { dy =  SPEED; dir = 'down';  }
    if (!dir) return;

    /* Clamp world X — can't walk left past origin or right past world edge */
    this.state.worldX = Math.max(0, Math.min(worldW - viewW, this.state.worldX + dx));
    /* Clamp Y within a narrow vertical band (path area) */
    this.state.worldY = Math.max(-30, Math.min(30, this.state.worldY + dy));
    this.state.lastDir = dir;

    this._applyCamera();

    /* Player sprite stays horizontally centred; only Y shifts */
    const p = document.getElementById('map-player');
    if (p) {
      const centreX = viewW / 2 - 20;
      const centreY = viewH * 0.45 + this.state.worldY;
      p.style.left   = centreX + 'px';
      p.style.bottom = (viewH - centreY - 40) + 'px';
      p.className    = `map-player walk-${dir}`;
    }

    this._checkNPCProximity();
  }

  /* Slide the world so the camera follows the player */
  _applyCamera() {
    const world = document.getElementById('map-inner');
    if (world) world.style.transform = `translateX(${-this.state.worldX}px)`;
  }

  _checkNPCProximity() {
    const world = document.getElementById('map-inner');
    const viewW = world ? world.parentElement.offsetWidth  : 420;
    const viewH = world ? world.parentElement.offsetHeight : 300;
    const playerWorldX = this.state.worldX + viewW / 2;
    const dx   = Math.abs(playerWorldX - this.state.npcWorldX);
    const near = dx < 55;

    const hint = document.getElementById('map-talk-hint');
    const bub  = document.getElementById('npc-bubble');
    if (hint) {
      hint.style.display = near ? 'block' : 'none';
      hint.style.left   = (viewW / 2 - 28) + 'px';
      hint.style.bottom = (viewH * 0.56) + 'px';
    }
    if (bub) bub.style.opacity = near ? '0' : '1';
    this._updateDirArrow(near);
  }

  _updateDirArrow(nearNPC) {
    const arrow = document.getElementById('map-dir-arrow');
    if (!arrow) return;
    if (nearNPC) { arrow.style.display = 'none'; return; }
    const world = document.getElementById('map-inner');
    const viewW = world ? world.parentElement.offsetWidth  : 420;
    const viewH = world ? world.parentElement.offsetHeight : 300;
    const npcScreenX = this.state.npcWorldX - this.state.worldX;
    arrow.textContent   = npcScreenX >= viewW / 2 ? '▶' : '◀';
    arrow.style.display = 'block';
    arrow.style.left    = (viewW / 2 + 30) + 'px';
    arrow.style.bottom  = (viewH * 0.50) + 'px';
  }

  _nearNPC() {
    const world = document.getElementById('map-inner');
    const viewW = world ? world.parentElement.offsetWidth : 420;
    const playerWorldX = this.state.worldX + viewW / 2;
    return Math.abs(playerWorldX - this.state.npcWorldX) < 55;
  }

  _talkToNPC() {
    const arrow = document.getElementById('map-dir-arrow');
    if (arrow) arrow.style.display = 'none';
    this.startQuestion();
  }

  /* Place player at viewport centre, NPC at world-px position */
  _placeMapSprites() {
    const world = document.getElementById('map-inner');
    const viewW = world ? world.parentElement.offsetWidth  : 420;
    const viewH = world ? world.parentElement.offsetHeight : 300;

    const p = document.getElementById('map-player');
    if (p) {
      p.style.left      = (viewW / 2 - 20) + 'px';
      p.style.bottom    = (viewH * 0.42) + 'px';
      p.style.transform = 'scaleX(-1)';
      p.className       = 'map-player idle';
    }
    const npcWrap = document.getElementById('map-npc-wrap');
    if (npcWrap) {
      npcWrap.style.left   = (this.state.npcWorldX - 24) + 'px';
      npcWrap.style.bottom = (viewH * 0.42) + 'px';
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
     CONTROLLER VISIBILITY
     ══════════════════════════════════════════════════════════ */
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
    this._showController(false);
    const go = () => { document.getElementById('screen-title').removeEventListener('click',go); this.showContinueOrName(); };
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

      document.getElementById('btn-continue-save').onclick = () => this.restoreFromSave(save);
      document.getElementById('btn-new-game').onclick = () => {
        document.getElementById('continue-warn').textContent = 'Starting a new game will erase your saved progress!';
        document.getElementById('btn-new-game').textContent  = '✦ CONFIRM NEW GAME';
        document.getElementById('btn-new-game').onclick      = () => { clearSave(); this.startFresh(); };
      };
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

  addChar(ch) { if (this.state.playerName.length<10){ this.state.playerName+=ch; this.refreshNameDisplay(); } }
  delChar()   { this.state.playerName=this.state.playerName.slice(0,-1); this.refreshNameDisplay(); }
  refreshNameDisplay() {
    const el=document.getElementById('name-display');
    if(el) el.textContent=this.state.playerName+(this.state.playerName.length<10?'_':'');
  }
  confirmName() { if(!this.state.playerName.trim()) this.state.playerName='ASH'; this.showIntro(); }

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

  /* ── MAP ──────────────────────────────────────────────── */

  showMap() {
    this.show('map');
    this._showController(true);

    /* We need the viewport size — defer a tick so the DOM is laid out */
    requestAnimationFrame(() => {
      const world = document.getElementById('map-inner');
      const viewW = world ? world.parentElement.offsetWidth : 420;

      if (this.state.currentQ === 0) {
        /* First load — player at world origin, camera at 0,
           NPC spawns 1.5 screen-widths ahead (off-screen right) */
        this.state.worldX    = 0;
        this.state.worldY    = 0;
        this.state.npcWorldX = Math.round(viewW * 3.5);
        this.state.npcWorldY = 0;
      } else {
        /* After each question — player world-X advances to just before
           where the NPC was, camera resets so player appears centred,
           new NPC spawns another 1.5 screens ahead */
        this.state.worldX    = Math.max(0, this.state.npcWorldX - Math.round(viewW / 2));
        this.state.worldY    = 0;
        this.state.npcWorldX = this.state.worldX + Math.round(viewW * 3.0 + Math.random() * viewW * 0.8);
        this.state.npcWorldY = 0;
      }

      document.getElementById('hud-name').textContent = this.state.playerName||'ASH';
      this.updateHUD();

      const q = this.state.questions[this.state.currentQ];
      const npcEl = document.getElementById('map-npc');
      if (q && npcEl) npcEl.textContent = NPC[q.npc]||'🧑';

      this._placeMapSprites();
      this._updateDirArrow(false);
      saveGame(this.state);
      this.flashSaveDot();

      const npcEl2 = document.getElementById('map-npc');
      if (npcEl2) npcEl2.onclick = ()=>this._talkToNPC();
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

    indices.forEach((origIdx, slotIdx) => {
      const btn=document.createElement('button');
      btn.className='choice-btn';
      btn.setAttribute('data-letter', slotIdx + 1);
      btn.textContent=q.options[origIdx];
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
    } else { this.state.streak=0; this.state.wrong++; }

    setTimeout(()=>this.showResult(correct,q),850);
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
      ansEl.textContent='✓ Correct answer: '+q.options[q.answer];
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
      if(i<text.length){el.textContent+=text[i++];}
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
