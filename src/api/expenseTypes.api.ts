import { apiClient } from './axios';
import { unwrap } from '../utils/apiEnvelope';
import type { CreateExpenseTypePayload, ExpenseType } from '../types/expenseType.types';

export const expenseTypesApi = {
  getAll: async (): Promise<ExpenseType[]> => {
    const response = await apiClient.get('/api/expense-types/get-all');
    const { data } = unwrap<ExpenseType[]>(response.data);
    return Array.isArray(data) ? data : [];
  },

  create: async (payload: CreateExpenseTypePayload): Promise<{ data: void; message?: string }> => {
    const response = await apiClient.post('/api/expense-types/create', payload);
    return unwrap<void>(response.data);
  },

  remove: async (expenseTypeId: number): Promise<{ data: void; message?: string }> => {
    const response = await apiClient.delete(`/api/expense-types/${expenseTypeId}/delete`);
    return unwrap<void>(response.data);
  },
};
