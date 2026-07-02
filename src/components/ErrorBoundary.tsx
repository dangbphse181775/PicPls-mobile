import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  /** Custom fallback UI */
  fallback?: (err: Error, reset: () => void) => React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Bọc toàn bộ app để bắt mọi exception runtime, tránh crash.
 * Hiển thị màn hình "Có lỗi xảy ra" + nút "Thử lại" thay vì để app trắng.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log để dev có thể debug
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return <DefaultFallback error={this.state.error} onReset={this.reset} />;
    }
    return this.props.children;
  }
}

function DefaultFallback({ error, onReset }: { error: Error; onReset: () => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>⚠️</Text>
      </View>
      <Text style={styles.title}>Đã xảy ra lỗi</Text>
      <Text style={styles.subtitle}>
        Ứng dụng gặp sự cố ngoài ý muốn. Vui lòng thử lại.
      </Text>
      <ScrollView style={styles.detailBox} contentContainerStyle={styles.detailContent}>
        <Text style={styles.detailText} numberOfLines={6}>
          {error.message}
        </Text>
      </ScrollView>
      <TouchableOpacity style={styles.retryBtn} onPress={onReset} activeOpacity={0.85}>
        <Text style={styles.retryText}>↻ Thử lại</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.dangerSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: { fontSize: 40 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  detailBox: {
    width: '100%',
    maxHeight: 140,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  detailContent: { padding: 14 },
  detailText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryText: { color: COLORS.white, fontSize: 15, fontWeight: '800' },
});
