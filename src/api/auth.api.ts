import { apiClient } from './axios';
import { unwrap } from '../utils/apiEnvelope';
import type { AuthUser } from '../types/auth.types';

export const authApi = {
  login: async (empId: string, password: string): Promise<{ data: AuthUser; message?: string }> => {
    const response = await apiClient.post('/api/user-authentication/login', { empId, password });
    return unwrap<AuthUser>(response.data);
  },

  changePassword: async (
    empId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ data: void; message?: string }> => {
    const response = await apiClient.put('/api/user-authentication/change-password', {
      empId,
      currentPassword,
      newPassword,
    });
    return unwrap<void>(response.data);
  },

  resetPassword: async (empId: string): Promise<{ data: void; message?: string }> => {
    const response = await apiClient.put('/api/user-authentication/reset-password', { empId });
    return unwrap<void>(response.data);
  },
};
