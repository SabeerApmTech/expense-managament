import { apiClient } from './axios';
import type { Expense, ExpenseListResponse, SaveExpenseRequest } from '../types/expense.types';

export const expensesApi = {
  list: async (params?: Record<string, string>): Promise<ExpenseListResponse> => {
    const response = await apiClient.get<ExpenseListResponse>('/api/expense/expenses', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Expense> => {
    const response = await apiClient.get<Expense>('/api/expense/expense/' + id);
    return response.data;
  },

  save: async (data: SaveExpenseRequest): Promise<Expense> => {
    const formData = new FormData();
    formData.append('Id', String(data.Id));
    formData.append('ExpenseTypeId', String(data.ExpenseTypeId));
    formData.append('Description', data.Description);
    formData.append('FromDate', data.FromDate);
    formData.append('ToDate', data.ToDate);
    formData.append('Amount', String(data.Amount));
    formData.append('PayModeId', String(data.PayModeId));
    formData.append('TravelModeId', String(data.TravelModeId));
    formData.append('AreaFrom', data.AreaFrom);
    formData.append('AreaTo', data.AreaTo);
    formData.append('InitiatedBy', data.InitiatedBy);
    if (data.BillFile) {
      formData.append('BillFile', data.BillFile);
    }
    const response = await apiClient.post<Expense>('/api/expense/saveExpense', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete('/api/expense/expense/' + id);
  },
};
