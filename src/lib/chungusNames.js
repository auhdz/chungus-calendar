/** Next "Chungus N" not already taken by another participant (by display name pattern). */
export function getNextChungusPlaceholder(placements, currentUserId) {
  const used = new Set();
  const re = /^chungus\s*(\d+)\s*$/i;
  for (const p of placements || []) {
    if (p.userId === currentUserId) continue;
    const raw = p.userName?.trim();
    if (!raw) continue;
    const m = raw.match(re);
    if (m) used.add(parseInt(m[1], 10));
  }
  let n = 1;
  while (used.has(n)) n += 1;
  return `Chungus ${n}`;
}
