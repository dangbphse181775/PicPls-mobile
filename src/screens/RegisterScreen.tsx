import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import authApi from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

// ─── Validation ───────────────────────────────────────────────────────────────
const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Vui lòng nhập họ và tên')
      .min(2, 'Họ tên tối thiểu 2 ký tự'),
    email: z
      .string()
      .min(1, 'Vui lòng nhập email')
      .email('Email không hợp lệ'),
    phoneNumber: z
      .string()
      .min(1, 'Vui lòng nhập số điện thoại')
      .regex(/^(0[3-9])\d{8}$/, 'Số điện thoại không hợp lệ (VD: 0912345678)'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    role: z.enum(['Customer', 'Grapher']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof registerSchema>;

// ─── Component ────────────────────────────────────────────────────────────────
export default function RegisterScreen({ navigation }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      role: 'Customer',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const response = await authApi.register({
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        phoneNumber: values.phoneNumber.trim(),
        role: values.role,
      });
      console.log('[Register] API response:', response);
      await setAuth(response);
      console.log('[Register] setAuth xong, isAuthenticated =', useAuthStore.getState().isAuthenticated);
      // Đóng modal Register để user thấy MainTabs (đã re-mount với role mới)
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (error: any) {
      console.warn('[Register] Lỗi đăng ký:', error?.response?.status, error?.response?.data);
      // Phân biệt lỗi mạng và lỗi từ server
      let message: string;
      if (!error?.response) {
        // Không có response = lỗi kết nối mạng (Network Error)
        // Có thể do Render server đang cold start (30-60s)
        message = 'Không kết nối được đến server. Server có thể đang khởi động, vui lòng thử lại sau 30 giây.';
      } else if (error.response.status === 400) {
        // BE trả ValidationProblemDetails: { errors: { Field: ["msg1", "msg2"] } }
        const errs = error?.response?.data?.errors;
        if (errs && typeof errs === 'object') {
          const firstKey = Object.keys(errs)[0];
          const firstMsg = firstKey && errs[firstKey]?.[0];
          message = firstMsg || 'Thông tin đăng ký chưa hợp lệ.';
        } else {
          message =
            error?.response?.data?.title ||
            error?.response?.data?.message ||
            'Thông tin đăng ký chưa hợp lệ.';
        }
      } else {
        message =
          error?.response?.data?.title ||
          error?.response?.data?.message ||
          `Lỗi ${error?.response?.status}: Đăng ký thất bại.`;
      }
      Alert.alert('Đăng ký thất bại', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="never"
          >
            {/* ── Header ───────────────────────────────────────────── */}
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.backBtnText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.pageTitle}>Tạo tài khoản</Text>
              <View style={styles.backBtn} />
            </View>

            <Text style={styles.pageSubtitle}>
              Tham gia PicMate và khám phá thế giới nhiếp ảnh 🌟
            </Text>

            {/* ── Role Selector ─────────────────────────────────────── */}
            <View style={styles.roleSection}>
              <Text style={styles.label}>Tôi là</Text>
              <Controller
                control={control}
                name="role"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.roleRow}>
                    <TouchableOpacity
                      style={[styles.roleBtn, value === 'Customer' && styles.roleBtnActive]}
                      onPress={() => onChange('Customer')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.roleEmoji}>🙋</Text>
                      <Text style={[styles.roleBtnText, value === 'Customer' && styles.roleBtnTextActive]}>
                        Khách hàng
                      </Text>
                      <Text style={[styles.roleDesc, value === 'Customer' && styles.roleDescActive]}>
                        Đặt lịch chụp ảnh
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.roleBtn, value === 'Grapher' && styles.roleBtnActive]}
                      onPress={() => onChange('Grapher')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.roleEmoji}>📷</Text>
                      <Text style={[styles.roleBtnText, value === 'Grapher' && styles.roleBtnTextActive]}>
                        Nhiếp ảnh gia
                      </Text>
                      <Text style={[styles.roleDesc, value === 'Grapher' && styles.roleDescActive]}>
                        Nhận lịch chụp ảnh
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>

            {/* ── Form Card ─────────────────────────────────────────── */}
            <View style={styles.card}>
              {/* Full Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Họ & tên</Text>
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputRow, errors.fullName && styles.inputRowError]}>
                      <Text style={styles.inputIcon}>👤</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Nguyễn Văn A"
                        placeholderTextColor={COLORS.textMuted}
                        autoCapitalize="words"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    </View>
                  )}
                />
                {errors.fullName && <Text style={styles.errorText}>{errors.fullName.message}</Text>}
              </View>

              {/* Email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputRow, errors.email && styles.inputRowError]}>
                      <Text style={styles.inputIcon}>✉️</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="your@email.com"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    </View>
                  )}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
              </View>

              {/* Phone */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Số điện thoại</Text>
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputRow, errors.phoneNumber && styles.inputRowError]}>
                      <Text style={styles.inputIcon}>📱</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="0912345678"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="phone-pad"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        maxLength={11}
                      />
                    </View>
                  )}
                />
                {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber.message}</Text>}
              </View>

              {/* Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Mật khẩu</Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputRow, errors.password && styles.inputRowError]}>
                      <Text style={styles.inputIcon}>🔒</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Nhập mật khẩu"
                        placeholderTextColor={COLORS.textMuted}
                        secureTextEntry={!showPassword}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
                {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
              </View>

              {/* Confirm Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Xác nhận mật khẩu</Text>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputRow, errors.confirmPassword && styles.inputRowError]}>
                      <Text style={styles.inputIcon}>🔑</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Nhập lại mật khẩu"
                        placeholderTextColor={COLORS.textMuted}
                        secureTextEntry={!showPassword}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    </View>
                  )}
                />
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
                )}
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    Tạo tài khoản {selectedRole === 'Grapher' ? 'Nhiếp ảnh gia' : 'Khách hàng'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* ── Login Link ────────────────────────────────────────── */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginLinkText}>
                Đã có tài khoản?{' '}
                <Text style={styles.loginLinkHighlight}>Đăng nhập</Text>
              </Text>
            </TouchableOpacity>
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
  primaryLight: '#818CF8',
  error: '#EF4444',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: '#2D2D4E',
  cardBorder: '#3D3D6B',
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 40,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backBtnText: { fontSize: 24, color: COLORS.textPrimary },
  pageTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  pageSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 24,
    textAlign: 'center',
  },

  // Role Selector
  roleSection: { marginBottom: 20 },
  roleRow: { flexDirection: 'row', gap: 12 },
  roleBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 4,
  },
  roleBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '18',
  },
  roleEmoji: { fontSize: 24, marginBottom: 4 },
  roleBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  roleBtnTextActive: { color: COLORS.primaryLight },
  roleDesc: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center' },
  roleDescActive: { color: COLORS.primaryLight + 'CC' },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 20,
  },

  // Fields
  fieldGroup: { marginBottom: 14 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  inputRowError: { borderColor: COLORS.error },
  inputIcon: { fontSize: 15 },
  input: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
  eyeIcon: { fontSize: 15 },
  errorText: { fontSize: 12, color: COLORS.error, marginTop: 4, fontWeight: '500' },

  // Submit
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },

  // Login link
  loginLink: { alignItems: 'center', paddingVertical: 4 },
  loginLinkText: { fontSize: 14, color: COLORS.textMuted },
  loginLinkHighlight: { color: COLORS.primaryLight, fontWeight: '700' },
});
