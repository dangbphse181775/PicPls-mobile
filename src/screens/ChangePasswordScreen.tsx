import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../components/Button';
import Card from '../components/Card';
import { COLORS } from '../theme/colors';

interface Props {
  navigation: any;
}

export default function ChangePasswordScreen({ navigation }: Props) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ các trường.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mật khẩu không khớp', 'Mật khẩu mới và xác nhận phải giống nhau.');
      return;
    }
    setIsLoading(true);
    // BE chưa expose endpoint change-password cho User role trong giai đoạn này.
    // Hiển thị thông báo để người dùng biết tính năng đang phát triển.
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Tính năng đang phát triển',
        'Chức năng đổi mật khẩu sẽ sớm được cập nhật. Vui lòng quay lại sau.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="never"
        >
          <Card style={styles.infoCard} padding={16}>
            <Text style={styles.infoIcon}>🔐</Text>
            <Text style={styles.infoTitle}>Bảo mật tài khoản</Text>
            <Text style={styles.infoDesc}>
              Thay đổi mật khẩu định kỳ giúp bảo vệ tài khoản của bạn tốt hơn.
            </Text>
          </Card>

          <Card style={styles.formCard} padding={20}>
            <Text style={styles.label}>Mật khẩu hiện tại</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Nhập mật khẩu hiện tại"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showOld}
              />
              <TouchableOpacity onPress={() => setShowOld(!showOld)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.inputIcon}>{showOld ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Mật khẩu mới</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>🔑</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nhập mật khẩu mới"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showNew}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.inputIcon}>{showNew ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>✅</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showNew}
              />
            </View>

            <Button
              title="Cập nhật mật khẩu"
              onPress={handleSubmit}
              loading={isLoading}
              fullWidth
              style={{ marginTop: 16 }}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
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

  infoCard: { alignItems: 'center', marginBottom: 16 },
  infoIcon: { fontSize: 36, marginBottom: 10 },
  infoTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  infoDesc: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 19 },

  formCard: {},
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 12,
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
    marginBottom: 4,
  },
  inputIcon: { fontSize: 15 },
  input: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
});
