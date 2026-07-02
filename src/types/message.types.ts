// ─── Message Types ─────────────────────────────────────────────────────────────

export interface MessageResponse {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface ConversationContact {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
}

export interface SendMessagePayload {
  receiverId: string;
  content: string;
}
