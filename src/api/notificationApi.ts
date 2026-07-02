import axiosClient from './axiosClient';
import type { PaginatedNotifications } from '../types/notification.types';

const notificationApi = {
  /**
   * GET /api/notifications
   * Lấy danh sách thông báo của user (phân trang)
   */
  getNotifications: async (page = 1, pageSize = 20): Promise<PaginatedNotifications> => {
    const response = await axiosClient.get<PaginatedNotifications>('/api/notifications', {
      params: { page, pageSize },
    });
    return response.data;
  },

  /**
   * GET /api/notifications/unread-count
   * Lấy số lượng thông báo chưa đọc
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await axiosClient.get<number>('/api/notifications/unread-count');
    return response.data;
  },

  /**
   * PUT /api/notifications/:id/read
   * Đánh dấu 1 thông báo là đã đọc
   */
  markAsRead: async (id: string): Promise<void> => {
    await axiosClient.put(`/api/notifications/${id}/read`);
  },

  /**
   * PUT /api/notifications/read-all
   * Đánh dấu tất cả thông báo là đã đọc
   */
  markAllAsRead: async (): Promise<void> => {
    await axiosClient.put('/api/notifications/read-all');
  },
};

export default notificationApi;
