import React, { useEffect, useState } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ActivityIndicator, View, StyleSheet, StatusBar, LogBox } from 'react-native';
import AppBackground from './src/components/AppBackground';
import ErrorBoundary from './src/components/ErrorBoundary';

import { setTokenGetter, setClearAuthCallback } from './src/api/axiosClient';
import { useAuthStore } from './src/store/authStore';

// Ẩn các warning không quan trọng (SignalR reconnect, AsyncStorage, ...)
// tránh làm rối console nhưng vẫn giữ crash-log thật.
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'AsyncStorage has been extracted',
  'Require cycle',
  'new NativeEventEmitter',
  // SignalR: server close connection là bình thường khi navigate hoặc reconnect
  'Connection disconnected with error',
  'Server returned an error on close',
  'WebSocket connection',
  'Connection closed with an error',
  'SignalR is not connected',
]);

// ── Navigation ────────────────────────────────────────────────────────────────
import TabNavigator, { type TabMode } from './src/navigation/TabNavigator';

// ── Auth screens ──────────────────────────────────────────────────────────────
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// ── Detail / Modal screens ────────────────────────────────────────────────────
import GrapherDetailScreen from './src/screens/GrapherDetailScreen';
import CreateBookingScreen from './src/screens/CreateBookingScreen';
import BookingSuccessScreen from './src/screens/BookingSuccessScreen';
import BookingDetailScreen from './src/screens/BookingDetailScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ChatScreen from './src/screens/ChatScreen';

// ── Grapher management screens ────────────────────────────────────────────────
import GrapherShopEditorScreen from './src/screens/GrapherShopEditorScreen';
import GrapherPortfolioManagerScreen from './src/screens/GrapherPortfolioManagerScreen';
import GrapherScheduleScreen from './src/screens/GrapherScheduleScreen';
import GrapherServicePackagesScreen from './src/screens/GrapherServicePackagesScreen';

// ── Settings screens ──────────────────────────────────────────────────────────
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import AppSettingsScreen from './src/screens/AppSettingsScreen';
import TermsScreen from './src/screens/TermsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

// ── Types ─────────────────────────────────────────────────────────────────────
import type {
  CreateBookingScreenParams,
  BookingSuccessScreenParams,
} from './src/types/booking.types';

export type RootStackParamList = {
  // Auth
  Login: undefined;
  Register: undefined;
  // Tabs (with mode)
  MainTabs: { mode: TabMode } | undefined;
  // Detail / Modals
  GrapherDetail: { grapherId: string };
  CreateBooking: CreateBookingScreenParams;
  BookingSuccess: BookingSuccessScreenParams;
  BookingDetail: { bookingId: string };
  Review: { bookingId: string; grapherName: string };
  EditProfile: undefined;
  Chat: { otherUserId: string; otherUserName: string };
  // Grapher
  GrapherShop: undefined;
  GrapherPortfolio: undefined;
  GrapherSchedule: undefined;
  GrapherPackages: undefined;
  // Settings
  ChangePassword: undefined;
  AppSettings: undefined;
  Terms: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Wrapper that injects the role into TabNavigator
function TabsWithMode() {
  const { user } = useAuthStore();
  const mode: TabMode = !user ? 'guest' : user.role?.toLowerCase() === 'grapher' ? 'grapher' : 'customer';
  // Re-mount the navigator when mode changes
  return <TabNavigator key={mode} mode={mode} />;
}

export default function App() {
  const { user, restoreAuth } = useAuthStore();
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    restoreAuth().finally(() => setIsRestoring(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTokenGetter(() => useAuthStore.getState().token);
    setClearAuthCallback(() => {
      // Clear auth on 401
      useAuthStore.getState().clearAuth();
    });
  }, []);

  if (isRestoring) {
    return (
      <ErrorBoundary>
        <View style={styles.splash}>
          <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
          <AppBackground />
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
    <GestureHandlerRootView style={styles.root}>
        <AppBackground />
        <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
        <SafeAreaProvider>
          <NavigationContainer
            theme={{
              ...DarkTheme,
              colors: {
                ...DarkTheme.colors,
                background: 'transparent',
                card: 'rgba(15, 15, 26, 0.92)',
              },
            }}
          >
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          >
            <Stack.Screen name="MainTabs" component={TabsWithMode} />

            {/* Auth flows (overlay) */}
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ animation: 'slide_from_right', presentation: 'modal' }}
            />

            {/* Detail / Modal flows */}
            <Stack.Screen
              name="GrapherDetail"
              component={GrapherDetailScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="CreateBooking"
              component={CreateBookingScreen}
              options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
            <Stack.Screen
              name="BookingSuccess"
              component={BookingSuccessScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen
              name="BookingDetail"
              component={BookingDetailScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Review"
              component={ReviewScreen}
              options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ animation: 'slide_from_right' }}
            />

            {/* Grapher-only */}
            {user?.role?.toLowerCase() === 'grapher' && (
              <>
                <Stack.Screen
                  name="GrapherShop"
                  component={GrapherShopEditorScreen}
                  options={{ animation: 'slide_from_right' }}
                />
                <Stack.Screen
                  name="GrapherPortfolio"
                  component={GrapherPortfolioManagerScreen}
                  options={{ animation: 'slide_from_right' }}
                />
                <Stack.Screen
                  name="GrapherSchedule"
                  component={GrapherScheduleScreen}
                  options={{ animation: 'slide_from_right' }}
                />
                <Stack.Screen
                  name="GrapherPackages"
                  component={GrapherServicePackagesScreen}
                  options={{ animation: 'slide_from_right' }}
                />
              </>
            )}

            {/* Settings (available to all) */}
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="AppSettings"
              component={AppSettingsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Terms"
              component={TermsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
      <Toast />
    </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F0F1A' },
  splash: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
