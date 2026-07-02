import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BookingSuccessScreenParams } from '../types/booking.types';

// ─── Navigation Types ─────────────────────────────────────────────────────────
type RootStackParamList = {
  BookingSuccess: BookingSuccessScreenParams;
  MainTabs: { screen: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'BookingSuccess'>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (amount: number | undefined | null): string =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);

const formatDateTime = (isoString: string): string => {
  if (!isoString) return 'Chưa cập nhật';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BookingSuccessScreen({ route, navigation }: Props) {
  const { bookingId, grapherName, serviceName, totalAmount, scheduledAt } =
    route.params;

  return (
    <>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Success Animation ──────────────────────────────────── */}
          <View style={styles.iconWrapper}>
            <View style={styles.iconOuterRing}>
              <View style={styles.iconInnerRing}>
                <Text style={styles.successIcon}>✓</Text>
              </View>
            </View>
          </View>

          <Text style={styles.title}>Đặt lịch thành công!</Text>
          <Text style={styles.subtitle}>
            Thanh toán của bạn đã được xác nhận. Nhiếp ảnh gia sẽ liên hệ với
            bạn sớm nhất.
          </Text>

          {/* ── Booking Details Card ───────────────────────────────── */}
          <View style={styles.detailCard}>
            <Text style={styles.detailCardTitle}>Chi tiết đặt lịch</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🆔</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Mã booking</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {bookingId ? bookingId.split('-')[0].toUpperCase() : 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📷</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Nhiếp ảnh gia</Text>
                <Text style={styles.detailValue}>{grapherName}</Text>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🎨</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Dịch vụ</Text>
                <Text style={styles.detailValue}>{serviceName}</Text>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🗓</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Thời gian</Text>
                <Text style={styles.detailValue}>{formatDateTime(scheduledAt)}</Text>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>💰</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Tổng thanh toán</Text>
                <Text style={[styles.detailValue, styles.amountText]}>
                  {formatCurrency(totalAmount)}
                </Text>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>✅</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Trạng thái</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Đã xác nhận</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── Info Note ─────────────────────────────────────────────── */}
          <View style={styles.infoNote}>
            <Text style={styles.infoNoteIcon}>💡</Text>
            <Text style={styles.infoNoteText}>
              Bạn có thể xem chi tiết và quản lý booking tại mục{' '}
              <Text style={styles.infoNoteHighlight}>Lịch của tôi</Text>.
            </Text>
          </View>

          {/* ── Action Buttons ────────────────────────────────────────── */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('MainTabs', { screen: 'BookingsTab' })}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>📋  Xem lịch của tôi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const COLORS = {
  background: '#0F0F1A',
  surface: '#1A1A2E',
  primary: '#6366F1',
  accent: '#F59E0B',
  success: '#10B981',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: '#2D2D4E',
  cardBorder: '#3D3D6B',
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },

  // ── Success Icon ──────────────────────────────────────────────────────────
  iconWrapper: { marginBottom: 28, alignItems: 'center', justifyContent: 'center' },
  iconOuterRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.success + '18',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.success + '30',
  },
  iconInnerRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.success + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: { fontSize: 44, color: COLORS.success },

  // ── Title ─────────────────────────────────────────────────────────────────
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 8,
  },

  // ── Detail Card ───────────────────────────────────────────────────────────
  detailCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 20,
  },
  detailCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 6 },
  detailIcon: { fontSize: 18, marginRight: 14, marginTop: 2 },
  detailContent: { flex: 1 },
  detailLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '600',
    lineHeight: 22,
  },
  amountText: { color: COLORS.accent, fontWeight: '800', fontSize: 17 },
  detailDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  statusBadge: {
    backgroundColor: COLORS.success + '20',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.success + '40',
  },
  statusText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '700',
  },

  // ── Info Note ─────────────────────────────────────────────────────────────
  infoNote: {
    width: '100%',
    backgroundColor: COLORS.primary + '15',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    marginBottom: 28,
    gap: 10,
  },
  infoNoteIcon: { fontSize: 18 },
  infoNoteText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  infoNoteHighlight: { color: COLORS.primary, fontWeight: '700' },

  // ── Actions ───────────────────────────────────────────────────────────────
  actions: { width: '100%', gap: 12 },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
