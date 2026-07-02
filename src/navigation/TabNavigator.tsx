import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, View, Text } from 'react-native';

import { COLORS } from '../theme/colors';
import { useAuthStore } from '../store/authStore';

import PublicHomeScreen from '../screens/PublicHomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import PresetShopScreen from '../screens/PresetShopScreen';
import QuickCaptureScreen from '../screens/QuickCaptureScreen';
import GuestProfileScreen from '../screens/GuestProfileScreen';
import HomeScreen from '../screens/HomeScreen';
import GrapherDashboardScreen from '../screens/GrapherDashboardScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import GrapherOrdersScreen from '../screens/GrapherOrdersScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GrapherServicePackagesScreen from '../screens/GrapherServicePackagesScreen';
import GrapherPortfolioManagerScreen from '../screens/GrapherPortfolioManagerScreen';

export type TabMode = 'guest' | 'customer' | 'grapher';

export type TabParamList = {
  // Guest mode
  GuestHomeTab: undefined;
  GuestExploreTab: undefined;
  GuestPresetTab: undefined;
  GuestCaptureTab: undefined;
  GuestProfileTab: undefined;
  // Logged-in mode (shared)
  HomeTab: undefined;
  BookingsTab: undefined;
  ServicesTab: undefined;
  PortfolioTab: undefined;
  ChatTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

interface TabConfig {
  name: keyof TabParamList;
  component: React.ComponentType<any>;
  title: string;
  icon: string;
}

const GUEST_TABS: TabConfig[] = [
  { name: 'GuestHomeTab', component: PublicHomeScreen, title: 'Trang chủ', icon: '🏠' },
  { name: 'GuestExploreTab', component: ExploreScreen, title: 'Khám phá', icon: '🖼️' },
  { name: 'GuestPresetTab', component: PresetShopScreen, title: 'Preset', icon: '🎨' },
  { name: 'GuestCaptureTab', component: QuickCaptureScreen, title: 'Chụp', icon: '📷' },
  { name: 'GuestProfileTab', component: GuestProfileScreen, title: 'Tài khoản', icon: '👤' },
];

const CUSTOMER_TABS: TabConfig[] = [
  { name: 'HomeTab', component: HomeScreen, title: 'Khám phá', icon: '🏠' },
  { name: 'BookingsTab', component: MyBookingsScreen, title: 'Lịch đặt', icon: '📅' },
  { name: 'ChatTab', component: ConversationsScreen, title: 'Tin nhắn', icon: '💬' },
  { name: 'ProfileTab', component: ProfileScreen, title: 'Cá nhân', icon: '👤' },
];

const GRAPHER_TABS: TabConfig[] = [
  { name: 'HomeTab', component: GrapherDashboardScreen, title: 'Tổng quan', icon: '📊' },
  { name: 'BookingsTab', component: GrapherOrdersScreen, title: 'Đơn', icon: '📋' },
  { name: 'ServicesTab', component: GrapherServicePackagesScreen, title: 'Dịch vụ', icon: '📦' },
  { name: 'PortfolioTab', component: GrapherPortfolioManagerScreen, title: 'Ảnh', icon: '🖼️' },
  { name: 'ChatTab', component: ConversationsScreen, title: 'Chat', icon: '💬' },
  { name: 'ProfileTab', component: ProfileScreen, title: 'Cá nhân', icon: '👤' },
];

interface TabNavigatorProps {
  mode: TabMode;
}

export default function TabNavigator({ mode }: TabNavigatorProps) {
  const tabs =
    mode === 'guest' ? GUEST_TABS : mode === 'grapher' ? GRAPHER_TABS : CUSTOMER_TABS;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        sceneStyle: { backgroundColor: 'transparent' },
        tabBarIcon: ({ focused, color }) => {
          const config = tabs.find(t => t.name === route.name);
          const icon = config?.icon || '📱';
          return (
            <View style={styles.iconContainer}>
              <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.55 }}>{icon}</Text>
            </View>
          );
        },
      })}
    >
      {tabs.map(t => (
        <Tab.Screen
          key={t.name}
          name={t.name}
          component={t.component}
          options={{ title: t.title }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(15, 15, 26, 0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(61, 61, 107, 0.6)',
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    paddingTop: 8,
    elevation: 0,
  },
  tabBarLabel: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  iconContainer: { alignItems: 'center', justifyContent: 'center' },
});
