import axiosClient from './axiosClient';
import type {
  GrapherProfileMeResponse,
  UpdateGrapherProfileRequest,
  ServicePackageUpsertRequest,
} from '../types/grapher.types';
import type { ServicePackageResponse } from '../types/booking.types';

const grapherProfileApi = {
  /**
   * GET /api/graphers/me
   * Lấy profile đầy đủ của grapher đang đăng nhập.
   */
  getMe: async (): Promise<GrapherProfileMeResponse> => {
    const response = await axiosClient.get<GrapherProfileMeResponse>('/api/graphers/me');
    return response.data;
  },

  /**
   * PUT /api/graphers/me
   * Cập nhật toàn bộ profile grapher (bio, location, styles, portfolio, equipment, services).
   */
  updateMe: async (payload: UpdateGrapherProfileRequest): Promise<GrapherProfileMeResponse> => {
    const response = await axiosClient.put<GrapherProfileMeResponse>('/api/graphers/me', payload);
    return response.data;
  },

  /**
   * PUT /api/graphers/me/online
   * Bật/tắt trạng thái online của grapher.
   */
  setOnline: async (isOnline: boolean): Promise<{ isOnline: boolean }> => {
    const response = await axiosClient.put<{ isOnline: boolean }>('/api/graphers/me/online', {
      isOnline,
    });
    return response.data;
  },

  /**
   * GET /api/graphers/me/services
   * Lấy danh sách gói dịch vụ của grapher.
   */
  getMyServices: async (): Promise<ServicePackageResponse[]> => {
    const response = await axiosClient.get<ServicePackageResponse[]>('/api/graphers/me/services');
    return response.data;
  },

  /**
   * POST /api/graphers/me/services
   * Tạo gói dịch vụ mới.
   */
  createService: async (payload: ServicePackageUpsertRequest): Promise<ServicePackageResponse> => {
    const response = await axiosClient.post<ServicePackageResponse>(
      '/api/graphers/me/services',
      payload,
    );
    return response.data;
  },

  /**
   * PUT /api/graphers/me/services/:id
   * Cập nhật gói dịch vụ.
   */
  updateService: async (
    id: string,
    payload: ServicePackageUpsertRequest,
  ): Promise<ServicePackageResponse> => {
    const response = await axiosClient.put<ServicePackageResponse>(
      `/api/graphers/me/services/${id}`,
      payload,
    );
    return response.data;
  },

  /**
   * DELETE /api/graphers/me/services/:id
   * Xoá gói dịch vụ.
   */
  deleteService: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/graphers/me/services/${id}`);
  },

  /**
   * POST /api/graphers/me/seed-packages
   * Khởi tạo 3 gói dịch vụ mặc định.
   */
  seedDefaultPackages: async (): Promise<ServicePackageResponse[]> => {
    const response = await axiosClient.post<ServicePackageResponse[]>(
      '/api/graphers/me/seed-packages',
    );
    return response.data;
  },
};

export default grapherProfileApi;
