import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import messageApi from '../api/messageApi';
import type { ConversationContact } from '../types/message.types';
import type { RootStackParamList } from '../../App';
import { useAuthStore } from '../store/authStore';

// Ở TabNavigator truyền navigation này là của Tab, nhưng ta có thể ép kiểu any
type Props = any;

export default function ConversationsScreen({ navigation }: Props) {
  const [contacts, setContacts] = useState<ConversationContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchContacts = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await messageApi.getConversations();
      setContacts(data);
    } catch (error) {
      console.error('Lỗi tải danh sách tin nhắn', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchContacts(true);
    });
    fetchContacts();
    return unsubscribe;
  }, [fetchContacts, navigation]);

  const renderItem = ({ item }: { item: ConversationContact }) => {
    const initial = (item.fullName || '?').charAt(0).toUpperCase();
    return (
      <TouchableOpacity
        style={styles.contactItem}
        onPress={() => navigation.navigate('Chat', { otherUserId: item.id, otherUserName: item.fullName || 'Người dùng' })}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          {item.avatarUrl ? (
            <Text style={styles.avatarText}>IMG</Text> // Dùng component Image thực tế
          ) : (
            <Text style={styles.avatarText}>{initial}</Text>
          )}
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.fullName || 'Người dùng'}</Text>
          <Text style={styles.contactRole}>{item.role || 'Thành viên'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tin nhắn</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : (
          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); fetchContacts(true); }} tintColor="#6366F1" />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào.</Text>
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
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  header: { padding: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  
  listContainer: { paddingVertical: 10 },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  contactRole: { fontSize: 13, color: COLORS.textSecondary },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: COLORS.textSecondary, fontSize: 15 },
});
