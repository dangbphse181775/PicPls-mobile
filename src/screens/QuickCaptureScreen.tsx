import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import uploadApi from '../api/uploadApi';
import Button from '../components/Button';
import Card from '../components/Card';
import { COLORS } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import { requireLogin } from '../hooks/useRequireAuth';

interface Props {
  navigation: any;
}

export default function QuickCaptureScreen({ navigation }: Props) {
  const { isAuthenticated } = useAuthStore();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageWidth, setImageWidth] = useState<number | null>(null);
  const [imageHeight, setImageHeight] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Cấp quyền', 'Cần quyền truy cập thư viện ảnh để chọn ảnh.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.85,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageWidth(asset.width || null);
      setImageHeight(asset.height || null);
      setUploadedUrl(null);
    }
  };

  const captureFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Cấp quyền', 'Cần quyền truy cập camera để chụp ảnh.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.85,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageWidth(asset.width || null);
      setImageHeight(asset.height || null);
      setUploadedUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!imageUri) return;
    if (
      !requireLogin(navigation, 'upload ảnh lên PicMate', performUpload, isAuthenticated)
    ) {
      return;
    }
  };

  const performUpload = async () => {
    if (!imageUri) return;
    setIsUploading(true);
    try {
      const ext = imageUri.substring(imageUri.lastIndexOf('.') + 1) || 'jpg';
      const url = await uploadApi.uploadImage(
        imageUri,
        `quick-capture-${Date.now()}.${ext}`,
        `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      );
      setUploadedUrl(url);
      Alert.alert('Thành công', 'Đã upload ảnh lên server PicMate.');
    } catch (e: any) {
      Alert.alert('Lỗi', 'Không thể upload ảnh. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setImageUri(null);
    setImageWidth(null);
    setImageHeight(null);
    setUploadedUrl(null);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chụp lấy ngay</Text>
          <Text style={styles.headerSubtitle}>
            Chụp hoặc chọn ảnh và upload lên PicMate ngay lập tức
          </Text>
        </View>

        {!imageUri ? (
          <Card style={styles.pickCard} padding={24}>
            <Text style={styles.pickIcon}>📸</Text>
            <Text style={styles.pickTitle}>Bắt đầu chụp ảnh</Text>
            <Text style={styles.pickDesc}>
              Chọn ảnh từ thư viện hoặc chụp ảnh mới để upload lên hệ thống
            </Text>
            <View style={styles.pickRow}>
              <Button
                title="Thư viện"
                icon="🖼️"
                onPress={pickFromLibrary}
                size="md"
                style={styles.pickBtn}
              />
              <Button
                title="Chụp ảnh"
                icon="📷"
                onPress={captureFromCamera}
                variant="outline"
                size="md"
                style={styles.pickBtn}
              />
            </View>
          </Card>
        ) : (
          <View>
            <Card style={styles.previewCard} padding={0}>
              <Image source={{ uri: imageUri }} style={styles.previewImg} resizeMode="cover" />
            </Card>

            <Card style={styles.metaCard} padding={16}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Kích thước</Text>
                <Text style={styles.metaValue}>
                  {imageWidth && imageHeight ? `${imageWidth} × ${imageHeight}` : 'Đang cập nhật...'}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Định dạng</Text>
                <Text style={styles.metaValue}>
                  {imageUri.split('.').pop()?.toUpperCase() || 'JPG'}
                </Text>
              </View>
              {uploadedUrl && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>URL</Text>
                  <Text style={styles.metaUrl} numberOfLines={2}>
                    {uploadedUrl}
                  </Text>
                </View>
              )}
            </Card>

            {uploadedUrl ? (
              <Card style={styles.successCard} padding={16}>
                <Text style={styles.successIcon}>✅</Text>
                <Text style={styles.successTitle}>Upload thành công!</Text>
                <Text style={styles.successDesc}>
                  Ảnh của bạn đã được lưu trên PicMate và có thể chia sẻ với nhiếp ảnh gia.
                </Text>
                <View style={styles.successRow}>
                  <Button title="Làm mới" variant="secondary" onPress={handleReset} />
                  <Button
                    title="Quay lại"
                    variant="outline"
                    onPress={() => navigation.navigate('MainTabs')}
                  />
                </View>
              </Card>
            ) : (
              <View style={styles.actionRow}>
                <Button
                  title="Đổi ảnh"
                  variant="secondary"
                  onPress={handleReset}
                  style={{ flex: 1 }}
                />
                <Button
                  title={isAuthenticated ? 'Upload ảnh' : 'Upload ảnh (cần đăng nhập)'}
                  icon="☁️"
                  onPress={handleUpload}
                  loading={isUploading}
                  style={{ flex: 1 }}
                />
              </View>
            )}
          </View>
        )}

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Mẹo chụp ảnh đẹp</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Sử dụng ánh sáng tự nhiên (golden hour)</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Chụp ở tỉ lệ 4:5 để tối ưu cho portfolio</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Dung lượng tối đa 10MB (jpg, png, webp)</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  container: { padding: 20, paddingBottom: 40 },

  header: { marginBottom: 18 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  headerSubtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },

  pickCard: { alignItems: 'center', marginBottom: 16 },
  pickIcon: { fontSize: 56, marginBottom: 14 },
  pickTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  pickDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 19,
  },
  pickRow: { flexDirection: 'row', gap: 10, width: '100%' },
  pickBtn: { flex: 1 },

  previewCard: { overflow: 'hidden', marginBottom: 14 },
  previewImg: { width: '100%', aspectRatio: 4 / 5, backgroundColor: COLORS.surface },

  metaCard: { marginBottom: 14 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  metaLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  metaValue: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '600', flex: 1, textAlign: 'right' },
  metaUrl: { fontSize: 11, color: COLORS.primaryLight, flex: 1, textAlign: 'right' },

  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },

  successCard: { alignItems: 'center', marginBottom: 14 },
  successIcon: { fontSize: 42, marginBottom: 10 },
  successTitle: { fontSize: 17, fontWeight: '800', color: COLORS.success, marginBottom: 6 },
  successDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 19,
  },
  successRow: { flexDirection: 'row', gap: 10, width: '100%' },

  tipsCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    marginTop: 8,
  },
  tipsTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primaryLight, marginBottom: 10 },
  tipItem: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  tipBullet: { color: COLORS.primaryLight, fontSize: 14 },
  tipText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
});
