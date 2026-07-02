import axiosClient from './axiosClient';
import type { ReviewRequest, ReviewResponse } from '../types/booking.types';

const reviewApi = {
  /**
   * POST /api/bookings/:bookingId/reviews
   * Yêu cầu role: Customer, booking phải ở trạng thái Completed
   */
  create: async (bookingId: string, data: ReviewRequest): Promise<ReviewResponse> => {
    const response = await axiosClient.post<ReviewResponse>(
      `/api/bookings/${bookingId}/reviews`,
      data,
    );
    return response.data;
  },
};

export default reviewApi;
