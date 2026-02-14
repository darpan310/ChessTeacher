import { openingLineRoots, openingLines } from "../lib/openingTraining";

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
  const roots = openingLineRoots(opening);

  const parentById = {};
  for (const root of roots) {
    for (const child of root.children ?? []) {
      parentById[child.id] = root.id;
    }
  }

  const selectedLine = lines.find((line) => line.id === selectedLineId) ?? lines[0];
  const selectedRootId = parentById[selectedLine?.id] ?? selectedLine?.id ?? roots[0]?.id;
  const selectedRoot = roots.find((line) => line.id === selectedRootId) ?? roots[0];
  const selectedSubVariations = selectedRoot?.children ?? [];

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
          <h3>Main Lines</h3>
          <div className="variation-grid">
            {roots.map((variation) => (
              <div
                key={variation.id}
                className={`line-card ${variation.id === selectedRootId ? "active" : ""}`}
              >
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

        <article className="line-group-card">
          <h3>Sub-Variations</h3>
          {selectedSubVariations.length === 0 ? (
            <p>No sub-variations defined for this line yet.</p>
          ) : (
            <div className="variation-grid">
              {selectedSubVariations.map((variation) => (
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
          )}
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
