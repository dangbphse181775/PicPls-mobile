export interface CreateDisputeRequest {
  bookingId: string;
  reason: string;
  description: string;
  evidenceUrls?: string[];
}

export interface DisputeResponse {
  id: string;
  bookingId: string;
  reportedBy: string;
  reason: string;
  description: string;
  evidenceUrls: string[];
  status: 'Pending' | 'Resolved' | 'Closed';
  createdAt: string;
}
