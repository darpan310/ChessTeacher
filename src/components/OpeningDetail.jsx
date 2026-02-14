import { Chessboard } from "react-chessboard";
import { openingLines } from "../lib/openingTraining";

export function OpeningDetail({
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
          {moveLog.length === 0 ? <p>No moves recorded yet.</p> : <p>{moveLog.join(" ")}</p>}
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
    </section>
  );
}
