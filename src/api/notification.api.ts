import { apiClient } from './axios';

export const notificationApi = {
  getVapidPublicKey: async (): Promise<string> => {
    const response = await apiClient.get<{ publicKey: string }>('/api/notification/vapid-public-key');
    return response.data.publicKey;
  },

  subscribe: async (subscription: PushSubscriptionJSON): Promise<void> => {
    await apiClient.post('/api/notification/subscribe', subscription);
  },

  unsubscribe: async (endpoint: string): Promise<void> => {
    await apiClient.post('/api/notification/unsubscribe', { endpoint });
  },
};
