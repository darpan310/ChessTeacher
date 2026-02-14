import { useEffect, useMemo, useRef, useState } from "react";
import { createChessEngine } from "../engine";
import {
  analysisToWhiteEval,
  evalToWhiteRatio,
  formatEngineScore,
  uciToSan,
} from "../lib/openingTraining";

const ENGINE_DEPTH = Number.parseInt(import.meta.env.VITE_ENGINE_DEPTH ?? "14", 10);
const ENGINE_MOVETIME_MS = Number.parseInt(import.meta.env.VITE_ENGINE_MOVETIME_MS ?? "700", 10);

export function useEngineAnalysis(boardFen) {
  const engineRef = useRef(null);
  const analysisRequestIdRef = useRef(0);

  const [engineStatus, setEngineStatus] = useState("Initializing Stockfish...");
  const [engineAnalysis, setEngineAnalysis] = useState(null);
  const [engineReady, setEngineReady] = useState(false);

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

  useEffect(() => {
    if (!engineReady) return undefined;

    const timeoutId = setTimeout(async () => {
      const engine = engineRef.current;
      const requestId = analysisRequestIdRef.current + 1;
      analysisRequestIdRef.current = requestId;
      console.debug("[engine] analyze requested", {
        hasEngine: Boolean(engine),
        adapter: engine?.constructor?.name,
        fen: boardFen,
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
          depth: Number.isFinite(ENGINE_DEPTH) ? ENGINE_DEPTH : 14,
          moveTimeMs: Number.isFinite(ENGINE_MOVETIME_MS) ? ENGINE_MOVETIME_MS : 700,
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
        if (message.includes("Superseded by newer analysis request")) {
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
    }, 120);

    return () => clearTimeout(timeoutId);
  }, [boardFen, engineReady]);

  const whiteEval = useMemo(() => analysisToWhiteEval(boardFen, engineAnalysis), [boardFen, engineAnalysis]);
  const whiteEvalRatio = useMemo(() => evalToWhiteRatio(whiteEval.whiteEvalPawns), [whiteEval.whiteEvalPawns]);

  return {
    engineStatus,
    engineAnalysis,
    whiteEvalLabel: whiteEval.label,
    whiteEvalRatio,
  };
}
