export interface BloomTheme {
  id: string;
  name: string;
  description: string;
  cost: number;
  colors: string[];
}

export const THEMES: BloomTheme[] = [
  {
    id: 'classic',
    name: 'Classic Bloom',
    description: 'A timeless beauty.',
    cost: 0,
    colors: [
      '#F6D9D9',
      '#DCE8D2',
      '#FCEBC7',
      '#D7E3F0',
      '#E8DCF0',
      '#F5D9C0',
      '#D3EDE6',
    ],
  },
  {
    id: 'lotus',
    name: 'Lotus Bloom',
    description: 'Soft pink and elegant.',
    cost: 100,
    colors: [
      '#F9D4E1',
      '#F6BFD3',
      '#FBE4EC',
      '#EFA9C4',
      '#FDEEF3',
      '#E88AAE',
      '#F5CFDE',
    ],
  },
  {
    id: 'star',
    name: 'Star Bloom',
    description: 'Shines with logic.',
    cost: 150,
    colors: [
      '#D6E4F5',
      '#FDEFC0',
      '#C7D9F0',
      '#F7DE8B',
      '#E3ECFB',
      '#F0C94A',
      '#B9CEEB',
    ],
  },
  {
    id: 'rainbow',
    name: 'Rainbow Bloom',
    description: 'For seasoned gardeners.',
    cost: 200,
    colors: [
      '#F6C9C9',
      '#FBE3A6',
      '#C9EBC4',
      '#BFDDF2',
      '#E1C7EF',
      '#F7C79A',
      '#C3E8DD',
    ],
  },
];

export function getThemeById(id: string): BloomTheme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]!;
}
