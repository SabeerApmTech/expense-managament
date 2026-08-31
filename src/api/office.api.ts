import { apiClient } from './axios';
import type { CreateOfficePayload, EditOfficePayload, Office } from '../types/office.types';

// This endpoint's response is {message, data} — no `success` key — so it's parsed
// directly rather than via the standard unwrap() helper (which keys off `success`).
export const officeApi = {
  getAll: async (): Promise<Office[]> => {
    const response = await apiClient.get<{ message?: string; data?: Office[] }>('/api/Office');
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  create: async (payload: CreateOfficePayload): Promise<{ data: void; message?: string }> => {
    const response = await apiClient.post<{ message?: string; data?: void }>('/api/Office', payload);
    return { data: response.data.data as void, message: response.data.message };
  },

  edit: async (officeId: number, payload: EditOfficePayload): Promise<{ data: void; message?: string }> => {
    const response = await apiClient.put<{ message?: string; data?: void }>(`/api/Office/${officeId}`, payload);
    return { data: response.data.data as void, message: response.data.message };
  },
};
