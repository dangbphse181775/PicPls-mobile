import axiosClient from './axiosClient';
import type {
  CreateBookingRequest,
  CreateBookingPaymentResponse,
  BookingDetailResponse,
  CustomerBookingResponse,
  CancelBookingRequest,
} from '../types/booking.types';

// ─── Booking API Service ───────────────────────────────────────────────────────

const bookingApi = {
  /**
   * POST /api/bookings
   * Tạo booking mới, trả về thông tin booking và VNPAY payment URL.
   * Yêu cầu role: Customer
   */
  create: async (
    data: CreateBookingRequest,
  ): Promise<CreateBookingPaymentResponse> => {
    const response = await axiosClient.post<CreateBookingPaymentResponse>(
      '/api/bookings',
      data,
    );
    return response.data;
  },

  /**
   * GET /api/bookings
   * Lấy danh sách booking của user đang đăng nhập.
   */
  getMine: async (): Promise<CustomerBookingResponse[]> => {
    const response = await axiosClient.get<CustomerBookingResponse[]>(
      '/api/bookings',
    );
    return response.data;
  },

  /**
   * GET /api/bookings/customer/:customerId
   * Lấy lịch sử booking theo customerId, có thể filter theo status.
   */
  getByCustomer: async (
    customerId: string,
    status?: string,
  ): Promise<CustomerBookingResponse[]> => {
    const response = await axiosClient.get<CustomerBookingResponse[]>(
      `/api/bookings/customer/${customerId}`,
      { params: { status } },
    );
    return response.data;
  },

  /**
   * GET /api/bookings/:id/detail
   * Lấy chi tiết booking theo id.
   */
  getDetail: async (bookingId: string): Promise<BookingDetailResponse> => {
    const response = await axiosClient.get<BookingDetailResponse>(
      `/api/bookings/${bookingId}/detail`,
    );
    return response.data;
  },

  /**
   * POST /api/bookings/:id/cancel
   * Hủy booking.
   */
  cancel: async (
    bookingId: string,
    data: CancelBookingRequest,
  ): Promise<void> => {
    await axiosClient.post(`/api/bookings/${bookingId}/cancel`, data);
  },

  /**
   * POST /api/bookings/:id/start
   * Customer bắt đầu buổi chụp.
   * Yêu cầu role: Customer
   */
  start: async (bookingId: string): Promise<void> => {
    await axiosClient.post(`/api/bookings/${bookingId}/start`);
  },

  /**
   * GET /api/bookings/my-orders
   * Grapher xem danh sách order của mình
   * Yêu cầu role: Grapher
   */
  getGrapherOrders: async (status?: string): Promise<any[]> => {
    const response = await axiosClient.get<any[]>('/api/bookings/my-orders', {
      params: { status },
    });
    return response.data;
  },

  /**
   * POST /api/bookings/:id/confirm
   * Grapher xác nhận booking
   * Yêu cầu role: Grapher
   */
  confirm: async (bookingId: string): Promise<void> => {
    await axiosClient.post(`/api/bookings/${bookingId}/confirm`);
  },

  /**
   * POST /api/bookings/:id/complete
   * Grapher hoàn thành booking
   * Yêu cầu role: Grapher
   */
  complete: async (bookingId: string): Promise<any> => {
    const response = await axiosClient.post(`/api/bookings/${bookingId}/complete`);
    return response.data;
  },
};

export default bookingApi;
