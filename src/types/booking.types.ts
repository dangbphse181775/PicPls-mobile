// ─── Request DTOs ──────────────────────────────────────────────────────────────

export interface CreateBookingRequest {
  grapherProfileId: string;    // UUID
  servicePackageId: string;    // UUID
  scheduledAt: string;         // ISO 8601: "2026-06-15T10:00:00Z"
  location: string;            // max 300 chars
  note?: string;               // optional
}

export interface CancelBookingRequest {
  reason: string;
}

// ─── Shared Sub-types ──────────────────────────────────────────────────────────

export interface PaymentTransactionResponse {
  id: string;
  provider: string;
  status: string;
  escrowStatus: string;
  transactionCode: string;
  providerTransactionId: string | null;
  amount: number;
  paidAt: string | null;
  releasedAt: string | null;
}

export interface BookingResponse {
  id: string;
  customerId: string;
  grapherProfileId: string;
  servicePackageId: string;
  scheduledAt: string;
  location: string;
  status: BookingStatus;
  totalAmount: number;
  platformFeeAmount: number;
  grapherPayoutAmount: number;
  payment: PaymentTransactionResponse | null;
}

// ─── Response DTOs ─────────────────────────────────────────────────────────────

export interface CreateBookingPaymentResponse {
  booking: BookingResponse;
  paymentUrl: string;
}

export interface BookingDetailResponse {
  id: string;
  grapherName: string;
  customerName: string;
  serviceName: string;
  scheduledAt: string;
  durationMinutes: number;
  location: string;
  note: string | null;
  status: BookingStatus;
  totalAmount: number;
  platformFeeAmount: number;
  grapherPayoutAmount: number;
  createdAt: string;
  cancellationReason: string | null;
}

export interface GrapherBookingResponse {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar: string | null;
  serviceName: string;
  scheduledAt: string;
  durationMinutes: number;
  location: string;
  note: string | null;
  status: BookingStatus;
  totalAmount: number;
  grapherPayoutAmount: number;
  createdAt: string;
}

export interface CustomerBookingResponse {
  id: string;
  grapherUserId: string;
  grapherName: string;
  grapherAvatar: string | null;
  serviceName: string;
  scheduledAt: string;
  durationMinutes: number;
  location: string;
  note: string | null;
  status: BookingStatus;
  totalAmount: number;
  createdAt: string;
}

export interface CompleteBookingResponse {
  bookingId: string;
  bookingStatus: string;
  escrowStatus: string;
  platformFeeAmount: number;
  grapherPayoutAmount: number;
}

// ─── Service Package (from Marketplace) ───────────────────────────────────────

export interface ServicePackageResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
}

// ─── Grapher Types (from Marketplace) ─────────────────────────────────────────

export interface GrapherPricingResponse {
  hourly: number;
  daily: number;
}

export interface GrapherSummaryResponse {
  id: string;
  userId: string;
  name: string;
  avatar: string | null;
  location: string;
  rating: number;
  reviewCount: number;
  isOnline: boolean;
  isVerified: boolean;
  styles: string[];
  portfolio: string[];
  pricing: GrapherPricingResponse;
}

export interface GrapherDetailResponse {
  id: string;
  userId: string;
  name: string;
  avatar: string | null;
  location: string;
  rating: number;
  reviewCount: number;
  isOnline: boolean;
  isVerified: boolean;
  bio: string;
  styles: string[];
  portfolio: string[];
  packages: ServicePackageResponse[];
}

export interface ReviewResponse {
  id: string;
  bookingId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewRequest {
  rating: number;
  comment: string;
}

// ─── Enums & Constants ─────────────────────────────────────────────────────────

export type BookingStatus =
  | 'PendingPayment'
  | 'PendingConfirmation'
  | 'Confirmed'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled';

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PendingPayment: 'Chờ thanh toán',
  PendingConfirmation: 'Chờ xác nhận',
  Confirmed: 'Đã xác nhận',
  InProgress: 'Đang thực hiện',
  Completed: 'Hoàn thành',
  Cancelled: 'Đã hủy',
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  PendingPayment: '#F59E0B',
  PendingConfirmation: '#8B5CF6',
  Confirmed: '#6366F1',
  InProgress: '#3B82F6',
  Completed: '#10B981',
  Cancelled: '#EF4444',
};

// ─── Navigation Params ─────────────────────────────────────────────────────────

export interface CreateBookingScreenParams {
  grapherProfileId: string;
  grapherName: string;
  servicePackage: ServicePackageResponse;
}

export interface BookingSuccessScreenParams {
  bookingId: string;
  grapherName: string;
  serviceName: string;
  totalAmount: number;
  scheduledAt: string;
}
