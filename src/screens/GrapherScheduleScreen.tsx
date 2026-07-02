import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import grapherProfileApi from '../api/grapherProfileApi';
import bookingApi from '../api/bookingApi';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import { COLORS } from '../theme/colors';
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS } from '../types/booking.types';
interface Props {
  navigation: any;
}

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

const formatTime = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const TABS: { key: 'upcoming' | 'pending' | 'inProgress' | 'completed' | 'cancelled'; label: string }[] = [
  { key: 'upcoming', label: '📅 Sắp tới' },
  { key: 'pending', label: '⏳ Chờ' },
  { key: 'inProgress', label: '🎬 Đang chụp' },
  { key: 'completed', label: '✅ Xong' },
  { key: 'cancelled', label: '❌ Hủy' },
];

export default function GrapherScheduleScreen({ navigation }: Props) {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isTogglingOnline, setIsTogglingOnline] = useState(false);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['key']>('upcoming');

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [me, orderList] = await Promise.all([
        grapherProfileApi.getMe(),
        bookingApi.getGrapherOrders().catch(() => []),
      ]);
      setIsOnline(!!me.isOnline);
      setOrders(Array.isArray(orderList) ? orderList : []);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể tải lịch trình.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleOnline = async (val: boolean) => {
    setIsTogglingOnline(true);
    try {
      await grapherProfileApi.setOnline(val);
      setIsOnline(val);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái online.');
    } finally {
      setIsTogglingOnline(false);
    }
  };

  const filtered = orders.filter(o => {
    const status = o.status;
    if (activeTab === 'upcoming') {
      return ['PendingConfirmation', 'Confirmed', 'InProgress'].includes(status);
    }
    if (activeTab === 'pending') return status === 'PendingPayment' || status === 'PendingConfirmation';
    if (activeTab === 'inProgress') return status === 'InProgress';
    if (activeTab === 'completed') return status === 'Completed';
    if (activeTab === 'cancelled') return status === 'Cancelled';
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch trình làm việc</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              load(true);
            }}
            tintColor={COLORS.primary}
          />
        }
      >
        <Card style={styles.onlineCard} padding={16}>
          <View style={styles.onlineRow}>
            <View style={styles.onlineLeft}>
              <View style={[styles.onlineDot, isOnline && styles.onlineDotActive]} />
              <View>
                <Text style={styles.onlineTitle}>
                  {isOnline ? 'Đang nhận đơn' : 'Đang tạm ẩn'}
                </Text>
                <Text style={styles.onlineHint}>
                  {isOnline
                    ? 'Khách hàng có thể thấy bạn trong kết quả tìm kiếm'
                    : 'Bật để hiển thị với khách hàng'}
                </Text>
              </View>
            </View>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              disabled={isTogglingOnline}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </Card>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {TABS.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, activeTab === t.key && styles.tabActive]}
              onPress={() => setActiveTab(t.key)}
            >
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isLoading ? (
          <Loading text="Đang tải lịch trình..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📅"
            title="Chưa có lịch"
            subtitle="Các đơn đặt lịch sẽ xuất hiện tại đây"
          />
        ) : (
          filtered.map((o: any) => (
            <TouchableOpacity
              key={o.id}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('BookingDetail', { bookingId: o.id })}
            >
              <Card style={styles.bookingCard} padding={14}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.bookingCustomer} numberOfLines={1}>
                    {o.customerName || 'Khách hàng'}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: (BOOKING_STATUS_COLORS as any)[o.status] + '30' },
                    ]}
                  >
                  <Text
                    style={[
                      styles.statusText,
                      { color: (BOOKING_STATUS_COLORS as any)[o.status] },
                    ]}
                  >
                    {(BOOKING_STATUS_LABELS as any)[o.status] || o.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.bookingService} numberOfLines={1}>
                📦 {o.serviceName}
              </Text>
              <View style={styles.bookingMeta}>
                <Text style={styles.bookingMetaText}>
                  🕐 {formatDate(o.scheduledAt)} • {formatTime(o.scheduledAt)}
                </Text>
              </View>
              <Text style={styles.bookingLocation} numberOfLines={1}>
                📍 {o.location}
              </Text>
              <View style={styles.bookingFooter}>
                <Text style={styles.bookingPrice}>
                  {formatCurrency(o.grapherPayoutAmount || o.totalAmount)}
                </Text>
                <Text style={styles.bookingDuration}>
                  ⏱ {o.durationMinutes >= 60
                    ? `${Math.round(o.durationMinutes / 60)}h`
                    : `${o.durationMinutes}p`}
                </Text>
              </View>
            </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 24, color: COLORS.textPrimary },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },

  container: { padding: 20, paddingBottom: 40 },

  onlineCard: { marginBottom: 16 },
  onlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  onlineLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  onlineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.textMuted,
  },
  onlineDotActive: { backgroundColor: COLORS.success },
  onlineTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  onlineHint: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  tabRow: { paddingBottom: 12, gap: 8, paddingRight: 8 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: COLORS.white },

  bookingCard: { marginBottom: 10 },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  bookingCustomer: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  bookingService: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  bookingMeta: { marginBottom: 4 },
  bookingMetaText: { fontSize: 12, color: COLORS.textMuted },
  bookingLocation: { fontSize: 12, color: COLORS.textMuted, marginBottom: 10 },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  bookingPrice: { fontSize: 14, color: COLORS.accent, fontWeight: '800' },
  bookingDuration: { fontSize: 12, color: COLORS.textMuted },
});
