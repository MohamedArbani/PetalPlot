import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

const HeartFilledIcon = require('@/assets/icons/png/HeartFilled.png');
const HeartBaseIcon = require('@/assets/icons/png/HeartBase.png');
const CoinIcon = require('@/assets/icons/png/Coin.png');
const StarFilledIcon = require('@/assets/icons/png/StarFilled.png');
const StarBaseIcon = require('@/assets/icons/png/StarBase.png');
const FlowerIcon = require('@/assets/icons/Flower.png');

export function CoinPill({ amount }: { amount: number }) {
  const colors = useColors();
  return (
    <View style={[styles.pill, { backgroundColor: colors.backgroundElevated }]}>
      <Image source={CoinIcon} style={styles.smallIcon} />
      <Text style={[styles.pillText, { color: colors.foreground }]}>{amount}</Text>
    </View>
  );
}

export function LivesPill({ lives, maxLives }: { lives: number; maxLives: number }) {
  const colors = useColors();
  return (
    <View style={[styles.pill, { backgroundColor: colors.backgroundElevated }]}>
      {Array.from({ length: maxLives }).map((_, i) => (
        <Image
          key={i}
          source={i < lives ? HeartFilledIcon : HeartBaseIcon}
          style={[styles.heartIcon, i > 0 && { marginLeft: -4 }]}
        />
      ))}
    </View>
  );
}

export function FlowerCounterPill({ count, total }: { count: number; total: number }) {
  const colors = useColors();
  return (
    <View style={[styles.pill, { backgroundColor: colors.backgroundElevated }]}>
      <Image source={FlowerIcon} style={styles.smallIcon} />
      <Text style={[styles.pillText, { color: colors.foreground }]}>
        {count} / {total}
      </Text>
    </View>
  );
}

export function StarRating({ stars, size = 20 }: { stars: number; size?: number }) {
  return (
    <View style={styles.starRow}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Image
          key={i}
          source={i < stars ? StarFilledIcon : StarBaseIcon}
          style={{ width: size, height: size, marginHorizontal: 2 }}
        />
      ))}
    </View>
  );
}

export function XpBar({
  level,
  xpIntoLevel,
  xpForNextLevel,
}: {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
}) {
  const colors = useColors();
  const pct = Math.min(1, xpIntoLevel / xpForNextLevel);
  return (
    <View style={styles.xpWrap}>
      <View style={[styles.xpBadge, { backgroundColor: colors.secondary }]}>
        <Text style={styles.xpBadgeText}>Lv.{level}</Text>
      </View>
      <View style={[styles.xpTrack, { backgroundColor: colors.backgroundElevated }]}>
        <View
          style={[
            styles.xpFill,
            { width: `${pct * 100}%`, backgroundColor: colors.coinGold },
          ]}
        />
      </View>
      <Text style={[styles.xpLabel, { color: colors.mutedForeground }]}>
        {xpIntoLevel}/{xpForNextLevel} XP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 4,
  },
  smallIcon: {
    width: 18,
    height: 18,
  },
  heartIcon: {
    width: 18,
    height: 18,
  },
  pillText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  xpWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  xpBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  xpTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpLabel: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
  },
});
