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
  { speaker: 'PROFESSOR OAK', npc: 'Professor Oak', text: "Hello {name}! Welcome to PokéSQL — the world of T-SQL training! My name is Professor Oak, the SQL Pokémon Professor!" },
  { speaker: 'PROFESSOR OAK', npc: 'Professor Oak', text: "This world is inhabited by powerful data — stored in TABLES, organised in DATABASES, and tamed with QUERIES!" },
  { speaker: 'PROFESSOR OAK', npc: 'Professor Oak', text: "Your mission? Journey through Pallet Town, challenge SQL experts, and become a T-SQL Champion!" },
  { speaker: 'PROFESSOR OAK', npc: 'Professor Oak', text: "You'll learn Microsoft T-SQL — the language used by DBAs and data professionals worldwide." },
  { speaker: 'PROFESSOR OAK', npc: 'Professor Oak', text: "100 questions await you in this town alone. Each correct answer earns you SQL EXP — and you'll learn something real!" },
  { speaker: 'PROFESSOR OAK', npc: 'Professor Oak', text: "Your progress is saved automatically in your browser so you can pick up right where you left off. Now, {name}... your adventure begins!" },
];

const CORRECT_FB = ["That's right!","Excellent work!","Perfect!","Outstanding!","Correct!","You're a natural!","Great answer!","Spot on!","Impressive!","Well done!"];
const WRONG_FB   = ["Not quite...","Hmm, that's not it.","Try again next time!","Almost...","Not this time!"];

const MILESTONES = {
  25: { badge: '🥉 SQL INITIATE',   stars: '★ ★ ☆ ☆' },
  50: { badge: '🥈 QUERY TRAINER',  stars: '★ ★ ★ ☆' },
  75: { badge: '🥇 DATA WRANGLER',  stars: '★ ★ ★ ★' },
};

const SAVE_KEY = 'pokesql_save_v1';

