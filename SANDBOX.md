# Kalami Sandbox: code tasks plan

> Where students write HTML and CSS by hand, see the page live, and get checked and
> explained as they go. Companion to `KALAMI.md` (§4.4 tasks, §6 integrity) and
> `kalami-stuff/STUDIO.md` (Phase D: code questions). Nothing here is built yet.

---

## 1. Decisions (2026-10-03)

| Topic | Decision |
|---|---|
| Languages | **HTML and CSS only** until other lecturers join. Student code has no JavaScript. |
| Where code runs | In the student's browser. No server runner, no judge, no extra hosting. |
| Grading | The browser result is feedback only. On submit, Convex re-runs the checks and that is the grade. |
| Isolation | The preview is a sandboxed iframe with scripts switched off. No separate domain while there is no JS (§5). |
| Phones | The layout must work on a narrow screen. A real phone editing experience waits until students are asked (survey). |
| Assistant | No AI: explanations, mistake finder, guided steps, X-ray (§6). An AI tutor comes only after a university backs Kalami. |
| Games | Later: CSS Diner / Flexbox Froggy-style levels for HTML/CSS, built on the same editor and checks engine. |

---

## 2. What the student sees

Desktop:

```
┌ Task: Build your profile card ───────────────────────────── ⏱ 12:41 ┐
│ Instructions         │ index.html │ style.css │ Preview              │
│ (their variant,      │                        │ (refreshes 300 ms    │
│  name watermark)     │  CodeMirror 6          │  after typing stops) │
│                      │  red-pen underlines    │                      │
│ Steps                │                        │                      │
│ ✓ has a <nav>        ├────────────────────────┴──────────────────────┤
│ ✓ 3 menu items       │ <nav>: a block of navigation links. Usually   │
│ ○ .card uses flex    │ holds a <ul> of <a> links. Example: …         │
└──────────────────────┴───────────────────────────────────── [Submit] ┘
```

Narrow screens (< 768 px): one pane at a time with a tab bar `Task · Code · Preview · Steps`.
Layout only for now. No phone keyboard toolbar, no touch tuning.

The same screen with no task attached is the **Playground**: free practice, saved per student.

---

## 3. Pieces

| Piece | Job | Lives in |
|---|---|---|
| `CodeEditor` | CodeMirror 6, files as tabs, integrity rules | `kalami/components/sandbox/` |
| `Preview` | Builds the page from the files and renders it in a sandboxed iframe | `kalami/components/sandbox/` |
| `lib/checks` | Parses HTML and CSS, works out the cascade, runs the check rules | `kalami-stuff/convex/lib/checks/` (source), copied to `kalami/lib/checks/` |
| `lib/lint` | Mistake finder for the errors browsers silently forgive | `kalami/lib/lint/` |
| `lib/explain` | Dictionary of tags, attributes, properties, values and lint codes, in ka and en | `kalami/lib/explain/` |
| `ExplainPanel` | Card for whatever is under the cursor, or for the current mistake | `kalami/components/sandbox/` |
| Backend | Playgrounds, code questions, variants, responses, re-check on submit | `kalami-stuff/convex/` |

The staff app reuses `Preview` and `lib/checks` for the task builder and for grading.

### 3.1 Editor (CodeMirror 6)

- Built from the parts we need, not `basicSetup`: `@codemirror/state`, `view`, `language`,
  `commands` (history, keymap), `lang-html`, `lang-css`, `lint`.
- **Every character is typed by hand.** No `autocompletion()`, `html({ autoCloseTags: false })`,
  and no bracket auto-pairing. Auto-indent on Enter stays, because it doesn't write code.
- Paste and drop: a transaction filter rejects `input.paste` / `input.drop` and counts them
  (`pasteBlocked`, `dropBlocked`).
- `largeInserts`: a single change that inserts more than ~50 characters, not counting undo or redo.
- `spellcheck="false"`, `autocorrect="off"`, `autocapitalize="off"` and Grammarly switched off,
  so neither the browser nor an extension can type for them.
- Locked lines: the lecturer can mark parts of the starter code as read-only (change filter).
- `Ctrl+Enter` refreshes the preview and runs the steps. `Ctrl+S` saves now instead of opening the
  browser's save dialog.

### 3.2 Preview

