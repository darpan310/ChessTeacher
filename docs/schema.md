# Chess Opening Trainer - Data Model and Schema (V1)

## 1. Design Principles
- Content-first: opening lines are authored and versioned.
- Position-centric: every training prompt is tied to a FEN.
- User progress is line-specific and position-specific.
- Schema supports both Learn and Drill flows without duplication.

## 2. Core Entities
- `openings`: top-level opening metadata
- `lines`: authored branches within an opening
- `line_nodes`: ordered steps in a line
- `positions`: normalized board states
- `user_line_progress`: spaced repetition + mastery per line
- `user_node_attempts`: detailed attempt history for analytics

## 3. Relational Schema (PostgreSQL)

```sql
-- Users
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  display_name text,
  created_at timestamptz not null default now()
);

-- Opening catalog
create table openings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,               -- e.g. "italian-game"
  name text not null,                      -- "Italian Game"
  side_to_train text not null check (side_to_train in ('white', 'black')),
  vs_first_move text,                      -- e.g. "e4", "d4" (null for white repertoire entries)
  family text,                             -- e.g. "Open Game", "Semi-Open"
  difficulty smallint not null default 1,  -- 1..5
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Lines under each opening
create table lines (
  id uuid primary key default gen_random_uuid(),
  opening_id uuid not null references openings(id) on delete cascade,
  code text not null,                      -- e.g. "mainline-a", "deviation-2"
  title text not null,                     -- user-facing title
  line_type text not null check (line_type in ('mainline', 'deviation', 'trap')),
  start_fen text not null,                 -- often initial position FEN
  max_ply smallint not null,               -- planned depth in plies
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (opening_id, code)
);

-- Normalized positions
create table positions (
  id uuid primary key default gen_random_uuid(),
  fen text not null unique,
  side_to_move text not null check (side_to_move in ('w', 'b')),
  created_at timestamptz not null default now()
);

-- Ordered nodes in a line
create table line_nodes (
  id uuid primary key default gen_random_uuid(),
  line_id uuid not null references lines(id) on delete cascade,
  ply_index smallint not null,             -- 1-based ply index in line
  position_id uuid not null references positions(id) on delete restrict,
  expected_move_san text not null,         -- "Nf3"
  expected_move_uci text not null,         -- "g1f3"
  actor_side text not null check (actor_side in ('white', 'black')),
  is_user_decision boolean not null default true,
  explanation text,                        -- short "why this move"
  concept_tag text,                        -- e.g. "development", "center-control"
  unique (line_id, ply_index)
);

-- User progress at line level
create table user_line_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  line_id uuid not null references lines(id) on delete cascade,
  mastery_score numeric(5,2) not null default 0,   -- 0..100
  accuracy_pct numeric(5,2) not null default 0,    -- 0..100
  current_streak int not null default 0,
  easiness_factor numeric(3,2) not null default 2.5,
  interval_days int not null default 0,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, line_id)
);

-- Detailed attempts at node level
create table user_node_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  line_node_id uuid not null references line_nodes(id) on delete cascade,
  attempted_move_san text,
  attempted_move_uci text,
  is_correct boolean not null,
  response_ms int,
  mode text not null check (mode in ('learn', 'drill', 'review')),
  attempted_at timestamptz not null default now()
);

create index idx_lines_opening_id on lines(opening_id);
create index idx_line_nodes_line_id on line_nodes(line_id);
create index idx_progress_user_next_review on user_line_progress(user_id, next_review_at);
create index idx_attempts_user_time on user_node_attempts(user_id, attempted_at desc);
```

## 4. Suggested Seed Content Shape (JSON)

```json
{
  "opening": {
    "slug": "italian-game",
    "name": "Italian Game",
    "side_to_train": "white"
  },
  "lines": [
    {
      "code": "mainline-a",
      "title": "Classical Italian Mainline",
      "line_type": "mainline",
      "moves_uci": ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "f8c5"],
      "explanations": {
        "g1f3": "Develop and attack e5.",
        "f1c4": "Pressure f7 and support quick castling."
      }
    }
  ]
}
```

## 5. API Surface (MVP-Oriented)
- `GET /openings?side=white|black&vs=e4|d4`
- `GET /openings/:slug/lines`
- `GET /lines/:id/session?mode=learn|drill|review`
- `POST /attempts` (line_node_id, move, mode, response_ms)
- `GET /review-queue?limit=20`
- `GET /progress/openings`

## 6. Spaced Repetition Rules (Initial)
- Correct with good speed:
  - Increase `interval_days` (1, 2, 4, 7, ...)
  - Raise `easiness_factor` slightly
- Incorrect:
  - Reset `interval_days` to 1
  - Reduce `easiness_factor` (min floor, e.g. 1.3)
- Set `next_review_at = now + interval_days`

## 7. Versioning and Content Ops
- Include optional `content_version` on `lines` in v1.1 if frequent updates are expected.
- Keep opening seeds in repo and run idempotent import scripts.
- Add simple integrity checks:
  - No duplicate `(line_id, ply_index)`
  - Every `expected_move_uci` legal in `position_id.fen`

