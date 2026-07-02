import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import bookingApi from '../api/bookingApi';
import grapherProfileApi from '../api/grapherProfileApi';
import { COLORS } from '../theme/colors';

// Mượn type từ các API, hoặc định nghĩa inline
import type { GrapherBookingResponse } from '../types/booking.types';
import type { GrapherProfileMeResponse } from '../types/grapher.types';

export default function GrapherDashboardScreen({ navigation }: any) {
  const { user } = useAuthStore();
  
  const [profile, setProfile] = useState<GrapherProfileMeResponse | null>(null);
  const [orders, setOrders] = useState<GrapherBookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [profData, ordersData] = await Promise.all([
        grapherProfileApi.getMe(),
        bookingApi.getGrapherOrders(), // lấy tất cả orders
      ]);
      setProfile(profData);
      setOrders(ordersData);
    } catch (error) {
      console.error('[Dashboard] Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  // Tính toán số liệu tổng quan
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const completedOrders = orders.filter(o => o.status === 'Completed');
  const thisMonthCompletedOrders = completedOrders.filter(o => {
    const d = new Date(o.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlyRevenue = thisMonthCompletedOrders.reduce((sum, o) => sum + (o.grapherPayoutAmount || 0), 0);
  
  const pendingOrdersCount = orders.filter(o => 
    ['PendingPayment', 'PendingConfirmation', 'Confirmed', 'InProgress'].includes(o.status)
  ).length;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tổng quan</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Xin chào, <Text style={{ color: COLORS.primary }}>{profile?.name || user?.name}</Text>!</Text>
        </View>

        {/* 4 Stat Cards */}
        <View style={styles.statsGrid}>
          {/* Doanh thu tháng */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIconGreen}>$</Text>
              <Text style={styles.statLabel}>Doanh thu tháng</Text>
            </View>
            <Text style={styles.statValue}>{formatCurrency(monthlyRevenue)}</Text>
          </View>

          {/* Đơn hoàn thành */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIconPurple}>✅</Text>
              <Text style={styles.statLabel}>Đơn hoàn thành</Text>
            </View>
            <Text style={styles.statValue}>{completedOrders.length}</Text>
          </View>

          {/* Đánh giá TB */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIconOrange}>⭐</Text>
              <Text style={styles.statLabel}>Đánh giá TB</Text>
            </View>
            <Text style={styles.statValue}>
              {profile?.reviewCount && profile.reviewCount > 0 ? profile.rating.toFixed(1) : 'Chưa có'}
            </Text>
          </View>

          {/* Đơn đang xử lý */}
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIconRed}>🕒</Text>
              <Text style={styles.statLabel}>Đơn đang xử lý</Text>
            </View>
            <Text style={styles.statValue}>{pendingOrdersCount}</Text>
          </View>
        </View>

        {/* Chart Placeholder */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>📈 Biểu đồ doanh thu</Text>
          <Text style={styles.chartDesc}>Doanh thu 30 ngày qua sẽ hiển thị tại đây.</Text>
          
          <View style={styles.chartBars}>
            {[30, 50, 40, 70, 45, 80, 65, 90, 75, 85].map((h, i) => (
              <View key={i} style={[styles.chartBar, { height: h }]} />
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Đơn hàng gần đây</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BookingsTab')}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {recentOrders.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có đơn hàng nào.</Text>
          ) : (
            recentOrders.map(order => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderItem}
                onPress={() => navigation.navigate('BookingDetail', { bookingId: order.id })}
                activeOpacity={0.7}
              >
                <View style={styles.orderLeft}>
                  <Text style={styles.orderService}>{order.serviceName}</Text>
                  <Text style={styles.orderCustomer}>{order.customerName}</Text>
                  <Text style={styles.orderDate}>{formatDate(order.scheduledAt)}</Text>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderAmount}>{formatCurrency(order.grapherPayoutAmount)}</Text>
                  <View style={styles.orderStatusTag}>
                    <Text style={styles.orderStatusText}>{order.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  scrollContent: { padding: 20, paddingBottom: 40, gap: 24 },
  
  welcomeSection: {
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  statIconGreen: { fontSize: 16, color: '#10B981' },
  statIconPurple: { fontSize: 16, color: '#8B5CF6' },
  statIconOrange: { fontSize: 16, color: '#F59E0B' },
  statIconRed: { fontSize: 16, color: '#EF4444' },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  chartCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  chartDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 24,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  chartBar: {
    width: 20,
    backgroundColor: COLORS.primaryLight,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    opacity: 0.8,
  },

  recentSection: {
    marginTop: 8,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
  },
  orderLeft: { flex: 1, gap: 4 },
  orderService: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  orderCustomer: { fontSize: 14, color: COLORS.textSecondary },
  orderDate: { fontSize: 12, color: COLORS.textMuted },
  orderRight: { alignItems: 'flex-end', gap: 8 },
  orderAmount: { fontSize: 15, fontWeight: '700', color: '#10B981' },
  orderStatusTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  orderStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
