import { openingLines } from "../lib/openingTraining";

export function OpeningDetail({
  opening,
  selectedLineId,
  onSelectLine,
  onBack,
  onStartLearn,
  linePlyCount,
  sessionActive,
}) {
  const lines = openingLines(opening);
  const selectedLine = lines.find((line) => line.id === selectedLineId) ?? lines[0];

  return (
    <section className="opening-detail-layout single-column-layout">
      <main className="opening-detail-main">
        <button className="back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <article className="opening-header-card">
          <h2>{opening.name} · Choose Line</h2>
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

        <article className="line-group-card opening-actions">
          <h3>Selected Line</h3>
          <p>
            <strong>{selectedLine.name}</strong>
          </p>
          <p>{selectedLine.moves}</p>
          <p>Line depth: {linePlyCount} plies</p>
          <button className="start-learn-btn" onClick={onStartLearn}>
            {sessionActive ? "Continue Learn" : "Start Learn"}
          </button>
        </article>
      </main>
    </section>
  );
}
