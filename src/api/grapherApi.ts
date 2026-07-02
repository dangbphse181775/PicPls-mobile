import axiosClient from './axiosClient';
import type { GrapherSummaryResponse, GrapherDetailResponse } from '../types/booking.types';

const grapherApi = {
  /**
   * GET /api/graphers
   * Tìm kiếm danh sách nhiếp ảnh gia, không cần token
   */
  search: async (params?: {
    location?: string;
    style?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    verified?: boolean;
  }): Promise<GrapherSummaryResponse[]> => {
    const response = await axiosClient.get<GrapherSummaryResponse[]>('/api/graphers', { params });
    return response.data;
  },

  /**
   * GET /api/graphers/:id
   * Lấy chi tiết profile nhiếp ảnh gia, không cần token
   */
  getDetail: async (id: string): Promise<GrapherDetailResponse> => {
    const response = await axiosClient.get<GrapherDetailResponse>(`/api/graphers/${id}`);
    return response.data;
  },
};

export default grapherApi;
