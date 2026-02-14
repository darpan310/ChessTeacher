# Chess Opening Trainer - Product Requirements (V1)

## 1. Product Summary
Build a web app that teaches chess openings to players around 1000 Elo using short, practical lines, plain-English explanations, and repetition drills.  
The product should train users as both White and Black and prioritize common, game-relevant positions over deep theory.

## 2. Problem
Most opening tools overwhelm lower-rated players with large trees and memorization-heavy workflows.  
A 1000 Elo player needs:
- Focused repertoires
- Clear "why" behind moves
- Repetition on common opponent responses
- Progress tracking that surfaces weak lines

## 3. Target User
- Elo range: ~800-1400 (primary: 1000)
- Wants to improve opening play quickly
- Prefers guided learning over raw databases
- Practices in short daily sessions (10-20 min)

## 4. Product Goals
- Help user learn playable opening repertoires as White and Black.
- Improve opening recall in practical games.
- Build understanding of ideas, not only move order memorization.

## 5. Non-Goals (V1)
- Full opening encyclopedia coverage
- Engine analysis lab
- Multiplayer games or social features
- Deep personalization from imported game history

## 6. MVP Scope

### 6.1 Openings Included
White repertoire:
- Italian Game
- London System
- Queen's Gambit

Black repertoire vs 1.e4:
- Sicilian Defense
- Caro-Kann Defense

Black repertoire vs 1.d4:
- Queen's Gambit Declined
- King's Indian Defense

### 6.2 Per Opening Content
For each opening:
- 1 mainline (8-12 plies to start)
- 2-4 common deviations from practical play
- Key idea summaries:
  - Main plan
  - Typical tactical motifs
  - Common mistakes

### 6.3 Training Modes
- Learn Mode:
  - Move-by-move walkthrough with short explanations
- Drill Mode:
  - User must input correct repertoire move from a position
- Review Mode:
  - Daily queue using spaced repetition from weakest lines

### 6.4 Progress Tracking
- Accuracy per line
- Current streak per line
- Last reviewed timestamp
- Next review timestamp
- "Ready for Game" score per opening (0-100)

## 7. User Stories
- As a player, I can choose to train as White or Black.
- As a player training Black, I can choose opponent first move (1.e4 or 1.d4).
- As a player, I can study one short line with explanations.
- As a player, I can be tested immediately after studying.
- As a player, I can return to a daily review queue focused on weak lines.

## 8. Functional Requirements
1. Opening Selection
- Display opening catalog grouped by side and opponent first move.
- Show completion/strength indicators per opening.

2. Position Rendering
- Render board from FEN.
- Highlight legal move attempts and validate chosen move.

3. Lesson Playback
- Step through authored line nodes in order.
- Display explanation at each critical move.

4. Drill Validation
- Accept move input by board interaction.
- Mark move correct if SAN/UCI matches expected move.
- On incorrect answer, show correction and concise reason.

5. Spaced Review
- Generate due queue from `next_review_at`.
- Update scheduling based on correctness and response quality.

6. Progress Dashboard
- Show readiness by opening.
- Show weak lines for targeted practice.

## 9. Non-Functional Requirements
- Mobile-friendly and desktop-friendly UI.
- Sub-200ms local move validation response.
- Deterministic lesson behavior (same line => same expected move).
- Content should be editable without code changes (DB + JSON seed pipeline).

## 10. Success Metrics (V1)
- D7 retention: % of users returning for review.
- Weekly drills completed per active user.
- Accuracy improvement in repeated lines over 2 weeks.
- # openings with "Ready for Game" >= 70.

## 11. Risks and Mitigations
- Risk: Too much content too soon.
  - Mitigation: Gate depth unlocks by mastery thresholds.
- Risk: Memorization without understanding.
  - Mitigation: Require short concept cards in Learn Mode.
- Risk: Incorrect/low-quality line content.
  - Mitigation: Curated seed set and content review checklist.

## 12. Milestones
1. M1 - Foundation
- Auth (optional local profile), opening catalog, board, lesson runner
2. M2 - Drill + Scoring
- Move validation, attempt tracking, accuracy/streak stats
3. M3 - Review System
- Spaced repetition scheduling and daily queue
4. M4 - Polish + Content Expansion
- Add lines/deviations and improve explanations
