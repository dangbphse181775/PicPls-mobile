import axiosClient from './axiosClient';
import type { CreateDisputeRequest, DisputeResponse } from '../types/dispute.types';

const disputeApi = {
  /**
   * POST /api/disputes
   * Tạo khiếu nại cho một booking
   */
  create: async (data: CreateDisputeRequest): Promise<DisputeResponse> => {
    const response = await axiosClient.post<DisputeResponse>('/api/disputes', data);
    return response.data;
  },
};

export default disputeApi;
