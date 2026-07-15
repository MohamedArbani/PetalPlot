import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { usePlayer } from '@/context/PlayerContext';
import { THEMES } from '@/lib/petalplot/themes';
import { CoinPill } from '@/components/HUD';

const HINT_PACK_COST = 40;
const HINT_PACK_SIZE = 3;
const LIVES_REFILL_COST = 60;

type Tab = 'themes' | 'boosters';

export default function StoreScreen() {
  const colors = useColors();
  const player = usePlayer();
  const [tab, setTab] = useState<Tab>('themes');

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Store</Text>
        <CoinPill amount={player.coins} />
      </View>

      <View style={styles.tabRow}>
        {(['themes', 'boosters'] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[
              styles.tabButton,
              {
                backgroundColor: tab === t ? colors.primary : colors.backgroundElevated,
              },
            ]}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: tab === t ? '#FFFFFF' : colors.mutedForeground },
              ]}
            >
              {t === 'themes' ? 'Flowers' : 'Boosters'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {tab === 'themes' &&
          THEMES.map((theme) => {
            const owned = player.ownedThemeIds.includes(theme.id);
            const equipped = player.equippedThemeId === theme.id;
            return (
              <View
                key={theme.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                ]}
              >
                <View style={styles.swatchRow}>
                  {theme.colors.slice(0, 4).map((c, i) => (
                    <View key={i} style={[styles.swatch, { backgroundColor: c }]} />
                  ))}
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.cardTitle, { color: colors.cardForeground }]}>
                    {theme.name}
                  </Text>
                  <Text style={[styles.cardDescription, { color: colors.mutedOnCard }]}>
                    {theme.description}
                  </Text>
                </View>
                <Pressable
                  onPress={() =>
                    owned ? player.equipTheme(theme.id) : player.buyTheme(theme.id)
                  }
                  disabled={equipped}
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: equipped
                        ? colors.muted
                        : owned
                          ? colors.secondary
                          : colors.primary,
                    },
                  ]}
                >
                  {!owned && (
                    <Ionicons name="logo-bitcoin" size={13} color="#FFFFFF" style={{ marginRight: 3 }} />
                  )}
                  <Text
                    style={[
                      styles.actionLabel,
                      { color: equipped ? colors.mutedOnCard : '#FFFFFF' },
                    ]}
                  >
                    {equipped ? 'Equipped' : owned ? 'Equip' : theme.cost}
                  </Text>
                </Pressable>
              </View>
            );
          })}

        {tab === 'boosters' && (
          <>
            <View
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            >
              <View style={[styles.iconBadge, { backgroundColor: colors.secondary }]}>
                <Ionicons name="bulb" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: colors.cardForeground }]}>
                  Hint Pack
                </Text>
                <Text style={[styles.cardDescription, { color: colors.mutedOnCard }]}>
                  +{HINT_PACK_SIZE} hints · You have {player.hints}
                </Text>
              </View>
              <Pressable
                onPress={() => player.buyHints(HINT_PACK_SIZE, HINT_PACK_COST)}
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="logo-bitcoin" size={13} color="#FFFFFF" style={{ marginRight: 3 }} />
                <Text style={[styles.actionLabel, { color: '#FFFFFF' }]}>{HINT_PACK_COST}</Text>
              </Pressable>
            </View>

            <View
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            >
              <View style={[styles.iconBadge, { backgroundColor: colors.accent }]}>
                <Ionicons name="heart" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: colors.cardForeground }]}>
                  Refill Lives
                </Text>
                <Text style={[styles.cardDescription, { color: colors.mutedOnCard }]}>
                  Fill up to {player.maxLives} lives instantly
                </Text>
              </View>
              <Pressable
                onPress={() => player.buyLivesRefill(LIVES_REFILL_COST)}
                disabled={player.lives >= player.maxLives}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor:
                      player.lives >= player.maxLives ? colors.muted : colors.primary,
                  },
                ]}
              >
                <Ionicons name="logo-bitcoin" size={13} color="#FFFFFF" style={{ marginRight: 3 }} />
                <Text style={[styles.actionLabel, { color: '#FFFFFF' }]}>{LIVES_REFILL_COST}</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 60 : 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tabLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 12,
    gap: 12,
  },
  swatchRow: {
    flexDirection: 'row',
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
    flexWrap: 'wrap',
  },
  swatch: {
    width: 22,
    height: 22,
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
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  actionLabel: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
});
