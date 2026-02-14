import { OPENING_SECTIONS } from "../data/openingCatalog";

export function Dashboard({ selectedOpeningId, onOpenOpening }) {
  return (
    <section className="dashboard-grid single-column">
      <div className="catalog-panel">
        {OPENING_SECTIONS.map((section) => (
          <article key={section.id} className="section-block">
            <div className="section-head">
              <h2>{section.title}</h2>
              <p>{section.subtitle}</p>
            </div>

            <div className="cards-grid">
              {section.openings.map((opening) => {
                const isActive = opening.id === selectedOpeningId;
                return (
                  <div key={opening.id} className={`opening-card ${isActive ? "active" : ""}`}>
                    <div className="opening-title-row">
                      <h3>{opening.name}</h3>
                      {isActive ? <span className="selected-pill">Selected</span> : null}
                    </div>

                    <p className="mainline-text">
                      <strong>Mainline:</strong> {opening.mainline.moves}
                    </p>

                    <p className="variations-title">Variations</p>
                    <ul>
                      {opening.variations.map((variation) => (
                        <li key={variation.id}>{variation.name}</li>
                      ))}
                    </ul>

                    <button onClick={() => onOpenOpening(opening.id)}>Open</button>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
