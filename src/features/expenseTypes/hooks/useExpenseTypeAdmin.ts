import { expenseTypesApi } from '../../../api/expenseTypes.api';
import { useManagedMutation } from '../../../utils/mutations';
import { EXPENSE_TYPE_KEYS } from './useExpenseTypes';
import type { CreateExpenseTypePayload } from '../../../types/expenseType.types';

export const useCreateExpenseType = () =>
  useManagedMutation(
    (payload: CreateExpenseTypePayload) => expenseTypesApi.create(payload),
    [EXPENSE_TYPE_KEYS.all],
    { success: (result) => result.message ?? 'Expense type saved', error: 'Failed to save expense type' }
  );

export const useDeleteExpenseType = () =>
  useManagedMutation(
    (expenseTypeId: number) => expenseTypesApi.remove(expenseTypeId),
    [EXPENSE_TYPE_KEYS.all],
    { success: (result) => result.message ?? 'Expense type deleted', error: 'Failed to delete expense type' }
  );
