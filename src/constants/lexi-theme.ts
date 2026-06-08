export const LexiTheme = {
  colors: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceMuted: '#F3F4F5',
    surfaceStrong: '#001E40',
    surfaceStrongAlt: '#003366',
    border: '#C3C6D1',
    textPrimary: '#001E40',
    textBody: '#191C1D',
    textMuted: '#43474F',
    textSoft: '#799DD6',
    mint: '#90EFEF',
    mintText: '#006A6A',
    mintSoft: 'rgba(144, 239, 239, 0.2)',
    mintBadge: 'rgba(144, 239, 239, 0.4)',
    danger: '#BA1A1A',
    dangerSoft: '#FDE8E8',
    shadow: 'rgba(15, 23, 42, 0.08)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 20,
    pill: 999,
  },
} as const;

export type BottomTabKey = 'home' | 'saved' | 'recent';
