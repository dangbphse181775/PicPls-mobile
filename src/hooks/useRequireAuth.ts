import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';

interface RequireAuthOptions {
  /**
   * Hành động mà người dùng muốn thực hiện (VD: 'đặt lịch', 'nhắn tin', 'lưu ảnh').
   * Hiển thị trong thông báo.
   */
  action: string;
  /**
   * Nếu true thì khi user chưa đăng nhập sẽ navigate thẳng tới màn hình Login.
   * Nếu false (mặc định) sẽ hỏi user trước.
   */
  navigateDirectly?: boolean;
  navigation: any;
}

/**
 * useRequireAuth: dùng trong các màn hình Guest để chặn action cần đăng nhập.
 *
 * VD:
 *   const requireAuth = useRequireAuth();
 *   const handleBook = () => requireAuth(() => navigation.navigate('CreateBooking', {...}), 'đặt lịch');
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuthStore();

  return useCallback(
    (action: () => void, actionLabel: string = 'thực hiện chức năng này', navigation: any) => {
      if (isAuthenticated) {
        action();
        return true;
      }

      // Hỏi user rồi navigate tới Login
      Alert.alert(
        'Yêu cầu đăng nhập',
        `Bạn cần đăng nhập để ${actionLabel}.`,
        [
          { text: 'Để sau', style: 'cancel' },
          {
            text: 'Đăng nhập',
            onPress: () => {
              if (navigation?.navigate) navigation.navigate('Login');
            },
          },
        ],
        { cancelable: true },
      );
      return false;
    },
    [isAuthenticated],
  );
}

/**
 * Helpers dạng plain function dùng ở trong screen component:
 *  const { user } = useAuthStore();
 *  ...
 *  <TouchableOpacity onPress={() => requireLogin(navigation, 'đặt lịch', () => doSomething())}>
 */
export function requireLogin(
  navigation: any,
  actionLabel: string,
  onAuthorized: () => void,
  isAuthenticated: boolean,
) {
  if (isAuthenticated) {
    onAuthorized();
    return true;
  }
  Alert.alert(
    'Yêu cầu đăng nhập',
    `Bạn cần đăng nhập để ${actionLabel}.`,
    [
      { text: 'Để sau', style: 'cancel' },
      {
        text: 'Đăng nhập',
        onPress: () => {
          if (navigation?.navigate) navigation.navigate('Login');
        },
      },
    ],
    { cancelable: true },
  );
  return false;
}

export default useRequireAuth;
