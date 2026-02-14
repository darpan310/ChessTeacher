import { Chess } from "chess.js";

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

export function openingLines(opening) {
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

export function getSanSequenceForLine(line) {
  return getSanSequenceFromPgn(getExpandedLinePgn(line));
}

export function explainMoveIdea(san, sideToMove) {
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

export function gameFromFen(fen) {
  return new Chess(fen);
}

export function uciToSan(fen, uci) {
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

export function formatEngineScore(scoreCp, scoreMate) {
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

export function analysisToWhiteEval(fen, analysis) {
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

export function evalToWhiteRatio(whiteEvalPawns) {
  const clamped = Math.max(-12, Math.min(12, whiteEvalPawns));
  const logistic = 1 / (1 + Math.exp(-clamped / 1.8));
  return Math.max(0.03, Math.min(0.97, logistic));
}

export function initBoardStateFromLine() {
  const chess = new Chess();
  return {
    fen: chess.fen(),
    history: [],
  };
}

export function initSessionFromLine(line) {
  const plan = buildLinePlan(getExpandedLinePgn(line));
  return {
    active: false,
    deviated: false,
    stepIndex: 0,
    plan,
  };
}

export function getUserSideForOpening(opening) {
  return opening.sectionId === "white" ? "w" : "b";
}

export function advanceComputerMoves(fen, history, session, userSide) {
  const chess = gameFromFen(fen);
  const nextHistory = [...history];
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
    nextHistory.push(autoMove.san);
    nextStepIndex += 1;
  }

  const completed = nextStepIndex >= session.plan.length;
  return {
    fen: chess.fen(),
    history: nextHistory,
    stepIndex: nextStepIndex,
    completed,
    autoMoves,
  };
}
