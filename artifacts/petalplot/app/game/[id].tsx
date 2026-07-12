import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import { getLevelById, LEVELS } from '@/lib/petalplot/levels';
import { CellState } from '@/lib/petalplot/types';
import { createEmptyGrid, cycleCellState, validateGrid } from '@/lib/petalplot/gameLogic';
import { useGameProgress } from '@/context/GameProgressContext';
import { PuzzleGrid } from '@/components/PuzzleGrid';
import { RuleHeader } from '@/components/RuleHeader';

const MAX_HEARTS = 3;

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const levelId = Number(id);
  const level = getLevelById(levelId);
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { completeLevel, isLevelCompleted } = useGameProgress();

  const [grid, setGrid] = useState<CellState[][]>(() =>
    createEmptyGrid(level?.n ?? 5),
  );
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [hasWon, setHasWon] = useState(false);
  const previousViolationsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!level) return;
    setGrid(createEmptyGrid(level.n));
    setHearts(MAX_HEARTS);
    setHasWon(false);
    previousViolationsRef.current = new Set();
  }, [level?.id]);

  const validation = useMemo(() => {
    if (!level) return null;
    return validateGrid(grid, level);
  }, [grid, level]);

  const winBannerScale = useSharedValue(0);
  const heartShake = useSharedValue(0);

  useEffect(() => {
    if (validation?.isSolved && !hasWon) {
      setHasWon(true);
      completeLevel(levelId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      winBannerScale.value = withDelay(
        150,
        withSpring(1, { damping: 11, stiffness: 140 }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validation?.isSolved]);

  const winBannerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: winBannerScale.value }],
    opacity: winBannerScale.value,
  }));

  const heartShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: heartShake.value }],
  }));

  const handleCellPress = useCallback(
    (row: number, col: number) => {
      if (!level || hasWon) return;

      setGrid((prevGrid) => {
        const current = prevGrid[row]?.[col] ?? 'EMPTY';
        const next = cycleCellState(current);
        const nextGrid = prevGrid.map((r) => [...r]);
        nextGrid[row]![col] = next;

        if (next === 'FLOWER') {
          const result = validateGrid(nextGrid, level);
          const key = `${row},${col}`;
          if (result.violatingCells.has(key)) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setHearts((h) => {
              const remaining = Math.max(0, h - 1);
              if (remaining === 0) {
                heartShake.value = withSequence(
                  withTiming(-6, { duration: 60 }),
                  withTiming(6, { duration: 60 }),
                  withTiming(-4, { duration: 60 }),
                  withTiming(0, { duration: 60 }),
                );
                // Gently clear flowers (keep blocked marks) and refill hearts.
                setTimeout(() => {
                  setGrid((g) =>
                    g.map((r) =>
                      r.map((c) => (c === 'FLOWER' ? 'BLOCKED' : c)),
                    ),
                  );
                  setHearts(MAX_HEARTS);
                }, 260);
              }
              return remaining;
            });
          } else {
            Haptics.selectionAsync();
          }
        } else {
          Haptics.selectionAsync();
        }

        return nextGrid;
      });
    },
    [level, hasWon],
  );

  const handleReset = useCallback(() => {
    if (!level) return;
    Haptics.selectionAsync();
    setGrid(createEmptyGrid(level.n));
    setHearts(MAX_HEARTS);
    setHasWon(false);
    winBannerScale.value = 0;
  }, [level]);

  if (!level || !validation) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Text style={{ color: colors.foreground }}>Level not found.</Text>
      </SafeAreaView>
    );
  }

  const boardSize = Math.min(width - 40, 440);
  const nextLevel = LEVELS.find((l) => l.id === level.id + 1);
  const webTopInset = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: webTopInset + 12,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Pressable
          testID="back-button"
          onPress={() => router.back()}
          style={styles.iconButton}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text
            style={[styles.levelName, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {level.name}
          </Text>
          <View style={styles.flowerCounterRow}>
            <MaterialCommunityIcons
              name="flower"
              size={13}
              color={colors.accent}
            />
            <Text
              style={[styles.flowerCounter, { color: colors.mutedForeground }]}
            >
              {validation.flowerCount} / {level.n}
            </Text>
          </View>
        </View>

        <Pressable
          testID="reset-button"
          onPress={handleReset}
          style={styles.iconButton}
          hitSlop={10}
        >
          <Ionicons name="refresh" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      <View style={styles.heartsRow}>
        <Animated.View style={[styles.hearts, heartShakeStyle]}>
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <Ionicons
              key={i}
              name={i < hearts ? 'heart' : 'heart-outline'}
              size={18}
              color={i < hearts ? colors.heartFilled : colors.heartEmpty}
              style={styles.heartIcon}
            />
          ))}
        </Animated.View>
      </View>

      <View style={styles.ruleHeaderWrap}>
        <RuleHeader />
      </View>

      <View style={styles.boardWrap}>
        <PuzzleGrid
          n={level.n}
          zones={level.zones}
          grid={grid}
          violatingCells={validation.violatingCells}
          boardSize={boardSize}
          isLocked={hasWon}
          onCellPress={handleCellPress}
        />
      </View>

      {hasWon && (
        <View style={styles.winOverlay} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.winCard,
              winBannerStyle,
              {
                backgroundColor: colors.card,
                borderColor: colors.primary,
                marginBottom: Platform.OS === 'web' ? 34 : insets.bottom + 16,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="flower-tulip"
              size={34}
              color={colors.primary}
            />
            <Text style={[styles.winTitle, { color: colors.foreground }]}>
              Bed cleared!
            </Text>
            <Text style={[styles.winSubtitle, { color: colors.mutedForeground }]}>
              Every flower found its perfect spot.
            </Text>
            <View style={styles.winActions}>
              <Pressable
                testID="back-to-levels-button"
                onPress={() => router.back()}
                style={[
                  styles.winButton,
                  styles.winButtonSecondary,
                  { borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.winButtonLabel,
                    { color: colors.secondaryForeground },
                  ]}
                >
                  Levels
                </Text>
              </Pressable>
              {nextLevel && (
                <Pressable
                  testID="next-level-button"
                  onPress={() => router.replace(`/game/${nextLevel.id}`)}
                  style={[
                    styles.winButton,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.winButtonLabel,
                      { color: colors.primaryForeground },
                    ]}
                  >
                    Next bed
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={colors.primaryForeground}
                  />
                </Pressable>
              )}
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  levelName: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
  },
  flowerCounterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flowerCounter: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  heartsRow: {
    alignItems: 'center',
    paddingTop: 10,
  },
  hearts: {
    flexDirection: 'row',
  },
  heartIcon: {
    marginHorizontal: 2,
  },
  ruleHeaderWrap: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  boardWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  winOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  winCard: {
    width: '86%',
    borderRadius: 24,
    borderWidth: 1.5,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  winTitle: {
    fontSize: 19,
    fontFamily: 'Inter_700Bold',
    marginTop: 6,
  },
  winSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 12,
  },
  winActions: {
    flexDirection: 'row',
    gap: 10,
  },
  winButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 14,
  },
  winButtonSecondary: {
    borderWidth: 1.5,
  },
  winButtonLabel: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});
