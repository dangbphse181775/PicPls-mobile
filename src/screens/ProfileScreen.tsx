import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '../store/authStore';
import { COLORS } from '../theme/colors';

interface Props {
  navigation: any;
}

interface MenuItem {
  icon: string;
  title: string;
  desc?: string;
  onPress: () => void;
  destructive?: boolean;
}

export default function ProfileScreen({ navigation }: Props) {
  const { user, clearAuth } = useAuthStore();
  const isGrapher = user?.role?.toLowerCase() === 'grapher';

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: clearAuth },
    ]);
  };

  const customerMenu: MenuItem[] = [
    { icon: '✏️', title: 'Chỉnh sửa hồ sơ', onPress: () => navigation.navigate('EditProfile') },
  ];

  const grapherMenu: MenuItem[] = [
    { icon: '✏️', title: 'Chỉnh sửa hồ sơ', onPress: () => navigation.navigate('EditProfile') },
    {
      icon: '🏪',
      title: 'Cửa hàng của tôi',
      desc: 'Bio, địa điểm, thiết bị, phong cách',
      onPress: () => navigation.navigate('GrapherShop'),
    },
    {
      icon: '🖼️',
      title: 'Quản lý Portfolio',
      desc: 'Thêm / xoá ảnh portfolio',
      onPress: () => navigation.navigate('GrapherPortfolio'),
    },
    {
      icon: '📦',
      title: 'Gói dịch vụ',
      desc: 'Tạo và quản lý các gói giá',
      onPress: () => navigation.navigate('GrapherPackages'),
    },
    {
      icon: '📅',
      title: 'Lịch trình làm việc',
      desc: 'Đơn đặt lịch & trạng thái online',
      onPress: () => navigation.navigate('GrapherSchedule'),
    },
  ];

  const settingsMenu: MenuItem[] = [
    {
      icon: '🔒',
      title: 'Đổi mật khẩu',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      icon: '⚙️',
      title: 'Cài đặt ứng dụng',
      desc: 'Thông báo, giao diện',
      onPress: () => navigation.navigate('AppSettings'),
    },
    {
      icon: '📄',
      title: 'Điều khoản & Chính sách',
      onPress: () => navigation.navigate('Terms'),
    },
  ];

  if (!user) return null;
  const userName = user.name || 'Người dùng';
  const userEmail = user.email || '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.nameText}>{userName}</Text>
            <Text style={styles.emailText}>{userEmail}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {isGrapher ? '📷 Nhiếp ảnh gia' : '🙋 Khách hàng'}
              </Text>
            </View>
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          {(isGrapher ? grapherMenu : customerMenu).map((m, i) => (
            <MenuRow key={i} item={m} />
          ))}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>
          {settingsMenu.map((m, i) => (
            <MenuRow key={i} item={m} />
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutBtnText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Phiên bản 1.0.0 • Build 2026.06.16</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuRow({ item }: { item: MenuItem }) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuIcon}>{item.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuText}>{item.title}</Text>
          {item.desc ? <Text style={styles.menuDesc}>{item.desc}</Text> : null}
        </View>
      </View>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 20 },

  profileCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { fontSize: 28, fontWeight: '700', color: COLORS.primary },
  profileInfo: { flex: 1, gap: 4 },
  nameText: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  emailText: { fontSize: 13, color: COLORS.textSecondary },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  roleText: { fontSize: 11, fontWeight: '700', color: COLORS.primaryLight },

  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 8,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  menuIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  menuText: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  menuDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  menuArrow: { fontSize: 22, color: COLORS.textMuted },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.danger + '50',
    marginBottom: 16,
    gap: 8,
  },
  logoutIcon: { fontSize: 18 },
  logoutBtnText: { color: COLORS.danger, fontSize: 15, fontWeight: '700' },

  versionText: { textAlign: 'center', color: COLORS.textMuted, fontSize: 12 },
});
