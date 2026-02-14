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
```

Notes:
- Default mode is `browser`.
- `VITE_STOCKFISH_WORKER_URL` is optional; built-in CDN fallbacks are used if unset.
- `VITE_ENGINE_MODE=server` is reserved for future backend engine integration.

## Current Functionality

- Opening dashboard with common openings and variations
- Dedicated opening detail/practice screen
- Guided line learning with correctness checks
- “What you tried” move feedback
- Move log + move idea explanations
- Live Stockfish analysis and evaluation bar beside the board

## Troubleshooting

- If Stockfish fails to initialize, check browser console for `[engine]` logs.
- If `npm run dev` fails, ensure Node.js 18+ is installed.

## Project Structure

```text
src/
  App.jsx
  styles.css
  engine/
    browserStockfishEngine.js
    serverChessEngine.js
    index.js
```
