import { apiClient } from './axios';
import { unwrap } from '../utils/apiEnvelope';
import type { ApiResponse } from '../types/auth.types';
import type {
  CreateUserExpenseTypeLimitPayload,
  CreateUserPayload,
  DeleteUsersPayload,
  EditUserPayload,
  EmployeeExpenseTypeUsage,
  UpdateUserExpenseTypeLimitPayload,
  UserAccount,
} from '../types/user.types';

// The single-employee endpoint wraps usage rows as {empId, empName, fromDate, toDate,
// expenseTypes: [...]}; the all-employees endpoint wraps them as {fromDate, toDate,
// employees: [...]} where each row already carries its own empId/empName. Flatten
// either shape (and the old flat-array shape, for safety) into one list of usage rows.
function normalizeUsageEntry(entry: unknown): EmployeeExpenseTypeUsage[] {
  if (!entry || typeof entry !== 'object') return [];
  const envelope = entry as { empId?: string; empName?: string; expenseTypes?: unknown; employees?: unknown };
  const nested = envelope.expenseTypes ?? envelope.employees;
  if (Array.isArray(nested)) {
    return (nested as EmployeeExpenseTypeUsage[]).map((item) => ({
      ...item,
      empId: item.empId ?? envelope.empId ?? '',
      empName: item.empName ?? envelope.empName ?? '',
    }));
  }
  if ('expenseTypeId' in entry) return [entry as EmployeeExpenseTypeUsage];
  return [];
}

function normalizeUsage(raw: unknown): EmployeeExpenseTypeUsage[] {
  return Array.isArray(raw) ? raw.flatMap(normalizeUsageEntry) : normalizeUsageEntry(raw);
}

export const userManagementApi = {
  getAll: async (): Promise<UserAccount[]> => {
    const response = await apiClient.get<ApiResponse<UserAccount[]>>('/api/user-management/get-all');
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  create: async (payload: CreateUserPayload): Promise<{ data: void; message?: string }> => {
    const response = await apiClient.post('/api/user-management/create', payload);
    return unwrap<void>(response.data);
  },

  edit: async (userId: number, payload: EditUserPayload): Promise<{ data: void; message?: string }> => {
    const response = await apiClient.put(`/api/user-management/${userId}/edit`, payload);
    return unwrap<void>(response.data);
  },

  remove: async (payload: DeleteUsersPayload): Promise<{ data: void; message?: string }> => {
    const response = await apiClient.delete('/api/user-management/delete', { data: payload });
    return unwrap<void>(response.data);
  },

  createExpenseTypeLimit: async (
    payload: CreateUserExpenseTypeLimitPayload
  ): Promise<{ data: void; message?: string }> => {
    const response = await apiClient.post('/api/user-management/expense-types/create', payload);
    return unwrap<void>(response.data);
  },

  updateExpenseTypeLimit: async (
    userExpenseTypeId: number,
    payload: UpdateUserExpenseTypeLimitPayload
  ): Promise<{ data: void; message?: string }> => {
    const response = await apiClient.put(`/api/user-management/expense-types/${userExpenseTypeId}/update`, payload);
    return unwrap<void>(response.data);
  },

  deleteExpenseTypeLimit: async (
    userExpenseTypeId: number,
    deletedByEmpId: string
  ): Promise<{ data: void; message?: string }> => {
    const response = await apiClient.delete(`/api/user-management/expense-types/${userExpenseTypeId}/delete`, {
      params: { deletedByEmpId },
    });
    return unwrap<void>(response.data);
  },

  // Current-month usage for one employee (path empId is the employee themself).
  getEmpExpenseTypeUsage: async (empId: string): Promise<EmployeeExpenseTypeUsage[]> => {
    const response = await apiClient.get<ApiResponse<unknown>>(
      `/api/user-management/expense-types/${empId}/emp-expense-types`
    );
    return normalizeUsage(response.data.data);
  },

  // Current-month usage across all employees — path empId is the calling ADMIN/SUPERADMIN's own empId.
  getAllEmpExpenseTypeUsage: async (adminEmpId: string): Promise<EmployeeExpenseTypeUsage[]> => {
    const response = await apiClient.get<ApiResponse<unknown>>(
      `/api/user-management/expense-types/${adminEmpId}/all-emp-expense-types`
    );
    return normalizeUsage(response.data.data);
  },
};
