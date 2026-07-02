import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Alert,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import grapherApi from '../api/grapherApi';
import { useAuthStore } from '../store/authStore';
import type { GrapherSummaryResponse } from '../types/booking.types';

type Props = any;

// ─── Constants ────────────────────────────────────────────────────────────────
const STYLES_OPTIONS = [
  'Chân dung', 'Cưới hỏi', 'Sản phẩm', 'Kiến trúc',
  'Phong cảnh', 'Đường phố', 'Gia đình', 'Trẻ em',
  'Thời trang', 'Nghệ thuật',
];
const LOCATIONS = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Huế', 'Hội An', 'Nha Trang', 'Đà Lạt'];
const PRICE_RANGES = [
  { label: 'Dưới 200k', min: 0, max: 200000 },
  { label: '200k - 500k', min: 200000, max: 500000 },
  { label: '500k - 1tr', min: 500000, max: 1000000 },
  { label: '1tr - 2tr', min: 1000000, max: 2000000 },
  { label: 'Trên 2tr', min: 2000000, max: 999999999 },
];
const RATING_OPTIONS = [
  { label: '4.5+', value: 4.5 },
  { label: '4.0+', value: 4.0 },
  { label: '3.5+', value: 3.5 },
];

// ─── Filter State ─────────────────────────────────────────────────────────────
interface FilterState {
  location: string;
  style: string;
  priceRange: { min: number; max: number } | null;
  minRating: number | null;
  verified: boolean;
}
const DEFAULT_FILTER: FilterState = { location: '', style: '', priceRange: null, minRating: null, verified: false };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
const renderStars = (rating: number) => '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));

// ─── Component ────────────────────────────────────────────────────────────────
import notificationApi from '../api/notificationApi';

