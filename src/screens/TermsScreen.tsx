import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../theme/colors';

interface Props {
  navigation: any;
}

const SECTIONS = [
  {
    title: '1. Giới thiệu',
    body: 'PicMate là nền tảng kết nối khách hàng với các nhiếp ảnh gia chuyên nghiệp. Bằng việc sử dụng ứng dụng, bạn đồng ý tuân thủ các điều khoản dưới đây.',
  },
  {
    title: '2. Tài khoản người dùng',
    body: 'Người dùng tự chịu trách nhiệm bảo mật thông tin tài khoản. PicMate không chịu trách nhiệm về thiệt hại phát sinh từ việc chia sẻ thông tin đăng nhập.',
  },
  {
    title: '3. Đặt lịch & Thanh toán',
    body: 'Mọi giao dịch đặt lịch đều được xử lý qua cổng VNPAY. PicMate giữ tiền trong tài khoản escrow và chuyển cho nhiếp ảnh gia sau khi buổi chụp hoàn thành.',
  },
  {
    title: '4. Huỷ đơn & Hoàn tiền',
    body: 'Khách hàng có thể huỷ đơn trước thời điểm chụp. Phí hoàn tiền tuỳ thuộc vào thời điểm huỷ và điều kiện cụ thể của từng đơn.',
  },
  {
    title: '5. Quyền riêng tư',
    body: 'PicMate cam kết bảo vệ thông tin cá nhân của người dùng. Ảnh upload lên hệ thống chỉ được sử dụng cho mục đích hiển thị portfolio và xử lý đơn hàng.',
  },
  {
    title: '6. Hành vi cấm',
    body: 'Nghiêm cấm đăng tải nội dung vi phạm pháp luật, quấy rối, lừa đảo hoặc bất kỳ hành vi nào gây tổn hại đến cộng đồng PicMate.',
  },
  {
    title: '7. Thay đổi điều khoản',
    body: 'PicMate có quyền cập nhật điều khoản bất kỳ lúc nào. Việc tiếp tục sử dụng đồng nghĩa với việc bạn chấp nhận các thay đổi.',
  },
  {
    title: '8. Liên hệ',
    body: 'Mọi thắc mắc xin liên hệ: support@picmate.app • Hotline: 1900 6868',
  },
];

export default function TermsScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Điều khoản & Chính sách</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>📄 Điều khoản sử dụng</Text>
          <Text style={styles.introDesc}>
            Cập nhật lần cuối: 16/06/2026
          </Text>
        </View>

        {SECTIONS.map((s, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Sử dụng PicMate nghĩa là bạn đã đọc và đồng ý với tất cả điều khoản trên.
          </Text>
        </View>
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

  intro: { marginBottom: 20 },
  introTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  introDesc: { fontSize: 12, color: COLORS.textMuted },

  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  sectionBody: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },

  footer: { marginTop: 16, padding: 16, alignItems: 'center' },
  footerText: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', fontStyle: 'italic' },
});
