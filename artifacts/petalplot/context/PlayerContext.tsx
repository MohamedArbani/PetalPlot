import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LEVELS } from '@/lib/petalplot/levels';
import { coinsForResult, levelFromXp, xpForStars } from '@/lib/petalplot/xp';
import { getThemeById } from '@/lib/petalplot/themes';

const STORAGE_KEY = 'petalplot_player_v1';
const MAX_LIVES = 5;
const LIFE_REGEN_MS = 20 * 60 * 1000; // 20 minutes per life
const STARTING_HINTS = 3;

interface PersistedState {
  coins: number;
  totalXp: number;
  lives: number;
  livesUpdatedAt: number;
  completedLevelIds: number[];
  perfectLevelIds: number[];
  bestTimesMs: Record<number, number>;
  ownedThemeIds: string[];
  equippedThemeId: string;
  hints: number;
  hasSeenTutorial: boolean;
  lastDailyClaimDate: string | null;
}

function defaultState(): PersistedState {
  return {
    coins: 60,
    totalXp: 0,
    lives: MAX_LIVES,
    livesUpdatedAt: 0,
    completedLevelIds: [],
    perfectLevelIds: [],
    bestTimesMs: {},
    ownedThemeIds: ['classic'],
    equippedThemeId: 'classic',
    hints: STARTING_HINTS,
    hasSeenTutorial: false,
    lastDailyClaimDate: null,
  };
}

const DAILY_BONUS_COINS = 25;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

interface LevelResult {
  stars: number;
  timeMs: number;
  isPerfect: boolean;
}

