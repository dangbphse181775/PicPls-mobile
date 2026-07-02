import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import bootstrapApi from '../api/bootstrapApi';
import Card from '../components/Card';
import Dropdown from '../components/Dropdown';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import { COLORS } from '../theme/colors';
import type { PresetResponse } from '../types/grapher.types';
import { useAuthStore } from '../store/authStore';
import { requireLogin } from '../hooks/useRequireAuth';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const CATEGORIES = [
  'Tất cả',
  'Vintage',
  'Cinematic',
  'Pastel',
  'Moody',
  'Wedding',
  'Film',
  'B&W',
  'Travel',
];

interface Props {
  navigation: any;
}

export default function PresetShopScreen({ navigation }: Props) {
  const { isAuthenticated } = useAuthStore();
  const [presets, setPresets] = useState<PresetResponse[]>([]);
  const [activeCat, setActiveCat] = useState('Tất cả');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await bootstrapApi.get();
      setPresets(data.presets || []);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể tải preset shop. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categories = ['Tất cả', ...Array.from(new Set(presets.map(p => p.category)))];
  const filtered =
    activeCat === 'Tất cả' ? presets : presets.filter(p => p.category === activeCat);

  const onDownload = (preset: PresetResponse) => {
    requireLogin(
      navigation,
      `tải preset "${preset.name}"`,
      () => {
        Alert.alert(
          'Tải preset',
          `Tính năng tải preset "${preset.name}" đang được phát triển. Bạn sẽ nhận được thông báo khi có bản cập nhật.`,
          [{ text: 'Đã hiểu', style: 'default' }],
        );
      },
      isAuthenticated,
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Preset Shop</Text>
        <Text style={styles.headerSubtitle}>
          Bộ lọc màu chuyên nghiệp cho ảnh của bạn ✨
        </Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
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
        ListHeaderComponent={
          <View>
            <View style={styles.banner}>
              <View style={styles.bannerIconWrap}>
                <Text style={styles.bannerIcon}>🎨</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>Preset chất lượng cao</Text>
                <Text style={styles.bannerDesc}>
                  Sử dụng ngay trong 1 cú chạm, biến ảnh thường thành ảnh nghệ thuật
                </Text>
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Dropdown
                label="📂 Danh mục"
                placeholder="Tất cả danh mục"
                value={activeCat}
                options={categories.map(c => ({ value: c, label: c }))}
                onChange={v => setActiveCat(v as string)}
              />
            </View>

            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>
                {filtered.length} preset {activeCat !== 'Tất cả' ? `cho "${activeCat}"` : ''}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.presetCard} padding={0}>
            <View style={styles.presetThumb}>
              <View style={styles.presetThumbInner}>
                <Text style={styles.presetThumbEmoji}>🎞️</Text>
              </View>
              <View style={styles.presetCatBadge}>
                <Text style={styles.presetCatText}>{item.category}</Text>
              </View>
            </View>
            <View style={styles.presetBody}>
              <Text style={styles.presetName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.presetMeta}>
                <Text style={styles.presetRating}>⭐ {item.rating.toFixed(1)}</Text>
                <Text style={styles.presetDownloads}>📥 {item.downloads}</Text>
              </View>
              <View style={styles.presetFooter}>
                <Text style={styles.presetPrice}>
                  {item.price > 0 ? formatCurrency(item.price) : 'Miễn phí'}
                </Text>
                <TouchableOpacity
                  style={styles.presetDownloadBtn}
                  onPress={() => onDownload(item)}
                >
                  <Text style={styles.presetDownloadText}>
                    {isAuthenticated ? 'Tải về' : '🔒 Tải về'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState
              icon="🎨"
              title="Chưa có preset nào"
              subtitle="Vui lòng quay lại sau"
            />
          )
        }
      />
      {isLoading && <Loading />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  header: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  headerSubtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },

  listContent: { paddingHorizontal: 14, paddingBottom: 32 },
  row: { justifyContent: 'space-between' },

  // Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 12,
  },
  bannerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerIcon: { fontSize: 22 },
  bannerTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  bannerDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },

  // Categories
  catRow: { paddingHorizontal: 6, paddingTop: 16, gap: 8, paddingRight: 12 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catChipText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  catChipTextActive: { color: COLORS.white },

  // Filter group (dropdown row)
  filterGroup: { marginTop: 16, marginBottom: 4 },

  // Result
  resultHeader: { marginTop: 18, marginBottom: 10, paddingHorizontal: 6 },
  resultTitle: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },

  // Preset card
  presetCard: {
    width: '47%',
    margin: 6,
    overflow: 'hidden',
  },
  presetThumb: {
    height: 110,
    backgroundColor: COLORS.primarySoft,
    position: 'relative',
  },
  presetThumbInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetThumbEmoji: { fontSize: 36 },
  presetCatBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(15,15,26,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  presetCatText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  presetBody: { padding: 12, gap: 6 },
  presetName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  presetMeta: { flexDirection: 'row', gap: 10 },
  presetRating: { fontSize: 11, color: COLORS.accent, fontWeight: '600' },
  presetDownloads: { fontSize: 11, color: COLORS.textMuted },
  presetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  presetPrice: { fontSize: 13, fontWeight: '800', color: COLORS.primaryLight },
  presetDownloadBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  presetDownloadText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
});
