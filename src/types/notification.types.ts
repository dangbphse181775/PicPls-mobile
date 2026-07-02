export interface NotificationResponse {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string; // e.g., 'Booking', 'System', 'Payment'
  isRead: boolean;
  referenceId?: string; // ID of the related entity (bookingId, etc.)
  createdAt: string;
}

export interface PaginatedNotifications {
  items: NotificationResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
