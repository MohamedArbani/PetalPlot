import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { usePlayer } from '@/context/PlayerContext';
import { DECORATIONS } from '@/lib/petalplot/decorations';
import { LEVELS } from '@/lib/petalplot/levels';
import { Mascot } from '@/components/Mascot';

export default function GardenScreen() {
  const colors = useColors();
  const player = usePlayer();
  const total = LEVELS.length;
  const progress = Math.min(1, player.gardenProgress / total);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Petal Grove</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Solve puzzles to grow your garden.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.plotCard,
            { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
          ]}
        >
          <Mascot variant="static" size={90} />
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, { color: colors.foreground }]}>
            {player.gardenProgress} / {total} blooms grown
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Decorations
        </Text>
        <View style={styles.grid}>
          {DECORATIONS.map((deco) => {
            const unlocked = player.gardenProgress >= deco.unlockAt;
            return (
              <View
                key={deco.id}
                style={[
                  styles.decoCard,
                  {
                    backgroundColor: unlocked ? colors.card : colors.backgroundElevated,
                    borderColor: unlocked ? colors.cardBorder : colors.border,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={deco.icon}
                  size={28}
                  color={unlocked ? colors.accent : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.decoName,
                    { color: unlocked ? colors.cardForeground : colors.mutedForeground },
                  ]}
                  numberOfLines={2}
                >
                  {deco.name}
                </Text>
                <Text style={[styles.decoMeta, { color: colors.mutedForeground }]}>
                  {unlocked ? 'Unlocked' : `Clear ${deco.unlockAt} beds`}
                </Text>
              </View>
            );
          })}
        </View>
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
  },
  plotCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginTop: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  decoCard: {
    width: '31%',
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    gap: 6,
  },
  decoName: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  decoMeta: {
    fontSize: 9,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});
