import axiosClient from './axiosClient';
import type { MessageResponse, ConversationContact } from '../types/message.types';

const messageApi = {
  /**
   * GET /api/messages/conversations
   * Trả về danh sách contacts đã chat
   */
  getConversations: async (): Promise<ConversationContact[]> => {
    const response = await axiosClient.get<ConversationContact[]>('/api/messages/conversations');
    return response.data;
  },

  /**
   * GET /api/messages/history/:otherUserId
   * Lịch sử tin nhắn với một user
   */
  getChatHistory: async (otherUserId: string): Promise<MessageResponse[]> => {
    const response = await axiosClient.get<MessageResponse[]>(
      `/api/messages/history/${otherUserId}`,
    );
    return response.data;
  },
};

export default messageApi;
