import { LEVELS } from './levels';

export interface PlayerStats {
  completedLevelIds: number[];
  perfectLevelIds: number[];
  bestTimesMs: Record<number, number>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: 'flower' | 'grid' | 'timer-outline' | 'trophy' | 'ribbon';
  target: number;
  getProgress: (stats: PlayerStats) => number;
}

const FAST_TIME_MS = 45_000;

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-bloom',
    name: 'First Bloom',
    description: 'Solve your first puzzle.',
    icon: 'flower',
    target: 1,
    getProgress: (s) => Math.min(1, s.completedLevelIds.length),
  },
  {
    id: 'perfect-row',
    name: 'Perfect Row',
    description: 'Complete a puzzle without any mistakes.',
    icon: 'grid',
    target: 3,
    getProgress: (s) => Math.min(3, s.perfectLevelIds.length),
  },
  {
    id: 'speedy-gardener',
    name: 'Speedy Gardener',
    description: 'Solve any puzzle in under 45 seconds.',
    icon: 'timer-outline',
    target: 1,
    getProgress: (s) =>
      Object.values(s.bestTimesMs).some((t) => t < FAST_TIME_MS) ? 1 : 0,
  },
  {
    id: 'master-gardener',
    name: 'Master Gardener',
    description: `Solve ${Math.ceil(LEVELS.length / 2)} puzzles.`,
    icon: 'trophy',
    target: Math.ceil(LEVELS.length / 2),
    getProgress: (s) => Math.min(Math.ceil(LEVELS.length / 2), s.completedLevelIds.length),
  },
  {
    id: 'bloom-legend',
    name: 'Bloom Legend',
    description: 'Solve every puzzle in the garden.',
    icon: 'ribbon',
    target: LEVELS.length,
    getProgress: (s) => Math.min(LEVELS.length, s.completedLevelIds.length),
  },
];
