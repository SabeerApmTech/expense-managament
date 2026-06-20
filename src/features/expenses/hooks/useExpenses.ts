import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { expensesApi } from '../../../api/expenses.api';
import type { SaveExpenseRequest, ExpenseFilters } from '../../../types/expense.types';

export const EXPENSE_KEYS = {
  all: ['expenses'] as const,
  lists: () => [...EXPENSE_KEYS.all, 'list'] as const,
  list: (filters: ExpenseFilters) => [...EXPENSE_KEYS.lists(), filters] as const,
  detail: (id: string) => [...EXPENSE_KEYS.all, 'detail', id] as const,
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
  });
};

export const useExpenseDetail = (id: string) =>
  useQuery({
    queryKey: EXPENSE_KEYS.detail(id),
    queryFn: () => expensesApi.getById(id),
    enabled: !!id,
  });

export const useSaveExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveExpenseRequest) => expensesApi.save(data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.lists() });
      if (vars.Id !== 0) {
        queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.detail(String(vars.Id)) });
      }
      enqueueSnackbar(
        vars.Id === 0 ? 'Expense submitted successfully' : 'Expense updated successfully',
        { variant: 'success' }
      );
    },
    onError: (_, vars) => {
      enqueueSnackbar(
        vars.Id === 0 ? 'Failed to submit expense' : 'Failed to update expense',
        { variant: 'error' }
      );
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.lists() });
      enqueueSnackbar('Expense deleted successfully', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Failed to delete expense', { variant: 'error' });
    },
  });
};
