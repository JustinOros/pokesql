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
├── game.js         ← Game engine + localStorage save system
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

## 💾 Save System

Progress is stored in the player's browser (`localStorage`) automatically:

- **Auto-saves** after every answered question and on map return
- **Continue screen** appears on next visit if an in-progress save exists
- Displays trainer name, question progress, and score on the continue screen
- **New Game** option is always available (prompts confirmation to prevent accidents)
- Save is cleared on game completion — ready for a fresh run

---

## 🎯 Features

| Feature | Detail |
|---|---|
| GBA Pokémon aesthetic | Press Start 2P font, pixel dialog boxes, scanline overlay |
| Mobile-first design | Full-screen on phones, framed device on desktop |
| 100 T-SQL questions | Progressive difficulty, multiple choice |
| Name entry | On-screen pixel keyboard, just like the real game |
| Typewriter text | Authentic dialog effect with tap-to-skip |
| 22 NPC characters | Professor Oak, Misty, Brock, Giovanni, Lance… |
| Streak bonuses | 3× = +150 pts 🔥, 5×+ = +200 pts 🔥 |
| Milestone badges | Earned at Q25, Q50, Q75, Q100 |
| Correct answer reveal | Wrong answers show the right answer + explanation |
| Keyboard shortcuts | 1–4 / A–D to answer, Enter to continue |

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

`answer` is the **0-based index** of the correct option (0 = A, 1 = B, 2 = C, 3 = D).

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

- Add to Home Screen on iOS/Android for a full-screen app experience
- The game uses `100dvh` and `safe-area-inset` for notched phones
- Tap anywhere on the dialog during intro to skip typewriter / advance
- Tap the NPC sprite on the map to start the question (same as the button)
