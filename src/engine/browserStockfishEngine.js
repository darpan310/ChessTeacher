const DEFAULT_WORKER_URL = "https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js";
const FALLBACK_WORKER_URLS = [
  "https://unpkg.com/stockfish.js@10.0.2/stockfish.js",
  "https://cdn.jsdelivr.net/npm/stockfish@16.0.0/src/stockfish.js",
];

function parseInfoLine(line) {
  if (!line.startsWith("info ")) return null;

  const tokens = line.split(/\s+/);
  const scoreIndex = tokens.indexOf("score");
  const pvIndex = tokens.indexOf("pv");

  let scoreCp = null;
  let scoreMate = null;
  if (scoreIndex >= 0 && scoreIndex + 2 < tokens.length) {
    const scoreType = tokens[scoreIndex + 1];
    const scoreValue = Number(tokens[scoreIndex + 2]);
    if (Number.isFinite(scoreValue)) {
      if (scoreType === "cp") scoreCp = scoreValue;
      if (scoreType === "mate") scoreMate = scoreValue;
    }
  }

  const pv = pvIndex >= 0 ? tokens.slice(pvIndex + 1).join(" ") : "";
  return { scoreCp, scoreMate, pv };
}

export class BrowserStockfishEngine {
  constructor(options = {}) {
    this.workerUrl = options.workerUrl ?? DEFAULT_WORKER_URL;
    this.activeWorkerUrl = null;
    this.worker = null;
    this.ready = false;
    this.waiter = null;
    this.analysis = null;
  }

  async init() {
    if (this.ready) return;
    const candidates = Array.from(new Set([this.workerUrl, ...FALLBACK_WORKER_URLS].filter(Boolean)));
    let lastError = null;

    for (const candidateUrl of candidates) {
      console.debug("[engine/browser] init worker candidate", { workerUrl: candidateUrl });
      try {
        this.worker = this.createWorker(candidateUrl);
        this.worker.onmessage = (event) => this.handleMessage(event.data);
        this.worker.onerror = (error) => {
          console.error("[engine/browser] worker error", { workerUrl: this.activeWorkerUrl, error });
          if (this.waiter) {
            this.waiter.reject(new Error(`Stockfish worker error: ${error.message || "unknown"}`));
            this.waiter = null;
          }
          if (this.analysis) {
            this.analysis.reject(new Error("Stockfish analysis failed."));
            this.analysis = null;
          }
        };

        this.activeWorkerUrl = candidateUrl;
        await this.sendAndWait("uci", (line) => line === "uciok", 5000);
        await this.sendAndWait("isready", (line) => line === "readyok", 5000);
        this.ready = true;
        console.debug("[engine/browser] init worker success", { workerUrl: candidateUrl });
        return;
      } catch (error) {
        lastError = error;
        console.error("[engine/browser] init worker candidate failed", {
          workerUrl: candidateUrl,
          error,
        });
        this.waiter = null;
        this.analysis = null;
        this.ready = false;
        this.activeWorkerUrl = null;
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
      }
    }

    const message =
      lastError instanceof Error
        ? lastError.message
        : "Unable to initialize Stockfish worker from all candidate URLs.";
    throw new Error(message);
  }

  createWorker(url) {
    const parsed = new URL(url, window.location.href);
    const sameOrigin = parsed.origin === window.location.origin;
    if (sameOrigin) {
      return new Worker(parsed.href);
    }

    // Cross-origin worker scripts cannot be loaded directly by Worker().
    // Bootstrap with a same-origin blob worker and import the remote script inside it.
    const bootstrap = `
      self.__stockfishLoaded = false;
      try {
        importScripts(${JSON.stringify(parsed.href)});
        self.__stockfishLoaded = true;
      } catch (error) {
        self.postMessage("stockfish_bootstrap_error " + (error && error.message ? error.message : String(error)));
      }
    `;
    const blob = new Blob([bootstrap], { type: "application/javascript" });
    const blobUrl = URL.createObjectURL(blob);
    try {
      return new Worker(blobUrl);
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  }

  async analyzePosition({ fen, depth = 12, moveTimeMs = 250 } = {}) {
    console.debug("[engine/browser] analyzePosition called", {
      ready: this.ready,
      hasWorker: Boolean(this.worker),
      depth,
      moveTimeMs,
      fen,
    });
    if (!this.ready || !this.worker) {
      throw new Error("Stockfish engine is not initialized.");
    }

    if (!fen) throw new Error("Missing FEN for analysis.");

    if (this.analysis) {
      this.send("stop");
      this.analysis.reject(new Error("Superseded by newer analysis request."));
      this.analysis = null;
    }

    this.send("stop");
    this.send(`position fen ${fen}`);

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (!this.analysis) return;
        this.send("stop");
        this.analysis = null;
        reject(new Error("Stockfish analysis timed out."));
      }, 15000);

      this.analysis = {
        timeoutId,
        latestInfo: null,
        resolve: (bestmoveUci) => {
          clearTimeout(timeoutId);
          const payload = {
            bestmoveUci,
            scoreCp: this.analysis?.latestInfo?.scoreCp ?? null,
            scoreMate: this.analysis?.latestInfo?.scoreMate ?? null,
            pv: this.analysis?.latestInfo?.pv ?? "",
          };
          this.analysis = null;
          resolve(payload);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          this.analysis = null;
          reject(error);
        },
      };

      if (moveTimeMs && moveTimeMs > 0) {
        this.send(`go movetime ${moveTimeMs}`);
      } else {
        this.send(`go depth ${depth}`);
      }
    });
  }

  async dispose() {
    if (this.analysis) {
      this.analysis.reject(new Error("Engine disposed."));
      this.analysis = null;
    }
    this.waiter = null;
    this.ready = false;
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  handleMessage(rawLine) {
    const line = String(rawLine ?? "").trim();
    if (!line) return;
    if (line.startsWith("stockfish_bootstrap_error")) {
      const message = line.slice("stockfish_bootstrap_error".length).trim();
      console.error("[engine/browser] bootstrap importScripts failed", message);
      if (this.waiter) {
        this.waiter.reject(new Error(`Stockfish bootstrap failed: ${message}`));
        this.waiter = null;
      }
      if (this.analysis) {
        this.analysis.reject(new Error(`Stockfish bootstrap failed: ${message}`));
        this.analysis = null;
      }
      return;
    }
    if (line === "uciok" || line === "readyok" || line.startsWith("bestmove ")) {
      console.debug("[engine/browser] message", line);
    }

    if (this.waiter && this.waiter.predicate(line)) {
      this.waiter.resolve(line);
      this.waiter = null;
      return;
    }

    if (this.analysis) {
      if (line.startsWith("info ")) {
        const info = parseInfoLine(line);
        if (info) this.analysis.latestInfo = info;
        return;
      }
      if (line.startsWith("bestmove ")) {
        const bestmoveUci = line.split(/\s+/)[1] ?? "";
        this.analysis.resolve(bestmoveUci);
      }
    }
  }

  send(command) {
    if (!this.worker) throw new Error("Stockfish worker is not available.");
    this.worker.postMessage(command);
  }

  sendAndWait(command, predicate, timeoutMs) {
    if (!this.worker) throw new Error("Stockfish worker is not available.");
    if (this.waiter) throw new Error("Engine is busy waiting for previous command.");

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (!this.waiter) return;
        this.waiter = null;
        reject(new Error(`Timed out waiting for '${command}' response.`));
      }, timeoutMs);

      this.waiter = {
        predicate,
        resolve: (line) => {
          clearTimeout(timeoutId);
          resolve(line);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
      };

      this.send(command);
    });
  }
}
