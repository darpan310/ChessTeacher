import { BrowserStockfishEngine } from "./browserStockfishEngine";
import { ServerChessEngine } from "./serverChessEngine";

const ENGINE_MODE = (import.meta.env.VITE_ENGINE_MODE ?? "browser").toLowerCase();

export function createChessEngine() {
  if (ENGINE_MODE === "server") {
    return new ServerChessEngine({ endpoint: import.meta.env.VITE_ENGINE_ENDPOINT });
  }

  return new BrowserStockfishEngine({ workerUrl: import.meta.env.VITE_STOCKFISH_WORKER_URL });
}