- `index.html` is the page. A `<link rel="stylesheet" href="style.css">` is replaced with that
  file's contents. **If the student forgot the link, their CSS doesn't apply**, just like on a
  real site, and the mistake finder says why.
- `<iframe srcdoc sandbox="allow-same-origin">`. There is **no** `allow-scripts`, so `<script>`
  and `on…=` attributes never run, and there are no forms, popups or top-level navigation.
  `allow-same-origin` without scripts lets *our* page look inside the preview (to keep the scroll
  position, and for X-ray), while the student's content still can't run anything.
- A CSP `<meta>` is injected first in `<head>`:
  `default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com; img-src data: <asset host>; base-uri 'none'`.
  The page can't fetch from arbitrary sites or embed frames.
- The staff app renders submissions with the same component, so grading is safe for the same reasons.

### 3.3 Checks engine (`lib/checks`)

One plain TypeScript engine runs in three places:

- the student's browser, for instant ticks;
- Convex, on submit, where it produces the grade;
- the studio, where the lecturer tests the rules against a sample solution.

Because it is the same code everywhere, the browser and the server never disagree.

- HTML: parse5 (it builds the same tree a browser builds, mistakes included), with source
  positions; selectors are matched with css-select.
- CSS: parsed with css-tree. For each element it works out which declaration wins: selector
  match, specificity, source order, `!important`, the inline `style` attribute, inheritance of
  inherited properties, and the common shorthands (`margin`, `padding`, `border`, `background`,
  `font`, `flex`, `gap`). Media queries are evaluated at the rule's viewport width (default 1280).
- Values are normalised before comparing: colours to `rgb()`, `0px` = `0`, keywords in lower case.
- There is no layout engine, so checks like "is centred" or "fits on one line" aren't possible.
  Reading `getComputedStyle` from the real preview would give layout, but the server can't do it,
  and a ✓ that turns into ✗ on submit is the worst thing a student can see.

Rule types (KALAMI.md §9, extended):

| Type | Example |
|---|---|
| `exists` / `not_exists` | there is a `nav` / no `table` is used for layout |
| `count` | `nav li` eq / gte / lte 3 |
| `text` | `h1` contains `{{student.firstName}}` |
| `attr` | every `img` has `alt`; `a[href]` starts with `https://` |
| `css` | `.card` → `display` is `flex` (or one of a list) |
| `linked` | `style.css` is linked from `index.html` |
| `lint_clean` | no mistake of severity `error` |

Each rule has `id`, `points`, `label {ka, en}`, `visible`, and an optional `hint {ka, en}`.
**Visible** rules are sent to the student with their variant values already filled in, and tick
while they type. **Hidden** rules exist only in `answerKeys` and run on the server at submit.

### 3.4 Variants

- Seed = SHA-256(`userId + assessmentId`), stored as `attempts.variantSeed`.
- The lecturer declares parameters on the question:

```json
{
  "color": { "pick": ["#e63946", "#2a9d8f", "#3a86ff"] },
  "items": { "int": [3, 6] },
  "city":  { "pick": ["თბილისი", "ქუთაისი", "ბათუმი"] }
}
```

- `{{variant.color}}` works in instructions, starter files and rules.
- Values are resolved on the server, so a student only ever sees their own.

---

## 4. Integrity in the sandbox

The editor is where most of KALAMI.md §6 happens. Per level:

| | `off` (practice, Playground) | `standard` | `strict` |
|---|:-:|:-:|:-:|
| No paste / drop / autocomplete / spellcheck | ✅ | ✅ | ✅ |
| `largeInserts`, typing bursts counted | ✅ | ✅ | ✅ |
| Name watermark over editor and preview | | ✅ | ✅ |
| Assistant (§6) | all layers | explain + mistakes + visible steps | lecturer's choice, default off |

The editor reports counters to the integrity collector (STUDIO.md Phase B, step 6). It doesn't
record keystrokes.

---

## 5. Isolation: why there's no separate domain yet

Student code runs on other people's screens: the lecturer's when grading, or a classmate's if a
playground is shared. **HTML and CSS can only draw. JavaScript can act.** Script running inside a
page where the lecturer is logged in could act *as the lecturer*: change grades, or read students'
data. With scripts off in the preview, that can't happen, so no extra domain is needed.

When student JavaScript arrives (later, for other lecturers), student code moves to its **own
registrable domain** (e.g. `kalami-run.space`), not a subdomain. Browsers treat everything under
`kalami.space` as one site: cookies can be shared, and requests between subdomains count as
same-site. `Preview` takes the runner's origin as a setting, so that switch is one change.

