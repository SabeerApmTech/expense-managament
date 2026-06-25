import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { expensesApi } from '../../../api/expenses.api';
import type { SaveExpenseRequest, ExpenseFilters } from '../../../types/expense.types';

export const EXPENSE_KEYS = {
  all: ['expenses'] as const,
  lists: () => [...EXPENSE_KEYS.all, 'list'] as const,
  list: (filters: ExpenseFilters) => [...EXPENSE_KEYS.lists(), filters] as const,
};

export const useExpenseList = (filters: ExpenseFilters = {}) => {
  const params: Record<string, string> = {};
  if (filters.fromDate) params.FromDate = filters.fromDate;
  if (filters.toDate) params.ToDate = filters.toDate;
  if (filters.status) params.Status = filters.status;
  if (filters.expenseType) params.ExpenseTypeId = filters.expenseType;

  return useQuery({
    queryKey: EXPENSE_KEYS.list(filters),
    queryFn: () => expensesApi.list(params),
    staleTime: 0,
  });
};

export const useSaveExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveExpenseRequest) => expensesApi.save(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ['admin-expenses', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      enqueueSnackbar('Expense submitted successfully', { variant: 'success' });
    },
    onError: (error) => {
      console.error('Save expense error:', error);
      enqueueSnackbar('Failed to submit expense', { variant: 'error' });
    },
  });
};

export const useInitiatorApproveItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { expenseId: number; status: number; reason?: string }) =>
      expensesApi.initiatorApproveReject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ['admin-expenses', 'list'] });
      enqueueSnackbar('Item approved', { variant: 'success' });
    },
    onError: () => enqueueSnackbar('Failed to approve item', { variant: 'error' }),
  });
};

export const useInitiatorRejectItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { expenseId: number; status: number; reason?: string }) =>
      expensesApi.initiatorApproveReject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ['admin-expenses', 'list'] });
      enqueueSnackbar('Item rejected', { variant: 'info' });
    },
    onError: () => enqueueSnackbar('Failed to reject item', { variant: 'error' }),
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ['admin-expenses', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      enqueueSnackbar('Expense deleted successfully', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Failed to delete expense', { variant: 'error' });
    },
  });
};
