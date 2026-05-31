# 🎮 PokéSQL — Learn T-SQL

A Pokémon-style Game Boy Advance browser game for learning **Microsoft T-SQL**!
Play it on your phone, tablet, or PC — progress is saved automatically to your browser.

## 🚀 Play It Live
👉 [Launch PokéSQL](https://justinoros.github.io/pokesql)

---

## 🗂️ Files

```
pokesql/
├── index.html        ← Game screens & structure
├── style.css         ← GBA Pokémon aesthetic, fully responsive
├── game.js           ← Game engine, controller, walking, save system
├── config.js         ← Game-specific config (name, text, badges, milestones)
├── questions.json    ← 100 T-SQL questions & answers
├── player.png        ← Player sprite sheet (24 frames, 16×32px)
├── oak.png           ← Professor Oak NPC sprite
├── gary.png          ← Rival Gary NPC sprite
├── joy.png           ← Nurse Joy NPC sprite
├── jenny.png         ← Officer Jenny NPC sprite
├── music.mp3         ← Background music (overworld)
├── music-rival.mp3   ← Background music (rival/battle)
├── favicon.ico       ← Browser tab icon
└── README.md
```

---

## 🕹️ Host on GitHub Pages (free)

1. Create a GitHub repo named **`pokesql`**
2. Upload all files listed above
3. Go to **Settings → Pages → Source: `main` branch, `/ (root)` folder**
4. Hit **Save** — live in ~60 seconds at `https://justinoros.github.io/pokesql`

No server, no database, no cost.

---

## 🎮 GBA Controller Overlay

On mobile, a semi-transparent Game Boy Advance-style controller overlays the bottom of the screen:

| Control | Action |
|---|---|
| **D-pad** | Walk the player around the map |
| **A button** (red) | Talk to NPC · Confirm answer · Advance dialog |
| **B button** (blue) | Talk to NPC · Advance dialog |
| **SELECT / START** | Decorative |

The controller is hidden on desktop (≥900px wide) — use the keyboard instead.

---

## 🕹️ Xbox / Gamepad Support

Plug in any Xbox, PlayStation, or USB gamepad and it works automatically:

| Input | Action |
|---|---|
| **Left stick / D-pad** | Walk on map |
| **A button** | Talk to NPC · Confirm answer · Advance dialog |
| **B button** | Talk to NPC · Advance dialog |
| **Start** | Confirm / advance on all screens |
| **X / Y / LB / RB** | Quick-pick answers 1/2/3/4 in battle |

---

## ⌨️ PC Keyboard Controls

| Key | Action |
|---|---|
| **WASD / Arrow keys** | Walk player on map |
| **E / Enter** | Talk to NPC · Confirm answer · Advance dialog |
| **X** | Talk to NPC · Advance dialog |
| **1 / 2 / 3 / 4** | Quick-pick answer directly |
| **Space** | Advance dialog |

---

## 🗺️ Map & Walking

- The player sprite walks freely around the overworld map using the D-pad, WASD, arrow keys, or Xbox controller
- Walking animations use the `player.png` sprite sheet with directional frames
- A blinking `▶` arrow on the right edge points toward the next NPC
- A `...` speech bubble appears above the player if you press talk before reaching the NPC
- Press **A**, **B**, **E**, or **Enter** when near the NPC to start the question
- Tapping the NPC sprite directly also triggers the conversation

---

## 💾 Save System

Progress is stored in the player's browser (`localStorage`) automatically:

- **Auto-saves** after every answered question and on map return
- **Shuffled question order** is saved so continuing a game resumes the exact same sequence
- **Continue screen** appears on next visit showing trainer name, progress %, and score
- **New Game** option always available — prompts confirmation before erasing save
- Save clears automatically on completion so the next run starts fresh

---

## 🎵 Music

- Background music plays automatically on the map (`music.mp3`)
- Music pauses during questions and resumes on return to the map
- **🎵 / 🔇 toggle** in the map header to mute/unmute
- Music resumes correctly after switching browser tabs on mobile

---

## 🎯 Features

| Feature | Detail |
|---|---|
| GBA controller overlay | D-pad + A/B buttons, semi-transparent, mobile only |
| Xbox / gamepad support | Full navigation on all screens including name entry |
| Walking player | Pixel sprite sheet, directional walk animations |
| Mobile-first design | Full-screen on phones with safe-area support, framed on desktop |
| localStorage save | Auto-save with shuffled order preserved on continue |
| 100 T-SQL questions | Randomised order every new game, shuffled answer slots |
| Numbered answers | Options labelled 1/2/3/4 — no A/B/C/D pattern to exploit |
| PNG NPC sprites | NPCs can use image files or emoji |
| Name entry | On-screen pixel keyboard navigable by gamepad |
| Typewriter text | Authentic dialog effect, tap/press/gamepad to skip |
| `...` proximity bubble | Shows above player when pressing talk too far from NPC |
| Background music | Loops on map, pauses during questions, mute toggle |
| Streak bonuses | 3× correct = +150 pts 🔥, 5×+ = +200 pts 🔥 |
| Milestone badges | Earned at Q25, Q50, Q75, Q100 |
| Correct answer reveal | Wrong answers show the right answer + full explanation |
| Scanline overlay | Authentic CRT/GBA screen effect |

---

## 📚 Topics Covered

| Questions | Topics |
|---|---|
| 1–15 | SELECT, FROM, WHERE, ORDER BY, TOP, BETWEEN, LIKE, IN, NULL |
| 16–25 | COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING, DISTINCT |
| 26–35 | Aliases, JOINs (INNER, LEFT, RIGHT, FULL OUTER), Keys |
| 36–50 | Data types, GETDATE(), INSERT, UPDATE, DELETE, TRUNCATE, Views, Stored Procedures |
| 51–65 | Transactions, Variables, @@ROWCOUNT, ISNULL, COALESCE, CAST, String functions, Date functions |
| 66–80 | CTEs, Subqueries, ROUND, CASE WHEN, Indexes, UNION, INTERSECT, EXCEPT, Triggers, Schemas |
| 81–100 | Temp tables, Table variables, TRY…CATCH, @@ERROR, SSMS, Execution plans, NOLOCK, Deadlocks, Window functions, PIVOT, IDENTITY, Normalization |

---

## ➕ Adding Questions

Edit `questions.json`, add to the `questions` array inside `levels[0]`:

```json
{
  "id": 101,
  "npc": "Professor Oak",
  "text": "Your question here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": 0,
  "explanation": "Why Option A is correct."
}
```

`answer` is the **0-based index** of the correct option (0 = first, 1 = second, etc.). The game shuffles display order randomly at runtime.

---

## 🧑 Adding NPCs

In `game.js`, add to the `NPC` object:

```js
const NPC = {
  'Your NPC Name': 'npc.png',   // PNG sprite file in repo root
  'Another NPC':   '🧑',        // or an emoji
};
```

Then reference `"npc": "Your NPC Name"` in `questions.json`. PNG files are auto-prefixed with `./` so just use the filename.

---

## ⚙️ Customising the Game

All game-specific text lives in **`config.js`** — the only file that differs between PokéSQL and its sister game PokéAzure. Edit it to change the game name, town name, intro dialog, badge names, battle move names, and more without touching `game.js` or `index.html`.

---

## 📱 Mobile Tips

- Add to Home Screen on iOS/Android for a full-screen app-like experience
- The game uses `100dvh` and `env(safe-area-inset-bottom)` for notched phones (iPhone X+)
- Tap anywhere on the dialog box during the intro to skip the typewriter and advance
- Tap the NPC sprite directly on the map as an alternative to pressing A/B