This is separate from anti-cheat. Controlling the student's tab (no paste, fullscreen, focus
tracking) is the integrity layer (§4) and works the same on any domain.

---

## 6. The assistant (no AI)

**HTML and CSS never show an error.** The browser silently guesses and carries on, which is why
beginners get stuck. The assistant's main job is to catch what the browser forgives.

| Layer | What the student gets | How |
|---|---|---|
| 1. Explain this | Cursor on a tag, attribute, property or value → a short card: what it does and a tiny example | `lib/explain` dictionary |
| 2. Mistakes | Red-pen underline, one Georgian sentence, and a hint for the fix | `lib/lint` (list below) |
| 3. Guided steps | Visible rules as a checklist that ticks itself (the self-drawing tick); a hint after a few tries | rule `label` + `hint` |
| 4. X-ray | Hover an element in the preview → its lines light up, plus the CSS rules on it: which one won, which were crossed out, and why (specificity, order) | the checks engine's cascade + source positions |

Mistakes `lib/lint` catches first:

- unclosed or wrongly nested tags; a tag closed that was never opened
- unknown tags and properties, with a suggestion (`backround-color` → `background-color`)
- invalid values (`display: flexbox`), checked against the CSS grammar by css-tree
- a missing `;` that silently swallows the next line
- `style.css` not linked; a selector that matches nothing on the page
- `class=".card"`, `#` in an `id`, and `<img>` without `alt`
- `<script>`: "JavaScript isn't part of this course yet, so it won't run here"

**Content:** about 50 tags, 100 properties, the common values and about 30 mistake codes, in ka and
en. Claude drafts it and you review it. It starts as files in the repo and moves to a Convex table
when other lecturers need to edit it. Links like "taught in lesson 3" come once lessons exist
(STUDIO.md Phase C).

**AI tutor:** not before a university backs Kalami. When it comes, the mistake codes, step results
and dictionary are exactly the context it needs.

---

## 7. Data changes (`kalami-stuff/convex`)

```
playgrounds     NEW  userId, title, files[{name, content}], updatedAt        by_userId
                     max ~20 per student, 100 KB per file
assessments     kind + "task"  (homework: code questions, usually no time limit)
questions       type + "code"
                + code? { language: "web", files[{name, content, locked?[{from, to}]}],
                          variantParams? }
answerKeys      key + { type: "code", rules: CheckRule[], sampleSolution?: files }
responses       (Phase B) value = { files }, autosaved 3 s after typing stops
                + checkResults?[{ruleId, passed}]   written by the server on submit
codeSnapshots   OPTIONAL  responseId, files, at: a saved version every ~30 s of activity,
                for the lecturer's timeline. Needs a line in the honesty notice.
```

MCP: `add_questions` learns the `code` type, so a lecturer's agent can draft starter files, rules
and variants. Drafts only, as always.

---

## 8. Build order

Students can't join courses or start attempts yet (STUDIO.md Phase B), so the sandbox starts with
the **Playground**, which needs neither.

| Step | Build | Done when |
|---|---|---|
| S1 | Editor, preview and layout (desktop + narrow), the editor's integrity rules, `playgrounds` with autosave, `/playground` | A student writes a page by hand and sees it live; paste does nothing |
| S2 | `lib/lint`, `lib/explain`, Explain panel (layers 1–2) | `backround-color` gets a red-pen note in Georgian |
| S3 | `lib/checks` with tests; code-question builder in the studio (starter files, rules, variants, sample solution, "test my rules") | You build a task and see your rules pass on your own solution |
| S4 | Phase B (join, attempts, responses), task player on the sandbox, guided steps, submit → server re-check, red-pen comments on lines | Your class does a graded HTML/CSS task end to end |
| S5 | X-ray, class error radar in the live monitor ("12 students stuck on step 3"), similarity, "not taught yet" | |
| Later | Phone editing (after asking students), CSS games, JavaScript + separate domain, AI tutor | |

---

## 9. Open questions

1. Images in student pages: only a curated set plus lecturer uploads (proposed), or any `https` image?
2. Snapshot timeline: add it to the honesty notice now, or skip it for the pilot?
3. Assistant in `strict` exams: off by default (proposed)?
