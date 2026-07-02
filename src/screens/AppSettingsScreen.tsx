import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Card from '../components/Card';
import { COLORS } from '../theme/colors';

interface Props {
  navigation: any;
}

export default function AppSettingsScreen({ navigation }: Props) {
  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);
  const [bookingNotif, setBookingNotif] = useState(true);
  const [chatNotif, setChatNotif] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt ứng dụng</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>🔔 Thông báo</Text>
        <Card style={styles.card} padding={0}>
          <SettingRow
            icon="📲"
            label="Thông báo đẩy"
            desc="Nhận thông báo trên thiết bị"
            value={pushNotif}
            onChange={setPushNotif}
          />
          <SettingRow
            icon="✉️"
            label="Thông báo email"
            desc="Nhận thông báo qua email"
            value={emailNotif}
            onChange={setEmailNotif}
            isLast
          />
        </Card>

        <Text style={styles.sectionTitle}>📅 Loại thông báo</Text>
        <Card style={styles.card} padding={0}>
          <SettingRow
            icon="📷"
            label="Cập nhật đơn đặt lịch"
            desc="Xác nhận, hoàn thành, hủy đơn"
            value={bookingNotif}
            onChange={setBookingNotif}
          />
          <SettingRow
            icon="💬"
            label="Tin nhắn mới"
            desc="Thông báo khi có tin nhắn mới"
            value={chatNotif}
            onChange={setChatNotif}
            isLast
          />
        </Card>

        <Text style={styles.sectionTitle}>🎨 Giao diện</Text>
        <Card style={styles.card} padding={0}>
          <SettingRow
            icon="🌙"
            label="Chế độ tối"
            desc="Luôn bật (PicMate tối ưu cho dark theme)"
            value={darkMode}
            onChange={setDarkMode}
            disabled
            isLast
          />
        </Card>

        <Text style={styles.sectionTitle}>ℹ️ Khác</Text>
        <Card style={styles.card} padding={0}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate('Terms')}
          >
            <Text style={styles.linkIcon}>📄</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.linkLabel}>Điều khoản & Chính sách</Text>
            </View>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.linkRow, styles.linkRowLast]}>
            <Text style={styles.linkIcon}>⭐</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.linkLabel}>Đánh giá ứng dụng</Text>
              <Text style={styles.linkDesc}>Giúp chúng tôi cải thiện PicMate</Text>
            </View>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.versionText}>Phiên bản 1.0.0 • Build 2026.06.16</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({
  icon,
  label,
  desc,
  value,
  onChange,
  disabled,
  isLast,
}: {
  icon: string;
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDesc}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: COLORS.border, true: COLORS.primary }}
        thumbColor={COLORS.white}
      />
    </View>
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

  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 12,
  },

  card: { marginBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowIcon: { fontSize: 22 },
  rowLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  rowDesc: { fontSize: 12, color: COLORS.textMuted },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  linkRowLast: { borderBottomWidth: 0 },
  linkIcon: { fontSize: 22 },
  linkLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  linkDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  linkArrow: { fontSize: 22, color: COLORS.textMuted },

  versionText: { textAlign: 'center', color: COLORS.textMuted, fontSize: 12, marginTop: 24 },
});
