import axiosClient from './axiosClient';

export interface UpdateUserProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

const userApi = {
  /**
   * PUT /api/users/me
   * Cập nhật thông tin profile của user hiện tại
   */
  updateProfile: async (data: UpdateUserProfileRequest): Promise<void> => {
    await axiosClient.put('/api/users/me', data);
  },
};

export default userApi;
