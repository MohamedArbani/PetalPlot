export interface GardenDecoration {
  id: string;
  name: string;
  /** Number of completed levels required to unlock this decoration. */
  unlockAt: number;
  icon: 'flower-tulip' | 'fountain' | 'arch' | 'lightbulb-on' | 'trophy';
}

export const DECORATIONS: GardenDecoration[] = [
  { id: 'sprout', name: 'First Sprout', unlockAt: 1, icon: 'flower-tulip' },
  { id: 'fountain', name: 'Stone Fountain', unlockAt: 3, icon: 'fountain' },
  { id: 'arch', name: 'Petal Grove Arch', unlockAt: 5, icon: 'arch' },
  { id: 'lanterns', name: 'Garden Lanterns', unlockAt: 7, icon: 'lightbulb-on' },
  { id: 'trophy', name: "Gardener's Trophy", unlockAt: 9, icon: 'trophy' },
];
