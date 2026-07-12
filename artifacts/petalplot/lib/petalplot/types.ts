export type CellState = 'EMPTY' | 'BLOCKED' | 'FLOWER';

export interface LevelConfig {
  id: number;
  name: string;
  n: number;
  /** zones[row][col] = zoneId (0..n-1) */
  zones: number[][];
}

export interface ValidationResult {
  /** Set of "row,col" keys for flowers currently violating a rule */
  violatingCells: Set<string>;
  flowerCount: number;
  isSolved: boolean;
}

export interface LevelProgress {
  completedLevelIds: number[];
  unlockedLevelId: number;
}

export function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}
