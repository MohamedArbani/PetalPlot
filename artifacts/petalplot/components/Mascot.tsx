import React from 'react';
import { Image } from 'expo-image';

export type MascotVariant =
  | 'static'
  | 'hello-wave'
  | 'thinking'
  | 'loading'
  | 'sad'
  | 'success'
  | 'error-shake';

const STATIC_SOURCE = require('@/assets/mascot/petalia.png');

const ANIMATED_SOURCES: Record<Exclude<MascotVariant, 'static'>, any> = {
  'hello-wave': require('@/assets/animations/webp/hello-wave.webp'),
  thinking: require('@/assets/animations/webp/thinking.webp'),
  loading: require('@/assets/animations/webp/loading.webp'),
  sad: require('@/assets/animations/webp/sad.webp'),
  success: require('@/assets/animations/webp/success.webp'),
  'error-shake': require('@/assets/animations/webp/error-shake.webp'),
};

interface MascotProps {
  variant?: MascotVariant;
  size?: number;
  loop?: boolean;
}

/**
 * Renders Petalia, the PetalPlot mascot — either the static portrait or one
 * of the looping WebP animations exported from the source clips (chroma-keyed
 * to transparent so it drops cleanly onto the dark garden background).
 */
export function Mascot({ variant = 'static', size = 96, loop = true }: MascotProps) {
  const source = variant === 'static' ? STATIC_SOURCE : ANIMATED_SOURCES[variant];

  return (
    <Image
      source={source}
      style={{ width: size, height: size }}
      contentFit="contain"
      autoplay
      // expo-image loops animated formats by default; explicit for clarity.
      // (no-op for the static PNG)
      priority="high"
      cachePolicy="memory-disk"
      accessibilityLabel="Petalia the mascot"
      // @ts-expect-error - allowed for animated webp on native
      loop={loop}
    />
  );
}