/* ─── SAVE / LOAD ────────────────────────────────────────── */
function saveGame(state) {
  try {
    const data = {
      playerName: state.playerName,
      currentQ:   state.currentQ,
      score:      state.score,
      streak:     state.streak,
      maxStreak:  state.maxStreak,
      correct:    state.correct,
      wrong:      state.wrong,
      savedAt:    Date.now(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (_) {}
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) { return null; }
}

function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
}

/* ─── GAME CLASS ─────────────────────────────────────────── */
class Game {
  constructor() {
    this.state = {
      screen:     'boot',
      playerName: '',
      questions:  [],
      currentQ:   0,
      score:      0,
      streak:     0,
      maxStreak:  0,
      correct:    0,
      wrong:      0,
      answering:  false,
      introStep:  0,
      twTimer:    null,
    };

    this.screens = {};
    document.querySelectorAll('.screen').forEach(s => {
      this.screens[s.id.replace('screen-', '')] = s;
    });

    this._introClickHandler = null;
    this._introKeyHandler   = null;

    this.bindGlobalKeys();
    this.boot();
  }

  /* ── BOOT ─────────────────────────────────────────────── */
  boot() {
    this.show('boot');
    setTimeout(() => this.showTitle(), 1800);
  }

  showTitle() {
    this.show('title');
    const go = () => {
      document.getElementById('screen-title').removeEventListener('click', go);
      this.showContinueOrName();
    };
    document.getElementById('screen-title').addEventListener('click', go);
  }

  /* ── CONTINUE SCREEN ──────────────────────────────────── */
  showContinueOrName() {
    const save = loadGame();
    if (save && save.playerName && save.currentQ > 0 && save.currentQ < 100) {
      this.show('continue');
      this.populateContinueScreen(save);

      document.getElementById('btn-continue-save').onclick = () => {
        this.restoreFromSave(save);
      };
      document.getElementById('btn-new-game').onclick = () => {
        document.getElementById('continue-warn').textContent =
          'Starting a new game will erase your saved progress!';
        document.getElementById('btn-new-game').textContent = '✦ CONFIRM NEW GAME';
        document.getElementById('btn-new-game').onclick = () => {
          clearSave();
          this.startFresh();
        };
      };
    } else {
      this.startFresh();
    }
  }

  populateContinueScreen(save) {
    const pct = Math.round((save.currentQ / 100) * 100);
    document.getElementById('save-name-disp').textContent  = save.playerName;
    document.getElementById('save-prog-disp').textContent  = `Q${save.currentQ}/100 (${pct}%)`;
    document.getElementById('save-score-disp').textContent = save.score.toLocaleString();
  }

  restoreFromSave(save) {
    Object.assign(this.state, {
      playerName: save.playerName,
      currentQ:   save.currentQ,
      score:      save.score,
      streak:     save.streak,
      maxStreak:  save.maxStreak,
      correct:    save.correct,
      wrong:      save.wrong,
    });
    this.loadQuestions(() => this.showMap());
  }

  startFresh() {
    this.state.playerName = '';
    this.state.currentQ   = 0;
    this.state.score      = 0;
    this.state.streak     = 0;
    this.state.maxStreak  = 0;
    this.state.correct    = 0;
    this.state.wrong      = 0;
    this.showNameEntry();
  }

  /* ── NAME ENTRY ───────────────────────────────────────── */
  showNameEntry() {
    this.show('name');
    this.buildKeyboard();
    this.typeText('name-prompt-text',
      "Hello there! Welcome to PokéSQL! My name is Professor Oak — the SQL Pokémon Professor. Now tell me, what is your name?");
    document.getElementById('btn-backspace').onclick   = () => this.delChar();
    document.getElementById('btn-confirm-name').onclick = () => this.confirmName();
  }

  buildKeyboard() {
    const grid  = document.getElementById('keyboard-grid');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-!?'.split('');
    grid.innerHTML = '';
    chars.forEach(ch => {
      const b = document.createElement('button');
      b.className   = 'key-btn';
      b.textContent = ch;
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); this.addChar(ch); });
      grid.appendChild(b);
    });
  }

  addChar(ch) {
    if (this.state.playerName.length >= 10) return;
    this.state.playerName += ch;
    this.refreshNameDisplay();
  }

  delChar() {
    this.state.playerName = this.state.playerName.slice(0, -1);
    this.refreshNameDisplay();
  }

  refreshNameDisplay() {
    const el = document.getElementById('name-display');
    el.textContent = this.state.playerName + (this.state.playerName.length < 10 ? '_' : '');
  }

  confirmName() {
    if (!this.state.playerName.trim()) this.state.playerName = 'ASH';
    this.showIntro();
  }

  /* ── INTRO CUTSCENE ───────────────────────────────────── */
  showIntro() {
    this.show('intro');
    this.state.introStep = 0;
    this.renderIntroMsg();

    const advance = () => this.advanceIntro();
    const introEl = document.getElementById('screen-intro');

    if (this._introClickHandler) introEl.removeEventListener('click', this._introClickHandler);
    this._introClickHandler = advance;
    introEl.addEventListener('click', advance);

    if (this._introKeyHandler) document.removeEventListener('keydown', this._introKeyHandler);
    this._introKeyHandler = (e) => { if (e.key === 'Enter' || e.key === ' ') advance(); };
    document.addEventListener('keydown', this._introKeyHandler);
  }

  renderIntroMsg() {
    const msg = INTRO_MSGS[this.state.introStep];
    if (!msg) return;
    const npcEl = document.getElementById('intro-npc');
    if (npcEl) npcEl.textContent = NPC[msg.npc] || '👴';
    document.getElementById('intro-speaker').textContent = msg.speaker;
    document.getElementById('intro-arrow').style.display = 'none';
    this.typeText('intro-text',
      msg.text.replace(/{name}/g, this.state.playerName || 'ASH'),
      () => { document.getElementById('intro-arrow').style.display = 'block'; }
    );
  }

  advanceIntro() {
    if (this.state.twTimer) {
      clearInterval(this.state.twTimer);
      this.state.twTimer = null;
      const msg = INTRO_MSGS[this.state.introStep];
      document.getElementById('intro-text').textContent =
        msg.text.replace(/{name}/g, this.state.playerName || 'ASH');
      document.getElementById('intro-arrow').style.display = 'block';
      return;
    }
    this.state.introStep++;
    if (this.state.introStep >= INTRO_MSGS.length) {
      document.removeEventListener('keydown', this._introKeyHandler);
      this.loadQuestions(() => this.showMap());
      return;
    }
    this.renderIntroMsg();
  }

  /* ── LOAD QUESTIONS ───────────────────────────────────── */
  loadQuestions(cb) {
    if (this.state.questions.length > 0) { cb(); return; }
    fetch('questions.json')
      .then(r => r.json())
      .then(data => {
        this.state.questions = data.levels[0].questions;
        cb();
      })
      .catch(() => this.toast('❌ Could not load questions.json'));
  }

  /* ── MAP ──────────────────────────────────────────────── */
  showMap() {
    this.show('map');
    document.getElementById('hud-name').textContent = this.state.playerName || 'ASH';
    this.updateHUD();
    this.updateMapNPC();
    saveGame(this.state);
    this.flashSaveDot();
    document.getElementById('btn-walk').onclick = () => this.startQuestion();
    const mapNpc = document.getElementById('map-npc');
    if (mapNpc) mapNpc.onclick = () => this.startQuestion();
  }

  updateMapNPC() {
    const q = this.state.questions[this.state.currentQ];
    if (!q) return;
    const el = document.getElementById('map-npc');
    if (el) el.textContent = NPC[q.npc] || '🧑';
  }

  updateHUD() {
    const q    = this.state.questions;
    const tot  = q.length || 100;
    const done = this.state.currentQ;
    const pct  = (done / tot) * 100;

    document.getElementById('hud-score').textContent  = this.state.score.toLocaleString();
    document.getElementById('hud-streak').textContent = this.state.streak + (this.state.streak >= 3 ? '🔥' : '');
    document.getElementById('hud-correct').textContent= `${this.state.correct}/${done}`;
    document.getElementById('map-prog-text').textContent = `${done}/${tot}`;

    const bar = document.getElementById('map-prog-bar');
    if (bar) {
      bar.style.width = pct + '%';
      bar.style.background = pct < 40 ? 'var(--hp-green)' : pct < 75 ? 'var(--hp-yellow)' : '#60c8ff';
    }
  }

  flashSaveDot() {
    const dot = document.getElementById('save-dot');
    if (!dot) return;
    dot.style.opacity = '1';
    setTimeout(() => { dot.style.opacity = '.4'; }, 1500);
  }

  /* ── BATTLE / QUESTION ────────────────────────────────── */
  startQuestion() {
    const q = this.state.questions[this.state.currentQ];
    if (!q) { this.showComplete(); return; }

    this.show('battle');
    this.state.answering = false;

    document.getElementById('battle-npc-sprite').textContent = NPC[q.npc] || '🧑';
    document.getElementById('battle-npc-name').textContent   = q.npc.toUpperCase();
    document.getElementById('battle-speaker').textContent    = q.npc.toUpperCase();
    document.getElementById('battle-player-name').textContent= (this.state.playerName || 'ASH').toUpperCase();
    document.getElementById('battle-q-num').textContent      = this.state.currentQ + 1;
    document.getElementById('battle-pts').textContent        = this.state.score.toLocaleString();
    document.getElementById('battle-arrow').style.display    = 'none';
    document.getElementById('battle-choices').innerHTML      = '';

    this.typeText('battle-text', q.text, () => this.renderChoices(q));
  }

  renderChoices(q) {
    const container = document.getElementById('battle-choices');
    container.innerHTML = '';
    ['A','B','C','D'].forEach((letter, i) => {
      const btn = document.createElement('button');
      btn.className   = 'choice-btn';
      btn.setAttribute('data-letter', letter);
      btn.textContent = q.options[i];
      btn.addEventListener('click', () => this.pick(i, q, container));
      container.appendChild(btn);
    });
  }

  pick(chosen, q, container) {
    if (this.state.answering) return;
    this.state.answering = true;

    const btns    = container.querySelectorAll('.choice-btn');
    const correct = chosen === q.answer;

    btns.forEach(b => b.classList.add('disabled'));
    btns[q.answer].classList.remove('disabled');
    btns[q.answer].classList.add('correct');
    if (!correct) btns[chosen].classList.add('wrong');

    if (correct) {
      this.state.streak++;
      this.state.correct++;
      this.state.maxStreak = Math.max(this.state.maxStreak, this.state.streak);
      const bonus = this.state.streak >= 5 ? 200 : this.state.streak >= 3 ? 150 : 100;
      this.state.score += bonus;
    } else {
      this.state.streak = 0;
      this.state.wrong++;
    }

    setTimeout(() => this.showResult(correct, q), 850);
  }

  /* ── RESULT ───────────────────────────────────────────── */
  showResult(correct, q) {
    this.show('result');

    const icon  = document.getElementById('result-icon');
    const label = document.getElementById('result-label');
    const ansEl = document.getElementById('result-correct-ans');
    const expEl = document.getElementById('result-explanation');
    const ptsEl = document.getElementById('result-pts');

    if (correct) {
      icon.textContent  = '✓';
      label.textContent = CORRECT_FB[Math.floor(Math.random() * CORRECT_FB.length)];
      label.className   = 'result-label correct';
      ptsEl.textContent = this.state.streak >= 5 ? '+200 PTS 🔥 STREAK BONUS!'
                        : this.state.streak >= 3 ? '+150 PTS 🔥 HOT!'
                        : '+100 PTS';
      ptsEl.style.display = 'block';
      ansEl.classList.remove('visible');
    } else {
      icon.textContent  = '✗';
      label.textContent = WRONG_FB[Math.floor(Math.random() * WRONG_FB.length)];
      label.className   = 'result-label wrong';
      ptsEl.style.display = 'none';
      ansEl.textContent = '✓ Correct answer: ' + q.options[q.answer];
      ansEl.classList.add('visible');
    }

    expEl.textContent = q.explanation;

    document.getElementById('btn-result-cont').onclick = () => {
      this.state.currentQ++;
      saveGame(this.state);
      if (this.state.currentQ >= this.state.questions.length) {
        clearSave();
        this.showComplete();
      } else if (MILESTONES[this.state.currentQ]) {
        this.showLevelUp();
      } else {
        this.showMap();
      }
    };
  }

  /* ── LEVEL UP ─────────────────────────────────────────── */
  showLevelUp() {
    this.show('levelup');
    const ms   = MILESTONES[this.state.currentQ];
    const pct  = (this.state.currentQ / (this.state.questions.length || 100)) * 100;

    document.getElementById('lu-name').textContent   = this.state.playerName || 'ASH';
    document.getElementById('lu-stars').textContent  = `${ms.stars} BADGE EARNED! ${ms.stars}`;
    document.getElementById('lu-badge').textContent  = ms.badge;
    document.getElementById('lu-prog-label').textContent = `${this.state.currentQ} / 100`;

    const bar = document.getElementById('lu-prog-inner');
    if (bar) bar.style.width = pct + '%';

    document.getElementById('btn-lu-cont').onclick = () => this.showMap();
  }

  /* ── COMPLETE ─────────────────────────────────────────── */
  showComplete() {
    this.show('complete');
    const name = this.state.playerName || 'ASH';
    const tot  = this.state.questions.length || 100;
    const acc  = tot > 0 ? Math.round((this.state.correct / tot) * 100) : 0;

    document.getElementById('complete-name').textContent = name;
    document.getElementById('complete-stats').textContent =
      `FINAL SCORE:   ${this.state.score.toLocaleString()}\n` +
      `CORRECT:       ${this.state.correct} / ${tot}\n` +
      `ACCURACY:      ${acc}%\n` +
      `BEST STREAK:   ${this.state.maxStreak} 🔥`;

    document.getElementById('btn-play-again').onclick = () => {
      clearSave();
      this.startFresh();
    };
  }

  /* ── SCREEN SWITCHER ──────────────────────────────────── */
  show(name) {
    Object.values(this.screens).forEach(s => s.classList.remove('active'));
    const t = this.screens[name];
    if (t) t.classList.add('active');
    this.state.screen = name;
  }

  /* ── TYPEWRITER ───────────────────────────────────────── */
  typeText(id, text, onDone) {
    if (this.state.twTimer) { clearInterval(this.state.twTimer); this.state.twTimer = null; }
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = '';
    let i = 0;
    this.state.twTimer = setInterval(() => {
      if (i < text.length) { el.textContent += text[i++]; }
      else {
        clearInterval(this.state.twTimer);
        this.state.twTimer = null;
        if (onDone) onDone();
      }
    }, 26);
  }

  /* ── TOAST ────────────────────────────────────────────── */
  toast(msg, ms = 2600) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), ms);
  }

  /* ── GLOBAL KEYBOARD ──────────────────────────────────── */
  bindGlobalKeys() {
    document.addEventListener('keydown', (e) => {
      const s = this.state.screen;

      if (s === 'name') {
        if (e.key === 'Backspace')  { e.preventDefault(); this.delChar(); }
        else if (e.key === 'Enter') { this.confirmName(); }
        else if (e.key.length === 1 && /[A-Z0-9.\-!?]/i.test(e.key)) {
          this.addChar(e.key.toUpperCase());
        }
        return;
      }

      if (s === 'title' && (e.key === 'Enter' || e.key === ' ')) {
        document.getElementById('screen-title').click();
        return;
      }

      if (s === 'battle' && !this.state.answering) {
        const map = { '1':0, '2':1, '3':2, '4':3, 'a':0, 'b':1, 'c':2, 'd':3 };
        const idx = map[e.key.toLowerCase()];
        if (idx !== undefined) {
          const btns = document.querySelectorAll('.choice-btn:not(.disabled)');
          if (btns[idx]) btns[idx].click();
        }
        return;
      }

      if (e.key === 'Enter' || e.key === ' ') {
        if (s === 'result')  { document.getElementById('btn-result-cont')?.click(); }
        if (s === 'levelup') { document.getElementById('btn-lu-cont')?.click(); }
        if (s === 'map')     { document.getElementById('btn-walk')?.click(); }
      }
    });
  }
}

/* ─── INIT ───────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => { new Game(); });
