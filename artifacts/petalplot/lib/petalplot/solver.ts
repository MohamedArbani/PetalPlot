import { LevelConfig } from './types';

// Finds *a* valid flower placement (row=1, col=1, zone=1, no 8-way touching)
// for a level's zone layout, used only to power the in-game Hint feature.
// Results are memoized since the same level is solved repeatedly.

const solutionCache = new Map<number, Array<{ row: number; col: number }>>();

export function solveLevel(
  level: LevelConfig,
): Array<{ row: number; col: number }> | null {
  const cached = solutionCache.get(level.id);
  if (cached) return cached;

  const { n, zones } = level;
  const placed: Array<{ row: number; col: number }> = [];
  const usedCols = new Set<number>();
  const usedZones = new Set<number>();

  const isSafe = (row: number, col: number) => {
    const zoneId = zones[row]?.[col] ?? -1;
    if (usedCols.has(col) || usedZones.has(zoneId)) return false;
    for (const p of placed) {
      if (Math.abs(p.row - row) <= 1 && Math.abs(p.col - col) <= 1) {
        return false;
      }
    }
    return true;
  };

  const backtrack = (row: number): boolean => {
    if (row === n) return true;
    for (let col = 0; col < n; col++) {
      if (!isSafe(row, col)) continue;
      const zoneId = zones[row]?.[col] ?? -1;
      placed.push({ row, col });
      usedCols.add(col);
      usedZones.add(zoneId);

      if (backtrack(row + 1)) return true;

      placed.pop();
      usedCols.delete(col);
      usedZones.delete(zoneId);
    }
    return false;
  };

  if (backtrack(0)) {
    solutionCache.set(level.id, [...placed]);
    return placed;
  }
  return null;
}
