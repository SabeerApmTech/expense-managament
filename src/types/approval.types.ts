import type { ExpenseStatus } from './expense.types';

export interface ApprovalExpenseDetail {
  approvalId: number;
  expenseDetailId: number;
  expenseId: number;
  expenseCode: string;
  initiatedByEmpId: string;
  initiatedByEmpName: string;
  expenseTypeId: number;
  expenseTypeName: string;
  amount: number;
  fromDate: string;
  toDate: string;
  paymentMode: string;
  travelMode?: string | null;
  fromLocation?: string | null;
  toLocation?: string | null;
  description?: string | null;
  submittedOn: string;
  status: ExpenseStatus;
}

// The detail lists (pending/approved/rejected) are embedded per expense so one
// expense with items in multiple states can be viewed as three tabs without a
// separate detail-fetch call.
export interface ApprovalExpenseSummary {
  expenseId: number;
  expenseCode: string;
  empId: string;
  empName: string;
  totalAmount: number;
  submittedOn: string;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  pending: ApprovalExpenseDetail[];
  approved: ApprovalExpenseDetail[];
  rejected: ApprovalExpenseDetail[];
}

export type UpdateApprovalStatus = 'Approve' | 'Reject';

export interface EmployeeExpensesResponse {
  empId: string;
  empName: string;
  expenses: ApprovalExpenseSummary[];
}
