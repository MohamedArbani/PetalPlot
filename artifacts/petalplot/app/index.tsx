import React from 'react';
import { FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { LEVELS } from '@/lib/petalplot/levels';
import { LevelConfig } from '@/lib/petalplot/types';
import { useGameProgress } from '@/context/GameProgressContext';
import { LevelCard } from '@/components/LevelCard';

export default function LevelSelectScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isLevelUnlocked, isLevelCompleted, completedLevelIds } =
    useGameProgress();

  const completedCount = completedLevelIds.length;

  const renderItem = ({ item }: { item: LevelConfig }) => (
    <LevelCard
      level={item}
      isUnlocked={isLevelUnlocked(item.id)}
      isCompleted={isLevelCompleted(item.id)}
      onPress={() => router.push(`/game/${item.id}`)}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.header}>
        <View
          style={[styles.iconBadge, { backgroundColor: colors.secondary }]}
        >
          <MaterialCommunityIcons
            name="flower"
            size={30}
            color={colors.accent}
          />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>
          PetalPlot
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          One flower per row, column, and patch — and none may touch.
        </Text>
        <Text style={[styles.progress, { color: colors.primary }]}>
          {completedCount} / {LEVELS.length} beds cleared
        </Text>
      </View>

      <FlatList
        data={LEVELS}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        scrollEnabled={LEVELS.length > 0}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'web' ? 67 : 0,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 4,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 2,
    maxWidth: 280,
  },
  progress: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'web' ? 34 : 24,
    gap: 12,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
});
