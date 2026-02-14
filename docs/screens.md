# Chess Opening Trainer - V1 Screen and Flow Spec

## 1. Product Flow (Happy Path)
1. User opens app and chooses training side (White or Black).
2. User selects an opening from catalog.
3. User runs Learn Mode for one line.
4. User immediately runs Drill Mode on same line.
5. User returns daily for Review Queue.

## 2. Screen List

## Screen 1: Home / Dashboard
Purpose:
- Show daily review status and opening readiness summary.

Content:
- "Start Daily Review" CTA with due count
- Repertoire split cards:
  - White openings
  - Black vs 1.e4
  - Black vs 1.d4
- Weakest lines panel

Primary actions:
- Start review queue
- Jump to opening catalog

---

## Screen 2: Side and Repertoire Picker
Purpose:
- Let user pick what they want to train now.

Content:
- Toggle: Train as White / Train as Black
- If Black: secondary choice for opponent first move (1.e4 / 1.d4)
- Opening cards with:
  - Name
  - Difficulty
  - Readiness score
  - Last reviewed

Primary actions:
- Open opening detail

---

## Screen 3: Opening Detail
Purpose:
- Show all available lines for a selected opening.

Content:
- Opening summary:
  - Core idea
  - Typical pawn structure
  - Common tactical themes
- Line list (mainline + deviations):
  - Completion %
  - Accuracy %
  - Next due

Primary actions:
- Start Learn mode for selected line
- Start Drill mode for selected line

---

## Screen 4: Learn Mode
Purpose:
- Teach line step-by-step with explanation.

Content:
- Chessboard and move list
- Current step explanation card:
  - Why move works
  - What to watch for
- "Opponent likely response" hint where relevant

Primary actions:
- Next step
- Replay line
- Switch to Drill

Rules:
- Keep explanation concise (1-3 sentences).
- Emphasize plans over exact memorization language.

---

## Screen 5: Drill Mode
Purpose:
- Test recall for repertoire moves.

Content:
- Chessboard with current prompt position
- Prompt: "Your move"
- Progress indicator (e.g., 3/10)

Primary actions:
- Submit move (board interaction)
- Reveal answer (after incorrect move)
- Continue to next prompt

Feedback behavior:
- Correct: short confirm + concept reinforcement
- Incorrect: show expected move + one-sentence reason

---

## Screen 6: Review Queue
Purpose:
- Daily spaced repetition session.

Content:
- Queue of due line nodes (mixed openings)
- Session score summary as user progresses

Primary actions:
- Answer move prompts
- Pause review
- Finish session

Completion output:
- Accuracy
- Lines strengthened
- Lines to revisit soon

---

## Screen 7: Progress / Analytics
Purpose:
- Provide practical progress visibility.

Content:
- Readiness by opening (0-100)
- Trend: last 7/30 day accuracy
- Slowest response concepts
- Most-missed lines

Primary actions:
- Start targeted drill on weak lines

## 3. Component Inventory (Shared)
- `ChessBoard`
- `MoveInputController`
- `LineStepper`
- `ExplanationCard`
- `AccuracyBadge`
- `ReadinessMeter`
- `ReviewQueuePanel`

## 4. MVP Navigation Map
- `/` -> Home / Dashboard
- `/repertoire` -> Side and Repertoire Picker
- `/openings/:slug` -> Opening Detail
- `/lines/:lineId/learn` -> Learn Mode
- `/lines/:lineId/drill` -> Drill Mode
- `/review` -> Review Queue
- `/progress` -> Progress / Analytics

## 5. UX Rules for 1000 Elo Audience
- Prefer short lines first (8-12 plies).
- Avoid jargon unless explained inline.
- Each teaching step answers:
  - What move?
  - Why this move?
  - What if opponent does the common alternative?
- Minimize modal clutter and dense notation walls.

## 6. Out-of-Scope Screens (Post-MVP)
- Game import analysis
- Repertoire style selector (aggressive/solid)
- Opening bot sparring mode
- Community/shared repertoires

