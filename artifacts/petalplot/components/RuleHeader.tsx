import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface RuleChipProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

function RuleChip({ icon, label }: RuleChipProps) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Ionicons name={icon} size={15} color={colors.primary} />
      <Text
        style={[styles.chipLabel, { color: colors.cardForeground }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export function RuleHeader() {
  return (
    <View style={styles.container}>
      <RuleChip icon="color-palette-outline" label="1 per zone" />
      <RuleChip icon="grid-outline" label="1 per row & col" />
      <RuleChip icon="close-circle-outline" label="No touching" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
});
