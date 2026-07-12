import { CellState, LevelConfig, ValidationResult, cellKey } from './types';

/**
 * Validates the current grid state against a level's rules:
 * - Exactly 1 flower per colored zone
 * - Exactly 1 flower per row and per column
 * - No two flowers touch, including diagonally
 *
 * Returns the set of currently-violating flower cells and whether the
 * puzzle is fully and correctly solved.
 */
export function validateGrid(
  gridState: CellState[][],
  levelConfig: LevelConfig,
): ValidationResult {
  const { n, zones } = levelConfig;
  const flowers: Array<{ row: number; col: number }> = [];

  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (gridState[row]?.[col] === 'FLOWER') {
        flowers.push({ row, col });
      }
    }
  }

  const violatingCells = new Set<string>();
  const rowCounts = new Map<number, number>();
  const colCounts = new Map<number, number>();
  const zoneCounts = new Map<number, number>();

  for (const { row, col } of flowers) {
    rowCounts.set(row, (rowCounts.get(row) ?? 0) + 1);
    colCounts.set(col, (colCounts.get(col) ?? 0) + 1);
    const zoneId = zones[row]?.[col] ?? -1;
    zoneCounts.set(zoneId, (zoneCounts.get(zoneId) ?? 0) + 1);
  }

  for (let i = 0; i < flowers.length; i++) {
    for (let j = i + 1; j < flowers.length; j++) {
      const a = flowers[i]!;
      const b = flowers[j]!;
      const dRow = Math.abs(a.row - b.row);
      const dCol = Math.abs(a.col - b.col);
      if (dRow <= 1 && dCol <= 1) {
        violatingCells.add(cellKey(a.row, a.col));
        violatingCells.add(cellKey(b.row, b.col));
      }
    }
  }

  for (const { row, col } of flowers) {
    if ((rowCounts.get(row) ?? 0) > 1) violatingCells.add(cellKey(row, col));
    if ((colCounts.get(col) ?? 0) > 1) violatingCells.add(cellKey(row, col));
    const zoneId = zones[row]?.[col] ?? -1;
    if ((zoneCounts.get(zoneId) ?? 0) > 1) violatingCells.add(cellKey(row, col));
  }

  const isSolved = flowers.length === n && violatingCells.size === 0;

  return {
    violatingCells,
    flowerCount: flowers.length,
    isSolved,
  };
}

export function createEmptyGrid(n: number): CellState[][] {
  return Array.from({ length: n }, () => Array<CellState>(n).fill('EMPTY'));
}

export function cycleCellState(state: CellState): CellState {
  if (state === 'EMPTY') return 'BLOCKED';
  if (state === 'BLOCKED') return 'FLOWER';
  return 'EMPTY';
}
