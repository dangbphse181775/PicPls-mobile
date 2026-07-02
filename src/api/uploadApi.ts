import axiosClient from './axiosClient';

const uploadApi = {
  /**
   * POST /api/uploads
   * Upload ảnh, trả về URL
   */
  uploadImage: async (uri: string, filename: string, type: string): Promise<string> => {
    const formData = new FormData();
    // @ts-ignore - FormData trong React Native nhận object
    formData.append('File', {
      uri,
      name: filename,
      type,
    });

    const response = await axiosClient.post<{ url: string }>('/api/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  },
};

export default uploadApi;
