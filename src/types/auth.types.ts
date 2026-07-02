// ─── Request DTOs ──────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: 'Customer' | 'Grapher';
}

// ─── Response DTOs ─────────────────────────────────────────────────────────────

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  redirect: string;
  accessToken: string;
  refreshToken: string;
}

export interface CurrentUserResponse {
  id: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

// ─── Auth Store State ──────────────────────────────────────────────────────────

export interface AuthState {
  user: AuthResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthResponse) => void;
  clearAuth: () => void;
}
