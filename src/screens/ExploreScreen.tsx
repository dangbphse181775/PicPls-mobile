import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import grapherApi from '../api/grapherApi';
import Card from '../components/Card';
import Dropdown from '../components/Dropdown';
import EmptyState from '../components/EmptyState';
import GrapherListItem from '../components/GrapherListItem';
import Loading from '../components/Loading';
import { COLORS } from '../theme/colors';
import type { GrapherSummaryResponse } from '../types/booking.types';

const STYLES = [
  'Chân dung',
  'Cưới hỏi',
  'Sản phẩm',
  'Kiến trúc',
  'Phong cảnh',
  'Đường phố',
  'Gia đình',
  'Trẻ em',
  'Thời trang',
  'Nghệ thuật',
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const renderStars = (rating: number) => {
  const full = Math.floor(rating || 0);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
};

interface Props {
  navigation: any;
}

export default function ExploreScreen({ navigation }: Props) {
  const [graphers, setGraphers] = useState<GrapherSummaryResponse[]>([]);
  const [activeStyle, setActiveStyle] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'price'>('rating');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      try {
        const data = await grapherApi.search({ style: activeStyle || undefined });
        if (isMounted.current) setGraphers(data);
      } catch (e) {
        if (isMounted.current)
          Alert.alert('Lỗi', 'Không thể tải danh sách. Vui lòng thử lại.');
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [activeStyle],
  );

  useEffect(() => {
    load();
  }, [load]);

  const sorted = [...graphers].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return (a.pricing?.hourly || 0) - (b.pricing?.hourly || 0);
  });

  const portfolioFlat = sorted.flatMap(g =>
    (g.portfolio || []).slice(0, 4).map(url => ({ url, grapher: g })),
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Khám phá</Text>
        <Text style={styles.headerSubtitle}>Portfolio & phong cách nổi bật</Text>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <GrapherListItem
            grapher={item}
            onPress={() => navigation.navigate('GrapherDetail', { grapherId: item.id })}
          />
        )}
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
            {/* Portfolio mosaic */}
            {portfolioFlat.length > 0 && (
              <View style={styles.mosaicSection}>
                <Text style={styles.sectionTitle}>📷 Portfolio nổi bật</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.mosaicScroll}
                >
                  {portfolioFlat.map((p, idx) => (
                    <TouchableOpacity
                      key={`${p.grapher.id}-${idx}`}
                      style={styles.mosaicItem}
                      activeOpacity={0.85}
                      onPress={() =>
                        navigation.navigate('GrapherDetail', { grapherId: p.grapher.id })
                      }
                    >
                      <View style={styles.mosaicImgWrap}>
                        <View style={styles.mosaicImgBg} />
                        <View style={styles.mosaicImgOverlay}>
                          <Text style={styles.mosaicImgLabel}>
                            {p.grapher.name?.split(' ').pop()}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Style filter + Sort */}
            <View style={styles.filterGroup}>
              <View style={{ flex: 1 }}>
                <Dropdown
                  label="🎨 Phong cách"
                  placeholder="Tất cả phong cách"
                  value={activeStyle}
                  options={STYLES.map(s => ({ value: s, label: s }))}
                  onChange={v => setActiveStyle(v as string)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Dropdown
                  label="🔃 Sắp xếp"
                  placeholder="Mặc định"
                  value={sortBy}
                  allowClear={false}
                  options={[
                    { value: 'rating', label: '⭐ Rating cao nhất' },
                    { value: 'price', label: '💰 Giá thấp nhất' },
                  ]}
                  onChange={v => setSortBy(v as 'rating' | 'price')}
                />
              </View>
            </View>

            <View style={styles.sortRow}>
              <Text style={styles.resultTitle}>
                {sorted.length} nhiếp ảnh gia {activeStyle ? `cho "${activeStyle}"` : ''}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState
              icon="🖼️"
              title="Chưa có portfolio"
              subtitle="Thử chọn phong cách khác để khám phá thêm"
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

  listContent: { paddingHorizontal: 20, paddingBottom: 32 },

  // Mosaic
  mosaicSection: { marginTop: 18 },
  mosaicScroll: { paddingRight: 12, gap: 10 },
  mosaicItem: { marginRight: 10 },
  mosaicImgWrap: {
    width: 130,
    height: 170,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    position: 'relative',
  },
  mosaicImgBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary + '40',
  },
  mosaicImgOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(15,15,26,0.85)',
  },
  mosaicImgLabel: { color: COLORS.white, fontSize: 12, fontWeight: '700' },

  // Section
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10 },

  // Filter group (dropdown row)
  filterGroup: { flexDirection: 'row', gap: 10, marginTop: 18, marginBottom: 4 },

  // Chips
  chipRow: { flexDirection: 'row', gap: 8, paddingRight: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  chipTextActive: { color: COLORS.white },

  // Sort
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  resultTitle: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600', flex: 1 },
  sortBtns: { flexDirection: 'row', gap: 6 },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortBtnActive: { backgroundColor: COLORS.primarySoft, borderColor: COLORS.primary },
  sortBtnText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  sortBtnTextActive: { color: COLORS.primaryLight },
});
