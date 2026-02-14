import { BrowserStockfishEngine } from "./browserStockfishEngine";
import { ServerChessEngine } from "./serverChessEngine";

const ENGINE_MODE = (import.meta.env.VITE_ENGINE_MODE ?? "browser").toLowerCase();

export function createChessEngine() {
  if (ENGINE_MODE === "server") {
    return new ServerChessEngine({ endpoint: import.meta.env.VITE_ENGINE_ENDPOINT });
  }

  const threads = Number.parseInt(import.meta.env.VITE_ENGINE_THREADS ?? "", 10);
  const hashMb = Number.parseInt(import.meta.env.VITE_ENGINE_HASH_MB ?? "", 10);
  return new BrowserStockfishEngine({
    workerUrl: import.meta.env.VITE_STOCKFISH_WORKER_URL,
    threads: Number.isFinite(threads) ? threads : undefined,
    hashMb: Number.isFinite(hashMb) ? hashMb : undefined,
  });
}
