import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { LevelConfig } from '@/lib/petalplot/types';
import * as Haptics from 'expo-haptics';

interface LevelCardProps {
  level: LevelConfig;
  isUnlocked: boolean;
  isCompleted: boolean;
  onPress: () => void;
}

export function LevelCard({
  level,
  isUnlocked,
  isCompleted,
  onPress,
}: LevelCardProps) {
  const colors = useColors();

  const handlePress = () => {
    if (!isUnlocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      testID={`level-card-${level.id}`}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isCompleted ? colors.primary : colors.border,
          opacity: pressed && isUnlocked ? 0.85 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.badge,
          {
            backgroundColor: isCompleted
              ? colors.primary
              : isUnlocked
                ? colors.secondary
                : colors.muted,
          },
        ]}
      >
        {isCompleted ? (
          <Ionicons name="checkmark" size={18} color={colors.primaryForeground} />
        ) : isUnlocked ? (
          <Text style={[styles.badgeNumber, { color: colors.foreground }]}>
            {level.id}
          </Text>
        ) : (
          <Ionicons name="lock-closed" size={15} color={colors.mutedForeground} />
        )}
      </View>
      <Text
        style={[
          styles.name,
          {
            color: isUnlocked ? colors.foreground : colors.mutedForeground,
          },
        ]}
        numberOfLines={1}
      >
        {level.name}
      </Text>
      <Text style={[styles.meta, { color: colors.mutedForeground }]}>
        {level.n} × {level.n}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  badgeNumber: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  name: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  meta: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
});
