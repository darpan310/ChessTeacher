import { useMemo, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { openingLineRoots, openingLines } from "../lib/openingTraining";

export function OpeningDetail({
  opening,
  selectedLineId,
  onBack,
  onSelectLine,
  onStartLine,
}) {
  const lines = openingLines(opening);
  const roots = openingLineRoots(opening);
  const selectedLine = lines.find((line) => line.id === selectedLineId) ?? lines[0];
  const [expandedById, setExpandedById] = useState({});
  const previewFen = useMemo(() => {
    if (!selectedLine?.pgn) return new Chess().fen();
    const chess = new Chess();
    try {
      chess.loadPgn(selectedLine.pgn);
      return chess.fen();
    } catch {
      return new Chess().fen();
    }
  }, [selectedLine]);
  const previewBreadcrumb = useMemo(() => {
    const findPath = (nodes, targetId, trail = []) => {
      for (const node of nodes ?? []) {
        const nextTrail = [...trail, node.name];
        if (node.id === targetId) return nextTrail;
        const childPath = findPath(node.children ?? [], targetId, nextTrail);
        if (childPath.length) return childPath;
      }
      return [];
    };
    return findPath(roots, selectedLine?.id);
  }, [roots, selectedLine]);

  const isExpanded = (lineId) => expandedById[lineId] ?? false;
  const toggleExpanded = (lineId) => {
    setExpandedById((prev) => ({
      ...prev,
      [lineId]: !(prev[lineId] ?? false),
    }));
  };

  return (
    <section className="opening-detail-layout">
      <button className="back-button" onClick={onBack}>
        ← Back to Dashboard
      </button>

      <article className="opening-header-card opening-header-full">
        <h2>{opening.name} · Choose Line</h2>
        <p>{opening.hint}</p>
      </article>

      <div className="opening-detail-panels">
        <main className="opening-detail-main">
        <article className="line-group-card">
          <h3>Line Tree</h3>
          <div className="line-tree-grid">
            {roots.map((variation) => (
              <div key={variation.id} className="line-tree-node">
                <div
                  className={`line-card ${variation.id === selectedLineId ? "active" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectLine(variation.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectLine(variation.id);
                    }
                  }}
                >
                  <div>
                    <strong className="line-title-row">
                      {(variation.children ?? []).length > 0 ? (
                        <button
                          className="toggle-btn inline-toggle"
                          aria-label={isExpanded(variation.id) ? "Collapse variations" : "Expand variations"}
                          title={isExpanded(variation.id) ? "Collapse variations" : "Expand variations"}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleExpanded(variation.id);
                          }}
                        >
                          {isExpanded(variation.id) ? "▼" : "▶"}
                        </button>
                      ) : (
                        <span className="inline-toggle-spacer" />
                      )}
                      <span>{variation.name}</span>
                    </strong>
                    <p>{variation.moves}</p>
                    <small>{variation.summary}</small>
                  </div>
                  <div className="line-actions">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onStartLine(variation.id);
                      }}
                    >
                      Start Learn
                    </button>
                  </div>
                </div>

                {(variation.children ?? []).length > 0 && isExpanded(variation.id) ? (
                  <div className="line-children">
                    {variation.children.map((child) => (
                      <div
                        key={child.id}
                        className={`line-card ${child.id === selectedLineId ? "active" : ""}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelectLine(child.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onSelectLine(child.id);
                          }
                        }}
                      >
                        <div>
                          <strong>↳ {child.name}</strong>
                          <p>{child.moves}</p>
                          <small>{child.summary}</small>
                        </div>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            onStartLine(child.id);
                          }}
                        >
                          Start Learn
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </article>
        </main>

        <aside className="practice-panel preview-panel">
          <div className="coach-card opening-preview-head">
            <p className="preview-kicker">Line Preview</p>
            <p className="preview-line-name">{[opening.name, ...previewBreadcrumb].filter(Boolean).join(" / ")}</p>
          </div>
          <div className="board-wrap preview-board-wrap">
            <Chessboard
              options={{
                id: "line-preview-board",
                position: previewFen,
                arePiecesDraggable: false,
                darkSquareStyle: { backgroundColor: "#b58863" },
                lightSquareStyle: { backgroundColor: "#f0d9b5" },
                boardStyle: {
                  borderRadius: "10px",
                  overflow: "hidden",
                  backgroundColor: "#b58863",
                  boxShadow: "0 12px 28px rgba(0, 0, 0, 0.2)",
                },
                showNotation: true,
              }}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}
