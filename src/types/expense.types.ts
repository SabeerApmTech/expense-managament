import type { ApiResponse } from './auth.types';

export type ExpenseStatus = 'Pending' | 'Approved' | 'Rejected';
export type SettlementStatus = 'Not Created' | 'Pending' | 'Settled';

export interface ExpenseSummary {
  expenseId: number;
  expenseCode: string;
  empId: string;
  empName: string;
  totalAmount: number;
  submittedOn: string;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export interface EmployeeExpensesListResponse {
  empId: string;
  empName: string;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  expenses: ExpenseSummary[];
}

export interface ExpenseDetailItem {
  expenseDetailId: number;
  expenseId: number;
  expenseCode: string;
  expenseTypeId: number;
  expenseTypeName: string;
  initiatedByEmpId: string;
  initiatedByEmpName: string;
  amount: number;
  fromDate: string;
  toDate: string;
  travelMode?: string | null;
  fromLocation?: string | null;
  toLocation?: string | null;
  paymentMode: string;
  description?: string | null;
  atLevel: number | null;
  status: ExpenseStatus;
  settlementStatus: SettlementStatus;
}

// Returned by the create/update expense-detail endpoints — a lighter summary,
// not the full ExpenseDetailItem shape returned by the details GET.
export interface CreatedExpenseDetailSummary {
  expenseId: number;
  expenseCode: string;
  empId: string;
  empName: string;
  totalAmount: number;
  expenseDetailId: number;
  expenseTypeId: number;
  expenseTypeName: string;
  billCount: number;
}

export interface ExpenseBill {
  expenseBillId: number;
  expenseDetailId: number;
  bill: string;
  uploadedOn: string;
  expenseDetail?: unknown;
}

export type ExpensesResponse = ApiResponse<ExpenseSummary[]>;
export type ExpenseDetailsResponse = ApiResponse<ExpenseDetailItem[]>;
export type ExpenseBillsResponse = ApiResponse<ExpenseBill[]>;
