import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { usePlayer } from '@/context/PlayerContext';
import { LEVELS, getLevelById } from '@/lib/petalplot/levels';
import { Mascot } from '@/components/Mascot';
import { CoinPill, LivesPill, XpBar } from '@/components/HUD';

const PresentIcon = require('@/assets/icons/Present.png');

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const player = usePlayer();

  const continueLevel =
    getLevelById(player.highestUnlockedLevelId) ?? LEVELS[0]!;
  const isAllComplete = player.completedLevelIds.length >= LEVELS.length;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.topBar}>
        <Text style={[styles.brand, { color: colors.foreground }]}>PetalPlot</Text>
        <View style={styles.topBarRight}>
          <LivesPill lives={player.lives} maxLives={player.maxLives} />
          <CoinPill amount={player.coins} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mascotWrap}>
          <Mascot variant="hello-wave" size={150} />
        </View>
        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
          Logic Blooms. Minds Thrive.
        </Text>

        <View style={styles.xpCard}>
          <XpBar
            level={player.level}
            xpIntoLevel={player.xpIntoLevel}
            xpForNextLevel={player.xpForNextLevel}
          />
        </View>

        <Pressable
          testID="daily-bloom-card"
          onPress={player.claimDailyBonus}
          disabled={!player.canClaimDaily}
          style={[
            styles.dailyCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Image source={PresentIcon} style={styles.presentIcon} contentFit="contain" />
          <View style={styles.dailyTextWrap}>
            <Text style={[styles.dailyTitle, { color: colors.cardForeground }]}>
              Daily Bloom
            </Text>
            <Text style={[styles.dailySubtitle, { color: colors.mutedOnCard }]}>
              {player.canClaimDaily
                ? 'A free gift is waiting for you'
                : 'Come back tomorrow for more'}
            </Text>
          </View>
          <View
            style={[
              styles.dailyBadge,
              { backgroundColor: player.canClaimDaily ? colors.coinGold : colors.muted },
            ]}
          >
            <Text
              style={[
                styles.dailyBadgeText,
                { color: player.canClaimDaily ? '#3A2E1F' : colors.mutedForeground },
              ]}
            >
              {player.canClaimDaily ? '+25' : 'Done'}
            </Text>
          </View>
        </Pressable>

        <Pressable
          testID="continue-button"
          onPress={() => router.push(`/game/${continueLevel.id}`)}
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="play" size={18} color="#FFFFFF" />
          <Text style={styles.primaryButtonLabel}>
            {isAllComplete ? 'Play Again' : `Continue · Level ${continueLevel.id}`}
          </Text>
        </Pressable>

        <Pressable
          testID="play-select-button"
          onPress={() => router.push('/levels')}
          style={[styles.secondaryButton, { backgroundColor: colors.secondary }]}
        >
          <Ionicons name="map-outline" size={18} color="#FFFFFF" />
          <Text style={styles.primaryButtonLabel}>Select a level</Text>
        </Pressable>

        <View style={styles.tagsRow}>
          <View style={styles.tag}>
            <Ionicons name="bulb-outline" size={16} color={colors.accent} />
            <Text style={[styles.tagLabel, { color: colors.mutedForeground }]}>
              Logic & Deduction
            </Text>
          </View>
          <View style={styles.tag}>
            <Ionicons name="flower-outline" size={16} color={colors.accent} />
            <Text style={[styles.tagLabel, { color: colors.mutedForeground }]}>
              Relaxing & Beautiful
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 60 : 8,
    paddingBottom: 8,
  },
  brand: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  mascotWrap: {
    marginTop: 4,
  },
  tagline: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    marginBottom: 18,
  },
  xpCard: {
    width: '100%',
    marginBottom: 14,
  },
  dailyCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  presentIcon: {
    width: 40,
    height: 44,
  },
  dailyTextWrap: {
    flex: 1,
  },
  dailyTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  dailySubtitle: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  dailyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  dailyBadgeText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  primaryButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 18,
    marginBottom: 10,
  },
  secondaryButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 18,
    marginBottom: 18,
  },
  primaryButtonLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 18,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tagLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
});
