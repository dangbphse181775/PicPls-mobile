import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { COLORS } from '../theme/colors';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles: Record<NonNullable<ButtonProps['size']>, ViewStyle> = {
  sm: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  md: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
  lg: { paddingVertical: 16, paddingHorizontal: 22, borderRadius: 14 },
};

const variantStyles: Record<Variant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: COLORS.primary },
    text: { color: COLORS.white },
  },
  secondary: {
    container: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.cardBorder },
    text: { color: COLORS.textPrimary },
  },
  danger: {
    container: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.danger + '60' },
    text: { color: COLORS.danger },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: COLORS.primaryLight },
  },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.primary },
    text: { color: COLORS.primaryLight },
  },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
  size = 'md',
}: ButtonProps) {
  const v = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={isDisabled}
      style={[
        styles.base,
        sizeStyles[size],
        v.container,
        fullWidth && { alignSelf: 'stretch' },
        isDisabled && { opacity: 0.55 },
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {loading ? (
          <ActivityIndicator color={v.text.color as string} size="small" />
        ) : (
          <>
            {icon ? <Text style={[styles.icon, v.text]}>{icon}</Text> : null}
            <Text style={[styles.text, v.text, textStyle]}>{title}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  contentRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { fontSize: 16 },
  text: { fontSize: 15, fontWeight: '700' },
});