interface PlayerContextValue {
  isLoaded: boolean;
  coins: number;
  hints: number;
  lives: number;
  maxLives: number;
  msUntilNextLife: number;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  completedLevelIds: number[];
  perfectLevelIds: number[];
  bestTimesMs: Record<number, number>;
  ownedThemeIds: string[];
  equippedThemeId: string;
  hasSeenTutorial: boolean;
  highestUnlockedLevelId: number;
  gardenProgress: number;
  canClaimDaily: boolean;
  claimDailyBonus: () => void;
  isLevelUnlocked: (levelId: number) => boolean;
  isLevelCompleted: (levelId: number) => boolean;
  recordLevelResult: (levelId: number, result: LevelResult) => void;
  spendLife: () => boolean;
  buyTheme: (themeId: string) => boolean;
  equipTheme: (themeId: string) => void;
  spendHint: () => boolean;
  buyHints: (count: number, cost: number) => boolean;
  buyLivesRefill: (cost: number) => boolean;
  markTutorialSeen: () => void;
  resetProgress: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

function computeLives(state: PersistedState): {
  lives: number;
  livesUpdatedAt: number;
} {
  if (state.lives >= MAX_LIVES) return state;
  const now = Date.now();
  const elapsed = now - state.livesUpdatedAt;
  const regenerated = Math.floor(elapsed / LIFE_REGEN_MS);
  if (regenerated <= 0) return state;
  const lives = Math.min(MAX_LIVES, state.lives + regenerated);
  const livesUpdatedAt =
    lives >= MAX_LIVES ? now : state.livesUpdatedAt + regenerated * LIFE_REGEN_MS;
  return { lives, livesUpdatedAt };
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(defaultState());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!isMounted) return;
        if (raw) {
          const parsed = { ...defaultState(), ...JSON.parse(raw) } as PersistedState;
          const { lives, livesUpdatedAt } = computeLives(parsed);
          setState({ ...parsed, lives, livesUpdatedAt });
        } else {
          setState((prev) => ({ ...prev, livesUpdatedAt: Date.now() }));
        }
        setIsLoaded(true);
      })
      .catch(() => setIsLoaded(true));
    return () => {
      isMounted = false;
    };
  }, []);

  const persist = useCallback((next: PersistedState) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const update = useCallback(
    (fn: (prev: PersistedState) => PersistedState) => {
      setState((prev) => {
        const next = fn(prev);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  // Periodically refresh regenerated lives while the app is open.
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        const { lives, livesUpdatedAt } = computeLives(prev);
        if (lives === prev.lives) return prev;
        const next = { ...prev, lives, livesUpdatedAt };
        persist(next);
        return next;
      });
    }, 15_000);
    return () => clearInterval(interval);
  }, [persist]);

  const recordLevelResult = useCallback(
    (levelId: number, result: LevelResult) => {
      update((prev) => {
        const coins = prev.coins + coinsForResult(result.stars, result.timeMs);
        const totalXp = prev.totalXp + xpForStars(result.stars);
        const completedLevelIds = prev.completedLevelIds.includes(levelId)
          ? prev.completedLevelIds
          : [...prev.completedLevelIds, levelId];
        const perfectLevelIds =
          result.isPerfect && !prev.perfectLevelIds.includes(levelId)
            ? [...prev.perfectLevelIds, levelId]
            : prev.perfectLevelIds;
        const prevBest = prev.bestTimesMs[levelId];
        const bestTimesMs =
          prevBest === undefined || result.timeMs < prevBest
            ? { ...prev.bestTimesMs, [levelId]: result.timeMs }
            : prev.bestTimesMs;
        return { ...prev, coins, totalXp, completedLevelIds, perfectLevelIds, bestTimesMs };
      });
    },
    [update],
  );

  const spendLife = useCallback((): boolean => {
    let didSpend = false;
    update((prev) => {
      const { lives, livesUpdatedAt } = computeLives(prev);
      if (lives <= 0) return { ...prev, lives, livesUpdatedAt };
      didSpend = true;
      return {
        ...prev,
        lives: lives - 1,
        livesUpdatedAt: lives - 1 < MAX_LIVES ? livesUpdatedAt || Date.now() : livesUpdatedAt,
      };
    });
    return didSpend;
  }, [update]);

  const buyTheme = useCallback(
    (themeId: string): boolean => {
      const theme = getThemeById(themeId);
      let success = false;
      update((prev) => {
        if (prev.ownedThemeIds.includes(themeId)) {
          success = true;
          return prev;
        }
        if (prev.coins < theme.cost) return prev;
        success = true;
        return {
          ...prev,
          coins: prev.coins - theme.cost,
          ownedThemeIds: [...prev.ownedThemeIds, themeId],
        };
      });
      return success;
    },
    [update],
  );

  const equipTheme = useCallback(
    (themeId: string) => {
      update((prev) =>
        prev.ownedThemeIds.includes(themeId)
          ? { ...prev, equippedThemeId: themeId }
          : prev,
      );
    },
    [update],
  );

  const spendHint = useCallback((): boolean => {
    let success = false;
    update((prev) => {
      if (prev.hints <= 0) return prev;
      success = true;
      return { ...prev, hints: prev.hints - 1 };
    });
    return success;
  }, [update]);

  const buyHints = useCallback(
    (count: number, cost: number): boolean => {
      let success = false;
      update((prev) => {
        if (prev.coins < cost) return prev;
        success = true;
        return { ...prev, coins: prev.coins - cost, hints: prev.hints + count };
      });
      return success;
    },
    [update],
  );

  const buyLivesRefill = useCallback(
    (cost: number): boolean => {
      let success = false;
      update((prev) => {
        if (prev.coins < cost || prev.lives >= MAX_LIVES) return prev;
        success = true;
        return { ...prev, coins: prev.coins - cost, lives: MAX_LIVES, livesUpdatedAt: Date.now() };
      });
      return success;
    },
    [update],
  );

  const claimDailyBonus = useCallback(() => {
    update((prev) => {
      if (prev.lastDailyClaimDate === todayKey()) return prev;
      return {
        ...prev,
        coins: prev.coins + DAILY_BONUS_COINS,
        lastDailyClaimDate: todayKey(),
      };
    });
  }, [update]);

  const markTutorialSeen = useCallback(() => {
    update((prev) => ({ ...prev, hasSeenTutorial: true }));
  }, [update]);

  const resetProgress = useCallback(() => {
    const next = { ...defaultState(), livesUpdatedAt: Date.now() };
    setState(next);
    persist(next);
  }, [persist]);

  const highestUnlockedLevelId = useMemo(() => {
    let unlocked = LEVELS[0]?.id ?? 1;
    for (const lvl of LEVELS) {
      if (state.completedLevelIds.includes(lvl.id)) {
        const nextLevel = LEVELS.find((l) => l.id === lvl.id + 1);
        if (nextLevel) unlocked = nextLevel.id;
      }
    }
    return unlocked;
  }, [state.completedLevelIds]);

  const { lives, livesUpdatedAt } = computeLives(state);
  const msUntilNextLife =
    lives >= MAX_LIVES ? 0 : Math.max(0, LIFE_REGEN_MS - (Date.now() - livesUpdatedAt));
  const { level, xpIntoLevel, xpForNextLevel } = levelFromXp(state.totalXp);

  const value = useMemo<PlayerContextValue>(
    () => ({
      isLoaded,
      coins: state.coins,
      hints: state.hints,
      lives,
      maxLives: MAX_LIVES,
      msUntilNextLife,
      level,
      xpIntoLevel,
      xpForNextLevel,
      completedLevelIds: state.completedLevelIds,
      perfectLevelIds: state.perfectLevelIds,
      bestTimesMs: state.bestTimesMs,
      ownedThemeIds: state.ownedThemeIds,
      equippedThemeId: state.equippedThemeId,
      hasSeenTutorial: state.hasSeenTutorial,
      highestUnlockedLevelId,
      gardenProgress: state.completedLevelIds.length,
      canClaimDaily: state.lastDailyClaimDate !== todayKey(),
      isLevelUnlocked: (levelId: number) => levelId <= highestUnlockedLevelId,
      isLevelCompleted: (levelId: number) => state.completedLevelIds.includes(levelId),
      recordLevelResult,
      spendLife,
      buyTheme,
      equipTheme,
      spendHint,
      buyHints,
      buyLivesRefill,
      claimDailyBonus,
      markTutorialSeen,
      resetProgress,
    }),
    [
      isLoaded,
      state,
      lives,
      msUntilNextLife,
      level,
      xpIntoLevel,
      xpForNextLevel,
      highestUnlockedLevelId,
      recordLevelResult,
      spendLife,
      buyTheme,
      equipTheme,
      spendHint,
      buyHints,
      buyLivesRefill,
      claimDailyBonus,
      markTutorialSeen,
      resetProgress,
    ],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within a PlayerProvider');
  return ctx;
}
