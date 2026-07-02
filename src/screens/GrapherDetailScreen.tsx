import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import grapherApi from '../api/grapherApi';
import type { RootStackParamList } from '../../App';
import type { GrapherDetailResponse, ServicePackageResponse } from '../types/booking.types';
import { useAuthStore } from '../store/authStore';
import { requireLogin } from '../hooks/useRequireAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'GrapherDetail'>;
const { width } = Dimensions.get('window');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const renderStars = (rating: number) => {
  const full = Math.floor(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function GrapherDetailScreen({ route, navigation }: Props) {
  const { grapherId } = route.params;
  const { user, isAuthenticated } = useAuthStore();
  const userRole = user?.role;
  const isCustomer = userRole === 'Customer';

  const [grapher, setGrapher] = useState<GrapherDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await grapherApi.getDetail(grapherId);
        setGrapher(data);
      } catch (error) {
        console.error('Failed to load grapher detail', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [grapherId]);

  const handleBookPackage = (pkg: ServicePackageResponse) => {
    if (!grapher) return;
    requireLogin(
      navigation,
      'đặt lịch với nhiếp ảnh gia này',
      () =>
        navigation.navigate('CreateBooking', {
          grapherProfileId: grapher.id,
          grapherName: grapher.name,
          servicePackage: pkg,
        }),
      isAuthenticated,
    );
  };

  const handleChat = () => {
    if (!grapher) return;
    requireLogin(
      navigation,
      'nhắn tin với nhiếp ảnh gia này',
      () =>
        navigation.navigate('Chat', {
          otherUserId: grapher.userId,
          otherUserName: grapher.name,
        }),
      isAuthenticated,
    );
  };

  if (isLoading || !grapher) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        {/* ── Header ────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hồ sơ Nhiếp ảnh gia</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {/* ── Profile Header ────────────────────────────────────── */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              {grapher.avatar ? (
                <Image source={{ uri: grapher.avatar }} style={{ width: '100%', height: '100%', borderRadius: 40 }} />
              ) : (
                <Text style={styles.avatarText}>
                  {(grapher.name || '?').charAt(0).toUpperCase()}
                </Text>
              )}
              {grapher.isOnline && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.nameText}>{grapher.name || 'Nhiếp ảnh gia'}</Text>
                {grapher.isVerified && <Text style={styles.verifiedBadge}>✓ Verified</Text>}
              </View>
              <Text style={styles.locationText}>📍 {grapher.location || 'Chưa cập nhật'}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.stars}>{renderStars(grapher.rating || 0)}</Text>
                <Text style={styles.ratingText}>
                  {(grapher.rating || 0).toFixed(1)} ({grapher.reviewCount || 0} đánh giá)
                </Text>
              </View>
            </View>
          </View>

          {/* ── Action Buttons ────────────────────────────────────── */}
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.chatBtn]}
              onPress={handleChat}
            >
              <Text style={styles.chatBtnText}>💬 Nhắn tin</Text>
            </TouchableOpacity>
            {/* Nếu là grapher xem profile của chính họ, có thể edit */}
          </View>

          {/* ── Bio & Styles ──────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Giới thiệu</Text>
            <Text style={styles.bioText}>{grapher.bio || 'Chưa có thông tin giới thiệu.'}</Text>

            <View style={styles.stylesRow}>
              {(grapher.styles || []).map((s) => (
                <View key={s} style={styles.tag}>
                  <Text style={styles.tagText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Portfolio ─────────────────────────────────────────── */}
          {(grapher.portfolio || []).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Portfolio</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.portfolioScroll}>
                {(grapher.portfolio || []).map((imgUrl, idx) => (
                  <Image key={idx} source={{ uri: imgUrl }} style={styles.portfolioImage} />
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── Packages ──────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gói dịch vụ</Text>
            {(grapher.packages || []).length === 0 ? (
              <Text style={styles.emptyText}>Nhiếp ảnh gia này chưa tạo gói dịch vụ nào.</Text>
            ) : (
              (grapher.packages || []).map((pkg) => (
                <View key={pkg.id} style={styles.packageCard}>
                  <View style={styles.packageHeader}>
                    <Text style={styles.packageName}>{pkg.name}</Text>
                    <Text style={styles.packagePrice}>{formatCurrency(pkg.price)}</Text>
                  </View>
                  <Text style={styles.packageDesc}>{pkg.description}</Text>
                  <View style={styles.packageFooter}>
                    <Text style={styles.packageDuration}>⏱ {pkg.durationMinutes >= 60 ? `${pkg.durationMinutes/60} giờ` : `${pkg.durationMinutes} phút`}</Text>
                    {userRole !== 'Grapher' && (
                      <TouchableOpacity
                        style={styles.bookBtn}
                        onPress={() => handleBookPackage(pkg)}
                      >
                        <Text style={styles.bookBtnText}>
                          {isAuthenticated ? 'Đặt lịch' : 'Đặt lịch (cần đăng nhập)'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
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
  primaryLight: '#818CF8',
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { color: COLORS.textMuted, marginTop: 12 },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 24, color: COLORS.textPrimary },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },

  container: { flex: 1 },
  contentContainer: { paddingBottom: 40 },

  profileHeader: { flexDirection: 'row', padding: 20, gap: 16, alignItems: 'center' },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '25',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: COLORS.primaryLight },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  profileInfo: { flex: 1, gap: 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameText: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  verifiedBadge: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: '700',
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  locationText: { fontSize: 13, color: COLORS.textMuted },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stars: { fontSize: 13, color: COLORS.accent },
  ratingText: { fontSize: 13, color: COLORS.textSecondary },

  actionRow: { paddingHorizontal: 20, paddingBottom: 20, flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  chatBtn: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.primary },
  chatBtnText: { color: COLORS.primaryLight, fontWeight: '700', fontSize: 14 },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  bioText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 12 },
  
  stylesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: COLORS.primary + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  tagText: { fontSize: 12, color: COLORS.primaryLight, fontWeight: '600' },

  portfolioScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
  portfolioImage: { width: 140, height: 180, borderRadius: 12, marginRight: 12, backgroundColor: COLORS.surface },

  emptyText: { color: COLORS.textMuted, fontStyle: 'italic' },
  
  packageCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
  },
  packageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  packageName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, flex: 1, marginRight: 8 },
  packagePrice: { fontSize: 16, fontWeight: '800', color: COLORS.accent },
  packageDesc: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 16, lineHeight: 20 },
  packageFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  packageDuration: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  bookBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  bookBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
});
