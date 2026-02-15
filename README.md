# ChessTeacher

ChessTeacher is a client-side chess opening trainer built with React + Vite.

It helps users practice opening lines as White or Black, validate moves, and view live Stockfish evaluation.

## Tech Stack

- React
- Vite
- `chess.js`
- `react-chessboard`
- Browser-based Stockfish worker (UCI)

## Getting Started

### 1. Clone and enter project

```bash
git clone https://github.com/darpan310/ChessTeacher.git
cd ChessTeacher
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run development server

```bash
npm run dev
```

Open the URL shown in terminal (usually `http://localhost:5173`).

## Build for Production

```bash
npm run build
npm run preview
```

## Environment Options (Optional)

You can configure engine mode via Vite env vars.

Create a `.env` file in project root:

```bash
VITE_ENGINE_MODE=browser
VITE_STOCKFISH_WORKER_URL=
VITE_ENGINE_ENDPOINT=
VITE_ENGINE_DEPTH=14
VITE_ENGINE_MOVETIME_MS=700
VITE_ENGINE_THREADS=
VITE_ENGINE_HASH_MB=64
VITE_OPENAI_API_KEY=
VITE_OPENAI_MODEL=gpt-5.1
VITE_OPENAI_BASE_URL=https://api.openai.com/v1
```

Notes:
- Default mode is `browser`.
- `VITE_STOCKFISH_WORKER_URL` is optional; built-in CDN fallbacks are used if unset.
- `VITE_ENGINE_MODE=server` is reserved for future backend engine integration.
- Increase `VITE_ENGINE_DEPTH` / `VITE_ENGINE_MOVETIME_MS` for stronger analysis.
- `VITE_ENGINE_THREADS` and `VITE_ENGINE_HASH_MB` tune engine strength vs CPU/memory usage.
- `VITE_OPENAI_API_KEY` and `VITE_OPENAI_MODEL` configure the Chess Teacher AI chat panel.
- `VITE_OPENAI_BASE_URL` is optional and defaults to `https://api.openai.com/v1`.
- Because this app is currently client-side only, Vite-exposed env vars are shipped to the browser. For production, move OpenAI calls to a backend proxy.

## Current Functionality

- Opening dashboard with common openings and variations
- Opening detail page for line selection
- Dedicated gameplay page focused on board + training tools
- Guided line learning with correctness checks
- Deviation mode: user can intentionally leave line and continue both sides with Stockfish guidance
- Move log shown in numbered White/Black pairs
- Move idea explanations
- Last-move board highlights
- Slight delay on computer reply move for better visual learning
- Live Stockfish analysis and evaluation bar beside the board
- Lazy-loaded opening library for scale (per-opening chunks)

## Troubleshooting

- If Stockfish fails to initialize, check browser console for `[engine]` logs.
- If `npm run dev` fails, ensure Node.js 18+ is installed.

## Project Structure

```text
src/
  App.jsx
  styles.css
  components/
    Dashboard.jsx
    OpeningDetail.jsx
    PracticeSession.jsx
  hooks/
    useEngineAnalysis.js
  lib/
    openingTraining.js
  data/
    openingCatalog.js
    openingLibrary.js
    openings.js
    openings-db/
  engine/
    browserStockfishEngine.js
    serverChessEngine.js
    index.js
```
