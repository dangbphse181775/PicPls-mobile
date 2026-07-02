import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import bookingApi from '../api/bookingApi';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '../types/booking.types';
import type { CustomerBookingResponse } from '../types/booking.types';
import type { TabParamList } from '../navigation/TabNavigator';

// Dùng Composite navigation prop nếu cần chuyển sang stack navigator
// Nhưng ở đây tạm dùng any cho gọn hoặc định nghĩa type chuẩn
type Props = any; 

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (amount: number | undefined | null) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const formatDate = (dateString: string) => {
  if (!dateString) return 'Chưa cập nhật';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function MyBookingsScreen({ navigation }: Props) {
  const [bookings, setBookings] = useState<CustomerBookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>(''); // rỗng là tất cả

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const fetchBookings = useCallback(async (silent = false) => {
    if (!silent && isMounted.current) setIsLoading(true);
    try {
      const data = await bookingApi.getMine();
      if (isMounted.current) setBookings(data);
    } catch (error) {
      console.error('Lỗi tải danh sách booking', error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    // Để gọi lại mỗi khi focus tab
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBookings(true);
    });
    fetchBookings();
    return unsubscribe;
  }, [fetchBookings, navigation]);

  const filteredBookings = statusFilter
    ? bookings.filter((b) => b.status === statusFilter)
    : bookings;

  // ── Render Item ─────────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: CustomerBookingResponse }) => {
    const grapherName = item.grapherName || 'Nhiếp ảnh gia';
    const status = (item.status || '') as keyof typeof BOOKING_STATUS_COLORS;
    const statusColor = BOOKING_STATUS_COLORS[status] || '#6B7280';
    const statusLabel = BOOKING_STATUS_LABELS[status] || item.status || 'N/A';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.grapherInfo}>
            <View style={styles.avatar}>
              {item.grapherAvatar ? (
                <Image source={{ uri: item.grapherAvatar }} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
              ) : (
                <Text style={styles.avatarText}>{grapherName.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <Text style={styles.grapherName}>{grapherName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.serviceName}>{item.serviceName || 'Gói dịch vụ'}</Text>
          <Text style={styles.detailText}>🗓 {formatDate(item.scheduledAt)}</Text>
          <Text style={styles.detailText} numberOfLines={1}>📍 {item.location || 'Chưa cập nhật'}</Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.priceLabel}>Tổng tiền</Text>
          <Text style={styles.priceValue}>{formatCurrency(item.totalAmount || 0)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lịch đặt của tôi</Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterScroll}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterBtn, statusFilter === '' && styles.filterBtnActive]}
              onPress={() => setStatusFilter('')}
            >
              <Text style={[styles.filterText, statusFilter === '' && styles.filterTextActive]}>Tất cả</Text>
            </TouchableOpacity>
            {Object.entries(BOOKING_STATUS_LABELS).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[styles.filterBtn, statusFilter === key && styles.filterBtnActive]}
                onPress={() => setStatusFilter(key)}
              >
                <Text style={[styles.filterText, statusFilter === key && styles.filterTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : (
          <FlatList
            data={filteredBookings}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); fetchBookings(true); }} tintColor="#6366F1" />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📅</Text>
                <Text style={styles.emptyText}>Chưa có lịch đặt nào.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const COLORS = {
  background: '#0F0F1A',
  surface: '#1A1A2E',
  primary: '#6366F1',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: '#2D2D4E',
  cardBorder: '#3D3D6B',
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  header: { padding: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  
  filterScroll: { paddingBottom: 10 },
  filterContainer: { paddingHorizontal: 20, gap: 8 },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  filterBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#FFF' },

  listContainer: { padding: 20, paddingBottom: 40 },
  
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  grapherInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary + '30', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  grapherName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  
  cardBody: { marginBottom: 12, gap: 6 },
  serviceName: { fontSize: 16, color: COLORS.textPrimary, fontWeight: '600' },
  detailText: { fontSize: 13, color: COLORS.textSecondary },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  priceLabel: { fontSize: 13, color: COLORS.textMuted },
  priceValue: { fontSize: 16, fontWeight: '700', color: '#F59E0B' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: COLORS.textSecondary, fontSize: 15 },
});
