import { useQuery } from '@tanstack/react-query';
import { userManagementApi } from '../../../api/userManagement.api';
import { useManagedMutation } from '../../../utils/mutations';
import type {
  CreateUserExpenseTypeLimitPayload,
  CreateUserPayload,
  DeleteUsersPayload,
  EditUserPayload,
  UpdateUserExpenseTypeLimitPayload,
} from '../../../types/user.types';

export const USER_KEYS = {
  all: ['users'] as const,
  allUsage: (adminEmpId: string) => ['all-expense-type-usage', adminEmpId] as const,
};

// Shared prefix with src/features/expenses/hooks/useExpenseTypeUsage.ts — kept as a
// literal (not a cross-feature import) so limit CRUD here can invalidate that cache too.
const EXPENSE_TYPE_USAGE_PREFIX = ['expense-type-usage'] as const;
const ALL_EXPENSE_TYPE_USAGE_PREFIX = ['all-expense-type-usage'] as const;

export const useUsers = () =>
  useQuery({
    queryKey: USER_KEYS.all,
    queryFn: () => userManagementApi.getAll(),
  });

export const useCreateUser = () =>
  useManagedMutation(
    (payload: CreateUserPayload) => userManagementApi.create(payload),
    [USER_KEYS.all],
    { success: (result) => result.message ?? 'User created successfully', error: 'Failed to create user' }
  );

export const useEditUser = () =>
  useManagedMutation(
    (vars: { userId: number; payload: EditUserPayload }) => userManagementApi.edit(vars.userId, vars.payload),
    [USER_KEYS.all],
    { success: (result) => result.message ?? 'User updated successfully', error: 'Failed to update user' }
  );

export const useDeleteUsers = () =>
  useManagedMutation(
    (payload: DeleteUsersPayload) => userManagementApi.remove(payload),
    [USER_KEYS.all],
    { success: (result) => result.message ?? 'User(s) deleted successfully', error: 'Failed to delete user(s)' }
  );

export const useCreateUserExpenseTypeLimit = () =>
  useManagedMutation(
    (payload: CreateUserExpenseTypeLimitPayload) => userManagementApi.createExpenseTypeLimit(payload),
    [EXPENSE_TYPE_USAGE_PREFIX, ALL_EXPENSE_TYPE_USAGE_PREFIX],
    { success: (result) => result.message ?? 'Expense limit added', error: 'Failed to add expense limit' }
  );

export const useUpdateUserExpenseTypeLimit = () =>
  useManagedMutation(
    (vars: { userExpenseTypeId: number; payload: UpdateUserExpenseTypeLimitPayload }) =>
      userManagementApi.updateExpenseTypeLimit(vars.userExpenseTypeId, vars.payload),
    [EXPENSE_TYPE_USAGE_PREFIX, ALL_EXPENSE_TYPE_USAGE_PREFIX],
    { success: (result) => result.message ?? 'Expense limit updated', error: 'Failed to update expense limit' }
  );

export const useDeleteUserExpenseTypeLimit = () =>
  useManagedMutation(
    (vars: { userExpenseTypeId: number; deletedByEmpId: string }) =>
      userManagementApi.deleteExpenseTypeLimit(vars.userExpenseTypeId, vars.deletedByEmpId),
    [EXPENSE_TYPE_USAGE_PREFIX, ALL_EXPENSE_TYPE_USAGE_PREFIX],
    { success: (result) => result.message ?? 'Expense limit deleted', error: 'Failed to delete expense limit' }
  );

// Current-month usage across all employees, for ADMIN/SUPERADMIN. Path param is the
// calling admin's own empId (an authorization check), same convention as useAllExpenseTypeLimits.
export const useAllEmpExpenseTypeUsage = (adminEmpId: string | null) =>
  useQuery({
    queryKey: USER_KEYS.allUsage(adminEmpId ?? ''),
    queryFn: () => userManagementApi.getAllEmpExpenseTypeUsage(adminEmpId as string),
    enabled: !!adminEmpId,
  });
