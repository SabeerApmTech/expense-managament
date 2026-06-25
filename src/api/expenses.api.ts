import { apiClient } from './axios';
import type { Expense, ExpenseListResponse, SaveExpenseRequest } from '../types/expense.types';

export const expensesApi = {
  list: async (params?: Record<string, string>): Promise<ExpenseListResponse> => {
    const response = await apiClient.get<ExpenseListResponse>('/api/expense/expenses', { params });
    return response.data;
  },

  save: async (data: SaveExpenseRequest): Promise<Expense> => {
    const formData = new FormData();
    formData.append('Id', String(data.Id));
    formData.append('ItemsJson', data.ItemsJson);
    (data.BillFiles ?? []).forEach((file) => formData.append('BillFiles', file));
    const response = await apiClient.post<Expense>('/api/expense/saveExpense', formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete('/api/expense/expense/' + id);
  },

  initiatorApproveReject: async (payload: {
    expenseId: number;
    status: number; // 1 = approve, 2 = reject
    reason?: string;
  }): Promise<void> => {
    await apiClient.post('/api/expense/approve-reject-expense', payload);
  },
};
