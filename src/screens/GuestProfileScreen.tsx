import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../components/Button';
import Card from '../components/Card';
import { COLORS } from '../theme/colors';

interface Props {
  navigation: any;
}

const FEATURES = [
  { icon: '🔍', title: 'Tìm thợ chụp', desc: 'Hàng trăm nhiếp ảnh gia chuyên nghiệp' },
  { icon: '🎨', title: 'Preset miễn phí', desc: 'Bộ lọc màu chất lượng cao' },
  { icon: '📷', title: 'Chụp & upload', desc: 'Lưu trữ ảnh an toàn trên cloud' },
  { icon: '💬', title: 'Nhắn tin trực tiếp', desc: 'Trao đổi với thợ chụp dễ dàng' },
];

export default function GuestProfileScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Text style={styles.logoIcon}>📸</Text>
          </View>
          <Text style={styles.brandName}>PicMate</Text>
          <Text style={styles.brandTagline}>
            Nền tảng kết nối nhiếp ảnh gia chuyên nghiệp
          </Text>
        </View>

        <Card style={styles.ctaCard} padding={20}>
          <Text style={styles.ctaTitle}>Đăng nhập để sử dụng đầy đủ tính năng</Text>
          <Text style={styles.ctaDesc}>
            Tạo tài khoản miễn phí chỉ với vài bước đơn giản
          </Text>
          <View style={styles.ctaBtnRow}>
            <Button
              title="Đăng nhập"
              onPress={() => navigation.navigate('Login')}
              size="md"
              style={styles.ctaBtn}
            />
            <Button
              title="Tạo tài khoản"
              variant="outline"
              onPress={() => navigation.navigate('Register')}
              size="md"
              style={styles.ctaBtn}
            />
          </View>
        </Card>

        <View style={styles.featureSection}>
          <Text style={styles.sectionTitle}>Tính năng nổi bật</Text>
          {FEATURES.map((f, idx) => (
            <View key={idx} style={styles.featureRow}>
              <View style={styles.featureIconWrap}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.linkSection}>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => navigation.navigate('Terms')}
          >
            <Text style={styles.linkIcon}>📄</Text>
            <Text style={styles.linkText}>Điều khoản & Chính sách</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => navigation.navigate('AppSettings')}
          >
            <Text style={styles.linkIcon}>⚙️</Text>
            <Text style={styles.linkText}>Cài đặt ứng dụng</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  container: { padding: 20, paddingBottom: 40 },

  header: { alignItems: 'center', marginTop: 14, marginBottom: 24 },
  logoWrap: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    marginBottom: 14,
  },
  logoIcon: { fontSize: 36 },
  brandName: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  brandTagline: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
  },

  ctaCard: { marginBottom: 24 },
  ctaTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  ctaDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginBottom: 16 },
  ctaBtnRow: { flexDirection: 'row', gap: 10 },
  ctaBtn: { flex: 1 },

  featureSection: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 8,
    gap: 12,
  },
  featureIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIcon: { fontSize: 20 },
  featureTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  featureDesc: { fontSize: 12, color: COLORS.textMuted, lineHeight: 17 },

  linkSection: { marginBottom: 24 },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 8,
    gap: 12,
  },
  linkIcon: { fontSize: 18 },
  linkText: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  linkArrow: { fontSize: 20, color: COLORS.textMuted },

  versionText: { textAlign: 'center', color: COLORS.textMuted, fontSize: 12 },
});
