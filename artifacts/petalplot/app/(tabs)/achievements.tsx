import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { usePlayer } from '@/context/PlayerContext';
import { ACHIEVEMENTS } from '@/lib/petalplot/achievements';

export default function AchievementsScreen() {
  const colors = useColors();
  const player = usePlayer();

  const stats = {
    completedLevelIds: player.completedLevelIds,
    perfectLevelIds: player.perfectLevelIds,
    bestTimesMs: player.bestTimesMs,
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Achievements</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Milestones from your time in the garden.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {ACHIEVEMENTS.map((achievement) => {
          const progress = achievement.getProgress(stats);
          const isComplete = progress >= achievement.target;
          const pct = Math.min(1, progress / achievement.target);
          return (
            <View
              key={achievement.id}
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: isComplete ? colors.primary : colors.muted },
                ]}
              >
                <Ionicons
                  name={isComplete ? 'checkmark' : (achievement.icon as any)}
                  size={22}
                  color={isComplete ? '#FFFFFF' : colors.mutedOnCard}
                />
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: colors.cardForeground }]}>
                  {achievement.name}
                </Text>
                <Text style={[styles.cardDescription, { color: colors.mutedOnCard }]}>
                  {achievement.description}
                </Text>
                <View style={[styles.track, { backgroundColor: colors.muted }]}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${pct * 100}%`,
                        backgroundColor: isComplete ? colors.primary : colors.coinGold,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: colors.mutedOnCard }]}>
                  {progress} / {achievement.target}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    gap: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  cardDescription: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    marginBottom: 8,
  },
  track: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    marginTop: 4,
    textAlign: 'right',
  },
});
