import { TextStyle } from 'react-native';
import { COLORS } from './colors';

/**
 * Typography scale — semantic helpers so screens don't
 * repeat raw font sizes / weights. Always pair these with
 * a color from the theme.
 */
export const typography: Record<string, TextStyle> = {
  display: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  h1: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  h2: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  h3: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  subtitle: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  body: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  bodyMuted: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  caption: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  button: { fontSize: 15, fontWeight: '700', color: COLORS.white },
};

export default typography;
