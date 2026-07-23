import { apiClient } from './axios';
import type {
  Expense,
  ExpenseListResponse,
  Designation,
  DesignationExpenseMap,
  DesignationTravelMap,
  Level,
  ExpenseLevelMap,
  EmployeeLevelMap,
  DesignationLevelMap,
  Employee,
  DashboardData,
  ApprovalLimit,
  SettlementHistoryResponse,
} from '../types/expense.types';

export const adminApi = {
  listExpenses: async (params?: Record<string, string>): Promise<ExpenseListResponse> => {
    const response = await apiClient.get<ExpenseListResponse>('/api/expense/expenses', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Expense> => {
    const response = await apiClient.get<Expense>('/api/expense/expense/' + id);
    return response.data;
  },

  approveRejectExpense: async (payload: {
    expenseId: number;
    status: 3 | 4 | 5;
    reason: string;
  }): Promise<void> => {
    await apiClient.post('/api/expense/approve-reject-expense', payload);
  },

  settleExpensesBulk: async (data: {
    expenseIds: (string | number)[];
    settlementBillFile: File;
    remarks: string;
  }): Promise<void> => {
    const formData = new FormData();
    formData.append('ExpenseIds', data.expenseIds.join(','));
    formData.append('SettlementBillFile', data.settlementBillFile);
    formData.append('Remarks', data.remarks);
    formData.append('Status', '6');
    await apiClient.post('/api/expense/settle-expense', formData, {
      headers: { 'Content-Type': undefined },
    });
  },

  saveTravelPayMode: async (payload: {
    travelorPaymentMode: {
      id: number;
      name: string;
      isTravelMode: boolean;
      createdBy: string;
      createdDate: string;
      updatedBy: string;
      updatedDate: string;
    };
  }): Promise<void> => {
    await apiClient.post('/api/expense/traveorpaymentSave', payload);
  },

  getDesignations: async (): Promise<Designation[]> => {
    const response = await apiClient.get<Designation[]>('/api/expense/Designation');
    return response.data;
  },

  getDesignationExpenseMaps: async (): Promise<DesignationExpenseMap[]> => {
    const response = await apiClient.get<DesignationExpenseMap[]>('/api/expense/designation-expense-map');
    return response.data;
  },

  saveDesignationExpenseMap: async (payload: DesignationExpenseMap): Promise<void> => {
    await apiClient.post('/api/expense/designation-expense-map', payload);
  },

  deleteDesignationExpenseMap: async (id: number): Promise<void> => {
    await apiClient.delete('/api/expense/designation-expense-map/' + id);
  },

  getDesignationTravelMaps: async (): Promise<DesignationTravelMap[]> => {
    const response = await apiClient.get<DesignationTravelMap[]>('/api/expense/designation-travel-map');
    return response.data;
  },

  saveDesignationTravelMap: async (payload: { id: number; designationId: number; travelModeIds: number[] }): Promise<void> => {
    await apiClient.post('/api/expense/designation-travel-map', payload);
  },

  deleteDesignationTravelMap: async (id: number): Promise<void> => {
    await apiClient.delete('/api/expense/designation-travel-map/' + id);
  },

  // ─── Levels ────────────────────────────────────────────────────────────────
  getLevels: async (): Promise<Level[]> => {
    const response = await apiClient.get<Level[]>('/api/expense/levels');
    return response.data;
  },

  saveLevel: async (payload: { name: string }): Promise<void> => {
    await apiClient.post('/api/expense/saveLevel', payload);
  },

  updateLevel: async (payload: { id: number; name: string }): Promise<void> => {
    await apiClient.put('/api/expense/updateLevel', payload);
  },

  deleteLevel: async (id: number): Promise<void> => {
    await apiClient.delete('/api/expense/level/' + id);
  },

  // ─── Level ↔ Expense maps ──────────────────────────────────────────────────
  getExpenseLevelMaps: async (): Promise<ExpenseLevelMap[]> => {
    const response = await apiClient.get<ExpenseLevelMap[]>('/api/expense/expenseLevelMaps');
    return response.data;
  },

  saveExpenseLevelMap: async (payload: {
    levelId: number;
    expenseId: number;
    fromRange: number;
    toRange: number;
  }): Promise<void> => {
    await apiClient.post('/api/expense/saveExpenseLevelMap', payload);
  },

  updateExpenseLevelMap: async (payload: {
    id: number;
    levelId: number;
    expenseId: number;
    fromRange: number;
    toRange: number;
  }): Promise<void> => {
    await apiClient.put('/api/expense/updateExpenseLevelMap', payload);
  },

  deleteExpenseLevelMap: async (id: number): Promise<void> => {
    await apiClient.delete('/api/expense/expenseLevelMap/' + id);
  },

  // ─── Level ↔ Employee maps ─────────────────────────────────────────────────
  getEmployees: async (): Promise<Employee[]> => {
    const response = await apiClient.get<Employee[]>('/api/expense/Employee');
    return response.data;
  },

  getEmployeeLevelMaps: async (): Promise<EmployeeLevelMap[]> => {
    const response = await apiClient.get<EmployeeLevelMap[]>('/api/expense/employeeLevelMaps');
    return response.data;
  },

  saveEmployeeLevelMap: async (payload: { employeeId: string; levelId: number }): Promise<void> => {
    await apiClient.post('/api/expense/saveEmployeeLevelMap', payload);
  },

  updateEmployeeLevelMap: async (payload: {
    id: number;
    employeeId: string;
    levelId: number;
  }): Promise<void> => {
    await apiClient.put('/api/expense/updateEmployeeLevelMap', payload);
  },

  deleteEmployeeLevelMap: async (id: number): Promise<void> => {
    await apiClient.delete('/api/expense/employeeLevelMap/' + id);
  },

  // ─── Level ↔ Designation maps ──────────────────────────────────────────────
  getDesignationLevelMaps: async (): Promise<DesignationLevelMap[]> => {
    const response = await apiClient.get<DesignationLevelMap[]>('/api/expense/DesignationLevelMaplist');
    return response.data;
  },

  saveDesignationLevelMap: async (payload: {
    id: number;
    levelId: number;
    designationId: number;
    fromRange: number;
    toRange: number;
  }): Promise<void> => {
    await apiClient.post('/api/expense/saveDesignationLevelMap', payload);
  },

  deleteDesignationLevelMap: async (id: number): Promise<void> => {
    await apiClient.delete('/api/expense/deleteDesignationLevelMap/' + id);
  },

  getDesignationLevelMapById: async (id: number): Promise<DesignationLevelMap> => {
    const response = await apiClient.get<DesignationLevelMap>('/api/expense/getDesignationLevelMap/' + id);
    return response.data;
  },

  // ─── Approval Limits ────────────────────────────────────────────────────────
  getApprovalLimits: async (): Promise<ApprovalLimit[]> => {
    const response = await apiClient.get('/api/expense/approval-limit');
    const data = response.data;
    if (!data) return [];
    if (Array.isArray(data)) return data as ApprovalLimit[];
    return [data as ApprovalLimit];
  },

  saveApprovalLimit: async (payload: { id: number; initiatedLimit: number; adminLimit: number; superAdminLimit: number }): Promise<void> => {
    await apiClient.post('/api/expense/approval-limit', payload);
  },

  deleteApprovalLimit: async (id: number): Promise<void> => {
    await apiClient.delete('/api/expense/approval-limit/' + id);
  },

  // ─── Dashboard ──────────────────────────────────────────────────────────────
  getDashboard: async (): Promise<DashboardData> => {
    const response = await apiClient.get<{ counts: DashboardData }>('/api/expense/dashboard');
    return response.data.counts;
  },

  // ─── Expense Report ─────────────────────────────────────────────────────────
  getExpenseReport: async (payload: {
    fromDate: string;
    toDate: string;
    employeeId: string;
    expenseTypeId: number;
  }): Promise<Expense[]> => {
    const response = await apiClient.post<Expense[]>('/api/expense/expensereport', payload);
    return response.data;
  },

  // ─── Settlement History ─────────────────────────────────────────────────────
  getExpenseAmountDetails: async (payload: {
    fromDate: string;
    toDate: string;
    employeeId: string;
    expenseTypeId: number;
  }): Promise<SettlementHistoryResponse> => {
    const response = await apiClient.post<SettlementHistoryResponse>('/api/expense/expenseAmountDetails', payload);
    return response.data;
  },

  // ─── Expense Type Management ─────────────────────────────────────────────────
  saveExpenseType: async (payload: {
    id: number;
    name: string;
    createdBy: string;
    createdDate: string;
    updatedBy: string;
    updatedDate: string;
  }): Promise<void> => {
    await apiClient.post('/api/expense/saveExpenseType', payload);
  },

  deleteExpenseType: async (id: number): Promise<void> => {
    await apiClient.delete('/api/expense/expensetype/' + id);
  },

  // ─── Delete Travel/Pay Mode ──────────────────────────────────────────────────
  deleteTravelPayMode: async (id: number): Promise<void> => {
    await apiClient.delete('/api/expense/traveorpayment/' + id);
  },
};
