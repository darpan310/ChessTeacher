import { useMemo, useState } from "react";
import { Chess } from "chess.js";
import { Dashboard } from "./components/Dashboard";
import { OpeningDetail } from "./components/OpeningDetail";
import { ALL_OPENINGS } from "./data/openings";
import { useEngineAnalysis } from "./hooks/useEngineAnalysis";
import {
  advanceComputerMoves,
  explainMoveIdea,
  gameFromFen,
  getSanSequenceForLine,
  getUserSideForOpening,
  initBoardStateFromLine,
  initSessionFromLine,
  openingLines,
} from "./lib/openingTraining";

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

  const { engineStatus, engineAnalysis, whiteEvalLabel, whiteEvalRatio } = useEngineAnalysis(boardFen);

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
        `Started learn on ${selectedLine.name}. Computer played: ${advanced.autoMoves.join(" ")}. Your move.`
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
        setStatus(`Learn: correct ${move.san}. Computer played ${advanced.autoMoves.join(" ")}. Your move.`);
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
          whiteEvalLabel={whiteEvalLabel}
          whiteEvalRatio={whiteEvalRatio}
        />
      )}
    </div>
  );
}
