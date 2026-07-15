/**
 * Semantic design tokens for PetalPlot — a garden-themed logic puzzle.
 * "Night garden" palette: deep forest background, cream parchment cards,
 * bloom-pink and gold accents. Matches the Petalia mascot design system.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#F5EFE0',
    tint: '#4C8C5C',

    // Core surfaces — the app shell is a deep night-garden green
    background: '#0B211C',
    backgroundElevated: '#123028',
    foreground: '#F5EFE0',

    // Cards / elevated surfaces — warm parchment cream
    card: '#F6E8C9',
    cardBorder: '#E3CBA0',
    cardForeground: '#3A2E1F',

    // Primary action color (buttons, links, active states) — leaf green
    primary: '#4C8C5C',
    primaryForeground: '#FFFFFF',

    // Secondary interactive surfaces — bloom lavender-purple
    secondary: '#8B7EC8',
    secondaryForeground: '#FFFFFF',

    // Muted / subdued elements
    muted: '#1B3A32',
    mutedForeground: '#9FBBAF',
    mutedOnCard: '#8A7758',

    // Accent highlights — petal pink/coral
    accent: '#E4785B',
    accentForeground: '#FFFFFF',

    // Destructive actions (delete, error, lose states)
    destructive: '#E14B4B',
    destructiveForeground: '#FFFFFF',

    // Borders and input outlines
    border: '#1B3A32',
    input: '#1B3A32',

    // PetalPlot specific
    zoneBorder: '#4A4038',
    heartFilled: '#FD3C4F',
    heartEmpty: '#3E5750',
    coinGold: '#F3AF29',
    starGold: '#FFD913',
    success: '#4C8C5C',
  },

  // Border radius (in px) — soft, rounded, garden feel.
  radius: 20,
};

// Pastel zone fills used for grid regions. Index = zoneId (0-6, supports up to 7 zones).
// This is the default "Classic Bloom" theme; other themes live in lib/petalplot/themes.ts.
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
