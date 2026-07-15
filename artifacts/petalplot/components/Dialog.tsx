import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Mascot, MascotVariant } from './Mascot';

interface DialogAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

interface DialogProps {
  visible: boolean;
  title: string;
  description?: string;
  mascotVariant?: MascotVariant;
  actions: DialogAction[];
  onRequestClose?: () => void;
}

export function Dialog({
  visible,
  title,
  description,
  mascotVariant,
  actions,
  onRequestClose,
}: DialogProps) {
  const colors = useColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          {mascotVariant && (
            <View style={styles.mascotWrap}>
              <Mascot variant={mascotVariant} size={84} />
            </View>
          )}
          <Text style={[styles.title, { color: colors.cardForeground }]}>{title}</Text>
          {description && (
            <Text style={[styles.description, { color: colors.mutedOnCard }]}>
              {description}
            </Text>
          )}
          <View style={styles.actions}>
            {actions.map((action, i) => (
              <Pressable
                key={i}
                onPress={action.onPress}
                style={[
                  styles.button,
                  action.variant === 'secondary'
                    ? { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.cardBorder }
                    : { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.buttonLabel,
                    {
                      color:
                        action.variant === 'secondary'
                          ? colors.cardForeground
                          : colors.primaryForeground,
                    },
                  ]}
                >
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 16, 14, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1.5,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  mascotWrap: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonLabel: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});
