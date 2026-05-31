
const ALL_POKEMON = [
  { name:'Charmander',  emoji:'🔥', type:'Fire' },
  { name:'Squirtle',    emoji:'💧', type:'Water' },
  { name:'Bulbasaur',   emoji:'🌿', type:'Grass' },
  { name:'Pikachu',     emoji:'⚡', type:'Electric' },
  { name:'Eevee',       emoji:'🦊', type:'Normal' },
  { name:'Jigglypuff',  emoji:'🎀', type:'Fairy' },
  { name:'Gengar',      emoji:'👻', type:'Ghost' },
  { name:'Snorlax',     emoji:'😴', type:'Normal' },
  { name:'Machamp',     emoji:'💪', type:'Fighting' },
  { name:'Alakazam',    emoji:'🔮', type:'Psychic' },
  { name:'Gyarados',    emoji:'🐉', type:'Dragon' },
  { name:'Lapras',      emoji:'🐋', type:'Water' },
  { name:'Dragonite',   emoji:'🐲', type:'Dragon' },
  { name:'Mewtwo',      emoji:'🧬', type:'Psychic' },
  { name:'Arcanine',    emoji:'🐕', type:'Fire' },
  { name:'Rapidash',    emoji:'🦄', type:'Fire' },
  { name:'Geodude',     emoji:'🪨', type:'Rock' },
  { name:'Onix',        emoji:'🐍', type:'Rock' },
  { name:'Haunter',     emoji:'😈', type:'Ghost' },
  { name:'Abra',        emoji:'🧘', type:'Psychic' },
  { name:'Pidgeot',     emoji:'🦅', type:'Flying' },
  { name:'Butterfree',  emoji:'🦋', type:'Bug' },
  { name:'Sandslash',   emoji:'🦔', type:'Ground' },
  { name:'Ninetales',   emoji:'🦊', type:'Fire' },
  { name:'Tentacruel',  emoji:'🐙', type:'Water' },
  { name:'Magnemite',   emoji:'🧲', type:'Electric' },
  { name:'Cloyster',    emoji:'🐚', type:'Ice' },
  { name:'Hitmonlee',   emoji:'🦵', type:'Fighting' },
  { name:'Starmie',     emoji:'⭐', type:'Water' },
  { name:'Scyther',     emoji:'🦗', type:'Bug' },
  { name:'Magikarp',    emoji:'🐟', type:'Water' },
  { name:'Ditto',       emoji:'🟣', type:'Normal' },
  { name:'Voltorb',     emoji:'🔴', type:'Electric' },
  { name:'Cubone',      emoji:'🦴', type:'Ground' },
  { name:'Chansey',     emoji:'🥚', type:'Normal' },
  { name:'Kangaskhan',  emoji:'🦘', type:'Normal' },
  { name:'Pinsir',      emoji:'🪲', type:'Bug' },
  { name:'Tauros',      emoji:'🐂', type:'Normal' },
  { name:'Vaporeon',    emoji:'💎', type:'Water' },
  { name:'Flareon',     emoji:'🌋', type:'Fire' },
  { name:'Jolteon',     emoji:'⚡', type:'Electric' },
];

const STARTER_POOL = [
  { name:'Charmander', emoji:'🔥', type:'Fire' },
  { name:'Squirtle',   emoji:'💧', type:'Water' },
  { name:'Bulbasaur',  emoji:'🌿', type:'Grass' },
];

function setNPC(el, val) {
  if (!el) return;
  if (val && val.endsWith('.png')) {
    el.innerHTML = '';
    const img = document.createElement('img');
    img.src = val.includes('/') ? val : './' + val;
    img.style.cssText = 'width:auto;image-rendering:pixelated;vertical-align:middle;display:block;';
    el.appendChild(img);
  } else {
    el.textContent = val || '🧑';
  }
}

const NPC = {
  'Professor Oak':     'oak.png',
  'Rival Gary':        'gary.png',
  'Old Man Bob':       'bob.png',
  'Nurse Joy':         'joy.png',
  'Officer Jenny':     'jenny.png',
  'Brock':             'brock.png',
  'Misty':             'misty.png',
  'Giovanni':          '😈',
  'Team Rocket Grunt': '🚀',
  'Scientist Bill':    '🔬',
  'Fisherman Ralph':   'ralph.png',
  'Hiker Taro':        'taro.png',
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
  'Gary':              'gary.png',
};

const INTRO_MSGS = CONFIG.introLines.map(text => ({ speaker:'PROFESSOR OAK', npc:'Professor Oak', text }));

const CORRECT_FB = ["That's right!","Excellent work!","Perfect!","Outstanding!","Correct!","You're a natural!","Great answer!","Spot on!","Impressive!","Well done!"];
const WRONG_FB   = ["Not quite...","Hmm, that's not it.","Try again next time!","Almost...","Not this time!"];


const SAVE_KEY = CONFIG.saveKey;
const MILESTONES = CONFIG.milestones;

function saveGame(s) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({
    playerName:s.playerName, currentQ:s.currentQ, score:s.score,
    streak:s.streak, maxStreak:s.maxStreak, correct:s.correct, wrong:s.wrong,
    questionOrder:s.questions.map(q=>q.id), savedAt:Date.now(),
    party:s.party, pokeballs:s.pokeballs, playerLevel:s.playerLevel,
    caughtCount:s.caughtCount,
  })); } catch(_){}
}
function loadGame()  { try { const r=localStorage.getItem(SAVE_KEY); return r?JSON.parse(r):null; } catch(_){return null;} }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch(_){} }

const Music = (() => {
  let audio    = null;
  let rival    = null;
  let muted    = false;
  let wantPlay = false;

  function getAudio() {
    if (!audio) {
      audio          = new Audio('./music.mp3');
      audio.loop     = true;
      audio.volume   = 0.375;
      audio.preload  = 'auto';
      audio.addEventListener('canplaythrough', () => {
        if (wantPlay && !muted) audio.play().catch(() => {});
      });
    }
    return audio;
  }

  function getRival() {
    if (!rival) {
      rival         = new Audio('./music-rival.mp3');
      rival.loop    = true;
      rival.volume  = 0.375;
      rival.preload = 'auto';
    }
    return rival;
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
      if (rival && !rival.paused) return;
      const a = getAudio();
      if (a.readyState >= 3) {
        if (a.paused) a.play().catch((e) => { console.warn('Music play blocked:', e); });
      }
    },
    pause() {
      wantPlay = false;
      if (audio && !audio.paused) audio.pause();
      if (rival && !rival.paused) rival.pause();
    },
    playBattle() {
      if (muted) return;
      if (audio && !audio.paused) audio.pause();
      const r = getRival();
      if (r.paused) { r.currentTime = 0; r.play().catch(() => {}); }
    },
    stopBattle() {
      if (rival && !rival.paused) { rival.pause(); rival.currentTime = 0; }
    },
    toggle() {
      muted = !muted;
      updateBtn();
      if (muted) Music.pause();
      else       Music.play();
    },
    unblock() {
      const a = getAudio();
      if (wantPlay && !muted && a.paused) {
        a.play().catch(() => {});
      }
    },
  };
})();

const SFX = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function unlock() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume().then(() => {});
  }
  document.addEventListener('touchstart',  unlock, { once: true, passive: true });
  document.addEventListener('pointerdown', unlock, { once: true, passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  });

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

  function seq(notes, type='square', vol=0.18) {
    const c = getCtx();
    let t = c.currentTime + 0.02;
    notes.forEach(n => {
      if (n.f) tone(n.f, type, vol, 0.01, n.d * 0.6, n.d * 0.4, t);
      t += n.d;
    });
  }

  return {
    boot()           { seq([{f:262,d:.1},{f:330,d:.1},{f:392,d:.1},{f:523,d:.25}], 'square', 0.2); },
    overworldStart() { seq([{f:392,d:.12},{f:440,d:.12},{f:494,d:.12},{f:523,d:.18},{f:494,d:.1},{f:440,d:.1},{f:392,d:.18},{f:330,d:.12},{f:392,d:.12},{f:440,d:.12},{f:392,d:.24}], 'square', 0.12); },
    step()           { tone(180, 'square', 0.04, 0.005, 0.02, 0.03); },
    encounter()      { seq([{f:523,d:.1},{f:659,d:.18}], 'square', 0.22); },
    type()           { tone(880 + Math.random()*200, 'square', 0.03, 0.005, 0.01, 0.02); },
    select()         { const c = getCtx(); tone(440, 'square', 0.12, 0.005, 0.03, 0.04, c.currentTime + 0.05); },
    backspace()      { seq([{f:350,d:.05},{f:250,d:.08}], 'triangle', 0.12); },
    correct()        { seq([{f:523,d:.08},{f:659,d:.08},{f:784,d:.08},{f:1047,d:.2}], 'square', 0.18); },
    streak()         { seq([{f:523,d:.06},{f:659,d:.06},{f:784,d:.06},{f:1047,d:.06},{f:1319,d:.2}], 'square', 0.18); },
    wrong()          { seq([{f:330,d:.1},{f:277,d:.1},{f:233,d:.18}], 'sawtooth', 0.15); },
    levelUp()        { seq([{f:523,d:.1},{f:659,d:.1},{f:784,d:.1},{f:659,d:.1},{f:784,d:.1},{f:1047,d:.3}], 'square', 0.2); },
    complete()       { seq([{f:523,d:.1},{f:659,d:.1},{f:784,d:.1},{f:1047,d:.1},{f:784,d:.08},{f:880,d:.08},{f:1047,d:.08},{f:1319,d:.4}], 'square', 0.2); },
    confirm()        { seq([{f:523,d:.08},{f:784,d:.15}], 'square', 0.18); },
    catch()          { seq([{f:330,d:.08},{f:440,d:.08},{f:523,d:.08},{f:659,d:.15},{f:784,d:.25}], 'square', 0.2); },
    pokeball()       { seq([{f:600,d:.06},{f:500,d:.06},{f:400,d:.06},{f:300,d:.1}], 'triangle', 0.15); },
    pokeballBounce() { seq([{f:300,d:.04},{f:500,d:.06},{f:200,d:.08}], 'triangle', 0.12); },
    escape()         { seq([{f:400,d:.08},{f:350,d:.08},{f:250,d:.15}], 'sawtooth', 0.12); },
    attack()         { seq([{f:200,d:.04},{f:400,d:.04},{f:600,d:.04},{f:800,d:.03},{f:1000,d:.03},{f:600,d:.06}], 'sawtooth', 0.2); },
    battleWin()      { seq([{f:523,d:.1},{f:659,d:.1},{f:784,d:.12},{f:1047,d:.15},{f:1319,d:.25}], 'square', 0.22); },
    battleLose()     { seq([{f:400,d:.12},{f:350,d:.12},{f:300,d:.14},{f:200,d:.25}], 'sawtooth', 0.18); },
  };
})();

