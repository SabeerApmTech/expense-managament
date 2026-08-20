import { apiClient } from './axios';
import { unwrap } from '../utils/apiEnvelope';
import type { ApprovalExpenseSummary, EmployeeExpensesResponse, UpdateApprovalStatus } from '../types/approval.types';

function normalizeExpense(entry: unknown): ApprovalExpenseSummary {
  const e = entry as Partial<ApprovalExpenseSummary>;
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

export const approvalsApi = {
  getEmployeeExpenses: async (empId: string): Promise<EmployeeExpensesResponse> => {
    const response = await apiClient.get(`/api/initiator-expenses/employee/${empId}/get`);
    const { data } = unwrap<EmployeeExpensesResponse>(response.data);
    return {
      empId: data?.empId ?? empId,
      empName: data?.empName ?? '',
      expenses: Array.isArray(data?.expenses) ? data.expenses.map(normalizeExpense) : [],
    };
  },

  updateApproval: async (
    approvalId: number,
    status: UpdateApprovalStatus,
    empId: string,
    rejectedReason?: string
  ): Promise<{ data: void; message?: string }> => {
    const response = await apiClient.put(
      `/api/initiator-expenses/${approvalId}/update`,
      { status, rejectedReason: rejectedReason ?? 'null' },
      { params: { empId } }
    );
    return unwrap<void>(response.data);
  },
};
