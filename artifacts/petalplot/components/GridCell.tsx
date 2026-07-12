import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import colors, { zoneColors } from '@/constants/colors';
import { CellState } from '@/lib/petalplot/types';

interface GridCellProps {
  state: CellState;
  zoneId: number;
  size: number;
  isViolating: boolean;
  isLocked: boolean;
  borderTop: boolean;
  borderLeft: boolean;
  borderRight: boolean;
  borderBottom: boolean;
  onPress: () => void;
  testID?: string;
}

const ZONE_BORDER_WIDTH = 2.5;
const HAIRLINE_WIDTH = StyleSheet.hairlineWidth;

export function GridCell({
  state,
  zoneId,
  size,
  isViolating,
  isLocked,
  borderTop,
  borderLeft,
  borderRight,
  borderBottom,
  onPress,
  testID,
}: GridCellProps) {
  const scale = useSharedValue(1);
  const flowerScale = useSharedValue(state === 'FLOWER' ? 1 : 0);

  useEffect(() => {
    flowerScale.value =
      state === 'FLOWER'
        ? withSequence(
            withTiming(0, { duration: 0 }),
            withSpring(1, { damping: 9, stiffness: 180 }),
          )
        : withTiming(0, { duration: 120 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const flowerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flowerScale.value }],
    opacity: flowerScale.value,
  }));

  const backgroundColor = zoneColors[zoneId % zoneColors.length];

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          backgroundColor,
          borderTopWidth: borderTop ? ZONE_BORDER_WIDTH : HAIRLINE_WIDTH,
          borderLeftWidth: borderLeft ? ZONE_BORDER_WIDTH : HAIRLINE_WIDTH,
          borderRightWidth: borderRight ? ZONE_BORDER_WIDTH : HAIRLINE_WIDTH,
          borderBottomWidth: borderBottom ? ZONE_BORDER_WIDTH : HAIRLINE_WIDTH,
          borderColor: colors.light.zoneBorder,
        },
        containerStyle,
      ]}
    >
      <Pressable
        testID={testID}
        disabled={isLocked}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withTiming(0.92, { duration: 80 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 10, stiffness: 200 });
        }}
        style={styles.pressable}
      >
        {isViolating && (
          <View style={[StyleSheet.absoluteFill, styles.violationOverlay]} />
        )}
        {state === 'BLOCKED' && (
          <Ionicons
            name="close"
            size={size * 0.34}
            color={colors.light.mutedForeground}
            style={{ opacity: 0.55 }}
          />
        )}
        <Animated.View style={flowerAnimatedStyle}>
          {state === 'FLOWER' && (
            <MaterialCommunityIcons
              name="flower"
              size={size * 0.58}
              color={
                isViolating ? colors.light.destructive : colors.light.accent
              }
            />
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  violationOverlay: {
    backgroundColor: 'rgba(214, 91, 91, 0.28)',
  },
});
