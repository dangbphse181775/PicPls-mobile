import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import bookingApi from '../api/bookingApi';
import type { CreateBookingScreenParams, BookingSuccessScreenParams } from '../types/booking.types';

// ─── Navigation Types ─────────────────────────────────────────────────────────
// Điều chỉnh RootStackParamList cho phù hợp với navigator của bạn
type RootStackParamList = {
  CreateBooking: CreateBookingScreenParams;
  BookingSuccess: BookingSuccessScreenParams;
};

type Props = NativeStackScreenProps<RootStackParamList, 'CreateBooking'>;

// ─── Zod Validation Schema ────────────────────────────────────────────────────
const createBookingSchema = z.object({
  location: z
    .string()
    .min(1, 'Vui lòng nhập địa điểm chụp ảnh')
    .max(300, 'Địa điểm không được vượt quá 300 ký tự'),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof createBookingSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);

const formatDateTime = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('vi-VN', options);
};

const getMinDate = (): Date => {
  const date = new Date();
  date.setHours(date.getHours() + 2); // Đặt lịch tối thiểu 2 giờ sau
  return date;
};

// ─── VNPAY Return URL patterns ────────────────────────────────────────────────
const VNPAY_RETURN_PATTERNS = [
  '/api/payments/vnpay-return',
  'http://localhost:5173/payment-result',
  '/payment-result',
];

const isVnPayReturnUrl = (url: string): boolean =>
  VNPAY_RETURN_PATTERNS.some((pattern) => url.includes(pattern));

