import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import uploadApi from '../api/uploadApi';
import authApi from '../api/authApi';
import userApi from '../api/userApi';
import { useAuthStore } from '../store/authStore';
import Toast from 'react-native-toast-message';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export default function EditProfileScreen({ navigation }: Props) {
  const { user, setAuth } = useAuthStore();
  const [fullName, setFullName] = useState(user?.name || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar || null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cấp quyền', 'Cần quyền truy cập thư viện ảnh để đổi avatar');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Toast.show({ type: 'error', text1: 'Thiếu thông tin', text2: 'Vui lòng nhập họ và tên' });
      return;
    }

    setIsLoading(true);
    try {
      let finalAvatarUrl = avatarUri;

      // Nếu có avatar mới (không phải URL web HTTP) -> Upload
      if (avatarUri && !avatarUri.startsWith('http')) {
        const ext = avatarUri.substring(avatarUri.lastIndexOf('.') + 1);
        finalAvatarUrl = await uploadApi.uploadImage(avatarUri, `avatar.${ext}`, `image/${ext}`);
      }

      await userApi.updateProfile({
        fullName: fullName.trim(),
        avatarUrl: finalAvatarUrl || undefined,
      });

      // Lấy lại thông tin user mới nhất
      const freshUser = await authApi.getMe();
      if (user) {
        await setAuth({
          ...user,
          name: freshUser.fullName,
          avatar: freshUser.avatarUrl,
        });
      }

      Toast.show({ type: 'success', text1: 'Thành công', text2: 'Cập nhật hồ sơ thành công' });
      navigation.goBack();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể cập nhật hồ sơ' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
          <View style={styles.backButton} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="never"
          >
            
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                ) : (
                  <Text style={styles.avatarText}>{fullName.charAt(0).toUpperCase()}</Text>
                )}
                <TouchableOpacity style={styles.editAvatarBtn} onPress={handlePickImage}>
                  <Text style={styles.editAvatarIcon}>📷</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.avatarHint}>Chạm vào biểu tượng máy ảnh để thay đổi</Text>
            </View>

            {/* Form */}
            <View style={styles.formSection}>
              <Text style={styles.label}>Họ và Tên</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrapper, styles.inputDisabled]}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={[styles.input, { color: COLORS.textMuted }]}
                  value={user?.email}
                  editable={false}
                />
              </View>
              <Text style={styles.inputHint}>Email không thể thay đổi</Text>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Lưu thay đổi</Text>
                )}
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
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
  cardBorder: '#3D3D6B',
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  
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

  container: { padding: 20 },

  avatarSection: { alignItems: 'center', marginBottom: 32, marginTop: 12 },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  avatarImg: { width: '100%', height: '100%', borderRadius: 50 },
  avatarText: { fontSize: 36, fontWeight: '700', color: COLORS.primary },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  editAvatarIcon: { fontSize: 16 },
  avatarHint: { fontSize: 13, color: COLORS.textMuted },

  formSection: { gap: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: -8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  inputDisabled: { backgroundColor: COLORS.background, opacity: 0.7 },
  inputIcon: { fontSize: 18 },
  input: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
  inputHint: { fontSize: 12, color: COLORS.textMuted, marginTop: -10, marginLeft: 4 },

  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
