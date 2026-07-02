import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import grapherApi from '../api/grapherApi';
import Button from '../components/Button';
import Card from '../components/Card';
import Dropdown from '../components/Dropdown';
import EmptyState from '../components/EmptyState';
import GrapherListItem from '../components/GrapherListItem';
import Loading from '../components/Loading';
import { COLORS } from '../theme/colors';
import type { GrapherSummaryResponse } from '../types/booking.types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'MainTabs'> & {
  navigation: any;
};

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

const LOCATIONS = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Huế',
  'Hội An',
  'Nha Trang',
  'Đà Lạt',
];

export default function PublicHomeScreen({ navigation }: Props) {
  const [graphers, setGraphers] = useState<GrapherSummaryResponse[]>([]);
  const [filtered, setFiltered] = useState<GrapherSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeLocation, setActiveLocation] = useState<string>('');
  const [activeStyle, setActiveStyle] = useState<string>('');
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
        const data = await grapherApi.search({
          location: activeLocation || undefined,
          style: activeStyle || undefined,
        });
        if (isMounted.current) {
          setGraphers(data);
          setFiltered(data);
        }
      } catch (e) {
        if (isMounted.current)
          Alert.alert('Lỗi', 'Không thể tải danh sách nhiếp ảnh gia. Vui lòng thử lại.');
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [activeLocation, activeStyle],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(graphers);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      graphers.filter(
        g =>
          (g.name || '').toLowerCase().includes(q) ||
          (g.location || '').toLowerCase().includes(q) ||
          (g.styles || []).some(s => s.toLowerCase().includes(q)),
      ),
    );
  }, [search, graphers]);

  const featured = graphers.filter(g => g.isVerified).slice(0, 5);

  const goLogin = () => navigation.navigate('Login');
  const goRegister = () => navigation.navigate('Register');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={filtered}
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
            {/* Hero */}
            <View style={styles.hero}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>📸 PicMate</Text>
              </View>
              <Text style={styles.heroTitle}>Tìm nhiếp ảnh gia{`\n`}cho khoảnh khắc của bạn</Text>
              <Text style={styles.heroSubtitle}>
                Khám phá hàng trăm thợ chụp chuyên nghiệp trên toàn quốc
              </Text>
              <View style={styles.searchRow}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tìm tên, địa điểm, phong cách..."
                  placeholderTextColor={COLORS.textMuted}
                  value={search}
                  onChangeText={setSearch}
                />
                {search ? (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Text style={styles.clearIcon}>✕</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Login CTA */}
            <Card style={styles.cta} padding={18}>
              <Text style={styles.ctaTitle}>Đăng nhập để đặt lịch & nhắn tin</Text>
              <Text style={styles.ctaDesc}>
                Tạo tài khoản miễn phí để bắt đầu trải nghiệm đầy đủ tính năng.
              </Text>
              <View style={styles.ctaRow}>
                <Button
                  title="Đăng nhập"
                  onPress={goLogin}
                  size="sm"
                  style={styles.ctaBtn}
                />
                <Button
                  title="Đăng ký"
                  onPress={goRegister}
                  variant="outline"
                  size="sm"
                  style={styles.ctaBtn}
                />
              </View>
            </Card>

            {/* Featured */}
            {!isLoading && featured.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>⭐ Nhiếp ảnh gia nổi bật</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.featuredScroll}
                >
                  {featured.map(g => (
                    <View key={g.id} style={styles.featuredWrap}>
                      <GrapherListItem
                        grapher={g}
                        variant="grid"
                        onPress={() =>
                          navigation.navigate('GrapherDetail', { grapherId: g.id })
                        }
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Filters */}
            <View style={styles.filterGroup}>
              <View style={{ flex: 1 }}>
                <Dropdown
                  label="📍 Khu vực"
                  icon=""
                  placeholder="Tất cả khu vực"
                  value={activeLocation}
                  options={LOCATIONS.map(l => ({ value: l, label: l }))}
                  onChange={v => setActiveLocation(v as string)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Dropdown
                  label="🎨 Phong cách"
                  icon=""
                  placeholder="Tất cả phong cách"
                  value={activeStyle}
                  options={STYLES.map(s => ({ value: s, label: s }))}
                  onChange={v => setActiveStyle(v as string)}
                />
              </View>
            </View>

            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>
                {filtered.length} nhiếp ảnh gia
                {activeLocation || activeStyle
                  ? ` (${[activeLocation, activeStyle].filter(Boolean).join(' • ')})`
                  : ''}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState
              icon="🔍"
              title="Không tìm thấy kết quả"
              subtitle="Thử bỏ bộ lọc hoặc thay đổi từ khoá"
              action={
                activeLocation || activeStyle ? (
                  <Button
                    title="Xoá bộ lọc"
                    size="sm"
                    variant="outline"
                    onPress={() => {
                      setActiveLocation('');
                      setActiveStyle('');
                    }}
                  />
                ) : undefined
              }
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
  listContent: { paddingBottom: 32, paddingHorizontal: 20 },

  // Hero
  hero: { paddingTop: 14, paddingBottom: 8 },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  heroBadgeText: { color: COLORS.primaryLight, fontSize: 12, fontWeight: '700' },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 36,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 18, lineHeight: 20 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26,26,46,0.92)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  clearIcon: { fontSize: 14, color: COLORS.textMuted, paddingHorizontal: 4 },

  // CTA
  cta: { marginTop: 8, marginBottom: 20, backgroundColor: COLORS.surface },
  ctaTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  ctaDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 14 },
  ctaRow: { flexDirection: 'row', gap: 10 },
  ctaBtn: { flex: 1 },

  // Sections
  section: { marginTop: 18, marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10 },

  // Filter group (dropdown row)
  filterGroup: { flexDirection: 'row', gap: 10, marginTop: 18, marginBottom: 4 },

  // Featured
  featuredScroll: { paddingRight: 12, gap: 0 },
  featuredWrap: { width: 160, marginRight: 10 },

  // Chips
  chipRow: { flexDirection: 'row', gap: 8, paddingRight: 12 },
  styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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

  // Result header
  resultHeader: { marginTop: 24, marginBottom: 12 },
  resultTitle: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
});
