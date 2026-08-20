import { apiClient } from './axios';
import { unwrap } from '../utils/apiEnvelope';
import type { ApiResponse } from '../types/auth.types';
import type {
  PendingSettlement, SettleExpenseResult, SettlementBill, SettledExpensesReport, SettledExpenseRecord,
  SettlementReport,
} from '../types/accounts.types';

export const SETTLEMENT_BILL_BASE_URL = 'https://expense.apmiot.com';

export const resolveSettlementBillUrl = (path: string): string =>
  path.startsWith('http') ? path : SETTLEMENT_BILL_BASE_URL + path;

// The settled-expenses endpoint groups settlement rows per expense ({expenseId,
// expenseCode, empId, empName, totalSettledAmount, details: [...]}) — flatten each
// group's details into the flat per-row shape the Settled Expenses table expects.
function flattenSettledGroup(entry: unknown): SettledExpenseRecord[] {
  const g = entry as Partial<{
    expenseId: number;
    expenseCode: string;
    empId: string;
    empName: string;
    details: Partial<SettledExpenseRecord>[];
  }>;
  if (!g || !Array.isArray(g.details)) return [];
  return g.details.map((d) => ({
    empId: g.empId ?? '',
    empName: g.empName ?? '',
    expenseId: g.expenseId ?? 0,
    expenseCode: g.expenseCode ?? '',
    expenseDetailId: d.expenseDetailId ?? 0,
    expenseTypeId: d.expenseTypeId ?? 0,
    expenseTypeName: d.expenseTypeName ?? '',
    settledAmount: d.settledAmount ?? 0,
    settlementId: d.settlementId ?? 0,
    settlementBillId: d.settlementBillId ?? 0,
    settlementBillPath: d.settlementBillPath ?? '',
    settlementDate: d.settlementDate ?? '',
  }));
}

function normalizePendingSettlement(entry: PendingSettlement): PendingSettlement {
  return { ...entry, details: Array.isArray(entry?.details) ? entry.details : [] };
}

export const accountsApi = {
  getPendingSettlements: async (empId: string, filterEmpId?: string): Promise<PendingSettlement[]> => {
    const response = await apiClient.get<ApiResponse<PendingSettlement[]>>('/api/accounts/pending-settlements', {
      params: { empId, ...(filterEmpId ? { filterEmpId } : {}) },
    });
    return Array.isArray(response.data.data) ? response.data.data.map(normalizePendingSettlement) : [];
  },

  getExpenseSettlementDetails: async (expenseCode: string, empId: string): Promise<PendingSettlement> => {
    const response = await apiClient.get<ApiResponse<PendingSettlement>>(`/api/accounts/expense/${expenseCode}`, {
      params: { empId },
    });
    return normalizePendingSettlement(response.data.data);
  },

  settle: async (formData: FormData): Promise<{ data: SettleExpenseResult; message?: string }> => {
    const response = await apiClient.post('/api/accounts/settle', formData, {
      headers: { 'Content-Type': undefined },
    });
    return unwrap<SettleExpenseResult>(response.data);
  },

  getSettlementBill: async (settlementBillId: number): Promise<SettlementBill> => {
    const response = await apiClient.get<ApiResponse<SettlementBill>>(
      `/api/accounts/settlement-bill/${settlementBillId}`
    );
    return response.data.data;
  },

  // Response carries report-level fields (accountantEmpName, totals, date range)
  // alongside `data`, so it isn't unwrapped via the plain {success,message,data} helper.
  // filterEmpId narrows results to one employee; omitted entirely to mean "all employees".
  getSettledExpenses: async (
    empId: string,
    fromDate: string,
    toDate: string,
    filterEmpId?: string
  ): Promise<SettledExpensesReport> => {
    const response = await apiClient.get<SettledExpensesReport>('/api/accounts/settled-expenses', {
      params: {
        EmpId: empId,
        FromDate: fromDate,
        ToDate: toDate,
        ...(filterEmpId ? { FilterEmpId: filterEmpId } : {}),
      },
    });
    return {
      requestedEmployeeId: response.data.requestedEmployeeId ?? empId,
      accountantEmpName: response.data.accountantEmpName ?? '',
      filterEmpId: response.data.filterEmpId ?? null,
      fromDate: response.data.fromDate ?? fromDate,
      toDate: response.data.toDate ?? toDate,
      totalSettledAmount: response.data.totalSettledAmount ?? 0,
      data: Array.isArray(response.data.data) ? response.data.data.flatMap(flattenSettledGroup) : [],
    };
  },

  // EmpId param is the calling ADMIN/SUPERADMIN's own empId (an authorization check),
  // same convention as the user-management usage endpoints.
  getSettlementReport: async (empId: string, fromDate: string, toDate: string): Promise<SettlementReport> => {
    const response = await apiClient.get<ApiResponse<SettlementReport>>('/api/accounts/settlement-report', {
      params: { EmpId: empId, FromDate: fromDate, ToDate: toDate },
    });
    const report = response.data.data;
    return {
      requestedEmployeeId: report?.requestedEmployeeId ?? empId,
      requestedEmployeeName: report?.requestedEmployeeName ?? '',
      role: report?.role ?? '',
      fromDate: report?.fromDate ?? fromDate,
      toDate: report?.toDate ?? toDate,
      totalSettledAmount: report?.totalSettledAmount ?? 0,
      employeeTotals: Array.isArray(report?.employeeTotals) ? report.employeeTotals : [],
      expenseTypeTotals: Array.isArray(report?.expenseTypeTotals) ? report.expenseTypeTotals : [],
    };
  },
};
