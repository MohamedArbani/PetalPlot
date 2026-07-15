const XP_PER_LEVEL = 200;

export function xpForStars(stars: number): number {
  return 40 + stars * 30;
}

export function coinsForResult(stars: number, timeMs: number): number {
  const base = 15 + stars * 10;
  const speedBonus = timeMs < 60_000 ? 10 : 0;
  return base + speedBonus;
}

export function levelFromXp(totalXp: number): {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
} {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = totalXp % XP_PER_LEVEL;
  return { level, xpIntoLevel, xpForNextLevel: XP_PER_LEVEL };
}
