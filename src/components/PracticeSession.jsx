import { useEffect, useMemo } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { openingLines } from "../lib/openingTraining";

export function PracticeSession({
  opening,
  selectedLineId,
  boardFen,
  orientation,
  onDrop,
  onFlipBoard,
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

  useEffect(() => {
    console.debug("[arrow] suggested-move inputs", {
      boardFen,
      suggestedMoveSan: suggestedMove?.san ?? null,
      engineBestmoveUci: engineAnalysis?.bestmoveUci ?? null,
    });
    console.debug("[arrow] computed arrow", suggestedArrow);
  }, [boardFen, suggestedMove, engineAnalysis, suggestedArrow]);

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
    console.debug("[arrow] payload to board", arrowsPayload);
  }, [arrowsPayload]);

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
                  id: "practice-board",
                  position: boardFen,
                  onPieceDrop: onDrop,
                  boardOrientation: orientation,
                  darkSquareStyle: { backgroundColor: "#b58863" },
                  lightSquareStyle: { backgroundColor: "#f0d9b5" },
                  boardStyle: {
                    borderRadius: "10px",
                    overflow: "hidden",
                    backgroundColor: "#b58863",
                    boxShadow: "0 12px 28px rgba(0, 0, 0, 0.2)",
                  },
                  squareStyles: lastMoveHighlightStyles,
                  arrows: arrowsPayload,
                  showNotation: true,
                  animationDurationInMs: 150,
                }}
              />
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
        </aside>
      </div>
    </section>
  );
}
