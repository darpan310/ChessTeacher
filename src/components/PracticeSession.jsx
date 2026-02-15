import { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { openingLines } from "../lib/openingTraining";
import { ChessTeacherChat } from "./ChessTeacherChat";
import bP from "../../mockups/library-pieces/bP.svg";
import bN from "../../mockups/library-pieces/bN.svg";
import bB from "../../mockups/library-pieces/bB.svg";
import bR from "../../mockups/library-pieces/bR.svg";
import bQ from "../../mockups/library-pieces/bQ.svg";
import wP from "../../mockups/library-pieces/wP.svg";
import wN from "../../mockups/library-pieces/wN.svg";
import wB from "../../mockups/library-pieces/wB.svg";
import wR from "../../mockups/library-pieces/wR.svg";
import wQ from "../../mockups/library-pieces/wQ.svg";

const PIECE_VALUE = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

const WHITE_PIECE_ICON = {
  p: wP,
  n: wN,
  b: wB,
  r: wR,
  q: wQ,
};

const BLACK_PIECE_ICON = {
  p: bP,
  n: bN,
  b: bB,
  r: bR,
  q: bQ,
};

const CAPTURE_RENDER_ORDER = ["q", "r", "b", "n", "p"];

export function PracticeSession({
  opening,
  selectedLineId,
  boardFen,
  orientation,
  onDrop,
  onFlipBoard,
  onUndoMove,
  canUndoMove,
  onResetToLine,
  onBackToOpening,
  onBackToDashboard,
  status,
  sessionActive,
  isDeviationMode,
  suggestedMove,
  suggestedMoveIdea,
  moveLog,
  recentMoveIdeas,
  linePlyCount,
  engineStatus,
  engineAnalysis,
  whiteEvalLabel,
  whiteEvalRatio,
}) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const lines = openingLines(opening);
  const selectedLine = lines.find((line) => line.id === selectedLineId) ?? lines[0];
  const movePairs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < moveLog.length; i += 2) {
      pairs.push({
        moveNumber: Math.floor(i / 2) + 1,
        white: moveLog[i] ?? "",
        black: moveLog[i + 1] ?? "",
      });
    }
    return pairs;
  }, [moveLog]);
  const lastMoveHighlightStyles = useMemo(() => {
    if (!moveLog.length) return {};
    const chess = new Chess();
    let lastMove = null;
    for (const san of moveLog) {
      try {
        lastMove = chess.move(san);
      } catch {
        lastMove = null;
        break;
      }
    }
    if (!lastMove) return {};

    const highlight = {
      backgroundColor: "rgba(255, 212, 59, 0.55)",
      boxShadow: "inset 0 0 0 2px rgba(166, 123, 0, 0.65)",
    };
    return {
      [lastMove.from]: highlight,
      [lastMove.to]: highlight,
    };
  }, [moveLog]);
  const legalMoveSquareStyles = useMemo(() => {
    if (!selectedSquare) return {};

    const chess = new Chess(boardFen);
    const piece = chess.get(selectedSquare);
    if (!piece || piece.color !== chess.turn()) return {};

    const moves = chess.moves({ square: selectedSquare, verbose: true });
    if (!moves.length) return {};

    const styles = {
      [selectedSquare]: {
        boxShadow: "inset 0 0 0 3px rgba(92, 78, 64, 0.5)",
        backgroundColor: "rgba(107, 92, 78, 0.22)",
      },
    };

    for (const move of moves) {
      const hasPiece = Boolean(chess.get(move.to));
      styles[move.to] = hasPiece
        ? {
            background:
              "radial-gradient(circle, rgba(121, 106, 90, 0.08) 56%, rgba(92, 78, 64, 0.52) 58%, transparent 62%)",
          }
        : {
            background:
              "radial-gradient(circle, rgba(107, 92, 78, 0.34) 22%, rgba(121, 106, 90, 0.16) 24%, transparent 26%)",
          };
    }

    return styles;
  }, [boardFen, selectedSquare]);
  const combinedSquareStyles = useMemo(
    () => ({
      ...lastMoveHighlightStyles,
      ...legalMoveSquareStyles,
    }),
    [lastMoveHighlightStyles, legalMoveSquareStyles]
  );
  const suggestedArrow = useMemo(() => {
    const stableEngineBestmove =
      isDeviationMode && engineAnalysis?.fen === boardFen ? engineAnalysis?.bestmoveUci : null;

    if (suggestedMove?.san) {
      const chess = new Chess(boardFen);
      try {
        const move = chess.move(suggestedMove.san);
        if (move?.from && move?.to) {
          return {
            startSquare: move.from,
            endSquare: move.to,
            color: "rgba(126, 211, 120, 0.85)",
          };
        }
      } catch {
        // Ignore if SAN cannot be resolved from current board state.
      }
    }

    const uci = stableEngineBestmove;
    if (uci && uci.length >= 4 && uci !== "(none)") {
      return {
        startSquare: uci.slice(0, 2),
        endSquare: uci.slice(2, 4),
        color: "rgba(126, 211, 120, 0.85)",
      };
    }
    return null;
  }, [boardFen, suggestedMove, engineAnalysis, isDeviationMode]);

  const arrowsPayload = suggestedArrow
    ? [
        {
          startSquare: suggestedArrow.startSquare,
          endSquare: suggestedArrow.endSquare,
          color: suggestedArrow.color,
        },
      ]
    : [];

  useEffect(() => {
    if (!selectedSquare) return;
    const chess = new Chess(boardFen);
    const piece = chess.get(selectedSquare);
    if (!piece || piece.color !== chess.turn()) {
      setSelectedSquare(null);
    }
  }, [boardFen, selectedSquare]);

  const asBoardSquare = (...values) =>
    values.find((value) => typeof value === "string" && /^[a-h][1-8]$/.test(value)) ?? null;

  const extractSquareFromArgs = (...args) => {
    const direct = asBoardSquare(...args);
    if (direct) return direct;
    for (const arg of args) {
      if (arg && typeof arg === "object") {
        const candidate =
          (typeof arg.square === "string" && arg.square) ||
          (typeof arg.sourceSquare === "string" && arg.sourceSquare) ||
          (arg.sourceSquare &&
            typeof arg.sourceSquare === "object" &&
            typeof arg.sourceSquare.square === "string" &&
            arg.sourceSquare.square) ||
          null;
        if (candidate && /^[a-h][1-8]$/.test(candidate)) return candidate;
      }
    }
    return null;
  };

  const handlePieceClick = (...args) => {
    const square = extractSquareFromArgs(...args);
    if (!square) return;
    const chess = new Chess(boardFen);
    const piece = chess.get(square);
    if (!piece || piece.color !== chess.turn()) {
      setSelectedSquare(null);
      return;
    }
    setSelectedSquare((current) => (current === square ? null : square));
  };

  const handleSquareClick = (...args) => {
    const square = extractSquareFromArgs(...args);
    if (!square) return;
    const chess = new Chess(boardFen);
    const piece = chess.get(square);

    if (!selectedSquare) {
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null);
      }
      return;
    }

    const selectedPiece = chess.get(selectedSquare);
    if (!selectedPiece || selectedPiece.color !== chess.turn()) {
      setSelectedSquare(null);
      return;
    }

    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      return;
    }

    const selectedPieceCode = `${selectedPiece.color}${selectedPiece.type.toUpperCase()}`;
    const moved = onDrop(selectedSquare, square, selectedPieceCode);
    if (moved) {
      setSelectedSquare(null);
      return;
    }
    setSelectedSquare(square === selectedSquare ? null : selectedSquare);
  };

  const handlePieceDrop = (...args) => {
    const moved = onDrop(...args);
    if (moved) setSelectedSquare(null);
    return moved;
  };

  const handleSquareMouseDown = (payload) => {
    void payload;
  };

  const capturedSummary = useMemo(() => {
    const replay = new Chess();
    const capturedByWhite = [];
    const capturedByBlack = [];

    for (const san of moveLog) {
      let move = null;
      try {
        move = replay.move(san);
      } catch {
        move = null;
      }
      if (!move) continue;
      if (move.captured) {
        if (move.color === "w") capturedByWhite.push(move.captured);
        else capturedByBlack.push(move.captured);
      }
    }

    const current = new Chess(boardFen);
    const board = current.board();
    let whiteMaterial = 0;
    let blackMaterial = 0;

    for (const row of board) {
      for (const piece of row) {
        if (!piece) continue;
        const value = PIECE_VALUE[piece.type] ?? 0;
        if (piece.color === "w") whiteMaterial += value;
        else blackMaterial += value;
      }
    }

    const whiteAdvantage = Math.max(0, whiteMaterial - blackMaterial);
    const blackAdvantage = Math.max(0, blackMaterial - whiteMaterial);

    const expandCaptured = (pieces, iconSet) =>
      CAPTURE_RENDER_ORDER.flatMap((type) =>
        pieces
          .filter((piece) => piece === type)
          .map((_, idx) => ({ id: `${type}-${idx}`, iconSrc: iconSet[type], type }))
      );

    return {
      whiteCapturedIcons: expandCaptured(capturedByWhite, BLACK_PIECE_ICON),
      blackCapturedIcons: expandCaptured(capturedByBlack, WHITE_PIECE_ICON),
      whiteAdvantage,
      blackAdvantage,
    };
  }, [moveLog, boardFen]);

  const topSide = orientation === "white" ? "black" : "white";
  const topStrip =
    topSide === "black"
      ? {
          label: "Black",
          icons: capturedSummary.blackCapturedIcons,
          score: capturedSummary.blackAdvantage,
          tone: "dark",
        }
      : {
          label: "White",
          icons: capturedSummary.whiteCapturedIcons,
          score: capturedSummary.whiteAdvantage,
          tone: "light",
        };
  const bottomStrip =
    topSide === "black"
      ? {
          label: "White",
          icons: capturedSummary.whiteCapturedIcons,
          score: capturedSummary.whiteAdvantage,
          tone: "light",
        }
      : {
          label: "Black",
          icons: capturedSummary.blackCapturedIcons,
          score: capturedSummary.blackAdvantage,
          tone: "dark",
        };

  return (
    <section className="practice-page-layout">
      <header className="practice-page-head">
        <div>
          <h2>
            {opening.name} - {selectedLine.name}
          </h2>
          <p>Line depth: {linePlyCount} plies</p>
        </div>
        <div className="practice-page-actions">
          <button className="back-button" onClick={onBackToOpening}>
            Line Selection
          </button>
          <button className="back-button" onClick={onBackToDashboard}>
            Dashboard
          </button>
        </div>
      </header>

      <div className="practice-page-grid">
        <main className="practice-board-card">
          <div className="practice-controls">
            <button className="control-btn control-btn-primary" onClick={onResetToLine}>
              Reset to Selected Line
            </button>
            <button className="control-btn control-btn-danger" onClick={onUndoMove} disabled={!canUndoMove}>
              Undo Move
            </button>
            <button className="control-btn control-btn-secondary" onClick={onFlipBoard}>
              Flip Board
            </button>
          </div>

          <div className="board-row">
            <div className="board-wrap">
              <div className="capture-strip capture-strip-top">
                <span className="capture-label">{topStrip.label}</span>
                <div className="capture-icons">
                  {topStrip.icons.map((piece) => (
                    <img key={piece.id} className="capture-piece-img" src={piece.iconSrc} alt={piece.type} />
                  ))}
                  {topStrip.score > 0 ? <span className="capture-score">+{topStrip.score}</span> : null}
                </div>
              </div>

              <div className="board-inner-row">
                <div className="eval-bar" aria-label={`Evaluation bar ${whiteEvalLabel}`}>
                  <div className="eval-black" style={{ height: `${(1 - whiteEvalRatio) * 100}%` }} />
                  <div className="eval-white" style={{ height: `${whiteEvalRatio * 100}%` }} />
                  <div className="eval-label">{whiteEvalLabel}</div>
                </div>

                <div className="board-core">
                  <Chessboard
                    options={{
                      id: "practice-board",
                      position: boardFen,
                      onPieceDrop: handlePieceDrop,
                      onPieceClick: handlePieceClick,
                      onSquareClick: handleSquareClick,
                      onSquareMouseDown: handleSquareMouseDown,
                      onSquareMouseUp: () => {},
                      boardOrientation: orientation,
                      darkSquareStyle: { backgroundColor: "#b58863" },
                      lightSquareStyle: { backgroundColor: "#f0d9b5" },
                      boardStyle: {
                        borderRadius: "10px",
                        overflow: "hidden",
                        backgroundColor: "#b58863",
                        boxShadow: "0 12px 28px rgba(0, 0, 0, 0.2)",
                      },
                      squareStyles: combinedSquareStyles,
                      arrows: arrowsPayload,
                      showNotation: true,
                      animationDurationInMs: 150,
                    }}
                  />
                </div>
              </div>

              <div className="capture-strip capture-strip-bottom">
                <span className="capture-label">{bottomStrip.label}</span>
                <div className="capture-icons">
                  {bottomStrip.icons.map((piece) => (
                    <img key={piece.id} className="capture-piece-img" src={piece.iconSrc} alt={piece.type} />
                  ))}
                  {bottomStrip.score > 0 ? <span className="capture-score">+{bottomStrip.score}</span> : null}
                </div>
              </div>
            </div>
          </div>

          <p className="status-bar">{status}</p>
        </main>

        <aside className="practice-panel">
          {isDeviationMode ? (
            <p className="deviation-indicator">
              Deviation mode active: you are now playing both sides. Follow Stockfish best moves.
            </p>
          ) : null}

          <div className="coach-card">
            <h3>Suggested Next Move</h3>
            {!sessionActive ? (
              <p>Start Learn from line selection to begin.</p>
            ) : suggestedMove ? (
              <>
                <p>
                  Play <strong>{suggestedMove.san}</strong> (ply {suggestedMove.ply})
                </p>
                <p>{suggestedMoveIdea}</p>
              </>
            ) : (
              <p>
                {isDeviationMode
                  ? "Line guidance paused after deviation. Use Stockfish suggestion below."
                  : "Line complete or position out of sequence. Reset to continue."}
              </p>
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
            {movePairs.length === 0 ? (
              <p>No moves recorded yet.</p>
            ) : (
              <div className="move-pairs">
                {movePairs.map((pair) => (
                  <div key={pair.moveNumber} className="move-pair-row">
                    <span className="move-num">{pair.moveNumber}.</span>
                    <span className="move-white">{pair.white}</span>
                    <span className="move-black">{pair.black}</span>
                  </div>
                ))}
              </div>
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
                    <strong>
                      {item.ply}. {item.san}
                    </strong>
                    : {item.idea}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <ChessTeacherChat
            context={{
              opening: opening.name,
              line: selectedLine.name,
              boardFen,
              orientation,
              status,
              sessionActive,
              deviationMode: isDeviationMode,
              suggestedMove: suggestedMove?.san ?? null,
              suggestedMovePly: suggestedMove?.ply ?? null,
              engineStatus,
              engineBestMove: engineAnalysis?.bestmoveSan ?? engineAnalysis?.bestmoveUci ?? null,
              engineEval: whiteEvalLabel,
              moveLog,
            }}
          />
        </aside>
      </div>
    </section>
  );
}
