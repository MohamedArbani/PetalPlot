import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { usePlayer } from '@/context/PlayerContext';
import { LEVELS } from '@/lib/petalplot/levels';
import { LevelNode } from '@/components/LevelNode';
import { Dialog } from '@/components/Dialog';
import { CoinPill, LivesPill } from '@/components/HUD';

export default function LevelsScreen() {
  const colors = useColors();
  const router = useRouter();
  const player = usePlayer();
  const [lockedNoticeVisible, setLockedNoticeVisible] = useState(false);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Blooming Path</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {player.completedLevelIds.length} / {LEVELS.length} beds cleared
          </Text>
        </View>
        <View style={styles.topBarRight}>
          <LivesPill lives={player.lives} maxLives={player.maxLives} />
          <CoinPill amount={player.coins} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {LEVELS.map((level, index) => (
          <LevelNode
            key={level.id}
            level={level}
            isUnlocked={player.isLevelUnlocked(level.id)}
            isCompleted={player.isLevelCompleted(level.id)}
            stars={player.perfectLevelIds.includes(level.id) ? 3 : player.isLevelCompleted(level.id) ? 2 : 0}
            align={index % 2 === 0 ? 'flex-start' : 'flex-end'}
            onPress={() => router.push(`/game/${level.id}`)}
            onLockedPress={() => setLockedNoticeVisible(true)}
          />
        ))}
      </ScrollView>

      <Dialog
        visible={lockedNoticeVisible}
        title="Level Locked"
        description="Complete the previous bed to unlock this one."
        mascotVariant="thinking"
        actions={[{ label: 'Got it', onPress: () => setLockedNoticeVisible(false) }]}
        onRequestClose={() => setLockedNoticeVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 60 : 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginTop: 2,
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
});
