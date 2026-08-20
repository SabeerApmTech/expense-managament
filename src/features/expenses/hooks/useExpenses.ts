import { useQuery } from '@tanstack/react-query';
import { expensesApi } from '../../../api/expenses.api';
import { useManagedMutation } from '../../../utils/mutations';

export const EXPENSE_KEYS = {
  all: ['expenses'] as const,
  list: (empId: string) => [...EXPENSE_KEYS.all, 'list', empId] as const,
  details: (empId: string, expenseId: number) => [...EXPENSE_KEYS.all, 'details', empId, expenseId] as const,
  bills: (expenseDetailId: number) => [...EXPENSE_KEYS.all, 'bills', expenseDetailId] as const,
};

// Shared prefix with src/features/userManagement/hooks/useUserManagement.ts — kept as a
// literal (not a cross-feature import) so add/edit/delete here also refreshes usage caps.
const EXPENSE_TYPE_USAGE_PREFIX = ['expense-type-usage'] as const;
const ALL_EXPENSE_TYPE_USAGE_PREFIX = ['all-expense-type-usage'] as const;

export const useExpenseList = (empId: string) =>
  useQuery({
    queryKey: EXPENSE_KEYS.list(empId),
    queryFn: () => expensesApi.getExpenses(empId),
    enabled: !!empId,
  });

export const useExpenseDetails = (empId: string, expenseId: number | undefined) =>
  useQuery({
    queryKey: EXPENSE_KEYS.details(empId, expenseId ?? 0),
    queryFn: () => expensesApi.getExpenseDetails(empId, expenseId as number),
    enabled: !!empId && !!expenseId,
  });

export const useExpenseBills = (expenseDetailId: number | undefined) =>
  useQuery({
    queryKey: EXPENSE_KEYS.bills(expenseDetailId ?? 0),
    queryFn: () => expensesApi.getBills(expenseDetailId as number),
    enabled: !!expenseDetailId,
  });

export const useCreateExpenseDetail = (empId: string, expenseId?: number) =>
  useManagedMutation(
    (formData: FormData) => expensesApi.createExpenseDetail(formData),
    [
      EXPENSE_KEYS.list(empId),
      ...(expenseId ? [EXPENSE_KEYS.details(empId, expenseId)] : []),
      EXPENSE_TYPE_USAGE_PREFIX,
      ALL_EXPENSE_TYPE_USAGE_PREFIX,
    ],
    { success: (result) => result.message ?? 'Expense submitted successfully', error: 'Failed to submit expense' }
  );

export const useUpdateExpenseDetail = (empId: string, expenseId?: number, expenseDetailId?: number) =>
  useManagedMutation(
    (vars: { expenseDetailId: number; formData: FormData }) =>
      expensesApi.updateExpenseDetail(vars.expenseDetailId, vars.formData),
    [
      EXPENSE_KEYS.list(empId),
      ...(expenseId ? [EXPENSE_KEYS.details(empId, expenseId)] : []),
      ...(expenseDetailId ? [EXPENSE_KEYS.bills(expenseDetailId)] : []),
      EXPENSE_TYPE_USAGE_PREFIX,
      ALL_EXPENSE_TYPE_USAGE_PREFIX,
    ],
    { success: (result) => result.message ?? 'Expense updated successfully', error: 'Failed to update expense' }
  );

export const useDeleteExpenseDetail = (empId: string, expenseId?: number) =>
  useManagedMutation(
    (expenseDetailId: number) => expensesApi.deleteExpenseDetail(empId, expenseDetailId),
    [
      EXPENSE_KEYS.list(empId),
      ...(expenseId ? [EXPENSE_KEYS.details(empId, expenseId)] : []),
      EXPENSE_TYPE_USAGE_PREFIX,
      ALL_EXPENSE_TYPE_USAGE_PREFIX,
    ],
    { success: (result) => result.message ?? 'Expense deleted successfully', error: 'Failed to delete expense' }
  );

export const useDeleteBill = (empId: string, expenseId?: number, expenseDetailId?: number) =>
  useManagedMutation(
    (expenseBillId: number) => expensesApi.deleteBill(empId, expenseBillId),
    [
      EXPENSE_KEYS.list(empId),
      ...(expenseId ? [EXPENSE_KEYS.details(empId, expenseId)] : []),
      ...(expenseDetailId ? [EXPENSE_KEYS.bills(expenseDetailId)] : []),
    ],
    { success: (result) => result.message ?? 'Expense deleted successfully', error: 'Failed to delete expense' }
  );
