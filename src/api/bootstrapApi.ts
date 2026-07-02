import axiosClient from './axiosClient';
import type { BootstrapResponse } from '../types/grapher.types';

const bootstrapApi = {
  /**
   * GET /api/bootstrap
   * Dữ liệu khởi tạo cho landing page: photographers, presets, styles, ...
   */
  get: async (): Promise<BootstrapResponse> => {
    const response = await axiosClient.get<BootstrapResponse>('/api/bootstrap');
    return response.data;
  },
};

export default bootstrapApi;
