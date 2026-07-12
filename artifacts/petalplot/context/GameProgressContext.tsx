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

const STORAGE_KEY = 'petalplot_progress_v1';

interface GameProgressState {
  completedLevelIds: number[];
  isLoaded: boolean;
}

interface GameProgressContextValue extends GameProgressState {
  highestUnlockedLevelId: number;
  isLevelUnlocked: (levelId: number) => boolean;
  isLevelCompleted: (levelId: number) => boolean;
  completeLevel: (levelId: number) => void;
  resetProgress: () => void;
}

const GameProgressContext = createContext<GameProgressContextValue | null>(
  null,
);

export function GameProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<GameProgressState>({
    completedLevelIds: [],
    isLoaded: false,
  });

  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!isMounted) return;
        if (raw) {
          const parsed = JSON.parse(raw) as { completedLevelIds: number[] };
          setState({
            completedLevelIds: parsed.completedLevelIds ?? [],
            isLoaded: true,
          });
        } else {
          setState((prev) => ({ ...prev, isLoaded: true }));
        }
      })
      .catch(() => {
        if (isMounted) setState((prev) => ({ ...prev, isLoaded: true }));
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const persist = useCallback((completedLevelIds: number[]) => {
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ completedLevelIds }),
    ).catch(() => {
      // Best-effort persistence; ignore write failures.
    });
  }, []);

  const completeLevel = useCallback(
    (levelId: number) => {
      setState((prev) => {
        if (prev.completedLevelIds.includes(levelId)) return prev;
        const next = [...prev.completedLevelIds, levelId];
        persist(next);
        return { ...prev, completedLevelIds: next };
      });
    },
    [persist],
  );

  const resetProgress = useCallback(() => {
    setState((prev) => ({ ...prev, completedLevelIds: [] }));
    persist([]);
  }, [persist]);

  const highestUnlockedLevelId = useMemo(() => {
    // The first level is always unlocked. Each subsequent level unlocks
    // once the previous one is completed.
    let unlocked = LEVELS[0]?.id ?? 1;
    for (const level of LEVELS) {
      if (state.completedLevelIds.includes(level.id)) {
        const nextLevel = LEVELS.find((l) => l.id === level.id + 1);
        if (nextLevel) unlocked = nextLevel.id;
      }
    }
    return unlocked;
  }, [state.completedLevelIds]);

  const isLevelUnlocked = useCallback(
    (levelId: number) => levelId <= highestUnlockedLevelId,
    [highestUnlockedLevelId],
  );

  const isLevelCompleted = useCallback(
    (levelId: number) => state.completedLevelIds.includes(levelId),
    [state.completedLevelIds],
  );

  const value = useMemo<GameProgressContextValue>(
    () => ({
      ...state,
      highestUnlockedLevelId,
      isLevelUnlocked,
      isLevelCompleted,
      completeLevel,
      resetProgress,
    }),
    [
      state,
      highestUnlockedLevelId,
      isLevelUnlocked,
      isLevelCompleted,
      completeLevel,
      resetProgress,
    ],
  );

  return (
    <GameProgressContext.Provider value={value}>
      {children}
    </GameProgressContext.Provider>
  );
}

export function useGameProgress(): GameProgressContextValue {
  const ctx = useContext(GameProgressContext);
  if (!ctx) {
    throw new Error(
      'useGameProgress must be used within a GameProgressProvider',
    );
  }
  return ctx;
}
