import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
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
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import { COLORS } from '../theme/colors';

interface Props {
  navigation: any;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const DEFAULT_PACKAGES = [
  {
    name: 'Gói Cơ bản',
    description: 'Chụp 30 phút, 10 ảnh chỉnh sửa',
    price: 300000,
    durationMinutes: 30,
  },
  {
    name: 'Gói Tiêu chuẩn',
    description: 'Chụp 1 giờ, 25 ảnh chỉnh sửa + 1 video ngắn',
    price: 600000,
    durationMinutes: 60,
  },
  {
    name: 'Gói Cao cấp',
    description: 'Chụp 2 giờ, 50 ảnh + video highlight',
    price: 1200000,
    durationMinutes: 120,
  },
];

interface PackageForm {
  id?: string | null;
  name: string;
  description: string;
  price: string;
  durationMinutes: string;
}

const emptyForm: PackageForm = { name: '', description: '', price: '', durationMinutes: '60' };

export default function GrapherServicePackagesScreen({ navigation }: Props) {
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const [editing, setEditing] = useState<PackageForm | null>(null);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await grapherProfileApi.getMyServices();
      setPackages(data || []);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể tải danh sách gói dịch vụ.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing({ ...emptyForm });
    setEditMode('create');
  };

  const openEdit = (pkg: any) => {
    setEditing({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description || '',
      price: String(pkg.price),
      durationMinutes: String(pkg.durationMinutes),
    });
    setEditMode('edit');
  };

  const closeModal = () => {
    setEditing(null);
  };

  const handleSave = async () => {
    if (!editing) return;
    const name = editing.name.trim();
    const price = Number(editing.price);
    const duration = Number(editing.durationMinutes);

    if (!name) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên gói.');
      return;
    }
    if (isNaN(price) || price <= 0) {
      Alert.alert('Sai định dạng', 'Giá phải là số dương.');
      return;
    }
    if (isNaN(duration) || duration <= 0) {
      Alert.alert('Sai định dạng', 'Thời lượng phải là số phút dương.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        id: editing.id,
        name,
        description: editing.description.trim(),
        price,
        durationMinutes: duration,
      };
      if (editMode === 'create') {
        await grapherProfileApi.createService(payload);
      } else {
        await grapherProfileApi.updateService(editing.id!, payload);
      }
      closeModal();
      load(true);
    } catch (e: any) {
      Alert.alert('Lỗi', 'Không thể lưu gói dịch vụ.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (pkg: any) => {
    Alert.alert('Xoá gói', `Bạn có chắc muốn xoá "${pkg.name}"?`, [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          try {
            await grapherProfileApi.deleteService(pkg.id);
            load(true);
          } catch (e) {
            Alert.alert('Lỗi', 'Không thể xoá gói.');
          }
        },
      },
    ]);
  };

  const handleSeed = async () => {
    Alert.alert(
      'Khởi tạo gói mẫu',
      'Hệ thống sẽ tạo 3 gói dịch vụ mẫu. Tiếp tục?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Tạo',
          onPress: async () => {
            setIsSeeding(true);
            try {
              await grapherProfileApi.seedDefaultPackages();
              load(true);
            } catch (e) {
              Alert.alert('Lỗi', 'Không thể tạo gói mẫu.');
            } finally {
              setIsSeeding(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gói dịch vụ</Text>
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
        {isLoading ? (
          <Loading text="Đang tải gói dịch vụ..." />
        ) : packages.length === 0 ? (
          <>
            <EmptyState
              icon="📦"
              title="Chưa có gói dịch vụ"
              subtitle="Tạo gói mới hoặc dùng gói mẫu để bắt đầu nhanh"
            />
            <View style={styles.emptyActions}>
              <Button title="Tạo gói mới" onPress={openCreate} fullWidth style={{ marginBottom: 10 }} />
              <Button
                title="Dùng 3 gói mẫu"
                variant="outline"
                onPress={handleSeed}
                loading={isSeeding}
                fullWidth
              />
            </View>
          </>
        ) : (
          <>
            {packages.map(pkg => (
              <Card key={pkg.id} style={styles.pkgCard} padding={16}>
                <View style={styles.pkgHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pkgName}>{pkg.name}</Text>
                    <Text style={styles.pkgDesc} numberOfLines={2}>
                      {pkg.description || 'Không có mô tả'}
                    </Text>
                  </View>
                  <Text style={styles.pkgPrice}>{formatCurrency(pkg.price)}</Text>
                </View>
                <View style={styles.pkgMeta}>
                  <Text style={styles.pkgMetaText}>
                    ⏱ {pkg.durationMinutes >= 60
                      ? `${Math.round(pkg.durationMinutes / 60)} giờ`
                      : `${pkg.durationMinutes} phút`}
                  </Text>
                </View>
                <View style={styles.pkgActions}>
                  <Button
                    title="Sửa"
                    variant="secondary"
                    size="sm"
                    onPress={() => openEdit(pkg)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Xoá"
                    variant="danger"
                    size="sm"
                    onPress={() => handleDelete(pkg)}
                    style={{ flex: 1 }}
                  />
                </View>
              </Card>
            ))}
            <View style={{ marginTop: 16 }}>
              <Button
                title="+ Thêm gói mới"
                onPress={openCreate}
                fullWidth
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Edit modal */}
      <Modal visible={!!editing} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode === 'create' ? 'Tạo gói mới' : 'Sửa gói dịch vụ'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {editing && (
              <ScrollView
                style={styles.modalBody}
                contentContainerStyle={{ paddingBottom: 20 }}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.fieldLabel}>Tên gói *</Text>
                <TextInput
                  style={styles.input}
                  value={editing.name}
                  onChangeText={t => setEditing({ ...editing, name: t })}
                  placeholder="VD: Gói chụp cưới cao cấp"
                  placeholderTextColor={COLORS.textMuted}
                />
                <Text style={styles.fieldLabel}>Mô tả</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  value={editing.description}
                  onChangeText={t => setEditing({ ...editing, description: t })}
                  placeholder="Mô tả chi tiết về gói..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                <Text style={styles.fieldLabel}>Giá (VND) *</Text>
                <TextInput
                  style={styles.input}
                  value={editing.price}
                  onChangeText={t => setEditing({ ...editing, price: t.replace(/[^0-9]/g, '') })}
                  placeholder="300000"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                />
                <Text style={styles.fieldLabel}>Thời lượng (phút) *</Text>
                <TextInput
                  style={styles.input}
                  value={editing.durationMinutes}
                  onChangeText={t => setEditing({ ...editing, durationMinutes: t.replace(/[^0-9]/g, '') })}
                  placeholder="60"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                />
                <View style={styles.modalActions}>
                  <Button
                    title="Huỷ"
                    variant="secondary"
                    onPress={closeModal}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title={editMode === 'create' ? 'Tạo' : 'Lưu'}
                    onPress={handleSave}
                    loading={isSaving}
                    style={{ flex: 2 }}
                  />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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

  emptyActions: { marginTop: 16 },

  pkgCard: { marginBottom: 12 },
  pkgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  pkgName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  pkgDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  pkgPrice: { fontSize: 16, color: COLORS.accent, fontWeight: '800' },
  pkgMeta: { marginBottom: 12, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  pkgMetaText: { fontSize: 13, color: COLORS.textMuted },
  pkgActions: { flexDirection: 'row', gap: 10 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary },
  modalClose: { fontSize: 18, color: COLORS.textMuted, fontWeight: '600' },
  modalBody: { padding: 20 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  textarea: { minHeight: 80, paddingTop: 12 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 24 },
});
