import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { adminApi } from '../../../api/admin.api';
import type { AdminExpenseFilters } from '../../../types/expense.types';

export const ADMIN_EXPENSE_KEYS = {
  all: ['admin-expenses'] as const,
  lists: () => [...ADMIN_EXPENSE_KEYS.all, 'list'] as const,
  list: (filters: AdminExpenseFilters) => [...ADMIN_EXPENSE_KEYS.lists(), filters] as const,
  detail: (id: string) => [...ADMIN_EXPENSE_KEYS.all, 'detail', id] as const,
};

export const useAdminExpenseList = (filters: AdminExpenseFilters = {}) => {
  const params: Record<string, string> = {};
  if (filters.employee) params.employee = filters.employee;
  if (filters.expenseType) params.expenseType = filters.expenseType;
  if (filters.fromDate) params.fromDate = filters.fromDate;
  if (filters.toDate) params.toDate = filters.toDate;
  if (filters.status) params.status = filters.status;

  return useQuery({
    queryKey: ADMIN_EXPENSE_KEYS.list(filters),
    queryFn: () => adminApi.listExpenses(params),
  });
};

export const useAdminExpenseDetail = (id: string) =>
  useQuery({
    queryKey: ADMIN_EXPENSE_KEYS.detail(id),
    queryFn: () => adminApi.getById(id),
    enabled: !!id,
  });

export const useApproveExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ expenseId }: { expenseId: number }) =>
      adminApi.approveRejectExpense({ expenseId, status: 2, reason: '' }),
    onSuccess: (_, { expenseId }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_EXPENSE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ADMIN_EXPENSE_KEYS.detail(String(expenseId)) });
      enqueueSnackbar('Expense approved successfully', { variant: 'success' });
    },
    onError: () => enqueueSnackbar('Failed to approve expense', { variant: 'error' }),
  });
};

export const useRejectExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ expenseId, reason }: { expenseId: number; reason: string }) =>
      adminApi.approveRejectExpense({ expenseId, status: 3, reason }),
    onSuccess: (_, { expenseId }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_EXPENSE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ADMIN_EXPENSE_KEYS.detail(String(expenseId)) });
      enqueueSnackbar('Expense rejected', { variant: 'info' });
    },
    onError: () => enqueueSnackbar('Failed to reject expense', { variant: 'error' }),
  });
};

export const useSettleExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      expenseId: string | number;
      settlementBillFile: File;
      remarks: string;
    }) => adminApi.settleExpense(data),
    onSuccess: (_, { expenseId }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_EXPENSE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ADMIN_EXPENSE_KEYS.detail(String(expenseId)) });
      enqueueSnackbar('Expense marked as settled', { variant: 'success' });
    },
    onError: () => enqueueSnackbar('Failed to settle expense', { variant: 'error' }),
  });
};

export const useExpenseReport = () =>
  useMutation({
    mutationFn: (payload: { fromDate: string; toDate: string; employeeId: string }) =>
      adminApi.getExpenseReport(payload),
    onError: () => enqueueSnackbar('Failed to generate report', { variant: 'error' }),
  });
