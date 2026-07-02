import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import bookingApi from '../api/bookingApi';
import disputeApi from '../api/disputeApi';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '../types/booking.types';
import type { BookingDetailResponse } from '../types/booking.types';
import type { RootStackParamList } from '../../App';
import { useAuthStore } from '../store/authStore';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingDetail'>;

// Bổ sung type cho RootStackParamList trong file này để tránh lỗi type, 
// nhưng đúng nhất là phải update App.tsx để định nghĩa.
// Giả định: BookingDetail: { bookingId: string }

const formatCurrency = (amount: number | undefined | null) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const formatDate = (dateString: string) => {
  if (!dateString) return 'Chưa cập nhật';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString || 'Chưa cập nhật';
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

export default function BookingDetailScreen({ route, navigation }: Props) {
  // @ts-ignore - BookingDetail params will be added to App.tsx later
  const { bookingId } = route.params;
  const { user } = useAuthStore();
  const userRole = user?.role;
  const isCustomer = userRole === 'Customer';
  const isGrapher = userRole === 'Grapher';

  const [booking, setBooking] = useState<BookingDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dispute state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  const fetchDetail = async () => {
    try {
      const data = await bookingApi.getDetail(bookingId);
      setBooking(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải chi tiết lịch đặt');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [bookingId]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleCancel = () => {
    Alert.alert('Hủy lịch', 'Bạn có chắc chắn muốn hủy lịch đặt này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Có, Hủy',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await bookingApi.cancel(bookingId, { reason: 'Người dùng hủy' });
            Alert.alert('Thành công', 'Đã hủy lịch đặt');
            fetchDetail();
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể hủy lịch đặt');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      await bookingApi.confirm(bookingId);
      Alert.alert('Thành công', 'Đã xác nhận lịch đặt');
      fetchDetail();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xác nhận lịch đặt');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async () => {
    setActionLoading(true);
    try {
      await bookingApi.start(bookingId);
      Alert.alert('Thành công', 'Đã bắt đầu buổi chụp');
      fetchDetail();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể bắt đầu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await bookingApi.complete(bookingId);
      Alert.alert('Thành công', 'Đã hoàn thành buổi chụp');
      fetchDetail();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể hoàn thành');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateDispute = async () => {
    if (!disputeReason.trim() || !disputeDesc.trim()) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập đầy đủ lý do và mô tả' });
      return;
    }
    setIsSubmittingDispute(true);
    try {
      await disputeApi.create({
        bookingId,
        reason: disputeReason,
        description: disputeDesc,
      });
      Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã gửi báo cáo sự cố' });
      setShowDisputeModal(false);
      setDisputeReason('');
      setDisputeDesc('');
      fetchDetail();
    } catch {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tạo khiếu nại lúc này' });
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (isLoading || !booking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết Lịch đặt</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          {/* Status Banner */}
          {(() => {
            const status = (booking.status || '') as keyof typeof BOOKING_STATUS_COLORS;
            const statusColor = BOOKING_STATUS_COLORS[status] || '#6B7280';
            const statusLabel = BOOKING_STATUS_LABELS[status] || booking.status || 'N/A';
            return (
              <View style={[styles.statusBanner, { backgroundColor: statusColor + '20' }]}>
                <Text style={[styles.statusBannerText, { color: statusColor }]}>
                  Trạng thái: {statusLabel}
                </Text>
              </View>
            );
          })()}

          {/* Info Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Thông tin chung</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{isGrapher ? 'Khách hàng' : 'Nhiếp ảnh gia'}</Text>
              <Text style={styles.infoValue}>
                {isGrapher ? booking.customerName || 'N/A' : booking.grapherName || 'N/A'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gói dịch vụ</Text>
              <Text style={styles.infoValue}>{booking.serviceName || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Thời gian</Text>
              <Text style={styles.infoValue}>{formatDate(booking.scheduledAt)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Thời lượng</Text>
              <Text style={styles.infoValue}>{booking.durationMinutes || 0} phút</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Địa điểm</Text>
              <Text style={styles.infoValue}>{booking.location || 'Chưa cập nhật'}</Text>
            </View>

            {booking.note ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ghi chú</Text>
                <Text style={styles.infoValue}>{booking.note}</Text>
              </View>
            ) : null}
          </View>

          {/* Price Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tổng tiền dịch vụ</Text>
              <Text style={styles.infoValue}>{formatCurrency(booking.totalAmount)}</Text>
            </View>

            {isGrapher && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phí nền tảng</Text>
                  <Text style={styles.infoValue}>- {formatCurrency(booking.platformFeeAmount)}</Text>
                </View>
                <View style={[styles.infoRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Thực nhận</Text>
                  <Text style={styles.totalValue}>{formatCurrency(booking.grapherPayoutAmount)}</Text>
                </View>
              </>
            )}
            
            {isCustomer && (
              <View style={[styles.infoRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Đã thanh toán</Text>
                <Text style={styles.totalValue}>{formatCurrency(booking.totalAmount)}</Text>
              </View>
            )}
          </View>

          {/* Cancel Reason */}
          {booking.status === 'Cancelled' && booking.cancellationReason && (
            <View style={styles.card}>
              <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Lý do hủy</Text>
              <Text style={{ color: '#F9FAFB', marginTop: 8 }}>{booking.cancellationReason}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            {actionLoading ? (
              <ActivityIndicator size="large" color="#6366F1" style={{ marginVertical: 20 }} />
            ) : (
              <>
                {/* Cancel is allowed for both if pending confirmation or pending payment */}
                {(booking.status === 'PendingConfirmation' || booking.status === 'Confirmed' || booking.status === 'PendingPayment') && (
                  <TouchableOpacity style={styles.btnDanger} onPress={handleCancel}>
                    <Text style={styles.btnDangerText}>Hủy lịch</Text>
                  </TouchableOpacity>
                )}

                {/* Grapher actions */}
                {isGrapher && (booking.status === 'PendingConfirmation' || booking.status === 'PendingPayment') && (
                  <TouchableOpacity style={styles.btnPrimary} onPress={handleConfirm}>
                    <Text style={styles.btnPrimaryText}>Xác nhận lịch</Text>
                  </TouchableOpacity>
                )}
                {isGrapher && booking.status === 'InProgress' && (
                  <TouchableOpacity style={styles.btnSuccess} onPress={handleComplete}>
                    <Text style={styles.btnSuccessText}>Hoàn thành buổi chụp</Text>
                  </TouchableOpacity>
                )}

                {/* Customer actions */}
                {isCustomer && booking.status === 'Confirmed' && (
                  <TouchableOpacity style={styles.btnPrimary} onPress={handleStart}>
                    <Text style={styles.btnPrimaryText}>Bắt đầu buổi chụp</Text>
                  </TouchableOpacity>
                )}
                {isCustomer && booking.status === 'Completed' && (
                  <TouchableOpacity 
                    style={styles.btnPrimary} 
                    onPress={() => {
                      // @ts-ignore
                      navigation.navigate('Review', { bookingId: booking.id, grapherName: booking.grapherName });
                    }}
                  >
                    <Text style={styles.btnPrimaryText}>Đánh giá & Nhận xét</Text>
                  </TouchableOpacity>
                )}
                
                {/* Dispute / Report issue for both Customer & Grapher if valid status */}
                {(booking.status === 'InProgress' || booking.status === 'Completed') && (
                  <TouchableOpacity style={styles.btnWarning} onPress={() => setShowDisputeModal(true)}>
                    <Text style={styles.btnWarningText}>Báo cáo sự cố (Khiếu nại)</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </ScrollView>

        {/* Dispute Modal */}
        <Modal visible={showDisputeModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Báo cáo sự cố</Text>
              
              <Text style={styles.label}>Lý do</Text>
              <TextInput 
                style={styles.input}
                placeholder="Ví dụ: Grapher đến trễ, Thái độ không tốt..."
                placeholderTextColor={COLORS.textMuted}
                value={disputeReason}
                onChangeText={setDisputeReason}
              />
              
              <Text style={styles.label}>Mô tả chi tiết</Text>
              <TextInput 
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả cụ thể sự việc..."
                placeholderTextColor={COLORS.textMuted}
                value={disputeDesc}
                onChangeText={setDisputeDesc}
                multiline
                numberOfLines={4}
              />
              
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowDisputeModal(false)} disabled={isSubmittingDispute}>
                  <Text style={styles.modalBtnCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnSubmit} onPress={handleCreateDispute} disabled={isSubmittingDispute}>
                  {isSubmittingDispute ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalBtnSubmitText}>Gửi</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const COLORS = {
  background: '#0F0F1A',
  surface: '#1A1A2E',
  primary: '#6366F1',
  success: '#10B981',
  danger: '#EF4444',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: '#2D2D4E',
  cardBorder: '#3D3D6B',
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  
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

  container: { padding: 20, paddingBottom: 40, gap: 16 },

  statusBanner: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusBannerText: { fontSize: 16, fontWeight: '700' },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary, flex: 1 },
  infoValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500', flex: 2, textAlign: 'right' },
  
  totalRow: { marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border, marginBottom: 0 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#F59E0B' },

  actionContainer: { gap: 12, marginTop: 8 },
  btnPrimary: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  btnPrimaryText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  btnSuccess: { backgroundColor: COLORS.success, padding: 16, borderRadius: 12, alignItems: 'center' },
  btnSuccessText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  btnDanger: { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.danger, padding: 16, borderRadius: 12, alignItems: 'center' },
  btnDangerText: { color: COLORS.danger, fontWeight: '700', fontSize: 16 },
  btnWarning: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#F59E0B', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnWarningText: { color: '#F59E0B', fontWeight: '700', fontSize: 16 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, color: COLORS.textPrimary },
  textArea: { height: 100, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalBtnCancel: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  modalBtnCancelText: { color: COLORS.textSecondary, fontWeight: '600' },
  modalBtnSubmit: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', backgroundColor: COLORS.primary },
  modalBtnSubmitText: { color: '#FFF', fontWeight: '600' },
});
