import { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { createChessEngine } from "./engine";

const OPENING_SECTIONS = [
  {
    id: "white",
    title: "Play as White",
    subtitle: "Choose your first-move repertoire",
    openings: [
      {
        id: "italian-game",
        name: "Italian Game",
        mainline: {
          id: "italian-mainline",
          name: "Mainline A",
          moves: "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d3 d6 6.O-O O-O 7.Re1 a6 8.Bb3 Ba7 9.Nbd2 h6 10.Nf1 Re8",
          pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O O-O 7. Re1 a6 8. Bb3 Ba7 9. Nbd2 h6 10. Nf1 Re8",
          summary: "Fast development with pressure on f7.",
        },
        variations: [
          {
            id: "italian-two-knights",
            name: "Two Knights Defense",
            moves: "1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.d3 Bc5 5.c3 d6 6.O-O O-O 7.Bb3 a6 8.Re1 Ba7 9.Nbd2 h6 10.Nf1",
            pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. d3 Bc5 5. c3 d6 6. O-O O-O 7. Bb3 a6 8. Re1 Ba7 9. Nbd2 h6 10. Nf1",
            summary: "Handle early ...Nf6 and keep initiative.",
          },
          {
            id: "italian-giuoco",
            name: "Giuoco Piano",
            moves: "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d4 exd4 6.cxd4 Bb4+ 7.Nc3 Bxc3+ 8.bxc3 d5 9.exd5 Nxd5 10.O-O O-O",
            pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Nc3 Bxc3+ 8. bxc3 d5 9. exd5 Nxd5 10. O-O O-O",
            summary: "Solid setup with gradual central expansion.",
          },
          {
            id: "italian-early-nf6",
            name: "Early ...Nf6 Deviation",
            moves: "1.e4 e5 2.Nf3 Nf6 3.Nxe5 d6 4.Nf3 Nxe4 5.d4 d5 6.Bd3 Be7 7.O-O O-O 8.c4 c6 9.Nc3 Nxc3 10.bxc3",
            pgn: "1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nf3 Nxe4 5. d4 d5 6. Bd3 Be7 7. O-O O-O 8. c4 c6 9. Nc3 Nxc3 10. bxc3",
            summary: "Simple practical response in fast games.",
          },
        ],
        hint: "Develop quickly and create pressure on f7 before central expansion.",
      },
      {
        id: "london-system",
        name: "London System",
        mainline: {
          id: "london-mainline",
          name: "Mainline A",
          moves: "1.d4 d5 2.Nf3 Nf6 3.Bf4 e6 4.e3 c5 5.c3 Nc6 6.Nbd2 Bd6 7.Bg3 O-O 8.Bd3 Re8 9.Ne5 Qc7 10.f4",
          pgn: "1. d4 d5 2. Nf3 Nf6 3. Bf4 e6 4. e3 c5 5. c3 Nc6 6. Nbd2 Bd6 7. Bg3 O-O 8. Bd3 Re8 9. Ne5 Qc7 10. f4",
          summary: "Flexible setup with clear development plan.",
        },
        variations: [
          {
            id: "london-c5",
            name: "...c5 Challenge",
            moves: "1.d4 d5 2.Bf4 c5 3.e3 Nc6 4.c3 Nf6 5.Nd2 e6 6.Bd3 Bd6 7.Bg3 O-O 8.Ngf3 b6 9.Ne5 Bb7 10.f4",
            pgn: "1. d4 d5 2. Bf4 c5 3. e3 Nc6 4. c3 Nf6 5. Nd2 e6 6. Bd3 Bd6 7. Bg3 O-O 8. Ngf3 b6 9. Ne5 Bb7 10. f4",
            summary: "Keep center stable and avoid early overextension.",
          },
          {
            id: "london-qb6",
            name: "...Qb6 Pressure",
            moves: "1.d4 d5 2.Bf4 Nf6 3.e3 c5 4.c3 Nc6 5.Nd2 cxd4 6.exd4 Qb6 7.Nb3 Bf5 8.Nf3 e6 9.Bd3 Bxd3 10.Qxd3",
            pgn: "1. d4 d5 2. Bf4 Nf6 3. e3 c5 4. c3 Nc6 5. Nd2 cxd4 6. exd4 Qb6 7. Nb3 Bf5 8. Nf3 e6 9. Bd3 Bxd3 10. Qxd3",
            summary: "Defend b2 cleanly while continuing development.",
          },
        ],
        hint: "Keep your structure clean and aim for easy development.",
      },
      {
        id: "queens-gambit",
        name: "Queen's Gambit",
        mainline: {
          id: "qg-mainline",
          name: "Mainline A",
          moves: "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 h6 7.Bh4 b6 8.cxd5 Nxd5 9.Bxe7 Qxe7 10.Nxd5 exd5",
          pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 h6 7. Bh4 b6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5",
          summary: "Play with space and central tension.",
        },
        variations: [
          {
            id: "qg-qga",
            name: "QGA",
            moves: "1.d4 d5 2.c4 dxc4 3.Nf3 Nf6 4.e3 e6 5.Bxc4 c5 6.O-O a6 7.Qe2 b5 8.Bb3 Bb7 9.Rd1 Nbd7 10.Nc3",
            pgn: "1. d4 d5 2. c4 dxc4 3. Nf3 Nf6 4. e3 e6 5. Bxc4 c5 6. O-O a6 7. Qe2 b5 8. Bb3 Bb7 9. Rd1 Nbd7 10. Nc3",
            summary: "Recover pawn with active development, not pawn rushing.",
          },
          {
            id: "qg-slav",
            name: "Slav Defense",
            moves: "1.d4 d5 2.c4 c6 3.Nf3 Nf6 4.Nc3 dxc4 5.a4 Bf5 6.e3 e6 7.Bxc4 Bb4 8.O-O Nbd7 9.Qe2 Bg6 10.e4",
            pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. a4 Bf5 6. e3 e6 7. Bxc4 Bb4 8. O-O Nbd7 9. Qe2 Bg6 10. e4",
            summary: "Use cxd5 moments and piece activity carefully.",
          },
        ],
        hint: "Use pawn tension to gain central space and active piece play.",
      },
    ],
  },
  {
    id: "black-e4",
    title: "Play as Black vs 1.e4",
    subtitle: "Build practical responses to king pawn openings",
    openings: [
      {
        id: "sicilian-defense",
        name: "Sicilian Defense",
        mainline: {
          id: "sicilian-mainline",
          name: "Mainline A",
          moves: "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Bg5 e6 7.f4 Be7 8.Qf3 Qc7 9.O-O-O Nbd7 10.g4 b5",
          pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Be7 8. Qf3 Qc7 9. O-O-O Nbd7 10. g4 b5",
          summary: "Challenge center and develop naturally.",
        },
        variations: [
          {
            id: "sicilian-alapin",
            name: "Alapin (2.c3)",
            moves: "1.e4 c5 2.c3 Nf6 3.e5 Nd5 4.d4 cxd4 5.Nf3 Nc6 6.cxd4 d6 7.Bc4 Nb6 8.Bb3 dxe5 9.Nxe5 Nxe5 10.dxe5",
            pgn: "1. e4 c5 2. c3 Nf6 3. e5 Nd5 4. d4 cxd4 5. Nf3 Nc6 6. cxd4 d6 7. Bc4 Nb6 8. Bb3 dxe5 9. Nxe5 Nxe5 10. dxe5",
            summary: "Hit center immediately and simplify plans.",
          },
          {
            id: "sicilian-smith-morra",
            name: "Smith-Morra",
            moves: "1.e4 c5 2.d4 cxd4 3.c3 dxc3 4.Nxc3 Nc6 5.Nf3 d6 6.Bc4 e6 7.O-O Nf6 8.Qe2 Be7 9.Rd1 e5 10.h3",
            pgn: "1. e4 c5 2. d4 cxd4 3. c3 dxc3 4. Nxc3 Nc6 5. Nf3 d6 6. Bc4 e6 7. O-O Nf6 8. Qe2 Be7 9. Rd1 e5 10. h3",
            summary: "Decline complications with practical setup.",
          },
          {
            id: "sicilian-closed",
            name: "Closed Sicilian",
            moves: "1.e4 c5 2.Nc3 Nc6 3.g3 g6 4.Bg2 Bg7 5.d3 d6 6.f4 e6 7.Nf3 Nge7 8.O-O O-O 9.Be3 Nd4 10.Qd2",
            pgn: "1. e4 c5 2. Nc3 Nc6 3. g3 g6 4. Bg2 Bg7 5. d3 d6 6. f4 e6 7. Nf3 Nge7 8. O-O O-O 9. Be3 Nd4 10. Qd2",
            summary: "Build queenside play and control d4 break.",
          },
        ],
        hint: "Counter in the center and queenside; don't rush pawn grabs.",
      },
      {
        id: "caro-kann",
        name: "Caro-Kann Defense",
        mainline: {
          id: "caro-mainline",
          name: "Mainline A",
          moves: "1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Bf5 5.Ng3 Bg6 6.h4 h6 7.Nf3 Nd7 8.h5 Bh7 9.Bd3 Bxd3 10.Qxd3",
          pgn: "1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5 5. Ng3 Bg6 6. h4 h6 7. Nf3 Nd7 8. h5 Bh7 9. Bd3 Bxd3 10. Qxd3",
          summary: "Solid center and clear development priorities.",
        },
        variations: [
          {
            id: "caro-advance",
            name: "Advance Variation",
            moves: "1.e4 c6 2.d4 d5 3.e5 Bf5 4.Nf3 e6 5.Be2 c5 6.Be3 Nc6 7.O-O Qb6 8.Nc3 cxd4 9.Nxd4 Nxd4 10.Bxd4",
            pgn: "1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2 c5 6. Be3 Nc6 7. O-O Qb6 8. Nc3 cxd4 9. Nxd4 Nxd4 10. Bxd4",
            summary: "Break with ...c5 and pressure d4 chain.",
          },
          {
            id: "caro-exchange",
            name: "Exchange Variation",
            moves: "1.e4 c6 2.d4 d5 3.exd5 cxd5 4.Bd3 Nc6 5.c3 Nf6 6.Bf4 Bg4 7.Qb3 Qd7 8.Nd2 e6 9.Ngf3 Bd6 10.Bxd6",
            pgn: "1. e4 c6 2. d4 d5 3. exd5 cxd5 4. Bd3 Nc6 5. c3 Nf6 6. Bf4 Bg4 7. Qb3 Qd7 8. Nd2 e6 9. Ngf3 Bd6 10. Bxd6",
            summary: "Develop harmoniously and use minority pressure plans.",
          },
        ],
        hint: "Solid structure first, then activate your bishop carefully.",
      },
    ],
  },
  {
    id: "black-d4",
    title: "Play as Black vs 1.d4",
    subtitle: "Choose your structure-based defense",
    openings: [
      {
        id: "qgd",
        name: "Queen's Gambit Declined",
        mainline: {
          id: "qgd-mainline",
          name: "Mainline A",
          moves: "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 h6 7.Bh4 b6 8.cxd5 Nxd5 9.Bxe7 Qxe7 10.Nxd5",
          pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 h6 7. Bh4 b6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5",
          summary: "Compact setup with timely ...c5 break.",
        },
        variations: [
          {
            id: "qgd-exchange",
            name: "Exchange QGD",
            moves: "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.cxd5 exd5 5.Bg5 c6 6.e3 Bf5 7.Qf3 Bg6 8.Bxf6 Qxf6 9.Qxf6 gxf6 10.Nge2",
            pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. cxd5 exd5 5. Bg5 c6 6. e3 Bf5 7. Qf3 Bg6 8. Bxf6 Qxf6 9. Qxf6 gxf6 10. Nge2",
            summary: "Understand isolated pawn vs hanging pawn plans.",
          },
          {
            id: "qgd-orthodox",
            name: "Orthodox",
            moves: "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 Nbd7 7.Rc1 c6 8.Bd3 dxc4 9.Bxc4 Nd5 10.Bxe7",
            pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 Nbd7 7. Rc1 c6 8. Bd3 dxc4 9. Bxc4 Nd5 10. Bxe7",
            summary: "Neutralize pin pressure and complete development.",
          },
        ],
        hint: "Stay compact and challenge the center with timely ...c5.",
      },
      {
        id: "kings-indian",
        name: "King's Indian Defense",
        mainline: {
          id: "kid-mainline",
          name: "Mainline A",
          moves: "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7 9.Ne1 Nd7 10.Nd3",
          pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Ne1 Nd7 10. Nd3",
          summary: "Flexible setup before central counterplay.",
        },
        variations: [
          {
            id: "kid-classical",
            name: "Classical",
            moves: "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7 9.Ne1 Nd7 10.Be3",
            pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Ne1 Nd7 10. Be3",
            summary: "Prepare ...e5 break and kingside initiative.",
          },
          {
            id: "kid-fianchetto",
            name: "Fianchetto",
            moves: "1.d4 Nf6 2.c4 g6 3.Nf3 Bg7 4.g3 O-O 5.Bg2 d6 6.O-O Nc6 7.Nc3 e5 8.d5 Ne7 9.e4 Nd7 10.Ne1",
            pgn: "1. d4 Nf6 2. c4 g6 3. Nf3 Bg7 4. g3 O-O 5. Bg2 d6 6. O-O Nc6 7. Nc3 e5 8. d5 Ne7 9. e4 Nd7 10. Ne1",
            summary: "Choose structure and avoid overcommitting too early.",
          },
        ],
        hint: "Allow center space, then counterattack with ...e5 or ...c5.",
      },
    ],
  },
];

const ALL_OPENINGS = OPENING_SECTIONS.flatMap((section) =>
  section.openings.map((opening) => ({ ...opening, sectionId: section.id }))
);
const DEFAULT_TARGET_PLY = 36;
const EXPANDED_LINE_CACHE = new Map();

function loadGameFromPgn(pgn) {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch {
    return new Chess();
  }
  return chess;
}

function openingLines(opening) {
  return [opening.mainline, ...opening.variations];
}

function hashString(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

function chooseContinuationMove(chess, seed) {
  const moves = chess.moves({ verbose: true });
  if (!moves.length) return null;

  const minorStartSquares = new Set(["b1", "g1", "b8", "g8", "c1", "f1", "c8", "f8"]);
  const centerTargets = new Set(["d4", "e4", "d5", "e5"]);
  const nearCenter = new Set(["c4", "f4", "c5", "f5"]);
  const ply = chess.history().length + 1;

  let best = moves[0];
  let bestScore = -Infinity;
  for (const move of moves) {
    let score = 0;
    const san = move.san || "";
    const piece = move.piece;

    if (san === "O-O" || san === "O-O-O") score += 200;
    if ((piece === "n" || piece === "b") && minorStartSquares.has(move.from)) score += 80;
    if (piece === "p" && centerTargets.has(move.to)) score += 55;
    if (move.captured) score += 28;
    if (nearCenter.has(move.to)) score += 12;
    if (ply < 16 && piece === "q") score -= 35;
    if (piece === "k" && san !== "O-O" && san !== "O-O-O") score -= 20;

    const tie = 1 / (1 + hashString(`${seed}|${move.from}|${move.to}|${san}`));
    const total = score + tie;
    if (total > bestScore) {
      bestScore = total;
      best = move;
    }
  }
  return best;
}

function getExpandedLinePgn(line) {
  const cacheKey = `${line.id}|${line.pgn}|${line.targetPly ?? DEFAULT_TARGET_PLY}`;
  if (EXPANDED_LINE_CACHE.has(cacheKey)) return EXPANDED_LINE_CACHE.get(cacheKey);

  const chess = loadGameFromPgn(line.pgn);
  const targetPly = line.targetPly ?? DEFAULT_TARGET_PLY;
  while (!chess.isGameOver() && chess.history().length < targetPly) {
    const nextMove = chooseContinuationMove(chess, line.id ?? line.name ?? "line");
    if (!nextMove) break;
    chess.move(nextMove);
  }

  const expandedPgn = chess.pgn();
  EXPANDED_LINE_CACHE.set(cacheKey, expandedPgn);
  return expandedPgn;
}

function buildLinePlan(linePgn) {
  const parser = new Chess();
  try {
    parser.loadPgn(linePgn);
  } catch {
    return [];
  }

  const sans = parser.history();
  const replay = new Chess();
  const steps = [];

  sans.forEach((san, index) => {
    const fenBefore = replay.fen();
    const moved = replay.move(san);
    if (!moved) return;
    steps.push({
      ply: index + 1,
      fenBefore,
      san: moved.san,
    });
  });

  return steps;
}

function getSuggestedMove(linePlan, fen) {
  return linePlan.find((step) => step.fenBefore === fen) ?? null;
}

function getSanSequenceFromPgn(pgn) {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch {
    return [];
  }
  return chess.history();
}

function getSanSequenceForLine(line) {
  return getSanSequenceFromPgn(getExpandedLinePgn(line));
}

function explainMoveIdea(san, sideToMove) {
  if (!san) return "Follow line principles: activity, king safety, and center control.";

  if (san === "O-O") return "King safety first: castle kingside and connect rooks.";
  if (san === "O-O-O") return "Castle long to activate rook quickly and shift play to the kingside.";
  if (san.includes("#")) return "This move delivers checkmate.";
  if (san.includes("+")) return "Forces a check and gains initiative.";
  if (san.includes("=")) return "Promotion converts pawn advantage into major-piece power.";
  if (san.includes("x")) return "Capture to remove a key defender or win material.";

  if (/^[de]4$/.test(san) || /^[de]5$/.test(san)) {
    return "Claims central space and opens lines for rapid development.";
  }
  if (/^[cf]4$/.test(san) || /^[cf]5$/.test(san)) {
    return "Challenges the center from the flank and prepares dynamic pawn structure.";
  }

  if (san.startsWith("N")) return "Develops a knight toward active central squares.";
  if (san.startsWith("B")) return "Develops bishop to improve piece activity and pressure diagonals.";
  if (san.startsWith("R")) return "Improves rook coordination and supports central or open files.";
  if (san.startsWith("Q")) return "Activates queen with caution to avoid early tempo loss.";
  if (san.startsWith("K")) return "King repositioning for safety or tactical defense.";
  if (/^[a-h][3-6]$/.test(san)) {
    return sideToMove === "w"
      ? "A useful pawn move to support development and control key squares."
      : "A useful pawn move to challenge White's setup and gain space.";
  }

  return "Supports piece activity and keeps the position aligned with line plans.";
}

function gameFromFen(fen) {
  return new Chess(fen);
}

function uciToSan(fen, uci) {
  if (!uci || uci === "(none)" || uci.length < 4) return null;

  const chess = gameFromFen(fen);
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci.length > 4 ? uci[4] : undefined;

  let move = null;
  try {
    move = chess.move({
      from,
      to,
      ...(promotion ? { promotion } : {}),
    });
  } catch {
    move = null;
  }
  return move?.san ?? null;
}

function formatEngineScore(scoreCp, scoreMate) {
  if (Number.isFinite(scoreMate)) {
    const sign = scoreMate > 0 ? "+" : "";
    return `Mate ${sign}${scoreMate}`;
  }
  if (Number.isFinite(scoreCp)) {
    const pawns = (scoreCp / 100).toFixed(2);
    const sign = scoreCp > 0 ? "+" : "";
    return `${sign}${pawns}`;
  }
  return "n/a";
}

function analysisToWhiteEval(fen, analysis) {
  if (!analysis) {
    return {
      whiteScoreCp: null,
      whiteScoreMate: null,
      whiteEvalPawns: 0,
      label: "0.00",
    };
  }

  const turn = gameFromFen(fen).turn();
  const sign = turn === "w" ? 1 : -1;
  const hasMate = Number.isFinite(analysis.scoreMate);
  const hasCp = Number.isFinite(analysis.scoreCp);
  const whiteScoreMate = hasMate ? sign * analysis.scoreMate : null;
  const whiteScoreCp = hasCp ? sign * analysis.scoreCp : null;

  if (Number.isFinite(whiteScoreMate)) {
    return {
      whiteScoreCp: null,
      whiteScoreMate,
      whiteEvalPawns: whiteScoreMate > 0 ? 12 : -12,
      label: `M${whiteScoreMate > 0 ? "+" : ""}${whiteScoreMate}`,
    };
  }

  const whiteEvalPawns = Number.isFinite(whiteScoreCp) ? whiteScoreCp / 100 : 0;
  const label = Number.isFinite(whiteScoreCp)
    ? `${whiteScoreCp > 0 ? "+" : ""}${(whiteScoreCp / 100).toFixed(2)}`
    : "0.00";

  return {
    whiteScoreCp,
    whiteScoreMate: null,
    whiteEvalPawns,
    label,
  };
}

function evalToWhiteRatio(whiteEvalPawns) {
  const clamped = Math.max(-12, Math.min(12, whiteEvalPawns));
  const logistic = 1 / (1 + Math.exp(-clamped / 1.8));
  return Math.max(0.03, Math.min(0.97, logistic));
}

function initBoardStateFromLine() {
  const chess = new Chess();
  return {
    fen: chess.fen(),
    history: [],
  };
}

function initSessionFromLine(line) {
  const plan = buildLinePlan(getExpandedLinePgn(line));
  return {
    active: false,
    stepIndex: 0,
    plan,
  };
}

function getUserSideForOpening(opening) {
  return opening.sectionId === "white" ? "w" : "b";
}

function advanceComputerMoves(fen, history, session, userSide) {
  const chess = gameFromFen(fen);
  let nextStepIndex = session.stepIndex;
  const autoMoves = [];

  while (nextStepIndex < session.plan.length) {
    const step = session.plan[nextStepIndex];
    if (!step) break;

    const sideToMove = chess.turn();
    if (sideToMove === userSide) break;

    let autoMove = null;
    try {
      autoMove = chess.move(step.san);
    } catch {
      autoMove = null;
    }
    if (!autoMove) break;
    autoMoves.push(autoMove.san);
    nextStepIndex += 1;
  }

  const completed = nextStepIndex >= session.plan.length;
  return {
    fen: chess.fen(),
    history: chess.history(),
    stepIndex: nextStepIndex,
    completed,
    autoMoves,
  };
}

function Dashboard({ selectedOpeningId, onOpenOpening }) {
  return (
    <section className="dashboard-grid single-column">
      <div className="catalog-panel">
        {OPENING_SECTIONS.map((section) => (
          <article key={section.id} className="section-block">
            <div className="section-head">
              <h2>{section.title}</h2>
              <p>{section.subtitle}</p>
            </div>

            <div className="cards-grid">
              {section.openings.map((opening) => {
                const isActive = opening.id === selectedOpeningId;
                return (
                  <div key={opening.id} className={`opening-card ${isActive ? "active" : ""}`}>
                    <div className="opening-title-row">
                      <h3>{opening.name}</h3>
                      {isActive ? <span className="selected-pill">Selected</span> : null}
                    </div>

                    <p className="mainline-text">
                      <strong>Mainline:</strong> {opening.mainline.moves}
                    </p>

                    <p className="variations-title">Variations</p>
                    <ul>
                      {opening.variations.map((variation) => (
                        <li key={variation.id}>{variation.name}</li>
                      ))}
                    </ul>

                    <button onClick={() => onOpenOpening(opening.id)}>Open</button>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function OpeningDetail({
  opening,
  selectedLineId,
  onSelectLine,
  onBack,
  status,
  onResetToLine,
  onFlipBoard,
  onDrop,
  boardFen,
  orientation,
  onStartLearn,
  suggestedMove,
  attempts,
  moveLog,
  sessionActive,
  pendingCorrection,
  onUndoIncorrectMove,
  suggestedMoveIdea,
  recentMoveIdeas,
  linePlyCount,
  engineStatus,
  engineAnalysis,
  whiteEvalLabel,
  whiteEvalRatio,
}) {
  const lines = openingLines(opening);
  const selectedLine = lines.find((line) => line.id === selectedLineId) ?? lines[0];

  return (
    <section className="opening-detail-layout">
      <main className="opening-detail-main">
        <button className="back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <article className="opening-header-card">
          <h2>{opening.name} · Opening Detail</h2>
          <p>{opening.hint}</p>
        </article>

        <article className="line-group-card">
          <h3>Mainline</h3>
          <div className={`line-card ${opening.mainline.id === selectedLineId ? "active" : ""}`}>
            <div>
              <strong>{opening.mainline.name}</strong>
              <p>{opening.mainline.moves}</p>
              <small>{opening.mainline.summary}</small>
            </div>
            <button onClick={() => onSelectLine(opening.mainline.id)}>Select</button>
          </div>
        </article>

        <article className="line-group-card">
          <h3>Variations</h3>
          <div className="variation-grid">
            {opening.variations.map((variation) => (
              <div key={variation.id} className={`line-card ${variation.id === selectedLineId ? "active" : ""}`}>
                <div>
                  <strong>{variation.name}</strong>
                  <p>{variation.moves}</p>
                  <small>{variation.summary}</small>
                </div>
                <button onClick={() => onSelectLine(variation.id)}>Select</button>
              </div>
            ))}
          </div>
        </article>
      </main>

      <aside className="practice-panel">
        <div className="practice-head">
          <h2>{selectedLine.name}</h2>
          <p>{selectedLine.moves}</p>
          <p>Line depth: {linePlyCount} plies</p>
        </div>

        <div className="mode-toggle">
          <button className="active" onClick={onStartLearn}>
            {sessionActive ? "Learning..." : "Start Learn"}
          </button>
        </div>

        <div className="practice-controls">
          <button onClick={onResetToLine}>Reset to Selected Line</button>
          <button onClick={onFlipBoard}>Flip Board</button>
        </div>

        <div className="board-row">
          <div className="eval-bar" aria-label={`Evaluation bar ${whiteEvalLabel}`}>
            <div className="eval-black" style={{ height: `${(1 - whiteEvalRatio) * 100}%` }} />
            <div className="eval-white" style={{ height: `${whiteEvalRatio * 100}%` }} />
            <div className="eval-label">{whiteEvalLabel}</div>
          </div>

          <div className="board-wrap">
            <Chessboard
              options={{
                id: "opening-detail-board",
                position: boardFen,
                onPieceDrop: onDrop,
                boardOrientation: orientation,
                customDarkSquareStyle: { backgroundColor: "#b58863" },
                customLightSquareStyle: { backgroundColor: "#f0d9b5" },
                customBoardStyle: {
                  borderRadius: "10px",
                  boxShadow: "0 12px 28px rgba(0, 0, 0, 0.2)",
                },
                showBoardNotation: true,
                animationDurationInMs: 150,
              }}
            />
          </div>
        </div>

        <p className="status-bar">{status}</p>

        {pendingCorrection ? (
          <div className="coach-card">
            <h3>Incorrect Move Detected</h3>
            <p>
              Expected <strong>{pendingCorrection.expectedSan}</strong>, but you played{" "}
              <strong>{pendingCorrection.playedSan}</strong>.
            </p>
            <button className="undo-btn" onClick={onUndoIncorrectMove}>
              Undo and try correct move
            </button>
          </div>
        ) : null}

        <div className="coach-card">
          <h3>Suggested Next Move</h3>
          {!sessionActive ? (
            <p>Click Start Learn to begin this line.</p>
          ) : suggestedMove ? (
            <>
              <p>
                Play <strong>{suggestedMove.san}</strong> (ply {suggestedMove.ply})
              </p>
              <p>{suggestedMoveIdea}</p>
            </>
          ) : (
            <p>Line complete or position out of sequence. Reset to continue.</p>
          )}
        </div>

        <div className="coach-card">
          <h3>What You Tried</h3>
          {attempts.length === 0 ? (
            <p>No attempts yet on this line.</p>
          ) : (
            <ul className="attempt-list">
              {attempts.map((attempt, index) => (
                <li key={`${attempt.label}-${index}`} className={attempt.inLine ? "in-line" : "off-line"}>
                  {attempt.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="coach-card">
          <h3>Stockfish Analysis</h3>
          <p>{engineStatus}</p>
          {engineAnalysis ? (
            <p>
              Best move: <strong>{engineAnalysis.bestmoveSan ?? engineAnalysis.bestmoveUci}</strong> | Eval:{" "}
              <strong>{whiteEvalLabel}</strong>
            </p>
          ) : null}
        </div>

        <div className="coach-card">
          <h3>Recorded Moves</h3>
          {moveLog.length === 0 ? (
            <p>No moves recorded yet.</p>
          ) : (
            <p>{moveLog.join(" ")}</p>
          )}
        </div>

        <div className="coach-card">
          <h3>Move Ideas</h3>
          {recentMoveIdeas.length === 0 ? (
            <p>Move explanations will appear as the line progresses.</p>
          ) : (
            <ul className="attempt-list">
              {recentMoveIdeas.map((item) => (
                <li key={`${item.ply}-${item.san}`}>
                  <strong>{item.ply}. {item.san}</strong>: {item.idea}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </section>
  );
}

export default function App() {
  const [view, setView] = useState("dashboard");
  const [selectedOpeningId, setSelectedOpeningId] = useState(ALL_OPENINGS[0].id);
  const [selectedLineId, setSelectedLineId] = useState(ALL_OPENINGS[0].mainline.id);
  const [orientation, setOrientation] = useState("white");
  const [status, setStatus] = useState("Choose an opening card, then select a line.");

  const initialBoard = initBoardStateFromLine();
  const initialSession = initSessionFromLine(ALL_OPENINGS[0].mainline);
  const [boardFen, setBoardFen] = useState(initialBoard.fen);
  const [moveLog, setMoveLog] = useState(initialBoard.history);
  const [attempts, setAttempts] = useState([]);
  const [session, setSession] = useState(initialSession);
  const [pendingCorrection, setPendingCorrection] = useState(null);
  const engineRef = useRef(null);
  const [engineStatus, setEngineStatus] = useState("Initializing Stockfish...");
  const [engineAnalysis, setEngineAnalysis] = useState(null);
  const [engineReady, setEngineReady] = useState(false);
  const analysisRequestIdRef = useRef(0);

  const selectedOpening = useMemo(
    () => ALL_OPENINGS.find((opening) => opening.id === selectedOpeningId) ?? ALL_OPENINGS[0],
    [selectedOpeningId]
  );

  const selectedLine = useMemo(() => {
    const lines = openingLines(selectedOpening);
    return lines.find((line) => line.id === selectedLineId) ?? lines[0];
  }, [selectedOpening, selectedLineId]);

  const userSide = useMemo(() => getUserSideForOpening(selectedOpening), [selectedOpening]);
  const linePlyCount = session.plan.length;
  const suggestedMove = useMemo(() => {
    if (pendingCorrection) {
      return { san: pendingCorrection.expectedSan, ply: pendingCorrection.expectedPly };
    }
    if (!session.active) return null;
    const expected = session.plan[session.stepIndex] ?? null;
    if (!expected) return null;
    if (expected.fenBefore !== boardFen) return null;
    const turn = gameFromFen(boardFen).turn();
    return turn === userSide ? expected : null;
  }, [session, boardFen, userSide, pendingCorrection]);
  const suggestedMoveIdea = useMemo(() => {
    if (!suggestedMove) return "";
    const turn = gameFromFen(boardFen).turn();
    return explainMoveIdea(suggestedMove.san, turn);
  }, [suggestedMove, boardFen]);
  const recentMoveIdeas = useMemo(() => {
    const chess = new Chess();
    const annotated = [];

    for (let i = 0; i < moveLog.length; i += 1) {
      const san = moveLog[i];
      const side = chess.turn();
      let moved = null;
      try {
        moved = chess.move(san);
      } catch {
        moved = null;
      }
      if (!moved) continue;
      annotated.push({ ply: i + 1, san: moved.san, idea: explainMoveIdea(moved.san, side) });
    }

    return annotated.slice(-6).reverse();
  }, [moveLog]);

  useEffect(() => {
    let disposed = false;
    const engine = createChessEngine();
    engineRef.current = engine;
    console.debug("[engine] created", {
      adapter: engine?.constructor?.name,
      hasAnalyze: typeof engine?.analyzePosition === "function",
      hasInit: typeof engine?.init === "function",
    });

    (async () => {
      try {
        console.debug("[engine] init start");
        await engine.init();
        if (disposed) return;
        console.debug("[engine] init success");
        setEngineReady(true);
        setEngineStatus("Stockfish ready (client-side worker).");
      } catch (error) {
        if (disposed) return;
        const message = error instanceof Error ? error.message : "Unknown engine initialization error";
        console.error("[engine] init failed", {
          message,
          error,
          adapter: engine?.constructor?.name,
        });
        setEngineReady(false);
        setEngineStatus(`Stockfish unavailable: ${message}`);
      }
    })();

    return () => {
      disposed = true;
      console.debug("[engine] dispose start");
      if (engineRef.current === engine) engineRef.current = null;
      setEngineReady(false);
      engine
        .dispose()
        .then(() => console.debug("[engine] dispose success"))
        .catch((error) => console.error("[engine] dispose failed", error));
    };
  }, []);

  const analyzeCurrentPosition = async ({ silentSuperseded = false } = {}) => {
    const engine = engineRef.current;
    const requestId = analysisRequestIdRef.current + 1;
    analysisRequestIdRef.current = requestId;
    console.debug("[engine] analyze requested", {
      hasEngine: Boolean(engine),
      adapter: engine?.constructor?.name,
      fen: boardFen,
      status: engineStatus,
    });

    if (!engine) {
      setEngineStatus("Stockfish engine is not available.");
      console.error("[engine] analyze aborted: engineRef.current is null");
      return;
    }

    setEngineStatus("Stockfish analyzing current position...");
    try {
      console.debug("[engine] analyze start");
      const analysis = await engine.analyzePosition({
        fen: boardFen,
        depth: 12,
        moveTimeMs: 300,
      });
      if (requestId !== analysisRequestIdRef.current) return;
      console.debug("[engine] analyze success", analysis);
      const bestmoveSan = uciToSan(boardFen, analysis.bestmoveUci);
      setEngineAnalysis({
        ...analysis,
        bestmoveSan,
      });
      setEngineStatus(
        `Stockfish done: ${bestmoveSan ?? analysis.bestmoveUci} (eval ${formatEngineScore(
          analysis.scoreCp,
          analysis.scoreMate
        )}).`
      );
    } catch (error) {
      if (requestId !== analysisRequestIdRef.current) return;
      const message = error instanceof Error ? error.message : "Unknown analysis error";
      if (silentSuperseded && message.includes("Superseded by newer analysis request")) {
        return;
      }
      console.error("[engine] analyze failed", {
        message,
        error,
        adapter: engine?.constructor?.name,
      });
      setEngineStatus(`Stockfish analysis failed: ${message}`);
    } finally {
      console.debug("[engine] analyze finished");
    }
  };

  useEffect(() => {
    if (!engineReady) return undefined;
    const timeoutId = setTimeout(() => {
      analyzeCurrentPosition({ silentSuperseded: true });
    }, 120);
    return () => clearTimeout(timeoutId);
  }, [boardFen, engineReady]);

  const whiteEval = useMemo(() => analysisToWhiteEval(boardFen, engineAnalysis), [boardFen, engineAnalysis]);
  const whiteEvalRatio = useMemo(() => evalToWhiteRatio(whiteEval.whiteEvalPawns), [whiteEval.whiteEvalPawns]);
  const openOpeningDetail = (openingId) => {
    const opening = ALL_OPENINGS.find((item) => item.id === openingId);
    if (!opening) return;

    const board = initBoardStateFromLine();
    setSelectedOpeningId(opening.id);
    setSelectedLineId(opening.mainline.id);
    setBoardFen(board.fen);
    setMoveLog(board.history);
    setAttempts([]);
    setSession(initSessionFromLine(opening.mainline));
    setPendingCorrection(null);
    setStatus(`Opened ${opening.name}. Mainline selected.`);
    setView("opening");
  };

  const onSelectLine = (lineId) => {
    const line = openingLines(selectedOpening).find((item) => item.id === lineId);
    if (!line) return;

    const sanMoves = getSanSequenceForLine(line);
    console.log(`[debug] Selected line: ${line.name}`);
    console.log("[debug] SAN moves:", sanMoves);

    const board = initBoardStateFromLine();
    setSelectedLineId(line.id);
    setBoardFen(board.fen);
    setMoveLog(board.history);
    setAttempts([]);
    setSession(initSessionFromLine(line));
    setPendingCorrection(null);
    setStatus(`Selected ${line.name}. Moves: ${sanMoves.join(" ")}.`);
  };

  const resetToSelectedLine = () => {
    console.log("[debug] reset selected line", {
      line: selectedLine.name,
      sessionActive: session.active,
      moveCount: moveLog.length,
    });

    const baseBoard = initBoardStateFromLine();
    const baseSession = initSessionFromLine(selectedLine);

    // If learning is active, restart the running learn session from move 1
    // and auto-play computer-side line moves as needed.
    if (session.active) {
      const advanced = advanceComputerMoves(
        baseBoard.fen,
        baseBoard.history,
        { ...baseSession, active: true },
        userSide
      );
      setMoveLog(advanced.history);
      setBoardFen(advanced.fen);
      setSession({
        ...baseSession,
        active: !advanced.completed,
        stepIndex: advanced.stepIndex,
      });
      setAttempts([]);
      setPendingCorrection(null);
      setStatus(`Reset ${selectedLine.name}. Learning restarted.`);
      return;
    }

    // If learning isn't active, reset to pre-session baseline.
    setMoveLog(baseBoard.history);
    setBoardFen(baseBoard.fen);
    setSession(baseSession);
    setAttempts([]);
    setPendingCorrection(null);
    setStatus(`Reset to ${selectedLine.name}. Click Start to begin again.`);
  };

  const startLearn = () => {
    const board = initBoardStateFromLine();
    const nextSession = initSessionFromLine(selectedLine);
    const advanced = advanceComputerMoves(
      board.fen,
      board.history,
      { ...nextSession, active: true },
      userSide
    );

    setBoardFen(advanced.fen);
    setMoveLog(advanced.history);
    setAttempts([]);
    setPendingCorrection(null);
    setSession({
      ...nextSession,
      active: !advanced.completed,
      stepIndex: advanced.stepIndex,
    });
    if (advanced.completed) {
      setStatus(`Started learn on ${selectedLine.name}. Line already complete.`);
      return;
    }
    if (advanced.autoMoves.length > 0) {
      setStatus(
        `Started learn on ${selectedLine.name}. Computer played: ${advanced.autoMoves.join(
          " "
        )}. Your move.`
      );
      return;
    }
    setStatus(`Started learn on ${selectedLine.name}. Your move.`);
  };

  const onDrop = (arg1, arg2, arg3) => {
    try {
      let sourceSquare = arg1;
      let targetSquare = arg2;
      let piece = arg3;

      // react-chessboard v5 can pass nested payload shapes
      if (arg1 && typeof arg1 === "object") {
        if (typeof arg1.sourceSquare === "string") {
          sourceSquare = arg1.sourceSquare;
          targetSquare = arg1.targetSquare;
          piece = arg1.piece?.pieceType ?? arg1.piece;
        } else if (arg1.sourceSquare && typeof arg1.sourceSquare === "object") {
          sourceSquare = arg1.sourceSquare.sourceSquare;
          targetSquare = arg1.sourceSquare.targetSquare ?? arg1.targetSquare;
          piece =
            arg1.sourceSquare.piece?.pieceType ??
            arg1.piece?.pieceType ??
            arg1.sourceSquare.piece ??
            arg1.piece;
        }
      }

      console.log("[debug] onPieceDrop", { sourceSquare, targetSquare, piece, boardFen });

      if (!sourceSquare || !targetSquare) {
        setStatus("Drop payload was incomplete. Try again.");
        return false;
      }

      if (pendingCorrection) {
        setStatus("Undo incorrect move first, then play the expected move.");
        return false;
      }

      const expected = session.plan[session.stepIndex] ?? null;
      const chess = gameFromFen(boardFen);
      const pieceCode = typeof piece === "string" ? piece : "";
      const isPawn = pieceCode[1] === "P";
      const targetRank = targetSquare?.[1];
      const isPromotion = isPawn && (targetRank === "1" || targetRank === "8");

      if (session.active && chess.turn() !== userSide) {
        setStatus("Wait for computer move. This position expects the other side to move.");
        return false;
      }

      let move = null;
      try {
        move = chess.move({
          from: sourceSquare,
          to: targetSquare,
          ...(isPromotion ? { promotion: "q" } : {}),
        });
      } catch {
        move = null;
      }

      if (move === null) {
        setAttempts((prev) =>
          [{ label: `${sourceSquare}-${targetSquare} (illegal)`, inLine: false }, ...prev].slice(0, 8)
        );
        setStatus("Illegal move in learn mode.");
        return false;
      }

      if (!session.active) {
        setAttempts((prev) => [{ label: `${move.san} (free play)`, inLine: true }, ...prev].slice(0, 8));
        setBoardFen(chess.fen());
        setMoveLog(chess.history());
        setStatus(`Free play: played ${move.san}. Start Learn for guided validation.`);
        return true;
      }

      if (!expected) {
        setAttempts((prev) =>
          [{ label: `${move.san} (out of sequence)`, inLine: false }, ...prev].slice(0, 8)
        );
        setStatus("No next expected move in line. Reset to continue.");
        return false;
      }

      const inLine = expected.san === move.san;
      if (!inLine) {
        setBoardFen(chess.fen());
        setMoveLog(chess.history());
        setPendingCorrection({
          expectedSan: expected.san,
          expectedPly: expected.ply,
          playedSan: move.san,
          rollbackFen: boardFen,
          rollbackHistory: moveLog,
        });
        setAttempts((prev) =>
          [{ label: `${move.san} (expected ${expected.san})`, inLine: false }, ...prev].slice(0, 8)
        );
        setStatus(`Learn: incorrect (${move.san}). Use Undo and try ${expected.san}.`);
        return true;
      }

      const nextStepIndex = session.stepIndex + 1;
      const postUserSession = {
        ...session,
        stepIndex: nextStepIndex,
        active: true,
      };
      const advanced = advanceComputerMoves(chess.fen(), chess.history(), postUserSession, userSide);
      const completed = advanced.completed;
      setAttempts((prev) => [{ label: `${move.san} (on line)`, inLine: true }, ...prev].slice(0, 8));
      setPendingCorrection(null);
      setBoardFen(advanced.fen);
      setMoveLog(advanced.history);
      setSession((prev) => ({
        ...prev,
        stepIndex: advanced.stepIndex,
        active: !completed,
      }));
      if (completed) {
        setStatus(`Learn: correct ${move.san}. Line complete.`);
        return true;
      }
      if (advanced.autoMoves.length > 0) {
        setStatus(
          `Learn: correct ${move.san}. Computer played ${advanced.autoMoves.join(" ")}. Your move.`
        );
        return true;
      }
      setStatus(`Learn: correct ${move.san}. Your move.`);
      return true;
    } catch (error) {
      console.error("[fatal] onDrop crash", error);
      setStatus("Move handler crashed. Please retry this move.");
      return false;
    }
  };

  const undoIncorrectMove = () => {
    if (!pendingCorrection) return;
    setBoardFen(pendingCorrection.rollbackFen);
    setMoveLog(pendingCorrection.rollbackHistory);
    setPendingCorrection(null);
    setStatus(`Try again: expected ${pendingCorrection.expectedSan}.`);
  };

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <div>
          <h1>Choose Opening to Learn</h1>
          <p>Pick an opening, then choose Mainline or Variation in the dedicated opening screen.</p>
        </div>
      </header>

      {view === "dashboard" ? (
        <Dashboard selectedOpeningId={selectedOpeningId} onOpenOpening={openOpeningDetail} />
      ) : (
        <OpeningDetail
          opening={selectedOpening}
          selectedLineId={selectedLineId}
          onSelectLine={onSelectLine}
          onBack={() => setView("dashboard")}
          status={status}
          onResetToLine={resetToSelectedLine}
          onFlipBoard={() => setOrientation((value) => (value === "white" ? "black" : "white"))}
          onDrop={onDrop}
          boardFen={boardFen}
          orientation={orientation}
          sessionActive={session.active}
          suggestedMove={suggestedMove}
          attempts={attempts}
          moveLog={moveLog}
          pendingCorrection={pendingCorrection}
          onUndoIncorrectMove={undoIncorrectMove}
          suggestedMoveIdea={suggestedMoveIdea}
          recentMoveIdeas={recentMoveIdeas}
          linePlyCount={linePlyCount}
          onStartLearn={startLearn}
          engineStatus={engineStatus}
          engineAnalysis={engineAnalysis}
          whiteEvalLabel={whiteEval.label}
          whiteEvalRatio={whiteEvalRatio}
        />
      )}
    </div>
  );
}
