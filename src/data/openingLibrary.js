const openingCache = new Map();
const openingModules = import.meta.glob("./openings-db/*.js");

export async function loadOpeningById(openingId) {
  if (!openingId) throw new Error("Missing opening id");
  if (openingCache.has(openingId)) return openingCache.get(openingId);

  const modulePath = `./openings-db/${openingId}.js`;
  const loader = openingModules[modulePath];
  if (!loader) throw new Error(`Opening module not found: ${openingId}`);
  const mod = await loader();
  const opening = mod.default;
  if (!opening) throw new Error(`Opening not found: ${openingId}`);

  openingCache.set(openingId, opening);
  return opening;
}
