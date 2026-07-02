import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import grapherProfileApi from '../api/grapherProfileApi';
import uploadApi from '../api/uploadApi';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import { COLORS } from '../theme/colors';

interface Props {
  navigation: any;
}

export default function GrapherPortfolioManagerScreen({ navigation }: Props) {
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await grapherProfileApi.getMe();
      const items = Array.isArray(data.portfolio)
        ? data.portfolio.map((p: any) => (typeof p === 'string' ? p : p.imageUrl))
        : [];
      setPortfolio(items);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể tải portfolio.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Cấp quyền', 'Cần quyền truy cập thư viện ảnh.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
    });
    if (result.canceled) return;

    setIsUploading(true);
    try {
      const urls: string[] = [];
      for (const asset of result.assets) {
        const ext = asset.uri.split('.').pop() || 'jpg';
        const url = await uploadApi.uploadImage(
          asset.uri,
          `portfolio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`,
          `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        );
        urls.push(url);
      }
      setPortfolio(prev => [...prev, ...urls]);
    } catch (e: any) {
      Alert.alert('Lỗi', 'Không thể upload ảnh. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (idx: number) => {
    Alert.alert('Xoá ảnh', 'Bạn có chắc muốn xoá ảnh này khỏi portfolio?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: () => setPortfolio(prev => prev.filter((_, i) => i !== idx)),
      },
    ]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const me = await grapherProfileApi.getMe();
      await grapherProfileApi.updateMe({
        bio: me.bio || '',
        location: me.location || '',
        styles: me.styles || [],
        portfolio,
        equipment: me.equipment || null,
        servicePackages: (me.servicePackages || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: p.price,
          durationMinutes: p.durationMinutes,
        })),
      });
      Alert.alert('Thành công', `Đã lưu ${portfolio.length} ảnh vào portfolio.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lưu portfolio.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Loading text="Đang tải portfolio..." fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Portfolio</Text>
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
        <Card style={styles.infoCard} padding={16}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tổng số ảnh</Text>
            <Text style={styles.infoValue}>{portfolio.length}</Text>
          </View>
          <Text style={styles.infoHint}>
            Ảnh tốt giúp khách hàng đánh giá phong cách của bạn. Nên có ít nhất 6 ảnh.
          </Text>
        </Card>

        {portfolio.length === 0 ? (
          <EmptyState
            icon="🖼️"
            title="Chưa có ảnh nào"
            subtitle="Bấm nút bên dưới để thêm ảnh vào portfolio"
          />
        ) : (
          <View style={styles.grid}>
            {portfolio.map((url, idx) => (
              <View key={`${url}-${idx}`} style={styles.gridItem}>
                <Image source={{ uri: url }} style={styles.gridImg} />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemove(idx)}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
                <View style={styles.indexBadge}>
                  <Text style={styles.indexBadgeText}>#{idx + 1}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionRow}>
          <Button
            title="Thêm ảnh"
            icon="➕"
            onPress={pickImages}
            loading={isUploading}
            fullWidth
          />
        </View>

        {portfolio.length > 0 && (
          <View style={styles.actionRow}>
            <Button
              title="Huỷ"
              variant="secondary"
              onPress={() => navigation.goBack()}
              style={{ flex: 1 }}
            />
            <Button
              title="Lưu portfolio"
              onPress={handleSave}
              loading={isSaving}
              style={{ flex: 2 }}
            />
          </View>
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

  infoCard: { marginBottom: 16 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  infoValue: { fontSize: 18, color: COLORS.primaryLight, fontWeight: '800' },
  infoHint: { fontSize: 12, color: COLORS.textMuted, lineHeight: 17 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  gridItem: {
    width: '33.333%',
    aspectRatio: 1,
    padding: 4,
    position: 'relative',
  },
  gridImg: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: COLORS.surface,
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '800' },
  indexBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(15,15,26,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  indexBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
});
