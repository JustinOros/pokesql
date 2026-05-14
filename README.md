# 🎮 PokéSQL — Learn T-SQL

A Pokémon-style Game Boy Advance browser game for learning **Microsoft T-SQL**!
Play it on your phone, tablet, or PC — progress is saved automatically to your browser.

## 🚀 Play It Live
**`https://justinoros.github.io/pokesql`**

---

## 🗂️ Files

```
pokesql/
├── index.html      ← Game screens & structure
├── style.css       ← GBA Pokémon aesthetic, fully responsive
├── game.js         ← Game engine, controller, walking, save system
├── questions.json  ← 100 T-SQL questions & answers
└── README.md
```

---

## 🕹️ Host on GitHub Pages (free)

1. Create a GitHub repo named **`pokesql`**
2. Upload all **4 files**: `index.html`, `style.css`, `game.js`, `questions.json`
3. Go to **Settings → Pages → Source: `main` branch, `/ (root)` folder**
4. Hit **Save** — live in ~60 seconds at `https://justinoros.github.io/pokesql`

No server, no database, no cost.

---

## 🎮 GBA Controller Overlay

On mobile, a semi-transparent Game Boy Advance-style controller overlays the bottom of the screen:

| Control | Action |
|---|---|
| **D-pad** | Walk the player around the map |
| **A button** (red) | Talk to NPC on map · Confirm answer in battle · Advance dialog |
| **B button** (blue) | Talk to NPC on map · Advance dialog |
| **SELECT / START** | Decorative — reserved for future use |

The controller is hidden on desktop (≥900px wide) — use the keyboard instead.

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

- The player sprite walks freely around the overworld map using the D-pad or WASD
- Walking animations change based on direction (left, right, up, down)
- Press **A**, **B**, **E**, or **Enter** at any time to talk to the NPC and start the question
- Tapping the NPC sprite directly also triggers the conversation

---

## 💾 Save System

Progress is stored in the player's browser (`localStorage`) automatically:

- **Auto-saves** after every answered question and on map return — a 💾 icon flashes to confirm
- **Continue screen** appears on next visit showing trainer name, progress %, and score
- **New Game** option always available — prompts confirmation before erasing save
- Save clears automatically on completion so the next run starts fresh

---

## 🎯 Features

| Feature | Detail |
|---|---|
| GBA controller overlay | D-pad + A/B buttons, semi-transparent, mobile only |
| Walking player | Moves freely on map, directional walk animations |
| Mobile-first design | Full-screen on phones with safe-area support, framed on desktop |
| localStorage save | Auto-save with continue screen on return visits |
| 100 T-SQL questions | Progressive difficulty, shuffled answer order every time |
| Randomised answer positions | Correct answer shuffled to a random slot — no pattern to exploit |
| Numbered answers | Options labelled 1/2/3/4 (not A/B/C/D) |
| Name entry | On-screen pixel keyboard, just like the real game |
| Typewriter text | Authentic dialog effect, tap/press to skip |
| 22 NPC characters | Professor Oak, Misty, Brock, Giovanni, Lance… |
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

`answer` is the **0-based index** of the correct option in the `options` array (0 = first option, 1 = second, etc.). The game shuffles the display order randomly at runtime, so the position shown to the player will vary each time.

---

## 🧑 Adding NPCs

In `game.js`, add to the `NPC` object at the top:

```js
const NPC = {
  'Your NPC Name': '🧑',
  ...
};
```

Then reference `"npc": "Your NPC Name"` in `questions.json`.

---

## 📱 Mobile Tips

- Add to Home Screen on iOS/Android for a full-screen app-like experience
- The game uses `100dvh` and `env(safe-area-inset-bottom)` for notched phones (iPhone X+)
- Tap anywhere on the dialog box during the intro to skip the typewriter and advance
- Tap the NPC sprite directly on the map as an alternative to pressing A/B