export default function HomeScreen({ navigation }: Props) {
  const { user, clearAuth } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [graphers, setGraphers] = useState<GrapherSummaryResponse[]>([]);
  const [filteredGraphers, setFilteredGraphers] = useState<GrapherSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [tempFilter, setTempFilter] = useState<FilterState>(DEFAULT_FILTER);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const loadUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const count = await notificationApi.getUnreadCount();
      if (isMounted.current) setUnreadCount(count);
    } catch {
      // ignore
    }
  }, [user]);

  const loadGraphers = useCallback(async (silent = false) => {
    if (!silent && isMounted.current) setIsLoading(true);
    try {
      const data = await grapherApi.search({
        location: filter.location || undefined,
        style: filter.style || undefined,
        minPrice: filter.priceRange?.min,
        maxPrice: filter.priceRange?.max,
        minRating: filter.minRating || undefined,
        verified: filter.verified || undefined,
      });
      if (isMounted.current) {
        setGraphers(data);
        setFilteredGraphers(data);
      }
    } catch {
      if (isMounted.current)
        Alert.alert('Lỗi', 'Không thể tải danh sách nhiếp ảnh gia. Vui lòng thử lại.');
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [filter]);

  useEffect(() => { loadGraphers(); loadUnreadCount(); }, [loadGraphers, loadUnreadCount]);

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredGraphers(graphers);
    } else {
      const q = searchText.toLowerCase();
      setFilteredGraphers(graphers.filter(g =>
        (g.name || '').toLowerCase().includes(q) ||
        (g.location || '').toLowerCase().includes(q) ||
        (g.styles || []).some(s => s.toLowerCase().includes(q))
      ));
    }
  }, [searchText, graphers]);

  const activeFilterCount = [filter.location, filter.style, filter.priceRange, filter.minRating, filter.verified].filter(Boolean).length;

  const handleLogout = () => Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
    { text: 'Hủy', style: 'cancel' },
    { text: 'Đăng xuất', style: 'destructive', onPress: clearAuth },
  ]);

  const openFilter = () => { setTempFilter({ ...filter }); setShowFilter(true); };
  const applyFilter = () => { setFilter({ ...tempFilter }); setShowFilter(false); };
  const resetFilter = () => setTempFilter({ ...DEFAULT_FILTER });

  // ── Render Item ─────────────────────────────────────────────────────────────
  const renderGrapher = ({ item }: { item: GrapherSummaryResponse }) => {
    const name = item.name || 'Nhiếp ảnh gia';
    const location = item.location || 'Chưa cập nhật';
    const initial = (name || '?').charAt(0).toUpperCase();
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('GrapherDetail', { grapherId: item.id })}
        activeOpacity={0.85}
      >
        <View style={styles.avatarWrapper}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={{ width: '100%', height: '100%', borderRadius: 18 }} />
          ) : (
            <Text style={styles.avatarText}>{initial}</Text>
          )}
          {item.isOnline && <View style={styles.onlineDot} />}
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardRow}>
            <Text style={styles.cardName} numberOfLines={1}>{name}</Text>
            {item.isVerified && <Text style={styles.verifiedBadge}>✓ Verified</Text>}
          </View>
          <Text style={styles.cardLocation} numberOfLines={1}>📍 {location}</Text>
          <View style={styles.tagsRow}>
            {(item.styles || []).slice(0, 3).map(s => (
              <View key={s} style={styles.tag}><Text style={styles.tagText}>{s}</Text></View>
            ))}
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.ratingRow}>
              <Text style={styles.stars}>{renderStars(item.rating || 0)}</Text>
              <Text style={styles.ratingText}>{(item.rating || 0).toFixed(1)} ({item.reviewCount || 0})</Text>
            </View>
            <Text style={styles.priceText}>từ {formatCurrency(item.pricing?.hourly || 0)}/giờ</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
      <Text style={styles.emptySubtitle}>{activeFilterCount > 0 ? 'Thử bỏ bớt bộ lọc để xem nhiều hơn' : 'Thử từ khóa khác'}</Text>
      {activeFilterCount > 0 && (
        <TouchableOpacity style={styles.clearFilterBtn} onPress={() => setFilter(DEFAULT_FILTER)}>
          <Text style={styles.clearFilterText}>Xóa bộ lọc</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* ── Top Bar ────────────────────────────────────────────────── */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greetingText}>
              Xin chào, {(user?.name || 'bạn').split(' ').filter(Boolean).pop() || 'bạn'} 👋
            </Text>
            <Text style={styles.topBarTitle}>Tìm nhiếp ảnh gia</Text>
          </View>
          <View style={styles.topBarRight}>
            <TouchableOpacity style={styles.bellIconBtn} onPress={() => navigation.navigate('Notifications')}>
              <Text style={styles.bellIconText}>🔔</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarSmall} onPress={handleLogout}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%', borderRadius: 21 }} />
              ) : (
                <Text style={styles.avatarSmallText}>{(user?.name || '?').charAt(0).toUpperCase()}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Search + Filter Row ────────────────────────────────────── */}
        <View style={styles.searchRow}>
          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm tên, địa điểm, phong cách..."
              placeholderTextColor={COLORS.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              clearButtonMode="while-editing"
            />
          </View>
          <TouchableOpacity style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]} onPress={openFilter}>
            <Text style={styles.filterIcon}>⚙️</Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Active Filter Chips ────────────────────────────────────── */}
        {activeFilterCount > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContainer}>
            {filter.location ? (
              <TouchableOpacity style={styles.chip} onPress={() => setFilter(f => ({ ...f, location: '' }))}>
                <Text style={styles.chipText}>📍 {filter.location} ✕</Text>
              </TouchableOpacity>
            ) : null}
            {filter.style ? (
              <TouchableOpacity style={styles.chip} onPress={() => setFilter(f => ({ ...f, style: '' }))}>
                <Text style={styles.chipText}>🎨 {filter.style} ✕</Text>
              </TouchableOpacity>
            ) : null}
            {filter.priceRange ? (
              <TouchableOpacity style={styles.chip} onPress={() => setFilter(f => ({ ...f, priceRange: null }))}>
                <Text style={styles.chipText}>💰 {PRICE_RANGES.find(p => p.min === filter.priceRange?.min)?.label} ✕</Text>
              </TouchableOpacity>
            ) : null}
            {filter.minRating ? (
              <TouchableOpacity style={styles.chip} onPress={() => setFilter(f => ({ ...f, minRating: null }))}>
                <Text style={styles.chipText}>⭐ {filter.minRating}+ ✕</Text>
              </TouchableOpacity>
            ) : null}
            {filter.verified ? (
              <TouchableOpacity style={styles.chip} onPress={() => setFilter(f => ({ ...f, verified: false }))}>
                <Text style={styles.chipText}>✓ Đã xác minh ✕</Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        )}

        {/* ── Stats ──────────────────────────────────────────────────── */}
        {!isLoading && (
          <View style={styles.statsBar}>
            <Text style={styles.statsText}>{filteredGraphers.length} nhiếp ảnh gia{searchText ? ` cho "${searchText}"` : ' có mặt'}</Text>
          </View>
        )}

        {/* ── List ───────────────────────────────────────────────────── */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredGraphers}
            keyExtractor={item => item.id}
            renderItem={renderGrapher}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
            maxToRenderPerBatch={10}
            windowSize={10}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); loadGraphers(true); }} tintColor={COLORS.primary} />
            }
          />
        )}
      </SafeAreaView>

      {/* ── Filter Modal ───────────────────────────────────────────── */}
      <Modal visible={showFilter} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bộ lọc nâng cao</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <Text style={styles.sectionLabel}>📍 Địa điểm</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsRow}>
                {LOCATIONS.map(loc => (
                  <TouchableOpacity
                    key={loc}
                    style={[styles.optionChip, tempFilter.location === loc && styles.optionChipActive]}
                    onPress={() => setTempFilter(f => ({ ...f, location: f.location === loc ? '' : loc }))}
                  >
                    <Text style={[styles.optionChipText, tempFilter.location === loc && styles.optionChipTextActive]}>{loc}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.sectionLabel}>🎨 Phong cách chụp</Text>
              <View style={styles.optionsGrid}>
                {STYLES_OPTIONS.map(style => (
                  <TouchableOpacity
                    key={style}
                    style={[styles.optionChip, tempFilter.style === style && styles.optionChipActive]}
                    onPress={() => setTempFilter(f => ({ ...f, style: f.style === style ? '' : style }))}
                  >
                    <Text style={[styles.optionChipText, tempFilter.style === style && styles.optionChipTextActive]}>{style}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>💰 Khoảng giá (giờ)</Text>
              <View style={styles.optionsGrid}>
                {PRICE_RANGES.map(range => (
                  <TouchableOpacity
                    key={range.label}
                    style={[styles.optionChip, tempFilter.priceRange?.min === range.min && styles.optionChipActive]}
                    onPress={() => setTempFilter(f => ({ ...f, priceRange: f.priceRange?.min === range.min ? null : { min: range.min, max: range.max } }))}
                  >
                    <Text style={[styles.optionChipText, tempFilter.priceRange?.min === range.min && styles.optionChipTextActive]}>{range.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>⭐ Đánh giá tối thiểu</Text>
              <View style={styles.optionsRow2}>
                {RATING_OPTIONS.map(r => (
                  <TouchableOpacity
                    key={r.label}
                    style={[styles.optionChip, tempFilter.minRating === r.value && styles.optionChipActive]}
                    onPress={() => setTempFilter(f => ({ ...f, minRating: f.minRating === r.value ? null : r.value }))}
                  >
                    <Text style={[styles.optionChipText, tempFilter.minRating === r.value && styles.optionChipTextActive]}>⭐ {r.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>✅ Trạng thái</Text>
              <TouchableOpacity
                style={[styles.toggleRow, tempFilter.verified && styles.toggleRowActive]}
                onPress={() => setTempFilter(f => ({ ...f, verified: !f.verified }))}
              >
                <Text style={styles.toggleLabel}>Chỉ hiện nhiếp ảnh gia đã xác minh</Text>
                <View style={[styles.toggle, tempFilter.verified && styles.toggleOn]}>
                  <View style={[styles.toggleThumb, tempFilter.verified && styles.toggleThumbOn]} />
                </View>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.resetBtn} onPress={resetFilter}>
                <Text style={styles.resetBtnText}>Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={applyFilter}>
                <Text style={styles.applyBtnText}>Áp dụng bộ lọc</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Colors ───────────────────────────────────────────────────────────────────
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Root wrapper — transparent so AppBackground from App.tsx shows through
  container: { flex: 1, backgroundColor: 'transparent' },
  safeArea: { flex: 1, backgroundColor: 'transparent' },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  greetingText: { fontSize: 12, color: COLORS.textMuted, marginBottom: 2 },
  topBarTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  bellIconBtn: { position: 'relative', padding: 4 },
  bellIconText: { fontSize: 24 },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0F0F1A',
  },
  unreadBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  avatarSmall: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.primary + '30',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.primary,
  },
  avatarSmallText: { fontSize: 18, fontWeight: '700', color: COLORS.primaryLight },

  searchRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 10, gap: 10, alignItems: 'center' },
  searchWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(26,26,46,0.9)',
    borderRadius: 14, borderWidth: 1, borderColor: COLORS.cardBorder,
    paddingHorizontal: 14, paddingVertical: 11, gap: 10,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  filterBtn: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: 'rgba(26,26,46,0.9)',
    borderWidth: 1, borderColor: COLORS.cardBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  filterBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '25' },
  filterIcon: { fontSize: 18 },
  filterBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 8, minWidth: 16, height: 16,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3,
  },
  filterBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFF' },

  chipScroll: { maxHeight: 38, marginBottom: 6 },
  chipContainer: { paddingHorizontal: 20, gap: 8 },
  chip: {
    backgroundColor: COLORS.primary + '30',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: COLORS.primary + '60',
  },
  chipText: { fontSize: 12, color: COLORS.primaryLight, fontWeight: '600' },

  statsBar: { paddingHorizontal: 20, marginBottom: 8 },
  statsText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },

  listContent: { paddingHorizontal: 20, paddingBottom: 24 },

  card: {
    backgroundColor: 'rgba(26,26,46,0.88)',
    borderRadius: 18, borderWidth: 1, borderColor: COLORS.cardBorder,
    flexDirection: 'row', padding: 14, marginBottom: 12, gap: 14,
  },
  avatarWrapper: {
    width: 62, height: 62, borderRadius: 18,
    backgroundColor: COLORS.primary + '25',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0, borderWidth: 1, borderColor: COLORS.primary + '40',
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: COLORS.primaryLight },
  onlineDot: {
    position: 'absolute', bottom: 3, right: 3,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: COLORS.success, borderWidth: 2, borderColor: COLORS.surface,
  },
  cardContent: { flex: 1, gap: 4 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  verifiedBadge: {
    fontSize: 10, color: COLORS.success, fontWeight: '600',
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  cardLocation: { fontSize: 12, color: COLORS.textMuted },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  tag: { backgroundColor: COLORS.primary + '20', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  tagText: { fontSize: 10, color: COLORS.primaryLight, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stars: { fontSize: 11, color: COLORS.accent },
  ratingText: { fontSize: 11, color: COLORS.textMuted },
  priceText: { fontSize: 12, color: COLORS.accent, fontWeight: '700' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: COLORS.textMuted },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  emptySubtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
  clearFilterBtn: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: COLORS.primary, borderRadius: 12 },
  clearFilterText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '85%',
    borderWidth: 1, borderBottomWidth: 0, borderColor: COLORS.cardBorder,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  modalClose: { fontSize: 18, color: COLORS.textMuted, fontWeight: '600' },
  modalScroll: { padding: 20 },
  sectionLabel: {
    fontSize: 13, fontWeight: '700', color: COLORS.textSecondary,
    marginBottom: 10, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  optionsRow: { flexDirection: 'row', gap: 8, paddingRight: 20 },
  optionsRow2: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
  },
  optionChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  optionChipTextActive: { color: '#FFF' },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.background, padding: 14, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 20,
  },
  toggleRowActive: { borderColor: COLORS.primary },
  toggleLabel: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600', flex: 1, marginRight: 10 },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: COLORS.border, padding: 2, justifyContent: 'center' },
  toggleOn: { backgroundColor: COLORS.primary },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF' },
  toggleThumbOn: { alignSelf: 'flex-end' },
  modalFooter: { flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: COLORS.border },
  resetBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  resetBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary },
  applyBtn: { flex: 2, paddingVertical: 14, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center' },
  applyBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
