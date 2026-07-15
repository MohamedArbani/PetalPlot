import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
import { solveLevel } from '@/lib/petalplot/solver';
import { getThemeById } from '@/lib/petalplot/themes';
import { usePlayer } from '@/context/PlayerContext';
import { PuzzleGrid } from '@/components/PuzzleGrid';
import { RuleHeader } from '@/components/RuleHeader';
import { Mascot } from '@/components/Mascot';
import { Dialog } from '@/components/Dialog';
import { StarRating } from '@/components/HUD';

const HeartFilledIcon = require('@/assets/icons/png/HeartFilled.png');
const HeartBaseIcon = require('@/assets/icons/png/HeartBase.png');

const MAX_HEARTS = 3;

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const levelId = Number(id);
  const level = getLevelById(levelId);
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const player = usePlayer();
  const theme = getThemeById(player.equippedThemeId);

  const [grid, setGrid] = useState<CellState[][]>(() => createEmptyGrid(level?.n ?? 5));
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [hasWon, setHasWon] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [confirmRestartVisible, setConfirmRestartVisible] = useState(false);
  const [confirmHintVisible, setConfirmHintVisible] = useState(false);
  const [hintedCell, setHintedCell] = useState<{ row: number; col: number } | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [mistakesMade, setMistakesMade] = useState(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!level) return;
    setGrid(createEmptyGrid(level.n));
    setHearts(MAX_HEARTS);
    setHasWon(false);
    setHasLost(false);
    setHintedCell(null);
    setElapsedMs(0);
    setMistakesMade(false);
    startTimeRef.current = Date.now();
  }, [level?.id]);

  useEffect(() => {
    if (hasWon || hasLost) return;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 1000);
    return () => clearInterval(interval);
  }, [hasWon, hasLost, level?.id]);

  const validation = useMemo(() => {
    if (!level) return null;
    return validateGrid(grid, level);
  }, [grid, level]);

  const stars = mistakesMade ? (hearts >= 2 ? 2 : 1) : 3;

  const winBannerScale = useSharedValue(0);
  const loseBannerScale = useSharedValue(0);
  const heartShake = useSharedValue(0);

  useEffect(() => {
    if (validation?.isSolved && !hasWon) {
      setHasWon(true);
      player.recordLevelResult(levelId, {
        stars,
        timeMs: elapsedMs,
        isPerfect: !mistakesMade,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      winBannerScale.value = withDelay(150, withSpring(1, { damping: 11, stiffness: 140 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validation?.isSolved]);

  const winBannerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: winBannerScale.value }],
    opacity: winBannerScale.value,
  }));
  const loseBannerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: loseBannerScale.value }],
    opacity: loseBannerScale.value,
  }));
  const heartShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: heartShake.value }],
  }));

  const triggerLoss = useCallback(() => {
    setHasLost(true);
    player.spendLife();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    loseBannerScale.value = withDelay(150, withSpring(1, { damping: 11, stiffness: 140 }));
  }, [player]);

  const handleCellPress = useCallback(
    (row: number, col: number) => {
      if (!level || hasWon || hasLost) return;
      setHintedCell(null);

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
            setMistakesMade(true);
            setHearts((h) => {
              const remaining = Math.max(0, h - 1);
              if (remaining === 0) {
                heartShake.value = withSequence(
                  withTiming(-6, { duration: 60 }),
                  withTiming(6, { duration: 60 }),
                  withTiming(-4, { duration: 60 }),
                  withTiming(0, { duration: 60 }),
                );
                setTimeout(() => triggerLoss(), 260);
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
    [level, hasWon, hasLost, triggerLoss],
  );

  const resetBoard = useCallback(() => {
    if (!level) return;
    setGrid(createEmptyGrid(level.n));
    setHearts(MAX_HEARTS);
    setHasWon(false);
    setHasLost(false);
    setHintedCell(null);
    setMistakesMade(false);
    setElapsedMs(0);
    startTimeRef.current = Date.now();
    winBannerScale.value = 0;
    loseBannerScale.value = 0;
  }, [level]);

  const handleResetPress = useCallback(() => {
    Haptics.selectionAsync();
    setConfirmRestartVisible(true);
  }, []);

  const handleUseHint = useCallback(() => {
    if (!level) return;
    const solution = solveLevel(level);
    if (!solution) return;
    const unrevealed = solution.filter(
      (cell) => grid[cell.row]?.[cell.col] !== 'FLOWER',
    );
    const target = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    if (!target) return;
    if (!player.spendHint()) return;
    setHintedCell(target);
    Haptics.selectionAsync();
  }, [level, grid, player]);

  if (!level || !validation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Level not found.</Text>
      </SafeAreaView>
    );
  }

  const boardSize = Math.min(width - 40, 440);
  const nextLevel = LEVELS.find((l) => l.id === level.id + 1);
  const webTopInset = Platform.OS === 'web' ? 67 : insets.top;
  const canRetry = player.lives > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: webTopInset + 12, borderBottomColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        <Pressable testID="back-button" onPress={() => router.back()} style={styles.iconButton} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={[styles.levelName, { color: colors.foreground }]} numberOfLines={1}>
            {level.name}
          </Text>
          <Text style={[styles.timer, { color: colors.mutedForeground }]}>
            {formatTime(elapsedMs)} · {validation.flowerCount}/{level.n}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            testID="hint-button"
            onPress={() => setConfirmHintVisible(true)}
            style={styles.iconButton}
            hitSlop={10}
          >
            <Ionicons name="bulb-outline" size={22} color={colors.coinGold} />
          </Pressable>
          <Pressable testID="reset-button" onPress={handleResetPress} style={styles.iconButton} hitSlop={10}>
            <Ionicons name="refresh" size={22} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      <View style={styles.heartsRow}>
        <Animated.View style={[styles.hearts, heartShakeStyle]}>
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <Image
              key={i}
              source={i < hearts ? HeartFilledIcon : HeartBaseIcon}
              style={styles.heartIcon}
            />
          ))}
        </Animated.View>
        <Text style={[styles.hintCount, { color: colors.mutedForeground }]}>
          {player.hints} hints left
        </Text>
      </View>

      <View style={styles.ruleHeaderWrap}>
        <RuleHeader />
      </View>

      <View style={styles.boardWrap}>
        <PuzzleGrid
          n={level.n}
          zones={level.zones}
          zoneColors={theme.colors}
          grid={grid}
          violatingCells={validation.violatingCells}
          hintedCell={hintedCell}
          boardSize={boardSize}
          isLocked={hasWon || hasLost}
          onCellPress={handleCellPress}
        />
      </View>

      {hasWon && (
        <View style={styles.overlay} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.resultCard,
              winBannerStyle,
              {
                backgroundColor: colors.card,
                borderColor: colors.primary,
                marginBottom: Platform.OS === 'web' ? 34 : insets.bottom + 16,
              },
            ]}
          >
            <Mascot variant="success" size={110} />
            <Text style={[styles.resultTitle, { color: colors.cardForeground }]}>
              Bloom Complete!
            </Text>
            <Text style={[styles.resultSubtitle, { color: colors.mutedOnCard }]}>
              Solved in {formatTime(elapsedMs)}
            </Text>
            <StarRating stars={stars} />
            <View style={styles.resultActions}>
              <Pressable
                testID="back-to-levels-button"
                onPress={() => router.back()}
                style={[styles.resultButton, styles.resultButtonSecondary, { borderColor: colors.cardBorder }]}
              >
                <Text style={[styles.resultButtonLabel, { color: colors.cardForeground }]}>Levels</Text>
              </Pressable>
              {nextLevel && (
                <Pressable
                  testID="next-level-button"
                  onPress={() => router.replace(`/game/${nextLevel.id}`)}
                  style={[styles.resultButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.resultButtonLabel, { color: '#FFFFFF' }]}>Next bed</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </Pressable>
              )}
            </View>
          </Animated.View>
        </View>
      )}

      {hasLost && (
        <View style={styles.overlay} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.resultCard,
              loseBannerStyle,
              {
                backgroundColor: colors.card,
                borderColor: colors.destructive,
                marginBottom: Platform.OS === 'web' ? 34 : insets.bottom + 16,
              },
            ]}
          >
            <Mascot variant="sad" size={110} />
            <Text style={[styles.resultTitle, { color: colors.cardForeground }]}>
              Out of Lives!
            </Text>
            <Text style={[styles.resultSubtitle, { color: colors.mutedOnCard }]}>
              {canRetry ? "Don't give up, try again." : 'Come back once your lives refill.'}
            </Text>
            <View style={styles.resultActions}>
              <Pressable
                testID="back-to-levels-from-lose-button"
                onPress={() => router.back()}
                style={[styles.resultButton, styles.resultButtonSecondary, { borderColor: colors.cardBorder }]}
              >
                <Text style={[styles.resultButtonLabel, { color: colors.cardForeground }]}>Back to Levels</Text>
              </Pressable>
              <Pressable
                testID="try-again-button"
                disabled={!canRetry}
                onPress={resetBoard}
                style={[
                  styles.resultButton,
                  { backgroundColor: canRetry ? colors.destructive : colors.muted },
                ]}
              >
                <Text
                  style={[
                    styles.resultButtonLabel,
                    { color: canRetry ? '#FFFFFF' : colors.mutedOnCard },
                  ]}
                >
                  Try Again
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      )}

      <Dialog
        visible={confirmRestartVisible}
        title="Restart this level?"
        description="Your current progress on this bed will be cleared."
        mascotVariant="thinking"
        actions={[
          { label: 'Cancel', onPress: () => setConfirmRestartVisible(false), variant: 'secondary' },
          {
            label: 'Restart',
            onPress: () => {
              setConfirmRestartVisible(false);
              resetBoard();
            },
          },
        ]}
        onRequestClose={() => setConfirmRestartVisible(false)}
      />

      <Dialog
        visible={confirmHintVisible}
        title="Use a hint?"
        description={
          player.hints > 0
            ? 'Reveals a possible flower cell.'
            : 'You have no hints left. Visit the Store to get more.'
        }
        mascotVariant="thinking"
        actions={[
          { label: 'Cancel', onPress: () => setConfirmHintVisible(false), variant: 'secondary' },
          {
            label: player.hints > 0 ? 'Use 1 Hint' : 'Go to Store',
            onPress: () => {
              setConfirmHintVisible(false);
              if (player.hints > 0) {
                handleUseHint();
              } else {
                router.push('/store');
              }
            },
          },
        ]}
        onRequestClose={() => setConfirmHintVisible(false)}
      />
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
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
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
  timer: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  heartsRow: {
    alignItems: 'center',
    paddingTop: 10,
    gap: 4,
  },
  hearts: {
    flexDirection: 'row',
  },
  heartIcon: {
    width: 20,
    height: 20,
    marginHorizontal: 2,
  },
  hintCount: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
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
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  resultCard: {
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
  resultTitle: {
    fontSize: 19,
    fontFamily: 'Inter_700Bold',
    marginTop: 4,
  },
  resultSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 10,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  resultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
  },
  resultButtonSecondary: {
    borderWidth: 1.5,
  },
  resultButtonLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
});
