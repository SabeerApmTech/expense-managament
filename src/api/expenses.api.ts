import { apiClient } from './axios';
import { unwrap } from '../utils/apiEnvelope';
import type { ApiResponse } from '../types/auth.types';
import type {
  ExpenseSummary, ExpenseDetailItem, ExpenseBill, CreatedExpenseDetailSummary, EmployeeExpensesListResponse,
} from '../types/expense.types';

export const BILL_BASE_URL = 'https://expense.apmiot.com/';

export const resolveBillUrl = (bill: string): string =>
  bill.startsWith('http') ? bill : BILL_BASE_URL + bill;

function normalizeExpense(entry: unknown): ExpenseSummary {
  const e = entry as Partial<ExpenseSummary>;
  return {
    expenseId: e.expenseId ?? 0,
    expenseCode: e.expenseCode ?? '',
    empId: e.empId ?? '',
    empName: e.empName ?? '',
    totalAmount: e.totalAmount ?? 0,
    submittedOn: e.submittedOn ?? '',
    pendingCount: e.pendingCount ?? 0,
    approvedCount: e.approvedCount ?? 0,
    rejectedCount: e.rejectedCount ?? 0,
    pending: Array.isArray(e.pending) ? e.pending : [],
    approved: Array.isArray(e.approved) ? e.approved : [],
    rejected: Array.isArray(e.rejected) ? e.rejected : [],
  };
}

export const expensesApi = {
  getExpenses: async (empId: string): Promise<ExpenseSummary[]> => {
    const response = await apiClient.get(`/api/expenses/${empId}/get`);
    const { data } = unwrap<EmployeeExpensesListResponse>(response.data);
    return Array.isArray(data?.expenses) ? data.expenses.map(normalizeExpense) : [];
  },

  getExpenseDetails: async (empId: string, expenseId: number): Promise<ExpenseDetailItem[]> => {
    const response = await apiClient.get<ApiResponse<ExpenseDetailItem[]>>(
      `/api/expenses/${empId}/details/${expenseId}/get`
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  getBills: async (expenseDetailId: number): Promise<ExpenseBill[]> => {
    const response = await apiClient.get<ApiResponse<ExpenseBill[]>>(
      `/api/expenses/details/${expenseDetailId}/bills/get`
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  createExpenseDetail: async (
    formData: FormData
  ): Promise<{ data: CreatedExpenseDetailSummary; message?: string }> => {
    const response = await apiClient.post('/api/expenses/details/create', formData, {
      headers: { 'Content-Type': undefined },
    });
    return unwrap<CreatedExpenseDetailSummary>(response.data);
  },

  updateExpenseDetail: async (expenseDetailId: number, formData: FormData): Promise<{ data: void; message?: string }> => {
    const response = await apiClient.put(`/api/expenses/details/${expenseDetailId}/update`, formData, {
      headers: { 'Content-Type': undefined },
    });
    return unwrap<void>(response.data);
  },

  deleteExpenseDetail: async (empId: string, expenseDetailId: number): Promise<{ data: void; message?: string }> => {
    const response = await apiClient.delete(`/api/expenses/${empId}/details/${expenseDetailId}/delete`);
    return unwrap<void>(response.data);
  },

  deleteBill: async (empId: string, expenseBillId: number): Promise<{ data: void; message?: string }> => {
    const response = await apiClient.delete(`/api/expenses/${empId}/bills/${expenseBillId}/delete`);
    return unwrap<void>(response.data);
  },
};
