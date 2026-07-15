import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { LevelConfig } from '@/lib/petalplot/types';
import { StarRating } from './HUD';

interface LevelNodeProps {
  level: LevelConfig;
  isUnlocked: boolean;
  isCompleted: boolean;
  stars: number;
  align: 'flex-start' | 'flex-end' | 'center';
  onPress: () => void;
  onLockedPress: () => void;
}

export function LevelNode({
  level,
  isUnlocked,
  isCompleted,
  stars,
  align,
  onPress,
  onLockedPress,
}: LevelNodeProps) {
  const colors = useColors();

  const handlePress = () => {
    if (!isUnlocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onLockedPress();
      return;
    }
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <View style={[styles.row, { justifyContent: align }]}>
      <Pressable
        testID={`level-node-${level.id}`}
        onPress={handlePress}
        style={styles.nodeWrap}
      >
        <View
          style={[
            styles.node,
            {
              backgroundColor: isCompleted
                ? colors.primary
                : isUnlocked
                  ? colors.card
                  : colors.backgroundElevated,
              borderColor: isUnlocked ? colors.coinGold : colors.border,
            },
          ]}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={26} color="#FFFFFF" />
          ) : isUnlocked ? (
            <Text style={[styles.nodeNumber, { color: colors.cardForeground }]}>
              {level.id}
            </Text>
          ) : (
            <Ionicons name="lock-closed" size={20} color={colors.mutedForeground} />
          )}
        </View>
        <Text
          style={[
            styles.nodeName,
            { color: isUnlocked ? colors.foreground : colors.mutedForeground },
          ]}
        >
          {level.name}
        </Text>
        <Text style={[styles.nodeMeta, { color: colors.mutedForeground }]}>
          {level.n} × {level.n}
        </Text>
        {isCompleted && (
          <View style={styles.starsWrap}>
            <StarRating stars={stars} size={14} />
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 28,
    marginBottom: 22,
  },
  nodeWrap: {
    alignItems: 'center',
    width: 108,
  },
  node: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeNumber: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  nodeName: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 6,
    textAlign: 'center',
  },
  nodeMeta: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  starsWrap: {
    marginTop: 2,
  },
});