const parseQueryParams = (url: string): Record<string, string> => {
  try {
    const queryString = url.includes('?') ? url.split('?')[1] : '';
    const params: Record<string, string> = {};
    queryString.split('&').forEach((pair) => {
      const [key, value] = pair.split('=');
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
    });
    return params;
  } catch {
    return {};
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CreateBookingScreen({ route, navigation }: Props) {
  const { grapherProfileId, grapherName, servicePackage } = route.params;

  // ── State ────────────────────────────────────────────────────────────────────
  const [scheduledAt, setScheduledAt] = useState<Date>(getMinDate());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);
  const [isWebViewLoading, setIsWebViewLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'cash'>('vnpay');
  const webViewRef = useRef<WebView>(null);

  // ── Form ─────────────────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      location: '',
      note: '',
    },
  });

  // ── API Call ─────────────────────────────────────────────────────────────────
  const onSubmit = useCallback(
    async (values: FormValues) => {
      setIsLoading(true);
      try {
        const response = await bookingApi.create({
          grapherProfileId,
          servicePackageId: servicePackage.id,
          scheduledAt: scheduledAt.toISOString(),
          location: values.location.trim(),
          note: values.note?.trim() || undefined,
          paymentMethod: paymentMethod === 'cash' ? 'cod' : 'vnpay',
        });

        if (paymentMethod === 'cash') {
          // Bỏ qua thanh toán, đi thẳng tới màn hình thành công
          navigation.replace('BookingSuccess', {
            bookingId: response.booking?.id || '',
            grapherName,
            serviceName: servicePackage.name,
            totalAmount: servicePackage.price,
            scheduledAt: scheduledAt.toISOString(),
          });
        } else {
          setPaymentUrl(response.paymentUrl);
          setIsWebViewVisible(true);
        }
      } catch (error: any) {
        let message = 'Có lỗi xảy ra khi tạo booking. Vui lòng thử lại.';
        const data = error?.response?.data;
        
        if (data) {
          message =
            data.detail ||
            data.message ||
            data.title ||
            data.Error ||
            (typeof data === 'string' ? data : message);
        } else if (error?.message) {
          message = error.message;
        }

        // Translate specific overlap error
        if (message.includes('already has a booking')) {
          message = 'Nhiếp ảnh gia đã có lịch chụp vào thời gian này. Vui lòng chọn một thời gian khác!';
        }

        Alert.alert('Tạo booking thất bại', message, [{ text: 'Đóng' }]);
      } finally {
        setIsLoading(false);
      }
    },
    [grapherProfileId, servicePackage.id, scheduledAt, paymentMethod, navigation, grapherName],
  );

  // ── WebView Navigation Handler ────────────────────────────────────────────────
  const handleWebViewNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      const { url } = navState;
      if (!url) return;

      if (isVnPayReturnUrl(url)) {
        // Đóng WebView ngay lập tức
        setIsWebViewVisible(false);
        setPaymentUrl(null);

        const params = parseQueryParams(url);
        const responseCode = params['vnp_ResponseCode'] || params['payment'];

        // vnp_ResponseCode = '00' là thành công
        // hoặc payment=success nếu backend redirect đến frontend URL
        const isSuccess =
          responseCode === '00' || responseCode === 'success';

        if (isSuccess) {
          // Điều hướng đến màn hình thành công
          navigation.replace('BookingSuccess', {
            bookingId: params['bookingId'] || '',
            grapherName,
            serviceName: servicePackage.name,
            totalAmount: servicePackage.price,
            scheduledAt: scheduledAt.toISOString(),
          });
        } else {
          const errorMessage =
            responseCode === 'failed'
              ? (params['message'] || 'Thanh toán thất bại')
              : getVnPayErrorMessage(responseCode);

          Alert.alert(
            '❌ Thanh toán thất bại',
            errorMessage,
            [{ text: 'Thử lại', style: 'cancel' }],
          );
        }
      }
    },
    [navigation, grapherName, servicePackage, scheduledAt],
  );

  const handleCloseWebView = useCallback(() => {
    Alert.alert(
      'Hủy thanh toán?',
      'Bạn có chắc muốn hủy quá trình thanh toán?',
      [
        { text: 'Tiếp tục thanh toán', style: 'cancel' },
        {
          text: 'Hủy',
          style: 'destructive',
          onPress: () => {
            setIsWebViewVisible(false);
            setPaymentUrl(null);
          },
        },
      ],
    );
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
        >
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="never"
          >
            {/* ── Header ────────────────────────────────────────────── */}
            <View style={styles.header}>
              {navigation.canGoBack() ? (
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={styles.backButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.backButton} />
              )}
              <Text style={styles.headerTitle}>Xác nhận đặt lịch</Text>
              <View style={styles.backButton} />
            </View>

            {/* ── Service Package Card ──────────────────────────────── */}
            <View style={styles.packageCard}>
              <View style={styles.packageCardHeader}>
                <View style={styles.packageIconWrapper}>
                  <Text style={styles.packageIcon}>📷</Text>
                </View>
                <View style={styles.packageInfo}>
                  <Text style={styles.grapherNameText}>{grapherName}</Text>
                  <Text style={styles.packageName}>{servicePackage.name}</Text>
                </View>
              </View>
              <View style={styles.packageDivider} />
              <View style={styles.packageMeta}>
                <View style={styles.packageMetaItem}>
                  <Text style={styles.packageMetaIcon}>⏱</Text>
                  <Text style={styles.packageMetaLabel}>Thời lượng</Text>
                  <Text style={styles.packageMetaValue}>
                    {servicePackage.durationMinutes >= 60
                      ? `${servicePackage.durationMinutes / 60} giờ`
                      : `${servicePackage.durationMinutes} phút`}
                  </Text>
                </View>
                <View style={styles.packageMetaDivider} />
                <View style={styles.packageMetaItem}>
                  <Text style={styles.packageMetaIcon}>💰</Text>
                  <Text style={styles.packageMetaLabel}>Giá dịch vụ</Text>
                  <Text style={[styles.packageMetaValue, styles.priceText]}>
                    {formatCurrency(servicePackage.price)}
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Date & Time Picker ────────────────────────────────── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Text style={styles.requiredStar}>* </Text>
                Thời gian chụp
              </Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => {
                  setDatePickerMode('date');
                  setIsDatePickerOpen(true);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.datePickerContent}>
                  <Text style={styles.datePickerIcon}>🗓</Text>
                  <View style={styles.datePickerTexts}>
                    <Text style={styles.datePickerLabel}>Ngày & Giờ đã chọn</Text>
                    <Text style={styles.datePickerValue}>
                      {formatDateTime(scheduledAt)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.datePickerArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* ── Location Input ────────────────────────────────────── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Text style={styles.requiredStar}>* </Text>
                Địa điểm chụp
              </Text>
              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>📍</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Nhập địa điểm tổ chức buổi chụp..."
                      placeholderTextColor="#6B7280"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      multiline
                      numberOfLines={2}
                      maxLength={300}
                      textAlignVertical="top"
                    />
                  </View>
                )}
              />
              {errors.location && (
                <Text style={styles.errorText}>⚠ {errors.location.message}</Text>
              )}
            </View>

            {/* ── Note Input ────────────────────────────────────────── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Ghi chú{' '}
                <Text style={styles.optionalLabel}>(không bắt buộc)</Text>
              </Text>
              <Controller
                control={control}
                name="note"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[styles.inputWrapper, styles.noteWrapper]}>
                    <Text style={[styles.inputIcon, styles.noteIcon]}>📝</Text>
                    <TextInput
                      style={[styles.textInput, styles.noteInput]}
                      placeholder="Yêu cầu đặc biệt, phong cách chụp, trang phục..."
                      placeholderTextColor="#6B7280"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      multiline
                      numberOfLines={4}
                      maxLength={500}
                      textAlignVertical="top"
                    />
                  </View>
                )}
              />
              {errors.note && (
                <Text style={styles.errorText}>⚠ {errors.note.message}</Text>
              )}
            </View>

            {/* ── Price Summary ─────────────────────────────────────── */}
            <View style={styles.priceSummary}>
              <View style={styles.priceSummaryRow}>
                <Text style={styles.priceSummaryLabel}>Dịch vụ</Text>
                <Text style={styles.priceSummaryValue}>
                  {formatCurrency(servicePackage.price)}
                </Text>
              </View>
              <View style={styles.priceSummaryDivider} />
              <View style={styles.priceSummaryRow}>
                <Text style={styles.priceSummaryTotal}>Tổng thanh toán</Text>
                <Text style={styles.priceSummaryTotalValue}>
                  {formatCurrency(servicePackage.price)}
                </Text>
              </View>
            </View>

            {/* ── Payment Method ─────────────────────────────────────── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
              <View style={styles.paymentMethods}>
                <TouchableOpacity
                  style={[
                    styles.paymentMethodCard,
                    paymentMethod === 'vnpay' && styles.paymentMethodCardActive,
                  ]}
                  onPress={() => setPaymentMethod('vnpay')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.paymentMethodIcon}>💳</Text>
                  <View style={styles.paymentMethodTexts}>
                    <Text style={styles.paymentMethodTitle}>VNPAY</Text>
                    <Text style={styles.paymentMethodDesc}>Thanh toán online</Text>
                  </View>
                  <View style={[styles.radio, paymentMethod === 'vnpay' && styles.radioActive]}>
                    {paymentMethod === 'vnpay' && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentMethodCard,
                    paymentMethod === 'cash' && styles.paymentMethodCardActive,
                  ]}
                  onPress={() => setPaymentMethod('cash')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.paymentMethodIcon}>💵</Text>
                  <View style={styles.paymentMethodTexts}>
                    <Text style={styles.paymentMethodTitle}>Tiền mặt</Text>
                    <Text style={styles.paymentMethodDesc}>Thanh toán sau buổi chụp</Text>
                  </View>
                  <View style={[styles.radio, paymentMethod === 'cash' && styles.radioActive]}>
                    {paymentMethod === 'cash' && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.submitButtonIcon}>
                    {paymentMethod === 'vnpay' ? '💳' : '✅'}
                  </Text>
                  <Text style={styles.submitButtonText}>
                    {paymentMethod === 'vnpay' ? 'Xác nhận & Thanh toán' : 'Xác nhận Đặt lịch'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.secureNote}>
              {paymentMethod === 'vnpay' ? '🔒 Thanh toán được bảo mật bởi VNPAY' : '📝 Thanh toán trực tiếp khi gặp mặt'}
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* ── Date & Time Picker (2 bước: chọn ngày → chọn giờ) ──────────── */}
      {isDatePickerOpen && (
        <DateTimePicker
          value={scheduledAt}
          mode={datePickerMode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={datePickerMode === 'date' ? getMinDate() : undefined}
          onChange={(event, selectedDate) => {
            if (!selectedDate) {
              if (Platform.OS === 'android') {
                 setIsDatePickerOpen(false);
              }
              return;
            }
            if (datePickerMode === 'date') {
              // Ghép ngày mới với giờ cũ
              const merged = new Date(selectedDate);
              merged.setHours(scheduledAt.getHours(), scheduledAt.getMinutes());
              setScheduledAt(merged);
              if (Platform.OS === 'android') {
                setIsDatePickerOpen(false);
                // Chuyển sang chọn giờ
                setTimeout(() => {
                  setDatePickerMode('time');
                  setIsDatePickerOpen(true);
                }, 100);
              }
            } else {
              // Ghép giờ mới với ngày đã chọn
              const merged = new Date(scheduledAt);
              merged.setHours(selectedDate.getHours(), selectedDate.getMinutes());
              setScheduledAt(merged);
              if (Platform.OS === 'android') {
                setIsDatePickerOpen(false);
              }
            }
          }}
          onDismiss={() => setIsDatePickerOpen(false)}
        />
      )}

      {/* ── VNPAY WebView Modal ───────────────────────────────────────── */}
      <Modal
        visible={isWebViewVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCloseWebView}
      >
        <SafeAreaView style={styles.webViewSafeArea} edges={['top', 'bottom']}>
          {/* WebView Header */}
          <View style={styles.webViewHeader}>
            <TouchableOpacity
              onPress={handleCloseWebView}
              style={styles.webViewCloseButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.webViewCloseText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.webViewTitleContainer}>
              <Text style={styles.webViewTitle}>Thanh toán VNPAY</Text>
              <Text style={styles.webViewSubtitle}>
                🔒 Kết nối an toàn & được mã hóa
              </Text>
            </View>
            <View style={styles.webViewCloseButton} />
          </View>

          {/* Loading Indicator */}
          {isWebViewLoading && (
            <View style={styles.webViewLoadingOverlay}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={styles.webViewLoadingText}>
                Đang kết nối đến cổng thanh toán...
              </Text>
            </View>
          )}

          {/* WebView */}
          {paymentUrl && (
            <WebView
              ref={webViewRef}
              source={{ uri: paymentUrl }}
              style={styles.webView}
              onLoadStart={() => setIsWebViewLoading(true)}
              onLoadEnd={() => setIsWebViewLoading(false)}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState={false}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                if (__DEV__) {
                  console.warn('[WebView Error]', nativeEvent);
                }
                // Bỏ qua lỗi khi redirect sang URL không hợp lệ (expected behavior)
                if (!isVnPayReturnUrl(nativeEvent.url || '')) {
                  Alert.alert(
                    'Lỗi kết nối',
                    'Không thể kết nối đến cổng thanh toán. Vui lòng thử lại.',
                    [{ text: 'Đóng', onPress: handleCloseWebView }],
                  );
                }
              }}
            />
          )}
        </SafeAreaView>
      </Modal>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getVnPayErrorMessage(responseCode: string): string {
  const errorMessages: Record<string, string> = {
    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
    '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
    '10': 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.',
    '11': 'Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại.',
    '12': 'Thẻ/Tài khoản bị khóa.',
    '13': 'Nhập sai mật khẩu OTP. Vui lòng thực hiện lại.',
    '24': 'Giao dịch không thành công do khách hàng hủy.',
    '51': 'Tài khoản không đủ số dư để thực hiện giao dịch.',
    '65': 'Tài khoản vượt quá hạn mức giao dịch trong ngày.',
    '75': 'Ngân hàng thanh toán đang bảo trì.',
    '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định.',
    '99': 'Lỗi không xác định từ hệ thống thanh toán.',
  };
  return errorMessages[responseCode] || `Thanh toán thất bại (Mã lỗi: ${responseCode || 'N/A'}).`;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const COLORS = {
  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceElevated: '#16213E',
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryGradientEnd: '#8B5CF6',
  accent: '#F59E0B',
  success: '#10B981',
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
  container: { flex: 1, backgroundColor: COLORS.background },
  contentContainer: { paddingBottom: 32 },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 24, color: COLORS.textPrimary },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },

  // ── Package Card ──────────────────────────────────────────────────────────
  packageCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  packageCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  packageIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primary + '25',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  packageIcon: { fontSize: 26 },
  packageInfo: { flex: 1 },
  grapherNameText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  packageName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  packageDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  packageMeta: {
    flexDirection: 'row',
    padding: 16,
  },
  packageMetaItem: { flex: 1, alignItems: 'center', gap: 4 },
  packageMetaDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  packageMetaIcon: { fontSize: 18 },
  packageMetaLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  packageMetaValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  priceText: { color: COLORS.accent },

  // ── Section ───────────────────────────────────────────────────────────────
  section: { marginHorizontal: 20, marginTop: 24 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  requiredStar: { color: COLORS.error },
  optionalLabel: {
    fontWeight: '400',
    color: COLORS.textMuted,
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 12,
  },

  // ── Date Picker ───────────────────────────────────────────────────────────
  datePickerButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  datePickerContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  datePickerIcon: { fontSize: 22, marginRight: 12 },
  datePickerTexts: { flex: 1 },
  datePickerLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  datePickerValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  datePickerArrow: {
    fontSize: 22,
    color: COLORS.primary,
    fontWeight: '300',
  },

  // ── Input ─────────────────────────────────────────────────────────────────
  inputWrapper: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    minHeight: 64,
  },
  noteWrapper: { minHeight: 110 },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
  },
  noteIcon: { marginTop: 2 },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
    paddingTop: 0,
    paddingBottom: 0,
  },
  noteInput: { minHeight: 80 },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },

  // ── Price Summary ──────────────────────────────────────────────────────────
  priceSummary: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  priceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceSummaryLabel: { fontSize: 14, color: COLORS.textSecondary },
  priceSummaryValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600' },
  priceSummaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  priceSummaryTotal: { fontSize: 16, color: COLORS.textPrimary, fontWeight: '700' },
  priceSummaryTotalValue: {
    fontSize: 20,
    color: COLORS.accent,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  // ── Submit Button ─────────────────────────────────────────────────────────
  submitButton: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 17,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonIcon: { fontSize: 18 },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secureNote: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 14,
  },

  // ── Payment Methods ─────────────────────────────────────────────────────────
  paymentMethods: {
    gap: 12,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 14,
    padding: 16,
  },
  paymentMethodCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  paymentMethodTexts: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  paymentMethodDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  // ── WebView ───────────────────────────────────────────────────────────────
  webViewSafeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  webViewCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webViewCloseText: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '700' },
  webViewTitleContainer: { alignItems: 'center' },
  webViewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  webViewSubtitle: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '500',
    marginTop: 2,
  },
  webView: { flex: 1 },
  webViewLoadingOverlay: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    gap: 16,
  },
  webViewLoadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
