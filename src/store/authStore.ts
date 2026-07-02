/**
 * authStore — không dùng Zustand, không dùng useSyncExternalStore.
 * Dùng useState + useEffect để tránh mọi vấn đề tương thích với
 * Hermes / React Native New Architecture.
 */
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthResponse } from '../types/auth.types';

const TOKEN_KEY = 'picmate_access_token';
const USER_KEY = 'picmate_user';

// ─── State type ───────────────────────────────────────────────────────────────
interface AuthState {
  user: AuthResponse | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ─── Module-level singleton state ─────────────────────────────────────────────
let _state: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const _listeners = new Set<(s: AuthState) => void>();

function _setState(partial: Partial<AuthState>) {
  _state = { ..._state, ...partial };
  _listeners.forEach((l) => l(_state));
}

// ─── Actions (gọi được ở mọi nơi, kể cả ngoài component) ─────────────────────
async function setAuth(user: AuthResponse): Promise<void> {
  const token = user?.accessToken || '';
  try {
    if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn('[AuthStore] AsyncStorage lỗi:', e);
  }
  _setState({ user, token, isAuthenticated: true });
}

export async function clearAuth(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch (e) {
    console.warn('[AuthStore] Clear lỗi:', e);
  }
  _setState({ user: null, token: null, isAuthenticated: false });
}

async function restoreAuth(): Promise<void> {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const userJson = await AsyncStorage.getItem(USER_KEY);
    if (token && userJson) {
      const user: AuthResponse = JSON.parse(userJson);
      if (user && user.accessToken) {
        _setState({ user, token: user.accessToken, isAuthenticated: true });
      }
    }
  } catch (e) {
    console.warn('[AuthStore] restoreAuth lỗi:', e);
  }
}

function getState(): AuthState {
  return _state;
}

// ─── Hook (dùng trong React component) ───────────────────────────────────────
export function useAuthStore() {
  const [snap, setSnap] = useState<AuthState>(() => _state);

  useEffect(() => {
    // sync lại nếu state đã thay đổi trước khi component mount
    setSnap(_state);
    _listeners.add(setSnap);
    return () => {
      _listeners.delete(setSnap);
    };
  }, []);

  return {
    ...snap,
    setAuth,
    clearAuth,
    restoreAuth,
  };
}

// Cho phép gọi useAuthStore.getState() ở axiosClient (không phải hook)
useAuthStore.getState = getState;
