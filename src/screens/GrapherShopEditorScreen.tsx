import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import grapherProfileApi from '../api/grapherProfileApi';
import Button from '../components/Button';
import Card from '../components/Card';
import Loading from '../components/Loading';
import { COLORS } from '../theme/colors';

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

interface Props {
  navigation: any;
}

export default function GrapherShopEditorScreen({ navigation }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [equipment, setEquipment] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [servicePackages, setServicePackages] = useState<any[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await grapherProfileApi.getMe();
      setBio(data.bio || '');
      setLocation(data.location || '');
      setEquipment(data.equipment || '');
      setSelectedStyles(data.styles || []);
      setPortfolio(
        Array.isArray(data.portfolio)
          ? data.portfolio.map((p: any) => (typeof p === 'string' ? p : p.imageUrl))
          : [],
      );
      setServicePackages(data.servicePackages || []);
    } catch (e: any) {
      Alert.alert('Lỗi', 'Không thể tải thông tin cửa hàng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleStyle = (s: string) => {
    setSelectedStyles(prev => (prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]));
  };

  const handleSave = async () => {
    if (!location.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập địa điểm hoạt động.');
      return;
    }
    setIsSaving(true);
    try {
      await grapherProfileApi.updateMe({
        bio: bio.trim(),
        location: location.trim(),
        styles: selectedStyles,
        portfolio,
        equipment: equipment.trim() || null,
        servicePackages: servicePackages.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: p.price,
          durationMinutes: p.durationMinutes,
        })),
      });
      Alert.alert('Thành công', 'Đã cập nhật thông tin cửa hàng.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Lỗi', 'Không thể lưu thông tin. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Loading text="Đang tải thông tin cửa hàng..." fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cửa hàng của tôi</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="never"
        >
          <Card style={styles.section} padding={20}>
            <Text style={styles.sectionLabel}>📍 Địa điểm hoạt động *</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="VD: Hà Nội, TP.HCM, ..."
              placeholderTextColor={COLORS.textMuted}
            />

            <Text style={styles.sectionLabel}>📝 Giới thiệu (Bio)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Chia sẻ về phong cách, kinh nghiệm và điểm mạnh của bạn..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.sectionLabel}>📷 Thiết bị</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={equipment}
              onChangeText={setEquipment}
              placeholder="VD: Sony A7 IV, ống kính 35mm f/1.4, gimbal ..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Card>

          <Card style={styles.section} padding={20}>
            <Text style={styles.sectionLabel}>🎨 Phong cách chụp ảnh</Text>
            <Text style={styles.sectionHint}>
              Chọn ít nhất 1 phong cách để khách hàng dễ tìm thấy bạn
            </Text>
            <View style={styles.styleGrid}>
              {STYLES.map(s => {
                const active = selectedStyles.includes(s);
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.styleChip, active && styles.styleChipActive]}
                    onPress={() => toggleStyle(s)}
                  >
                    <Text
                      style={[styles.styleChipText, active && styles.styleChipTextActive]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          <Card style={styles.section} padding={20}>
            <Text style={styles.sectionLabel}>📦 Gói dịch vụ</Text>
            <Text style={styles.sectionHint}>
              Quản lý các gói dịch vụ trong mục "Gói dịch vụ" ở trang cá nhân
            </Text>
            {servicePackages.length === 0 ? (
              <Text style={styles.emptyMini}>Bạn chưa có gói dịch vụ nào.</Text>
            ) : (
              servicePackages.map((p: any, idx: number) => (
                <View key={p.id || idx} style={styles.pkgRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pkgName}>{p.name}</Text>
                    <Text style={styles.pkgDesc} numberOfLines={1}>
                      {p.description || 'Không có mô tả'}
                    </Text>
                  </View>
                  <Text style={styles.pkgPrice}>
                    {new Intl.NumberFormat('vi-VN').format(p.price)}đ
                  </Text>
                </View>
              ))
            )}
            <Button
              title="Quản lý gói dịch vụ"
              variant="outline"
              size="sm"
              onPress={() => navigation.navigate('GrapherPackages')}
              style={{ marginTop: 10 }}
            />
          </Card>

          <View style={styles.actionRow}>
            <Button
              title="Huỷ"
              variant="secondary"
              onPress={() => navigation.goBack()}
              style={{ flex: 1 }}
            />
            <Button
              title="Lưu thay đổi"
              onPress={handleSave}
              loading={isSaving}
              style={{ flex: 2 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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

  container: { padding: 20, paddingBottom: 40, gap: 16 },

  section: { marginBottom: 0 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 12,
  },
  sectionHint: { fontSize: 12, color: COLORS.textMuted, marginBottom: 12, lineHeight: 17 },

  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  textarea: { minHeight: 80, paddingTop: 12 },

  styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  styleChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  styleChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  styleChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  styleChipTextActive: { color: COLORS.white },

  pkgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  pkgName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  pkgDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  pkgPrice: { fontSize: 13, color: COLORS.accent, fontWeight: '800' },
  emptyMini: { fontSize: 13, color: COLORS.textMuted, fontStyle: 'italic', marginBottom: 8 },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
