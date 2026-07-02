import axios from 'axios';

// ─── Cấu hình Base URL ─────────────────────────────────────────────────────────
// Sử dụng backend đã deploy trên Render
const BASE_URL = 'https://picmate-api-latest.onrender.com';
// const BASE_URL = 'http://10.0.2.2:5274'; // Android Emulator (local)
// const BASE_URL = 'http://192.168.1.x:5274'; // Thiết bị thật (local)

const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Tăng timeout vì Render server có thể cold start lâu hơn
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor: Đính kèm JWT Token ──────────────────────────────────
// Bạn cần import store của Zustand ở đây để lấy token.
// Để tránh circular dependency, lấy token qua một getter function.
// Trong dự án thật, hãy thay thế bằng store thực tế của bạn.
let _getToken: (() => string | null) | null = null;

export const setTokenGetter = (getter: () => string | null) => {
  _getToken = getter;
};

axiosClient.interceptors.request.use(
  (config) => {
    const token = _getToken?.();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor: Xử lý lỗi toàn cục ───────────────────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log lỗi để debug
    if (__DEV__) {
      console.error('[API Error]', error.response?.status, error.response?.data);
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