function getPlayerLevel(state) {
  return Math.max(1, Math.floor(state.correct * 1.2) + 1);
}

function randomPokemonForNPC() {
  const pool = ALL_POKEMON.filter(p => !STARTER_POOL.find(s => s.name === p.name));
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const level = Math.floor(Math.random() * 15) + 1;
  return { ...pick, level };
}

function randomWildPokemon(playerLevel) {
  const pick = ALL_POKEMON[Math.floor(Math.random() * ALL_POKEMON.length)];
  const minLvl = Math.max(1, playerLevel - 3);
  const maxLvl = playerLevel + 5;
  const level = Math.floor(Math.random() * (maxLvl - minLvl + 1)) + minLvl;
  return { ...pick, level };
}

class Game {
  constructor() {
    this.state = {
      screen:'boot', playerName:'', questions:[], currentQ:0,
      score:0, streak:0, maxStreak:0, correct:0, wrong:0,
      answering:false, introStep:0, twTimer:null,
      worldX: 0, worldY: 0,
      npcWorldX: 0, npcWorldY: 0,
      npcSpawned: false,
      pathDir: 'right',
      lastDir: 'right',
      cursor:0,
      party: [],
      pokeballs: 0,
      playerLevel: 1,
      caughtCount: 0,
      activePokemon: null,
      wildWorldX: 0, wildWorldY: 0,
      wildSpawned: false,
      currentWild: null,
      currentNPCPokemon: null,
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

  _bindController() {
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

    document.getElementById('btn-start').addEventListener('pointerdown', (e)=>{ e.preventDefault(); if (this.state.screen === 'name') { this.confirmName(); } else { this._pressA(); } });
    document.getElementById('btn-select').addEventListener('pointerdown', (e)=>{ e.preventDefault(); });
  }

  _pressA() {
    const s = this.state.screen;
    if (s === 'title')   { document.getElementById('screen-title')?.click(); return; }
    if (s === 'name')    { this._nameKeyConfirm(); return; }
    if (s === 'continue') {
      if (this._contCursor === 1) document.getElementById('btn-new-game')?.click();
      else document.getElementById('btn-continue-save')?.click();
      return;
    }
    if (s === 'map')                             { this._talkToNPC(); return; }
    if (s === 'battle' && !this.state.answering) { this._confirmCursor(); return; }
    if (s === 'intro')   { this.advanceIntro(); return; }
    if (s === 'party-select') { this._partySelectConfirm(); return; }
    if (s === 'starter') { this.pickStarter(this._starterCursor||0); return; }
    if (s === 'starter-confirm') { document.getElementById('btn-starter-continue')?.click(); return; }
    if (s === 'catch')   { const btns = document.querySelectorAll('.catch-action-btn'); if (btns[this._catchCursor||0]) btns[this._catchCursor||0].click(); return; }
    if (s === 'catch-result') { document.getElementById('btn-catch-continue')?.click(); return; }
    if (s === 'result')  { document.getElementById('btn-result-cont')?.click(); return; }
    if (s === 'levelup') { document.getElementById('btn-lu-cont')?.click(); return; }
  }

  _pressB() {
    const s = this.state.screen;
    if (s === 'name')   { this.delChar(); return; }
    if (s === 'map')                            { this._talkToNPC(); return; }
    if (s === 'battle' && this.state.answering) { return; }
    if (s === 'battle' && !this.state.answering) { this._confirmCursor(); return; }
    if (s === 'intro')  { this.advanceIntro(); return; }
    if (s === 'catch')  { const btns = document.querySelectorAll('.catch-action-btn'); if (btns[this._catchCursor||0]) btns[this._catchCursor||0].click(); return; }
    if (s === 'result') { document.getElementById('btn-result-cont')?.click(); return; }
    if (s === 'starter-confirm') { document.getElementById('btn-starter-continue')?.click(); return; }
    if (s === 'catch-result') { document.getElementById('btn-catch-continue')?.click(); return; }
    if (s === 'levelup') { document.getElementById('btn-lu-cont')?.click(); return; }
  }

  _dpadStart(dir) {
    const s = this.state.screen;
    if (s === 'name') {
      const COLS = 10;
      const keys = this._getNameKeys();
      const total = keys.length;
      let c = this._gpKeyCursor;
      const row = Math.floor(c / COLS);
      const col = c % COLS;
      const totalRows = Math.ceil(total / COLS);
      if (dir === 'right') {
        c = (col + 1 >= COLS || c + 1 >= total) ? row * COLS : c + 1;
      }
      if (dir === 'left') {
        c = (col - 1 < 0) ? Math.min(row * COLS + COLS - 1, total - 1) : c - 1;
      }
      if (dir === 'down') {
        c = c + COLS >= total ? col : c + COLS;
      }
      if (dir === 'up') {
        c = c - COLS < 0 ? Math.min((totalRows - 1) * COLS + col, total - 1) : c - COLS;
      }
      this._gpKeyCursor = c;
      this._renderNameCursor();
      SFX.select();
      return;
    }
    if (s === 'party-select' && (dir === 'up' || dir === 'down')) {
      const max = (this._partySelectOrdered || []).length - 1;
      this._partySelectCursor = dir === 'up' ? Math.max(0, this._partySelectCursor - 1) : Math.min(max, this._partySelectCursor + 1);
      this._renderPartySelectCursor();
      SFX.select();
      return;
    }
    if (s === 'continue' && (dir === 'up' || dir === 'down')) {
      this._contCursor = this._contCursor === 0 ? 1 : 0;
      this._renderContCursor();
      return;
    }
    if (s === 'starter' && (dir === 'left' || dir === 'right')) {
      this._starterCursor = dir === 'left' ? Math.max(0, (this._starterCursor||0) - 1) : Math.min(2, (this._starterCursor||0) + 1);
      this._renderStarterCursor();
      return;
    }
    if (s === 'catch' && (dir === 'left' || dir === 'right')) {
      this._catchCursor = dir === 'left' ? 0 : 1;
      this._renderCatchCursor();
      return;
    }
    if (s === 'battle') { this._moveCursor(dir); }
    this._heldKeys.add(dir);
    if (!this._walkLoop) this._startWalkLoop();
  }

  _dpadEnd(dir) {
    this._heldKeys.delete(dir);
    if (this._heldKeys.size === 0) this._stopWalkLoop();
  }

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
        const dir = this.state.lastDir;
        const idleFrames = { right:'-320px', down:'-32px', left:'-128px', up:'-224px' };
        const frame = idleFrames[dir] || '-32px';
        p.className = 'map-player idle';
        requestAnimationFrame(() => {
          p.style.backgroundPositionX = frame;
        });
      }
    }
  }

  _getViewport() {
    const w = document.getElementById('map-world');
    return {
      viewW: (w && w.offsetWidth)  || 420,
      viewH: (w && w.offsetHeight) || 300,
    };
  }

  _walkTick() {
    if (this.state.screen !== 'map') return;
    const {viewW, viewH} = this._getViewport();
    const SPEED = 8;
    let dx = 0, dy = 0, dir = '';
    if (this._heldKeys.has('right')) { dx =  SPEED; dir = 'right'; }
    if (this._heldKeys.has('left'))  { dx = -SPEED; dir = 'left';  }
    if (this._heldKeys.has('up'))    { dy = -SPEED; dir = 'up';    }
    if (this._heldKeys.has('down'))  { dy =  SPEED; dir = 'down';  }
    if (!dir) return;

    this.state.worldX += dx;
    this.state.worldY += dy;

    this.state.lastDir = dir;

    this._applyCamera();

    const p   = document.getElementById('map-player');
    const bub = document.getElementById('player-bubble');
    if (p) {
      const cx  = viewW / 2 - 16;
      const bot = viewH * 0.45;
      p.style.left   = cx + 'px';
      p.style.bottom = bot + 'px';
      p.className    = `map-player walk-${dir}`;
      if (bub) { bub.style.left = (cx - 4) + 'px'; bub.style.bottom = (bot + 66) + 'px'; }
    }
    this._checkNPCProximity();
    this._checkWildProximity();
  }

  _applyCamera() {
    const {viewW, viewH} = this._getViewport();
    const spread = Math.max(viewW, viewH) * 5;
    const inner = document.getElementById('map-inner');
    const tx = -(spread + this.state.worldX - viewW / 2);
    const ty = -(spread + this.state.worldY - viewH / 2);
    if (inner) inner.style.transform = `translate(${tx}px,${ty}px)`;
    this._positionNPCOnScreen();
    this._positionWildOnScreen();
  }

  _positionNPCOnScreen() {
    const {viewW, viewH} = this._getViewport();
    const npcWrap = document.getElementById('map-npc-wrap');
    if (npcWrap) {
      const screenX = viewW / 2 + (this.state.npcWorldX - this.state.worldX) - 24;
      const screenY = viewH / 2 + (this.state.npcWorldY - this.state.worldY) - 24;
      npcWrap.style.left   = screenX + 'px';
      npcWrap.style.bottom = (viewH - screenY - 48) + 'px';
    }
  }

  _positionWildOnScreen() {
    const {viewW, viewH} = this._getViewport();
    const wildWrap = document.getElementById('map-wild-wrap');
    if (wildWrap && this.state.wildSpawned) {
      const screenX = viewW / 2 + (this.state.wildWorldX - this.state.worldX) - 24;
      const screenY = viewH / 2 + (this.state.wildWorldY - this.state.worldY) - 24;
      wildWrap.style.left   = screenX + 'px';
      wildWrap.style.bottom = (viewH - screenY - 48) + 'px';
      wildWrap.style.display = 'block';
    }
  }

  _playerScreenOffset() {
    const {viewW, viewH} = this._getViewport();
    return { px: viewW / 2, py: viewH - (viewH * 0.45) - 32 };
  }

  _npcScreenDist() {
    const {viewW, viewH} = this._getViewport();
    const {px, py} = this._playerScreenOffset();
    const npcSX = viewW / 2 + (this.state.npcWorldX - this.state.worldX);
    const npcSY = viewH / 2 + (this.state.npcWorldY - this.state.worldY);
    return Math.sqrt((npcSX - px) ** 2 + (npcSY - py) ** 2);
  }

  _wildScreenDist() {
    if (!this.state.wildSpawned) return Infinity;
    const {viewW, viewH} = this._getViewport();
    const {px, py} = this._playerScreenOffset();
    const wSX = viewW / 2 + (this.state.wildWorldX - this.state.worldX);
    const wSY = viewH / 2 + (this.state.wildWorldY - this.state.worldY);
    return Math.sqrt((wSX - px) ** 2 + (wSY - py) ** 2);
  }

  _checkNPCProximity() {
    const {viewW, viewH} = this._getViewport();
    const dist = this._npcScreenDist();
    const near = this.state.npcSpawned && dist < 100;

    const hint = document.getElementById('map-talk-hint');
    const bub  = document.getElementById('npc-bubble');
    if (hint) {
      const npcSX = viewW / 2 + (this.state.npcWorldX - this.state.worldX);
      const npcSY = viewH / 2 + (this.state.npcWorldY - this.state.worldY);
      hint.style.display = near ? 'block' : 'none';
      hint.style.left   = (npcSX - 28) + 'px';
      hint.style.bottom = (viewH - npcSY + 48) + 'px';
    }
    if (bub) bub.style.opacity = near ? '0' : '1';
    this._updateDirArrow(near);
  }

  _checkWildProximity() {
    if (!this.state.wildSpawned || !this.state.currentWild) return;
    const dist = this._wildScreenDist();
    if (dist < 80) {
      this._stopWalkLoop();
      this._heldKeys.clear();
      SFX.encounter();
      this.showCatchScreen();
    }
  }

  _updateDirArrow(nearNPC) {
    const arrow = document.getElementById('map-dir-arrow');
    if (!arrow) return;
    if (nearNPC) { arrow.style.display = 'none'; arrow.style.animation = 'none'; this._stopArrowCycle(); return; }
    const {viewW, viewH} = this._getViewport();
    const dx = this.state.npcWorldX - this.state.worldX;
    const dy = this.state.npcWorldY - this.state.worldY;
    let pd;
    if (Math.abs(dx) >= Math.abs(dy)) {
      pd = dx >= 0 ? 'right' : 'left';
    } else {
      pd = dy >= 0 ? 'down' : 'up';
    }

    const isLandscape = window.innerWidth > window.innerHeight;
    const ctrlH = isLandscape ? 0 : Math.round(Math.min(148, Math.max(110, window.innerWidth * 0.22)));
    const safeBottom = ctrlH + 12;
    const midY = (viewH - ctrlH) / 2 - 16;

    const glyphs = { right:'▶', left:'◀', up:'▲', down:'▼' };
    arrow.textContent     = glyphs[pd];
    if (this._arrowDir !== pd) {
      this._arrowDir = pd;
      arrow.style.display   = 'block';
      arrow.style.animation = 'arrowPulse .7s ease-in-out infinite';
      this._startArrowCycle(arrow);
    }
    if (pd === 'right') {
      arrow.style.removeProperty('left');
      arrow.style.right  = '12px';
      arrow.style.bottom = midY + 'px';
    } else if (pd === 'left') {
      arrow.style.removeProperty('right');
      arrow.style.left   = '12px';
      arrow.style.bottom = midY + 'px';
    } else if (pd === 'up') {
      arrow.style.removeProperty('right');
      arrow.style.left   = (viewW / 2 - 16) + 'px';
      arrow.style.bottom = (viewH - ctrlH - 48) + 'px';
    } else {
      arrow.style.removeProperty('right');
      arrow.style.left   = (viewW / 2 - 16) + 'px';
      arrow.style.bottom = safeBottom + 'px';
    }
  }

  _startArrowCycle(arrow) {
    this._stopArrowCycle();
    arrow.style.opacity = '0';
    const cycle = () => {
      if (!arrow || arrow.style.display === 'none') return;
      arrow.style.opacity = '1';
      this._arrowHideTimer = setTimeout(() => {
        arrow.style.opacity = '0';
      }, 3000);
    };
    cycle();
    this._arrowInterval = setInterval(cycle, 15000);
  }

  _stopArrowCycle() {
    clearInterval(this._arrowInterval);
    clearTimeout(this._arrowHideTimer);
    this._arrowInterval = null;
    this._arrowHideTimer = null;
    this._arrowDir = null;
  }

  _nearNPC() {
    if (!this.state.npcSpawned) return false;
    return this._npcScreenDist() < 100;
  }

  _talkToNPC() {
    if (!this._nearNPC()) {
      const bub = document.getElementById('player-bubble');
      if (bub) {
        bub.classList.remove('visible');
        void bub.offsetWidth;
        bub.classList.add('visible');
        clearTimeout(this._bubbleTimer);
        this._bubbleTimer = setTimeout(() => bub.classList.remove('visible'), 1500);
      }
      return;
    }
    const arrow = document.getElementById('map-dir-arrow');
    if (arrow) { arrow.style.display = 'none'; arrow.style.animation = 'none'; this._stopArrowCycle(); }
    const bub = document.getElementById('player-bubble');
    if (bub) bub.classList.remove('visible');
    SFX.encounter();
    const conscious = this.state.party.filter(p => !p.fainted);
    if (conscious.length > 1) {
      this.showPartySelect();
    } else {
      this.state.activePokemon = conscious[0] || this.state.party[0];
      this.startQuestion();
    }
  }

  showPartySelect() {
    this.show('party-select');
    this._showController(true);
    this._partySelectCursor = 0;

    const list = document.getElementById('party-select-list');
    list.innerHTML = '';

    const ordered = [...this.state.party].reverse().sort((a, b) => (a.fainted ? 1 : 0) - (b.fainted ? 1 : 0));

    ordered.forEach((poke, i) => {
      const entry = document.createElement('div');
      entry.className = 'party-select-entry' + (poke.fainted ? ' fainted' : '');
      if (i === 0 && !poke.fainted) entry.classList.add('party-selected');

      const emojiWrap = document.createElement('div');
      emojiWrap.className = 'party-select-emoji';
      emojiWrap.textContent = poke.emoji;
      if (poke.fainted) {
        const zzz = document.createElement('span');
        zzz.className = 'party-select-zzz';
        zzz.textContent = 'zZz';
        emojiWrap.appendChild(zzz);
      }

      const info = document.createElement('div');
      info.className = 'party-select-info';
      info.innerHTML = `<div class="party-select-name">${poke.name.toUpperCase()}</div><div class="party-select-detail">${poke.type} · Lv ${poke.level}</div>`;

      const badge = document.createElement('div');
      badge.className = 'party-select-badge' + (poke.fainted ? ' badge-fainted' : '');
      badge.textContent = poke.fainted ? 'FAINTED' : 'READY';

      entry.appendChild(emojiWrap);
      entry.appendChild(info);
      entry.appendChild(badge);

      if (!poke.fainted) {
        entry.addEventListener('click', () => {
          this.state.activePokemon = poke;
          SFX.confirm();
          this.startQuestion();
        });
      }

      list.appendChild(entry);
    });

    this._partySelectOrdered = ordered;
    this._renderPartySelectCursor();
  }

  _renderPartySelectCursor() {
    const entries = document.querySelectorAll('.party-select-entry');
    entries.forEach((e, i) => {
      e.classList.toggle('party-selected', i === this._partySelectCursor && !e.classList.contains('fainted'));
      if (i === this._partySelectCursor) {
        e.scrollIntoView({ block:'nearest', behavior:'smooth' });
      }
    });
  }

  _partySelectConfirm() {
    const ordered = this._partySelectOrdered;
    if (!ordered) return;
    const poke = ordered[this._partySelectCursor];
    if (poke && !poke.fainted) {
      this.state.activePokemon = poke;
      SFX.confirm();
      this.startQuestion();
    }
  }

  _placeMapSprites() {
    const {viewW, viewH} = this._getViewport();
    const idleFrames = { right:'-320px', down:'-32px', left:'-128px', up:'-224px' };
    const p   = document.getElementById('map-player');
    const bub = document.getElementById('player-bubble');
    if (p) {
      const cx  = viewW / 2 - 16;
      const bot = viewH * 0.45;
      p.style.left   = cx + 'px';
      p.style.bottom = bot + 'px';
      p.className    = 'map-player idle';
      p.style.backgroundPositionX = idleFrames[this.state.lastDir] || '-32px';
      if (bub) { bub.style.left = (cx - 4) + 'px'; bub.style.bottom = (bot + 66) + 'px'; }
    }
    this._applyCamera();
    const hint = document.getElementById('map-talk-hint');
    if (hint) hint.style.display = 'none';
  }

  _moveCursor(dir) {
    const btns = document.querySelectorAll('.choice-btn:not(.disabled):not(.correct):not(.wrong):not(.confirm-inactive)');
    if (!btns.length) return;
    const total = btns.length;
    let c = this.state.cursor;
    const hasConfirm = total === 5;
    if      (dir === 'right') c = (c === 0) ? 1 : (c === 2) ? 3 : c;
    else if (dir === 'left')  c = (c === 1) ? 0 : (c === 3) ? 2 : (c === 4) ? 4 : c;
    else if (dir === 'down')  c = (c === 0) ? 2 : (c === 1) ? 3 : (hasConfirm && (c === 2 || c === 3)) ? 4 : c;
    else if (dir === 'up')    c = (c === 2) ? 0 : (c === 3) ? 1 : (c === 4) ? 2 : c;
    c = Math.min(c, total - 1);
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
    const btns = document.querySelectorAll('.choice-btn:not(.disabled):not(.correct):not(.wrong):not(.confirm-inactive)');
    const target = btns[this.state.cursor];
    if (target) target.click();
  }

  _bindGlobalKeys() {
    const DPAD_KEYS = {
      'ArrowUp':'up','ArrowDown':'down','ArrowLeft':'left','ArrowRight':'right',
      'w':'up','s':'down','a':'left','d':'right',
      'W':'up','S':'down','A':'left','D':'right',
    };

    document.addEventListener('keydown', (e) => {
      const s = this.state.screen;

      if (s === 'name') {
        if (e.key==='Backspace') { e.preventDefault(); this.delChar(); }
        else if (e.key==='Enter') this.confirmName();
        else if (e.key.length===1 && /[A-Z0-9.\-!?]/i.test(e.key)) this.addChar(e.key.toUpperCase());
        return;
      }

      if (s === 'title' && (e.key==='Enter'||e.key===' ')) { document.getElementById('screen-title').click(); return; }
      if (s === 'party-select') {
        if (e.key==='ArrowUp'||e.key==='w'||e.key==='W') {
          this._partySelectCursor = Math.max(0, this._partySelectCursor - 1);
          this._renderPartySelectCursor();
          SFX.select();
          return;
        }
        if (e.key==='ArrowDown'||e.key==='s'||e.key==='S') {
          const max = (this._partySelectOrdered || []).length - 1;
          this._partySelectCursor = Math.min(max, this._partySelectCursor + 1);
          this._renderPartySelectCursor();
          SFX.select();
          return;
        }
        if (e.key==='Enter'||e.key===' '||e.key==='e'||e.key==='E') {
          this._partySelectConfirm();
          return;
        }
        return;
      }
      if (s === 'continue') {
        if (e.key==='ArrowUp'||e.key==='w'||e.key==='W'||e.key==='ArrowDown'||e.key==='s'||e.key==='S') {
          this._contCursor = this._contCursor === 0 ? 1 : 0;
          this._renderContCursor();
          return;
        }
        if (e.key==='Enter'||e.key===' '||e.key==='e'||e.key==='E') {
          if (this._contCursor === 1) document.getElementById('btn-new-game')?.click();
          else document.getElementById('btn-continue-save')?.click();
          return;
        }
        return;
      }
      if (s === 'intro' && (e.key==='Enter'||e.key===' '||e.key==='e'||e.key==='E')) { this.advanceIntro(); return; }

      if (s === 'starter') {
        if (e.key==='1'||e.key==='2'||e.key==='3') {
          this._starterCursor = parseInt(e.key) - 1;
          this._renderStarterCursor();
          setTimeout(() => this.pickStarter(this._starterCursor), 150);
          return;
        }
        if (e.key==='ArrowLeft'||e.key==='a'||e.key==='A') {
          this._starterCursor = Math.max(0, (this._starterCursor||0) - 1);
          this._renderStarterCursor();
          return;
        }
        if (e.key==='ArrowRight'||e.key==='d'||e.key==='D') {
          this._starterCursor = Math.min(2, (this._starterCursor||0) + 1);
          this._renderStarterCursor();
          return;
        }
        if (e.key==='Enter'||e.key===' '||e.key==='e'||e.key==='E') {
          this.pickStarter(this._starterCursor||0);
          return;
        }
        return;
      }

      if (s === 'starter-confirm' && (e.key==='Enter'||e.key===' ')) {
        document.getElementById('btn-starter-continue')?.click();
        return;
      }

      if (s === 'catch') {
        if (e.key==='1'||e.key==='2') {
          const btns = document.querySelectorAll('.catch-action-btn');
          if (e.key==='1' && btns[0]) btns[0].click();
          if (e.key==='2' && btns[1]) btns[1].click();
          return;
        }
        if (e.key==='ArrowLeft'||e.key==='a'||e.key==='A') {
          this._catchCursor = 0;
          this._renderCatchCursor();
          return;
        }
        if (e.key==='ArrowRight'||e.key==='d'||e.key==='D') {
          this._catchCursor = 1;
          this._renderCatchCursor();
          return;
        }
        if (e.key==='Enter'||e.key===' '||e.key==='e'||e.key==='E') {
          const btns = document.querySelectorAll('.catch-action-btn');
          if (btns[this._catchCursor||0]) btns[this._catchCursor||0].click();
          return;
        }
        return;
      }

      if (s === 'catch-result' && (e.key==='Enter'||e.key===' ')) {
        document.getElementById('btn-catch-continue')?.click();
        return;
      }

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

      if ((e.key==='Enter'||e.key==='e'||e.key==='E') && !e.repeat) {
        e.preventDefault();
        this._pressA();
        return;
      }

      if ((e.key==='x'||e.key==='X') && !e.repeat) { this._pressB(); return; }

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

  _bindGamepad() {
    this._gpPrev   = {};
    this._gpActive = false;

    window.addEventListener('gamepadconnected', (e) => {
      console.log('Gamepad connected:', e.gamepad.id);
    });

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

    if (s === 'name') {
      const letterKeys = Array.from(document.querySelectorAll('.key-btn'));
      const delBtn     = document.getElementById('btn-backspace');
      const okBtn      = document.getElementById('btn-confirm-name');
      const keys       = [...letterKeys, delBtn, okBtn].filter(Boolean);
      const total      = keys.length;
      const COLS       = 10;

      keys.forEach((k, i) => {
        k.style.outline       = i === this._gpKeyCursor ? '3px solid #f8c030' : '';
        k.style.outlineOffset = i === this._gpKeyCursor ? '-2px' : '';
      });

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

      if (justPressed(0) || justPressed(1)) {
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
      if (justPressed(2)) {
        this.delChar();
      }
      if (justPressed(9) || justPressed(8)) {
        this.confirmName();
      }

    } else {

      if (s === 'continue') {
        const movedUp   = gpDirs.up   && !this._gpPrev['axis_up'];
        const movedDown = gpDirs.down  && !this._gpPrev['axis_down'];
        if (movedUp || movedDown) {
          this._contCursor = this._contCursor === 0 ? 1 : 0;
          this._renderContCursor();
        }
      }

      Object.entries(gpDirs).forEach(([dir, active]) => {
        const key = `axis_${dir}`;
        if (active && !this._gpPrev[key]) {
          if (s === 'map') {
            this._heldKeys.add(dir);
            if (!this._walkLoop) this._startWalkLoop();
          }
          if (s === 'battle') this._moveCursor(dir);
          if (s === 'party-select' && (dir === 'up' || dir === 'down')) {
            const max = (this._partySelectOrdered || []).length - 1;
            this._partySelectCursor = dir === 'up' ? Math.max(0, this._partySelectCursor - 1) : Math.min(max, this._partySelectCursor + 1);
            this._renderPartySelectCursor();
            SFX.select();
          }
          if (s === 'starter' && (dir === 'left' || dir === 'right')) {
            this._starterCursor = dir === 'left' ? Math.max(0, (this._starterCursor||0) - 1) : Math.min(2, (this._starterCursor||0) + 1);
            this._renderStarterCursor();
          }
          if (s === 'catch' && (dir === 'left' || dir === 'right')) {
            this._catchCursor = dir === 'left' ? 0 : 1;
            this._renderCatchCursor();
          }
        } else if (!active && this._gpPrev[key]) {
          this._heldKeys.delete(dir);
          if (this._heldKeys.size === 0) this._stopWalkLoop();
        }
      });

      if (justPressed(0) || justPressed(9)) {
        if      (s === 'boot')     { }
        else if (s === 'title')    { document.getElementById('screen-title')?.click(); }
        else if (s === 'continue') {
          if (this._contCursor === 0) document.getElementById('btn-continue-save')?.click();
          else                          document.getElementById('btn-new-game')?.click();
        }
        else if (s === 'intro')    { this.advanceIntro(); }
        else if (s === 'battle' && !this.state.answering) { this._confirmCursor(); }
        else if (s === 'result')   { document.getElementById('btn-result-cont')?.click(); }
        else if (s === 'levelup')  { document.getElementById('btn-lu-cont')?.click(); }
        else if (s === 'complete') { document.getElementById('btn-play-again')?.click(); }
        else if (s === 'starter-confirm') { document.getElementById('btn-starter-continue')?.click(); }
        else if (s === 'party-select') { this._partySelectConfirm(); }
        else if (s === 'starter') { this.pickStarter(this._starterCursor||0); }
        else if (s === 'catch') { const cbtns = document.querySelectorAll('.catch-action-btn'); if (cbtns[this._catchCursor||0]) cbtns[this._catchCursor||0].click(); }
        else if (s === 'catch-result') { document.getElementById('btn-catch-continue')?.click(); }
        else { this._pressA(); }
      }

      if (justPressed(1)) {
        if      (s === 'battle' && !this.state.answering) { this._confirmCursor(); }
        else if (s === 'intro')    { this.advanceIntro(); }
        else if (s === 'result')   { document.getElementById('btn-result-cont')?.click(); }
        else { this._pressB(); }
      }

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

    Object.entries(gpDirs).forEach(([d, v]) => this._gpPrev[`axis_${d}`] = v);
    for (let i = 0; i < btns.length; i++) {
      this._gpPrev[`btn_${i}`] = btns[i]?.pressed;
    }
  }

  _showController(visible) {
    ['gba-left', 'gba-right'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (visible) el.classList.remove('hidden');
      else         el.classList.add('hidden');
    });
  }

  boot() {
    this.show('boot');
    this._showController(true);
    setTimeout(() => this.showTitle(), 1800);
  }

  showTitle() {
    this.show('title');
    SFX.boot();
    this._showController(true);
    const go = () => {
      document.getElementById('screen-title').removeEventListener('click', go);
      Music.unblock();
      this.showContinueOrName();
    };
    document.getElementById('screen-title').addEventListener('click', go);
  }

  showContinueOrName() {
    const save = loadGame();
    if (save && save.playerName && save.currentQ > 0 && save.currentQ < 100 && save.party && save.party.length > 0) {
      this.show('continue');
      this._showController(true);
      this._contCursor = 0;
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
      this._contCursor = 0;
      setTimeout(() => {
        const c = document.getElementById('btn-continue-save');
        if (c) c.style.outline = '3px solid #f8c030';
      }, 50);
    } else {
      clearSave();
      this.startFresh();
    }
  }

  restoreFromSave(save) {
    Object.assign(this.state, {
      playerName:save.playerName, currentQ:save.currentQ,
      score:save.score, streak:save.streak, maxStreak:save.maxStreak,
      correct:save.correct, wrong:save.wrong,
      worldX:0, worldY:0, npcWorldX:0, npcWorldY:0, npcSpawned:false,
      party: save.party || [],
      pokeballs: save.pokeballs || 0,
      playerLevel: save.playerLevel || 1,
      caughtCount: save.caughtCount || 0,
      activePokemon: save.party && save.party.length > 0 ? save.party[0] : null,
    });
    this.loadQuestions(() => {
      if (save.questionOrder && save.questionOrder.length === this.state.questions.length) {
        const idMap = Object.fromEntries(this.state.questions.map(q => [q.id, q]));
        const restored = save.questionOrder.map(id => idMap[id]).filter(Boolean);
        if (restored.length === this.state.questions.length) {
          this.state.questions = restored;
        }
      }
      this.showMap();
    });
  }

  startFresh() {
    Object.assign(this.state, {
      playerName:'', currentQ:0, score:0, streak:0, maxStreak:0, correct:0, wrong:0,
      party:[], pokeballs:0, playerLevel:1, caughtCount:0, activePokemon:null,
    });
    this.showNameEntry();
  }

  showNameEntry() {
    this.show('name');
    this._showController(true);
    this._gpKeyCursor = 0;
    this.buildKeyboard();
    this.typeText('name-prompt-text', CONFIG.namePrompt);
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
    this._gpKeyCursor = 0;
    this._renderNameCursor();
  }

  _getNameKeys() {
    const letterKeys = Array.from(document.querySelectorAll('.key-btn'));
    const delBtn = document.getElementById('btn-backspace');
    const okBtn = document.getElementById('btn-confirm-name');
    return [...letterKeys, delBtn, okBtn].filter(Boolean);
  }

  _renderNameCursor() {
    const keys = this._getNameKeys();
    keys.forEach((k, i) => {
      k.style.outline = i === this._gpKeyCursor ? '3px solid #f8c030' : '';
      k.style.outlineOffset = i === this._gpKeyCursor ? '-2px' : '';
    });
  }

  _nameKeyConfirm() {
    const keys = this._getNameKeys();
    const key = keys[this._gpKeyCursor];
    if (!key) return;
    if (key.classList.contains('key-btn')) {
      this.addChar(key.textContent);
    } else if (key.id === 'btn-backspace') {
      this.delChar();
    } else if (key.id === 'btn-confirm-name') {
      this.confirmName();
    }
  }

  addChar(ch) { if (this.state.playerName.length<10){ this.state.playerName+=ch; this.refreshNameDisplay(); SFX.select(); } }
  delChar()   { this.state.playerName=this.state.playerName.slice(0,-1); this.refreshNameDisplay(); SFX.backspace(); }
  refreshNameDisplay() {
    const el=document.getElementById('name-display');
    if(el) el.textContent=this.state.playerName+(this.state.playerName.length<10?'_':'');
  }
  confirmName() { if(!this.state.playerName.trim()) this.state.playerName='ASH'; SFX.confirm(); this.showIntro(); }

  showIntro() {
    this.show('intro');
    this._showController(true);
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
    if (npcEl) setNPC(npcEl, NPC[msg.npc] || '👴');
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
      this.showStarterSelection();
      return;
    }
    this.renderIntroMsg();
  }

  showStarterSelection() {
    this.show('starter');
    this._showController(true);
    this._starterCursor = 0;
    const oakEl = document.getElementById('starter-oak');
    if (oakEl) setNPC(oakEl, NPC['Professor Oak']);

    this.typeText('starter-text', `Now, ${this.state.playerName||'ASH'}! Choose your partner Pokémon! Each one is special in its own way!`);

    const container = document.getElementById('starter-choices');
    container.innerHTML = '';

    STARTER_POOL.forEach((poke, i) => {
      const btn = document.createElement('button');
      btn.className = 'starter-btn';
      btn.innerHTML = `
        <span class="starter-emoji">${poke.emoji}</span>
        <span class="starter-name">${poke.name}</span>
        <span class="starter-type">${poke.type} · Lv5</span>
      `;
      btn.addEventListener('click', () => this.pickStarter(i));
      container.appendChild(btn);
    });
    this._renderStarterCursor();
  }

  _renderStarterCursor() {
    SFX.select();
    const btns = document.querySelectorAll('.starter-btn');
    btns.forEach((btn, i) => {
      btn.classList.toggle('starter-btn-selected', i === (this._starterCursor||0));
    });
  }

  _renderCatchCursor() {
    const btns = document.querySelectorAll('.catch-action-btn');
    btns.forEach((btn, i) => {
      btn.classList.toggle('catch-btn-selected', i === (this._catchCursor||0));
    });
  }

  _renderContCursor() {
    const contBtn = document.getElementById('btn-continue-save');
    const newBtn = document.getElementById('btn-new-game');
    if (contBtn) contBtn.style.outline = this._contCursor === 0 ? '3px solid #f8c030' : '';
    if (newBtn) newBtn.style.outline = this._contCursor === 1 ? '3px solid #f8c030' : '';
  }

  pickStarter(index) {
    const chosen = { ...STARTER_POOL[index], level: 5 };
    this.state.party = [chosen];
    this.state.activePokemon = chosen;
    this.state.pokeballs = 5;

    SFX.catch();

    this.show('starter-confirm');
    this._showController(true);

    document.getElementById('starter-chosen-emoji').textContent = chosen.emoji;
    document.getElementById('starter-chosen-name').textContent = chosen.name.toUpperCase();
    document.getElementById('starter-chosen-level').textContent = `Lv ${chosen.level} · ${chosen.type}`;

    const others = STARTER_POOL.filter((_, i) => i !== index);
    const fleeText = `${others[0].emoji} ${others[0].name} and ${others[1].emoji} ${others[1].name} ran away!`;
    document.getElementById('starter-flee-text').textContent = fleeText;

    this.typeText('starter-confirm-text',
      `Great choice! ${chosen.name} looks excited to join you! The other Pokémon scurried away into the wild. You also received 5 Pokéballs!`
    );

    document.getElementById('btn-starter-continue').onclick = () => {
      if (this.state.twTimer) { clearInterval(this.state.twTimer); this.state.twTimer = null; }
      this.loadQuestions(() => this.showMap());
    };
  }

  _spawnWildPokemon() {
    if (this.state.pokeballs <= 0) { this.state.wildSpawned = false; return; }
    if (Math.random() > 0.90) { this.state.wildSpawned = false; return; }

    const pLevel = getPlayerLevel(this.state);
    const wild = randomWildPokemon(pLevel);
    this.state.currentWild = wild;

    const {viewW, viewH} = this._getViewport();
    const npcDx = this.state.npcWorldX;
    const npcDy = this.state.npcWorldY;

    const t = 0.2 + Math.random() * 0.5;
    let wx = npcDx * t + (Math.random() - 0.5) * viewW * 1.5;
    let wy = npcDy * t + (Math.random() - 0.5) * viewH * 1.5;

    const minDist = 150;
    if (Math.sqrt(wx*wx + wy*wy) < minDist) {
      wx += (wx >= 0 ? 1 : -1) * minDist;
      wy += (wy >= 0 ? 1 : -1) * minDist;
    }

    this.state.wildWorldX = wx;
    this.state.wildWorldY = wy;
    this.state.wildSpawned = true;

    const wildEl = document.getElementById('map-wild');
    if (wildEl) wildEl.textContent = wild.emoji;
    const wildWrap = document.getElementById('map-wild-wrap');
    if (wildWrap) wildWrap.style.display = 'block';

    this._positionWildOnScreen();
  }

  showCatchScreen() {
    const wild = this.state.currentWild;
    if (!wild) return;
    this._throwing = false;

    this.show('catch');
    this._showController(true);
    this._catchCursor = 0;
    Music.pause();

    document.getElementById('catch-wild-pokemon').textContent = wild.emoji;
    document.getElementById('catch-wild-name').textContent = wild.name.toUpperCase();
    document.getElementById('catch-wild-level').textContent = `Lv ${wild.level}`;

    const pLevel = getPlayerLevel(this.state);
    const canCatch = pLevel >= wild.level;

    this.typeText('catch-text', `A wild ${wild.name} appeared!`);

    const actions = document.getElementById('catch-actions');
    actions.innerHTML = '';

    const throwBtn = document.createElement('button');
    throwBtn.className = 'catch-action-btn btn-pixel btn-red';
    throwBtn.innerHTML = '<img src="./favicon.ico" class="pokeball-icon"> THROW BALL';
    throwBtn.disabled = this.state.pokeballs <= 0;
    if (this.state.pokeballs <= 0) throwBtn.style.opacity = '0.4';
    throwBtn.addEventListener('click', () => this.throwPokeball(wild, canCatch));
    actions.appendChild(throwBtn);

    const runBtn = document.createElement('button');
    runBtn.className = 'catch-action-btn btn-pixel btn-blue';
    runBtn.textContent = '🏃 RUN AWAY';
    runBtn.addEventListener('click', () => {
      this.state.wildSpawned = false;
      this.state.currentWild = null;
      const wildWrap = document.getElementById('map-wild-wrap');
      if (wildWrap) wildWrap.style.display = 'none';
      this.showMap();
    });
    actions.appendChild(runBtn);
    this._renderCatchCursor();
  }

  throwPokeball(wild, canCatch) {
    if (this._throwing) return;
    if (this.state.pokeballs <= 0) return;
    this._throwing = true;
    this.state.pokeballs--;
    SFX.pokeball();

    const catchScreen = document.getElementById('screen-catch');
    const pokemonEl = document.getElementById('catch-wild-pokemon');
    const nameEl = document.getElementById('catch-wild-name');
    const levelEl = document.getElementById('catch-wild-level');

    const ball = document.createElement('img');
    ball.src = './favicon.ico';
    ball.className = 'pokeball-throw';
    catchScreen.appendChild(ball);

    setTimeout(() => {
      const pokeRect = pokemonEl.getBoundingClientRect();
      const screenRect = catchScreen.getBoundingClientRect();
      const burstX = pokeRect.left - screenRect.left + pokeRect.width / 2;
      const burstY = pokeRect.top - screenRect.top + pokeRect.height * 0.25;

      const burst = document.createElement('div');
      burst.className = 'pokeball-burst';
      burst.style.left = burstX + 'px';
      burst.style.top = burstY + 'px';
      catchScreen.appendChild(burst);

      ball.remove();
      pokemonEl.style.opacity = '0';
      pokemonEl.style.transform = 'scale(0)';
      pokemonEl.style.transition = 'opacity .2s, transform .2s';
      if (nameEl) nameEl.style.display = 'none';
      if (levelEl) levelEl.style.display = 'none';

      const restBall = document.createElement('img');
      restBall.src = './favicon.ico';
      restBall.className = 'pokeball-rest';
      restBall.style.left = (burstX - 20) + 'px';
      restBall.style.top = (burstY + 20) + 'px';
      catchScreen.appendChild(restBall);

      setTimeout(() => burst.remove(), 500);

      let bounceCount = 0;
      const doBounce = () => {
        const maxBounces = canCatch ? 3 : 2;
        if (bounceCount >= maxBounces) {
          restBall.remove();
          pokemonEl.style.opacity = '1';
          pokemonEl.style.transform = '';
          pokemonEl.style.transition = '';
          if (nameEl) nameEl.style.display = '';
          if (levelEl) levelEl.style.display = '';
          this._showCatchResult(wild, canCatch);
          return;
        }
        bounceCount++;
        SFX.pokeballBounce();
        restBall.classList.remove('pokeball-bounce-anim');
        void restBall.offsetWidth;
        restBall.classList.add('pokeball-bounce-anim');
        setTimeout(doBounce, 600);
      };

      setTimeout(doBounce, 600);
    }, 700);
  }

  _showCatchResult(wild, canCatch) {
    this._throwing = false;
    this.show('catch-result');
    this._showController(true);

    const resultEmoji = document.getElementById('catch-result-emoji');
    const resultMsg = document.getElementById('catch-result-msg');
    const continueBtn = document.getElementById('btn-catch-continue');
    if (continueBtn) continueBtn.style.display = 'none';

    if (canCatch) {
      setTimeout(() => SFX.catch(), 500);
      resultEmoji.textContent = wild.emoji;
      resultMsg.innerHTML = `
        <div class="catch-success-title">GOTCHA!</div>
        <div class="catch-success-detail">${wild.name} (Lv ${wild.level}) was caught!</div>
        <div class="catch-success-sub">Added to your party!</div>
      `;
      this.state.party.push({ ...wild });
      this.state.caughtCount++;
    } else {
      setTimeout(() => SFX.escape(), 300);
      resultEmoji.textContent = '💨';
      resultMsg.innerHTML = `
        <div class="catch-fail-title">OH NO!</div>
        <div class="catch-fail-detail">${wild.name} (Lv ${wild.level}) broke free and escaped!</div>
        <div class="catch-fail-sub">The Pokémon was too strong! Train more to catch stronger Pokémon.</div>
      `;
    }

    this.state.wildSpawned = false;
    this.state.currentWild = null;
    const wildWrap = document.getElementById('map-wild-wrap');
    if (wildWrap) wildWrap.style.display = 'none';

    setTimeout(() => {
      if (this.state.screen === 'catch-result') {
        saveGame(this.state);
        this.showMap();
      }
    }, 3000);
  }

  loadQuestions(cb) {
    if (this.state.questions.length>0) { cb(); return; }
    fetch('./questions.json')
      .then(r=>r.json())
      .then(data=>{
        const qs = data.levels[0].questions;
        for (let i = qs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [qs[i], qs[j]] = [qs[j], qs[i]];
        }
        this.state.questions = qs;
        cb();
      })
      .catch(()=>this.toast('❌ Could not load questions.json'));
  }

  _pickNextDir(currentDir) {
    const opposite = { right:'left', left:'right', up:'down', down:'up' };
    const opp = opposite[currentDir];
    const choices = ['right','left','up','down',currentDir,currentDir].filter(d => d !== opp);
    return choices[Math.floor(Math.random() * choices.length)];
  }

  _generateTrees() {
    const container = document.getElementById('map-trees');
    if (!container) return;
    container.innerHTML = '';
    const {viewW, viewH} = this._getViewport();
    const spread = Math.max(viewW, viewH) * 5;
    const inner = document.getElementById('map-inner');
    if (inner) { inner.style.width = spread * 2 + 'px'; inner.style.height = spread * 2 + 'px'; }
    const cx = spread;
    const cy = spread;
    const npcX = cx + this.state.npcWorldX;
    const npcY = cy + this.state.npcWorldY;
    const occupied = [];
    this._trees = [];
    for (let i = 0; i < 300; i++) {
      const span = document.createElement('span');
      span.className = 'tree';
      const size = 48 + Math.random() * 24;
      let x, y, tries = 0;
      do {
        x = cx + (Math.random() - 0.5) * spread * 1.8;
        y = cy + (Math.random() - 0.5) * spread * 1.8;
        tries++;
      } while (tries < 10 && Math.abs(x - npcX) < 80 && Math.abs(y - npcY) < 80);
      occupied.push({ x, y, r: size * 0.6 });
      this._trees.push({ wx: x - cx, wy: y - cy, r: size * 0.35 });
      span.textContent             = '🌳';
      span.style.fontSize          = size + 'px';
      span.style.left              = x + 'px';
      span.style.top               = y + 'px';
      span.style.animationDelay    = (Math.random() * 3).toFixed(2) + 's';
      span.style.animationDuration = (2.5 + Math.random() * 2).toFixed(1) + 's';
      container.appendChild(span);
    }
    const grassEmojis = ['🌾'];
    for (let i = 0; i < 2400; i++) {
      let x, y, tries = 0, tooClose;
      do {
        x = cx + (Math.random() - 0.5) * spread * 1.8;
        y = cy + (Math.random() - 0.5) * spread * 1.8;
        tries++;
        tooClose = occupied.some(t => Math.abs(x - t.x) < t.r && Math.abs(y - t.y) < t.r);
      } while (tries < 12 && (tooClose || (Math.abs(x - npcX) < 80 && Math.abs(y - npcY) < 80)));
      if (tooClose) continue;
      const span = document.createElement('span');
      span.className = 'tall-grass';
      const size = 5 + Math.random() * 4;
      span.textContent             = grassEmojis[Math.floor(Math.random() * grassEmojis.length)];
      span.style.fontSize          = size + 'px';
      span.style.left              = x + 'px';
      span.style.top               = y + 'px';
      span.style.animationDelay    = (Math.random() * 4).toFixed(2) + 's';
      span.style.animationDuration = (2 + Math.random() * 2).toFixed(1) + 's';
      if (Math.random() > 0.5) span.classList.add('tall-grass-flip');
      container.appendChild(span);
    }
    this._rocks = [];
    for (let i = 0; i < 90; i++) {
      let x, y, tries = 0, tooClose;
      do {
        x = cx + (Math.random() - 0.5) * spread * 1.8;
        y = cy + (Math.random() - 0.5) * spread * 1.8;
        tries++;
        tooClose = occupied.some(t => Math.abs(x - t.x) < t.r && Math.abs(y - t.y) < t.r);
      } while (tries < 12 && (tooClose || (Math.abs(x - npcX) < 80 && Math.abs(y - npcY) < 80)));
      if (tooClose) continue;
      occupied.push({ x, y, r: 20 });
      const wx = x - cx;
      const wy = y - cy;
      this._rocks.push({ wx, wy, r: 22 });
      const span = document.createElement('span');
      span.className = 'map-rock';
      const size = 11 + Math.random() * 6;
      span.textContent             = '🪨';
      span.style.fontSize          = size + 'px';
      span.style.left              = x + 'px';
      span.style.top               = y + 'px';
      container.appendChild(span);
    }
  }

  _preGenerateNextLeg() {
    this._nextLegDir = this._pickNextDir(this.state.pathDir);
    this._nextLegLen = null;
  }

  _npcOffsetForDir(dir, viewW, viewH) {
    const dist = dir === 'right' || dir === 'left'
      ? Math.round(viewW * (3.0 + Math.random() * 0.8))
      : Math.round(viewH * (3.0 + Math.random() * 0.8));
    return {
      nx: dir === 'right' ? dist : dir === 'left' ? -dist : 0,
      ny: dir === 'down'  ? dist : dir === 'up'   ? -dist : 0,
      dir,
    };
  }

  showMap() {
    this.show('map');
    this._showController(true);

    requestAnimationFrame(() => {
      const {viewW, viewH} = this._getViewport();

      if (this.state.currentQ === 0) {
        this.state.pathDir = 'right';
      } else if (this._nextLegDir) {
        this.state.pathDir = this._nextLegDir;
        this._nextLegDir = null;
        this._nextLegLen = null;
      } else {
        this.state.pathDir = this._pickNextDir(this.state.pathDir);
      }

      this.state.worldX  = 0;
      this.state.worldY  = 0;
      this.state.lastDir = this.state.pathDir;

      const {nx, ny} = this._npcOffsetForDir(this.state.pathDir, viewW, viewH);
      this.state.npcWorldX  = nx;
      this.state.npcWorldY  = ny;
      this.state.npcSpawned = true;

      this._generateTrees();
      this._spawnWildPokemon();

      document.getElementById('hud-name').textContent = this.state.playerName||'ASH';
      this.updateHUD();

      const q = this.state.questions[this.state.currentQ];
      const npcEl = document.getElementById('map-npc');
      if (q && npcEl) setNPC(npcEl, NPC[q.npc]||'🧑');

      this._placeMapSprites();
      this._checkNPCProximity();
      this._updateDirArrow(false);
      Music.stopBattle();
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
    const partyEl = document.getElementById('hud-party');
    if (partyEl) {
      partyEl.textContent = this.state.party.map(p => p.emoji).join('');
      if (this.state.party.length === 0) partyEl.textContent = '—';
    }
    document.getElementById('map-prog-text').textContent = `${done}/${tot}`;
    const bar=document.getElementById('map-prog-bar');
    if(bar){ bar.style.width=pct+'%'; bar.style.background=pct<40?'var(--hp-green)':pct<75?'var(--hp-yellow)':'#60c8ff'; }

    const pbEl = document.getElementById('pokeball-count');
    if (pbEl) pbEl.innerHTML = `<img src="./favicon.ico" class="pokeball-icon"> ${this.state.pokeballs}`;

    this.state.playerLevel = getPlayerLevel(this.state);
  }

  flashSaveDot() {
    const dot=document.getElementById('save-dot');
    if(!dot)return; dot.style.opacity='1';
    setTimeout(()=>{ dot.style.opacity='.4'; },1500);
  }

  _getActivePokemon() {
    if (this.state.activePokemon && !this.state.activePokemon.fainted) return this.state.activePokemon;
    const conscious = this.state.party.filter(p => !p.fainted);
    if (conscious.length > 0) return conscious[0];
    if (this.state.party.length === 0) return { name:'MissingNo', emoji:'❓', type:'???', level:1 };
    return this.state.party[0];
  }

  startQuestion() {
    this._stopWalkLoop();
    this._heldKeys.clear();
    const q=this.state.questions[this.state.currentQ];
    if(!q){ this.showComplete(); return; }

    const playerPoke = this._getActivePokemon();
    const npcPoke = randomPokemonForNPC();
    this.state.currentNPCPokemon = npcPoke;

    this.show('battle');
    this._showController(true);
    Music.playBattle();
    this.state.answering=false;
    this.state.cursor=0;

    document.getElementById('battle-npc-pokemon').textContent = npcPoke.emoji;
    document.getElementById('battle-npc-pokemon-name').textContent = npcPoke.name.toUpperCase();
    document.getElementById('battle-npc-pokemon-level').textContent = `Lv ${npcPoke.level}`;
    document.getElementById('battle-npc-name').textContent   = q.npc.toUpperCase();
    const npcTrainer = document.getElementById('battle-npc-trainer');
    if (npcTrainer) setNPC(npcTrainer, NPC[q.npc] || '🧑');

    document.getElementById('battle-player-pokemon').textContent = playerPoke.emoji;
    document.getElementById('battle-player-pokemon-name').textContent = playerPoke.name.toUpperCase();
    document.getElementById('battle-player-pokemon-level').textContent = `Lv ${playerPoke.level}`;
    document.getElementById('battle-player-name').textContent= (this.state.playerName||'ASH').toUpperCase();

    document.getElementById('battle-speaker').textContent    = q.npc.toUpperCase();
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

    const isMulti = Array.isArray(q.answers);

    const indices = [0,1,2,3];
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const correctShuffledIdx = isMulti ? null : indices.indexOf(q.answer);
    const correctShuffledSet = isMulti ? new Set(q.answers.map(a => indices.indexOf(a))) : null;

    q._correctShuffledSet = correctShuffledSet;
    q._indices = indices;

    if (isMulti) {
      q._correctDisplayText = q.answers.map(a => q.options[a]).join(' AND ');
    } else {
      q._correctDisplayText = q.options[q.answer];
    }

    const selectedSlots = new Set();
    let confirmBtn = null;

    if (isMulti) {
      confirmBtn = document.createElement('button');
      confirmBtn.className='choice-btn confirm-btn confirm-inactive';
      confirmBtn.textContent='✔ CONFIRM';
      confirmBtn.addEventListener('click', () => {
        if (this.state.answering || selectedSlots.size !== 2) return;
        this.pickMulti(selectedSlots, correctShuffledSet, q, container);
      });
    }

    indices.forEach((origIdx, slotIdx) => {
      const btn=document.createElement('button');
      btn.className='choice-btn';
      btn.setAttribute('data-letter', slotIdx + 1);
      btn.textContent=q.options[origIdx];

      if (isMulti) {
        btn.addEventListener('click', () => {
          if (this.state.answering) return;
          if (btn.classList.contains('selected')) {
            btn.classList.remove('selected');
            selectedSlots.delete(slotIdx);
          } else {
            if (selectedSlots.size >= 2) return;
            btn.classList.add('selected');
            selectedSlots.add(slotIdx);
          }
          confirmBtn.classList.toggle('confirm-inactive', selectedSlots.size !== 2);
        });
      } else {
        btn.addEventListener('click',()=>this.pick(slotIdx, correctShuffledIdx, q, container));
      }
      btn.addEventListener('mouseenter', () => {
        this.state.cursor = slotIdx;
        this._renderCursor();
      });
      container.appendChild(btn);
    });

    if (isMulti) {
      confirmBtn.addEventListener('mouseenter', () => {
        if (confirmBtn.classList.contains('confirm-inactive')) return;
        this.state.cursor = 4;
        this._renderCursor();
      });
      container.appendChild(confirmBtn);
      container._confirmBtn = confirmBtn;
    }

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
      this.state.pokeballs += 3;
      if(this.state.streak>=3) SFX.streak(); else SFX.correct();
    } else { this.state.streak=0; this.state.wrong++; SFX.wrong(); }

    this.state.playerLevel = getPlayerLevel(this.state);

    setTimeout(()=>{
      this._preGenerateNextLeg();
      this.showBattleAnim(correct, q);
    },120);
  }

  pickMulti(selectedSlots, correctSet, q, container) {
    if(this.state.answering)return;
    this.state.answering=true;

    const btns=Array.from(container.querySelectorAll('.choice-btn:not(.confirm-btn)'));
    const correct = selectedSlots.size === correctSet.size &&
                    [...selectedSlots].every(s => correctSet.has(s));

    btns.forEach((b,i)=>{
      b.classList.remove('cursor','selected');
      b.classList.add('disabled');
      if(correctSet.has(i)) b.classList.add('correct');
      else if(selectedSlots.has(i) && !correctSet.has(i)) b.classList.add('wrong');
    });
    const cb = container.querySelector('.confirm-btn');
    if(cb) cb.style.display='none';

    if(correct){
      this.state.streak++; this.state.correct++;
      this.state.maxStreak=Math.max(this.state.maxStreak,this.state.streak);
      this.state.score+=this.state.streak>=5?200:this.state.streak>=3?150:100;
      this.state.pokeballs += 3;
      if(this.state.streak>=3) SFX.streak(); else SFX.correct();
    } else { this.state.streak=0; this.state.wrong++; SFX.wrong(); }

    this.state.playerLevel = getPlayerLevel(this.state);

    setTimeout(()=>{
      this._preGenerateNextLeg();
      this.showBattleAnim(correct, q);
    },120);
  }

  showBattleAnim(correct, q) {
    this.show('battle-anim');
    this._showController(false);

    const playerPoke = this._getActivePokemon();
    const npcPoke = this.state.currentNPCPokemon || { name:'???', emoji:'❓', level:1 };

    const npcTrainer = document.getElementById('anim-npc-trainer');
    if (npcTrainer) {
      const npcQ = this.state.questions[this.state.currentQ];
      setNPC(npcTrainer, NPC[npcQ?.npc] || '🧑');
    }
    const playerTrainer = document.getElementById('anim-player-trainer');
    if (playerTrainer) playerTrainer.innerHTML = '<div class="anim-player-sprite-sheet"></div>';

    document.getElementById('anim-player-pokemon-name').textContent = playerPoke.name.toUpperCase();
    document.getElementById('anim-player-pokemon').textContent = playerPoke.emoji;
    document.getElementById('anim-npc-pokemon-name').textContent = npcPoke.name.toUpperCase();
    document.getElementById('anim-npc-pokemon').textContent = npcPoke.emoji;

    const playerHp = document.getElementById('anim-player-hp');
    const npcHp = document.getElementById('anim-npc-hp');
    playerHp.style.width = '100%';
    npcHp.style.width = '100%';
    playerHp.style.background = 'var(--hp-green)';
    npcHp.style.background = 'var(--hp-green)';

    const playerSprite = document.getElementById('anim-player-pokemon');
    const npcSprite = document.getElementById('anim-npc-pokemon');
    playerSprite.style.opacity = '1';
    playerSprite.style.transform = '';
    npcSprite.style.opacity = '1';
    npcSprite.style.transform = '';

    const msg = document.getElementById('battle-anim-msg');

    if (correct) {
      msg.textContent = `${playerPoke.name} used ${CONFIG.battleMove}!`;
      SFX.attack();
      setTimeout(() => {
        npcHp.style.width = '0%';
        npcHp.style.background = 'var(--red)';
        msg.textContent = `It's super effective! ${npcPoke.name} fainted!`;
        npcSprite.style.opacity = '0.3';
        npcSprite.style.transform = 'translateY(20px) scale(0.5)';
        SFX.battleWin();
      }, 800);
      setTimeout(() => {
        npcSprite.style.opacity = '1';
        npcSprite.style.transform = '';
        this.showResult(true, q);
      }, 2200);
    } else {
      msg.textContent = `${playerPoke.name} used ${CONFIG.battleMiss}... but it missed!`;
      SFX.attack();
      setTimeout(() => {
        msg.textContent = `${npcPoke.name} used COUNTER ATTACK!`;
        SFX.attack();
      }, 800);
      setTimeout(() => {
        playerHp.style.width = '0%';
        playerHp.style.background = 'var(--red)';
        msg.textContent = `${playerPoke.name} fainted!`;
        playerSprite.style.opacity = '0.3';
        playerSprite.style.transform = 'translateY(20px) scale(0.5)';
        SFX.battleLose();
        playerPoke.fainted = true;
        const conscious = this.state.party.filter(p => !p.fainted);
        if (conscious.length === 0) {
          this.state.party[0].fainted = false;
        }
      }, 1400);
      setTimeout(() => {
        playerSprite.style.opacity = '1';
        playerSprite.style.transform = '';
        this.showResult(false, q);
      }, 2800);
    }
  }

  showResult(correct,q) {
    this.show('result');
    this._showController(true);
    Music.stopBattle();
    Music.pause();

    document.getElementById('result-icon').textContent  = correct?'✓':'✗';
    const lbl=document.getElementById('result-label');
    lbl.textContent = correct ? CORRECT_FB[Math.floor(Math.random()*CORRECT_FB.length)]
                              : WRONG_FB[Math.floor(Math.random()*WRONG_FB.length)];
    lbl.className   = 'result-label '+(correct?'correct':'wrong');

    const ansEl=document.getElementById('result-correct-ans');
    const ptsEl=document.getElementById('result-pts');
    const pbEl=document.getElementById('result-pokeballs');

    if(correct){
      ptsEl.textContent=this.state.streak>=5?'+200 PTS 🔥 STREAK!':this.state.streak>=3?'+150 PTS 🔥 HOT!':'+100 PTS';
      ptsEl.style.display='block'; ansEl.classList.remove('visible');
      pbEl.textContent = `⚪ +3 Pokéballs! (Total: ${this.state.pokeballs})`;
      pbEl.style.display = 'block';
    } else {
      ptsEl.style.display='none';
      pbEl.style.display='none';
      const correctText = q._correctDisplayText || (q.answers ? q.answers.map(a=>q.options[a]).join(' AND ') : q.options[q.answer]);
      ansEl.textContent='✓ Correct answer'+(q.answers?'s':'')+': '+correctText;
      ansEl.classList.add('visible');
    }
    document.getElementById('result-explanation').textContent=q.explanation;

    const contBtn = document.getElementById('btn-result-cont');
    const doNext = () => {
      this.state.currentQ++;
      saveGame(this.state);
      if(this.state.currentQ>=this.state.questions.length){ clearSave(); this.showComplete(); }
      else if(MILESTONES[this.state.currentQ]) this.showLevelUp();
      else this.showMap();
    };
    contBtn.onclick = doNext;
  }

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
      `BEST STREAK:   ${this.state.maxStreak} 🔥\n`+
      `POKÉMON CAUGHT: ${this.state.caughtCount}`;

    const pokeEl = document.getElementById('complete-pokemon');
    if (pokeEl && this.state.party.length > 0) {
      pokeEl.innerHTML = '<div class="complete-party-title">YOUR PARTY</div>' +
        this.state.party.map(p => `<span class="complete-party-entry">${p.emoji} ${p.name} Lv${p.level}</span>`).join('');
    }

    document.getElementById('btn-play-again').onclick=()=>{ clearSave(); this.startFresh(); };
  }

  show(name) {
    Object.values(this.screens).forEach(s=>s.classList.remove('active'));
    const t=this.screens[name]; if(t)t.classList.add('active');
    this.state.screen=name;
  }

  typeText(id,text,onDone) {
    if(this.state.twTimer){clearInterval(this.state.twTimer);this.state.twTimer=null;}
    const el=document.getElementById(id); if(!el)return; el.textContent='';
    let i=0;
    this.state.twTimer=setInterval(()=>{
      if(i<text.length){el.textContent+=text[i++]; if(i%2===0) SFX.type();}
      else{clearInterval(this.state.twTimer);this.state.twTimer=null;if(onDone)onDone();}
    },26);
  }

  toast(msg,ms=2600){
    const el=document.getElementById('toast');
    el.textContent=msg; el.classList.remove('hidden');
    setTimeout(()=>el.classList.add('hidden'),ms);
  }
}

window.addEventListener('DOMContentLoaded',()=>{ new Game(); });
