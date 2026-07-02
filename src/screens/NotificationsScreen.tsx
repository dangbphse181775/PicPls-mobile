import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import notificationApi from '../api/notificationApi';
import type { NotificationResponse } from '../types/notification.types';
import { COLORS } from '../theme/colors';
import EmptyState from '../components/EmptyState';
import SkeletonLoader from '../components/SkeletonLoader';
import Toast from 'react-native-toast-message';

export default function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(async (pageNum: number, isRefresh = false) => {
    try {
      const data = await notificationApi.getNotifications(pageNum, 20);
      if (isRefresh) {
        setNotifications(data.items);
      } else {
        setNotifications(prev => [...prev, ...data.items]);
      }
      setHasMore(data.page < data.totalPages);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi tải thông báo',
        text2: 'Vui lòng kiểm tra lại kết nối mạng.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1, true);
  }, [fetchNotifications]);

  const onRefresh = () => {
    setIsRefreshing(true);
    setPage(1);
    fetchNotifications(1, true);
  };

  const loadMore = () => {
    if (hasMore && !isLoading && !isRefreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage);
    }
  };

  const markAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      // ignore silently
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      Toast.show({ type: 'success', text1: 'Đã đánh dấu tất cả là đã đọc' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Không thể thực hiện tác vụ này' });
    }
  };

  const renderItem = ({ item }: { item: NotificationResponse }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      onPress={() => markAsRead(item.id, item.isRead)}
      activeOpacity={0.7}
    >
      <View style={styles.iconBox}>
        <Text style={styles.iconText}>{item.type === 'Booking' ? '📅' : '🔔'}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, !item.isRead && styles.unreadText]}>{item.title}</Text>
        <Text style={styles.cardMessage} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.cardTime}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const renderSkeletons = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 12 }}>
      {[1, 2, 3, 4, 5].map((key) => (
        <View key={key} style={{ flexDirection: 'row', gap: 12 }}>
          <SkeletonLoader width={48} height={48} borderRadius={24} />
          <View style={{ flex: 1, gap: 8, justifyContent: 'center' }}>
            <SkeletonLoader width="80%" height={16} />
            <SkeletonLoader width="100%" height={12} />
            <SkeletonLoader width="40%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={styles.markAllText}>Đọc hết</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        renderSkeletons()
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <EmptyState
              icon="📭"
              title="Chưa có thông báo nào"
              subtitle="Khi có hoạt động mới, thông báo sẽ hiển thị ở đây."
            />
          }
          ListFooterComponent={hasMore && notifications.length > 0 ? <ActivityIndicator color={COLORS.primary} style={{ padding: 16 }} /> : null}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 4,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  markAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'flex-start',
  },
  unreadCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
    lineHeight: 20,
  },
  cardTime: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 6,
    marginLeft: 8,
  },
});
