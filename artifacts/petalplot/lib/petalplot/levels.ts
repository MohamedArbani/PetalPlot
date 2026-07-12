import { LevelConfig } from './types';

// Each level's `zones` matrix was procedurally generated so that a valid
// solution is guaranteed to exist: exactly one flower per row, column,
// and colored zone, with no two flowers touching (including diagonally).

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'First Bloom',
    n: 5,
    zones: [
      [0, 0, 1, 1, 1],
      [2, 0, 1, 1, 1],
      [2, 3, 3, 4, 4],
      [2, 3, 3, 4, 4],
      [2, 2, 3, 4, 4],
    ],
  },
  {
    id: 2,
    name: 'Morning Dew',
    n: 5,
    zones: [
      [2, 0, 0, 1, 1],
      [2, 0, 0, 1, 1],
      [2, 2, 2, 3, 1],
      [4, 4, 4, 3, 3],
      [4, 4, 4, 3, 3],
    ],
  },
  {
    id: 3,
    name: 'Sunny Patch',
    n: 5,
    zones: [
      [0, 0, 0, 0, 1],
      [2, 2, 2, 0, 1],
      [4, 2, 2, 3, 1],
      [4, 2, 3, 3, 1],
      [4, 4, 3, 3, 1],
    ],
  },
  {
    id: 4,
    name: 'Herb Garden',
    n: 6,
    zones: [
      [1, 1, 1, 0, 0, 0],
      [1, 1, 1, 0, 0, 0],
      [3, 3, 2, 2, 2, 2],
      [3, 3, 5, 4, 4, 2],
      [3, 5, 5, 4, 4, 2],
      [3, 5, 5, 4, 4, 4],
    ],
  },
  {
    id: 5,
    name: 'Rose Bed',
    n: 6,
    zones: [
      [2, 1, 1, 1, 0, 0],
      [2, 2, 1, 1, 0, 0],
      [2, 2, 1, 1, 0, 0],
      [2, 2, 5, 3, 3, 3],
      [4, 4, 5, 3, 3, 3],
      [4, 4, 5, 5, 5, 5],
    ],
  },
  {
    id: 6,
    name: 'Wildflower Row',
    n: 6,
    zones: [
      [1, 1, 2, 2, 0, 0],
      [1, 1, 1, 2, 0, 0],
      [1, 1, 1, 2, 2, 0],
      [3, 3, 5, 2, 4, 4],
      [3, 3, 5, 4, 4, 4],
      [3, 5, 5, 5, 5, 4],
    ],
  },
  {
    id: 7,
    name: 'Greenhouse',
    n: 7,
    zones: [
      [2, 2, 2, 1, 1, 0, 0],
      [2, 2, 1, 1, 1, 0, 0],
      [2, 2, 3, 1, 1, 0, 0],
      [4, 4, 3, 3, 3, 5, 5],
      [4, 4, 3, 3, 3, 5, 5],
      [4, 4, 6, 6, 6, 5, 5],
      [4, 6, 6, 6, 6, 6, 5],
    ],
  },
  {
    id: 8,
    name: 'Botanical Maze',
    n: 7,
    zones: [
      [0, 0, 0, 1, 1, 2, 2],
      [0, 0, 0, 1, 1, 1, 2],
      [5, 3, 3, 1, 1, 1, 2],
      [5, 3, 3, 3, 2, 2, 2],
      [5, 3, 3, 3, 2, 4, 4],
      [5, 5, 6, 6, 4, 4, 4],
      [5, 6, 6, 6, 6, 4, 4],
    ],
  },
  {
    id: 9,
    name: 'Master Gardener',
    n: 7,
    zones: [
      [1, 1, 1, 1, 1, 0, 0],
      [2, 2, 1, 1, 1, 0, 0],
      [2, 2, 4, 4, 3, 0, 0],
      [2, 2, 4, 4, 3, 3, 5],
      [2, 4, 4, 4, 3, 5, 5],
      [6, 6, 6, 3, 3, 5, 5],
      [6, 6, 6, 6, 3, 5, 5],
    ],
  },
];

export function getLevelById(id: number): LevelConfig | undefined {
  return LEVELS.find((level) => level.id === id);
}
