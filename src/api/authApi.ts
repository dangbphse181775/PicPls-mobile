import axiosClient from './axiosClient';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  CurrentUserResponse,
} from '../types/auth.types';

const authApi = {
  /**
   * POST /api/auth/login
   * Không cần JWT token
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },

  /**
   * POST /api/auth/register
   * Không cần JWT token
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  /**
   * GET /api/auth/me
   * Cần JWT token
   */
  getMe: async (): Promise<CurrentUserResponse> => {
    const response = await axiosClient.get<CurrentUserResponse>('/api/auth/me');
    return response.data;
  },
};

export default authApi;
