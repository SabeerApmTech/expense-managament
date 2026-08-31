import { apiClient } from './axios';
import { unwrap } from '../utils/apiEnvelope';
import type { AuthUser } from '../types/auth.types';

export const authApi = {
  login: async (empId: string, password: string): Promise<{ data: AuthUser; message?: string }> => {
    const response = await apiClient.post('/api/user-authentication/login', { empId, password });
    const { data, message } = unwrap<AuthUser>(response.data);
    return {
      data: {
        ...data,
        officeId: data?.officeId ?? 0,
        department: data?.department ?? '',
        isAssetCreator: data?.isAssetCreator ?? false,
      },
      message,
    };
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
