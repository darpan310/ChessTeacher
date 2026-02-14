import { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Dashboard } from "./components/Dashboard";
import { OpeningDetail } from "./components/OpeningDetail";
import { PracticeSession } from "./components/PracticeSession";
import { ALL_OPENINGS } from "./data/openingCatalog";
import { loadOpeningById } from "./data/openingLibrary";
import { useEngineAnalysis } from "./hooks/useEngineAnalysis";
import {
  advanceComputerMoves,
  explainMoveIdea,
  gameFromFen,
  getSanSequenceForLine,
  getDefaultLine,
  getLineById,
  getUserSideForOpening,
  initBoardStateFromLine,
  initSessionFromLine,
} from "./lib/openingTraining";

export default function App() {
  const AUTO_REPLY_DELAY_MS = 600;
  const [view, setView] = useState("dashboard");
  const [selectedOpeningId, setSelectedOpeningId] = useState(ALL_OPENINGS[0].id);
  const [selectedLineId, setSelectedLineId] = useState(getDefaultLine(ALL_OPENINGS[0])?.id ?? "");
  const [orientation, setOrientation] = useState("white");
  const [status, setStatus] = useState("Choose an opening card, then select a line.");

  const initialBoard = initBoardStateFromLine();
  const initialSession = initSessionFromLine(ALL_OPENINGS[0].mainline);
  const [boardFen, setBoardFen] = useState(initialBoard.fen);
  const [moveLog, setMoveLog] = useState(initialBoard.history);
  const [attempts, setAttempts] = useState([]);
  const [session, setSession] = useState(initialSession);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [openingsById, setOpeningsById] = useState({});
  const autoReplyTimeoutRef = useRef(null);

  const clearPendingAutoReply = () => {
    if (autoReplyTimeoutRef.current) {
      clearTimeout(autoReplyTimeoutRef.current);
      autoReplyTimeoutRef.current = null;
    }
    setIsComputerThinking(false);
  };

  useEffect(() => {
    return () => {
      if (autoReplyTimeoutRef.current) clearTimeout(autoReplyTimeoutRef.current);
    };
  }, []);

  const selectedOpeningSummary = useMemo(
    () => ALL_OPENINGS.find((opening) => opening.id === selectedOpeningId) ?? ALL_OPENINGS[0],
    [selectedOpeningId]
  );
  const selectedOpening = openingsById[selectedOpeningId] ?? selectedOpeningSummary;
  const isSelectedOpeningLoaded = Boolean(openingsById[selectedOpeningId]);

  const selectedLine = useMemo(
    () => getLineById(selectedOpening, selectedLineId),
    [selectedOpening, selectedLineId]
  );

  const userSide = useMemo(() => getUserSideForOpening(selectedOpening), [selectedOpening]);
  const linePlyCount = session.plan.length;
  const suggestedMove = useMemo(() => {
    if (!session.active) return null;
    if (session.deviated) return null;
    const expected = session.plan[session.stepIndex] ?? null;
    if (!expected) return null;
    if (expected.fenBefore !== boardFen) return null;
    const turn = gameFromFen(boardFen).turn();
    return turn === userSide ? expected : null;
  }, [session, boardFen, userSide]);

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

  const openOpeningDetail = async (openingId) => {
    clearPendingAutoReply();
    const openingSummary = ALL_OPENINGS.find((item) => item.id === openingId);
    if (!openingSummary) return;

    const board = initBoardStateFromLine();
    setSelectedOpeningId(openingSummary.id);
    setSelectedLineId(getDefaultLine(openingSummary)?.id ?? "");
    setBoardFen(board.fen);
    setMoveLog(board.history);
    setAttempts([]);
    setSession(initSessionFromLine(getDefaultLine(openingSummary)));
    setStatus(`Loading ${openingSummary.name}...`);
    setView("opening");

    try {
      const openingFull = await loadOpeningById(openingId);
      setOpeningsById((prev) => ({ ...prev, [openingId]: openingFull }));
      const defaultLine = getDefaultLine(openingFull);
      setSelectedLineId(defaultLine?.id ?? "");
      setSession(initSessionFromLine(defaultLine));
      setStatus(`Opened ${openingFull.name}. Mainline selected.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown opening load error";
      setStatus(`Failed to load opening: ${message}`);
    }
  };

  const onSelectLine = (lineId) => {
    clearPendingAutoReply();
    if (!isSelectedOpeningLoaded) {
      setStatus(`Opening data is still loading. Try selecting ${selectedOpeningSummary.name} again in a moment.`);
      return;
    }
    const line = getLineById(selectedOpening, lineId);
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
    setStatus(`Selected ${line.name}. Moves: ${sanMoves.join(" ")}.`);
  };

  const resetToSelectedLine = () => {
    clearPendingAutoReply();
    if (!isSelectedOpeningLoaded) {
      setStatus("Opening data is still loading. Please wait.");
      return;
    }
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
      setStatus(`Reset ${selectedLine.name}. Learning restarted.`);
      return;
    }

    setMoveLog(baseBoard.history);
    setBoardFen(baseBoard.fen);
    setSession(baseSession);
    setAttempts([]);
    setStatus(`Reset to ${selectedLine.name}. Click Start to begin again.`);
  };

  const startLearn = () => {
    clearPendingAutoReply();
    if (!isSelectedOpeningLoaded) {
      setStatus(`Opening data is still loading for ${selectedOpeningSummary.name}.`);
      return;
    }
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
      if (isComputerThinking) {
        setStatus("Computer is thinking... wait for the reply move.");
        return false;
      }

      const expected = session.plan[session.stepIndex] ?? null;
      const chess = gameFromFen(boardFen);
      const pieceCode = typeof piece === "string" ? piece : "";
      const isPawn = pieceCode[1] === "P";
      const targetRank = targetSquare?.[1];
      const isPromotion = isPawn && (targetRank === "1" || targetRank === "8");

      if (session.active && !session.deviated && chess.turn() !== userSide) {
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
        setMoveLog((prev) => [...prev, move.san]);
        setStatus(`Free play: played ${move.san}. Start Learn for guided validation.`);
        return true;
      }

      if (session.deviated) {
        setBoardFen(chess.fen());
        setMoveLog((prev) => [...prev, move.san]);
        setAttempts((prev) => [{ label: `${move.san} (deviation mode)`, inLine: false }, ...prev].slice(0, 8));
        setStatus("Deviation mode: play both sides. Follow Stockfish best move.");
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
        setMoveLog((prev) => [...prev, move.san]);
        setSession((prev) => ({ ...prev, deviated: true, active: true }));
        setAttempts((prev) =>
          [{ label: `${move.san} (expected ${expected.san})`, inLine: false }, ...prev].slice(0, 8)
        );
        setStatus(
          `Learn: deviated with ${move.san} (expected ${expected.san}). You now control both sides.`
        );
        return true;
      }

      const nextStepIndex = session.stepIndex + 1;
      const postUserSession = {
        ...session,
        stepIndex: nextStepIndex,
        active: true,
      };
      const historyAfterUser = [...moveLog, move.san];
      const advanced = advanceComputerMoves(chess.fen(), historyAfterUser, postUserSession, userSide);
      const completed = advanced.completed;
      setAttempts((prev) => [{ label: `${move.san} (on line)`, inLine: true }, ...prev].slice(0, 8));
      if (advanced.autoMoves.length > 0) {
        setBoardFen(chess.fen());
        setMoveLog(historyAfterUser);
        setSession((prev) => ({
          ...prev,
          stepIndex: nextStepIndex,
          deviated: false,
          active: true,
        }));
        setIsComputerThinking(true);
        setStatus(`Learn: correct ${move.san}. Computer is thinking...`);
        if (autoReplyTimeoutRef.current) clearTimeout(autoReplyTimeoutRef.current);
        autoReplyTimeoutRef.current = setTimeout(() => {
          autoReplyTimeoutRef.current = null;
          setBoardFen(advanced.fen);
          setMoveLog(advanced.history);
          setSession((prev) => ({
            ...prev,
            stepIndex: advanced.stepIndex,
            deviated: false,
            active: !completed,
          }));
          setIsComputerThinking(false);
          if (completed) {
            setStatus(`Learn: correct ${move.san}. Computer played ${advanced.autoMoves.join(" ")}. Line complete.`);
            return;
          }
          setStatus(`Learn: correct ${move.san}. Computer played ${advanced.autoMoves.join(" ")}. Your move.`);
        }, AUTO_REPLY_DELAY_MS);
        return true;
      }
      setBoardFen(advanced.fen);
      setMoveLog(advanced.history);
      setSession((prev) => ({
        ...prev,
        stepIndex: advanced.stepIndex,
        deviated: false,
        active: !completed,
      }));
      if (completed) {
        setStatus(`Learn: correct ${move.san}. Line complete.`);
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
        <>
          {view === "opening" ? (
            <OpeningDetail
              opening={selectedOpening}
              selectedLineId={selectedLineId}
              onSelectLine={onSelectLine}
              onBack={() => setView("dashboard")}
              onStartLearn={() => {
                startLearn();
                setView("play");
              }}
              linePlyCount={linePlyCount}
              sessionActive={session.active}
            />
          ) : (
            <PracticeSession
              opening={selectedOpening}
              selectedLineId={selectedLineId}
              boardFen={boardFen}
              orientation={orientation}
              onDrop={onDrop}
              onFlipBoard={() => setOrientation((value) => (value === "white" ? "black" : "white"))}
              onResetToLine={resetToSelectedLine}
              onBackToOpening={() => setView("opening")}
              onBackToDashboard={() => setView("dashboard")}
              status={status}
              sessionActive={session.active}
              isDeviationMode={session.deviated}
              suggestedMove={suggestedMove}
              suggestedMoveIdea={suggestedMoveIdea}
              moveLog={moveLog}
              recentMoveIdeas={recentMoveIdeas}
              linePlyCount={linePlyCount}
              engineStatus={engineStatus}
              engineAnalysis={engineAnalysis}
              whiteEvalLabel={whiteEvalLabel}
              whiteEvalRatio={whiteEvalRatio}
            />
          )}
        </>
      )}
    </div>
  );
}
