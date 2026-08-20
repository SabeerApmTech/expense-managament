import { useQuery } from '@tanstack/react-query';
import { expenseTypesApi } from '../../../api/expenseTypes.api';

export const EXPENSE_TYPE_KEYS = {
  all: ['expense-types'] as const,
};

export const useExpenseTypes = () =>
  useQuery({
    queryKey: EXPENSE_TYPE_KEYS.all,
    queryFn: () => expenseTypesApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
