export class ServerChessEngine {
  constructor(options = {}) {
    this.endpoint = options.endpoint ?? "/api/engine/analyze";
    this.ready = false;
  }

  async init() {
    // Placeholder so app can switch to server-side engine later.
    this.ready = true;
  }

  async analyzePosition({ fen }) {
    if (!this.ready) throw new Error("Server engine is not initialized.");
    if (!fen) throw new Error("Missing FEN for analysis.");

    throw new Error(
      `Server engine adapter not implemented. Configure backend at ${this.endpoint}.`
    );
  }

  async dispose() {
    this.ready = false;
  }
}
