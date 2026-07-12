/**
 * Semantic design tokens for PetalPlot — a garden-themed logic puzzle.
 * Warm, botanical palette: cream paper background, sage primary, coral accent.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#2B2116',
    tint: '#5B8266',

    // Core surfaces
    background: '#FBF8F2',
    foreground: '#2B2116',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#2B2116',

    // Primary action color (buttons, links, active states)
    primary: '#5B8266',
    primaryForeground: '#FFFFFF',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#F1E9DC',
    secondaryForeground: '#2B2116',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#EFE7D8',
    mutedForeground: '#8A7B65',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#E4785B',
    accentForeground: '#FFFFFF',

    // Destructive actions (delete, error states)
    destructive: '#D65B5B',
    destructiveForeground: '#FFFFFF',

    // Borders and input outlines
    border: '#E6DCC8',
    input: '#E6DCC8',

    // PetalPlot specific
    zoneBorder: '#4A4038',
    heartFilled: '#E4785B',
    heartEmpty: '#E6DCC8',
    success: '#5B8266',
  },

  // Border radius (in px) — soft, rounded, garden feel.
  radius: 16,
};

// Pastel zone fills used for grid regions. Index = zoneId (0-6, supports up to 7 zones).
export const zoneColors: string[] = [
  '#F6D9D9', // blush
  '#DCE8D2', // sage
  '#FCEBC7', // butter
  '#D7E3F0', // sky
  '#E8DCF0', // lavender
  '#F5D9C0', // peach
  '#D3EDE6', // mint
];

export default colors;
