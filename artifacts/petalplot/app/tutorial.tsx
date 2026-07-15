import React, { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { usePlayer } from '@/context/PlayerContext';
import { Mascot } from '@/components/Mascot';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: 'intro',
    title: 'Welcome to PetalPlot',
    description:
      'A relaxing logic puzzle where every flower has its perfect place. Let Petalia show you the three simple rules.',
    mascot: 'hello-wave' as const,
  },
  {
    key: 'zone',
    title: '1 Per Zone',
    description: 'Place exactly one flower in each colored zone.',
    icon: 'palette-outline' as const,
  },
  {
    key: 'line',
    title: '1 Per Row & Column',
    description: 'Each row and column must contain exactly one flower.',
    icon: 'view-grid-outline' as const,
  },
  {
    key: 'touch',
    title: 'No Touching',
    description: 'Flowers cannot touch each other, even diagonally.',
    icon: 'close-octagon-outline' as const,
  },
];

export default function TutorialScreen() {
  const colors = useColors();
  const router = useRouter();
  const player = usePlayer();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const finish = () => {
    player.markTutorialSeen();
    router.replace('/');
  };

  const goNext = () => {
    if (index === SLIDES.length - 1) {
      finish();
      return;
    }
    const nextIndex = index + 1;
    scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    setIndex(nextIndex);
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(newIndex);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {index > 0 ? (
        <View style={styles.topRow}>
          <Text style={[styles.stepLabel, { color: colors.mutedForeground }]}>
            Tutorial {index + 1}/{SLIDES.length}
          </Text>
        </View>
      ) : (
        <View style={styles.topRow} />
      )}
      <Pressable onPress={finish} style={styles.skipButton}>
        <Text style={[styles.skipLabel, { color: colors.mutedForeground }]}>Skip</Text>
      </Pressable>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
      >
        {SLIDES.map((slide) => (
          <View key={slide.key} style={[styles.slide, { width }]}>
            <View
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              {slide.mascot ? (
                <Mascot variant={slide.mascot} size={140} />
              ) : (
                <View style={[styles.iconCircle, { backgroundColor: colors.muted }]}>
                  <MaterialCommunityIcons name={slide.icon} size={48} color={colors.accent} />
                </View>
              )}
              <Text style={[styles.slideTitle, { color: colors.cardForeground }]}>
                {slide.title}
              </Text>
              <Text style={[styles.slideDescription, { color: colors.mutedOnCard }]}>
                {slide.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === index ? colors.primary : colors.muted,
                width: i === index ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>

      <Pressable
        testID="tutorial-next-button"
        onPress={goNext}
        style={[styles.nextButton, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.nextLabel}>
          {index === SLIDES.length - 1 ? 'Start Playing' : 'Next'}
        </Text>
        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topRow: {
    height: Platform.OS === 'web' ? 60 : 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 60 : 20,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  skipLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    borderRadius: 28,
    borderWidth: 1.5,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  slideTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    marginTop: 16,
    textAlign: 'center',
  },
  slideDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 28,
    marginBottom: Platform.OS === 'web' ? 34 : 24,
    paddingVertical: 16,
    borderRadius: 18,
  },
  nextLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
});
