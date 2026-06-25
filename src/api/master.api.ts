import { apiClient } from './axios';
import type { ExpenseTypeMaster, TravelPayModeMaster, ExpensePageLoad } from '../types/expense.types';

export const masterApi = {
  getExpenseTypes: async (): Promise<ExpenseTypeMaster[]> => {
    const response = await apiClient.get<ExpenseTypeMaster[]>('/api/expense/expensetype');
    return response.data;
  },

  getTravelOrPaymentList: async (isTravelMode: boolean): Promise<TravelPayModeMaster[]> => {
    const response = await apiClient.get<TravelPayModeMaster[]>('/api/expense/traveorpaymentList', {
      params: { isTravelMode },
    });
    return response.data;
  },

  getExpensePageLoad: async (): Promise<ExpensePageLoad> => {
    const response = await apiClient.get<ExpensePageLoad>('/api/expense/expense-page-load');
    return response.data;
  },

  getExpenseStatuses: async (): Promise<{ id: number; name: string }[]> => {
    const response = await apiClient.get<{ id: number; name: string }[]>('/api/enum/expenseentry-status');
    return response.data;
  },
};
