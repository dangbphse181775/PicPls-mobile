import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS } from '../theme/colors';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: 'solid' | 'glass' | 'outline';
  padding?: number;
}

export default function Card({ children, style, variant = 'glass', padding = 16 }: CardProps) {
  const base =
    variant === 'glass'
      ? styles.glass
      : variant === 'outline'
        ? styles.outline
        : styles.solid;

  return (
    <View style={[base, { padding }, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  glass: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  solid: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  outline: {
    backgroundColor: 'transparent',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
