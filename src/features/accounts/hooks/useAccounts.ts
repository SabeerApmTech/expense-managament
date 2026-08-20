import { useQuery } from '@tanstack/react-query';
import { accountsApi } from '../../../api/accounts.api';
import { useManagedMutation } from '../../../utils/mutations';

const PENDING_PREFIX = ['accounts', 'pending-settlements'] as const;
const EXPENSE_DETAIL_PREFIX = ['accounts', 'expense'] as const;

export const ACCOUNTS_KEYS = {
  pending: (empId: string, filterEmpId: string) => [...PENDING_PREFIX, empId, filterEmpId] as const,
  detail: (expenseCode: string) => ['accounts', 'expense', expenseCode] as const,
  settled: (empId: string, fromDate: string, toDate: string, filterEmpId: string) =>
    ['accounts', 'settled-expenses', empId, fromDate, toDate, filterEmpId] as const,
  settlementReport: (empId: string, fromDate: string, toDate: string) =>
    ['accounts', 'settlement-report', empId, fromDate, toDate] as const,
};

export const usePendingSettlements = (empId: string | undefined, filterEmpId?: string) =>
  useQuery({
    queryKey: ACCOUNTS_KEYS.pending(empId ?? '', filterEmpId ?? ''),
    queryFn: () => accountsApi.getPendingSettlements(empId as string, filterEmpId),
    enabled: !!empId,
  });

export const useExpenseSettlementDetails = (expenseCode: string | undefined, empId: string | undefined) =>
  useQuery({
    queryKey: ACCOUNTS_KEYS.detail(expenseCode ?? ''),
    queryFn: () => accountsApi.getExpenseSettlementDetails(expenseCode as string, empId as string),
    enabled: !!expenseCode && !!empId,
  });

// Settles one or more expenses (bulk supported via multiple ExpenseIds/ExpenseDetailIds
// in the FormData) — invalidating the broad expense-detail prefix, rather than one
// specific expenseCode key, covers every per-expense detail cache a bulk settle could touch.
export const useSettleExpense = () =>
  useManagedMutation(
    (formData: FormData) => accountsApi.settle(formData),
    [PENDING_PREFIX, EXPENSE_DETAIL_PREFIX],
    { success: (result) => result.message ?? 'Expense settled successfully', error: 'Failed to settle expense' }
  );

export const useSettledExpenses = (
  empId: string | undefined,
  fromDate: string,
  toDate: string,
  filterEmpId?: string
) =>
  useQuery({
    queryKey: ACCOUNTS_KEYS.settled(empId ?? '', fromDate, toDate, filterEmpId ?? ''),
    queryFn: () => accountsApi.getSettledExpenses(empId as string, fromDate, toDate, filterEmpId),
    enabled: !!empId,
  });

export const useSettlementReport = (empId: string | undefined, fromDate: string, toDate: string) =>
  useQuery({
    queryKey: ACCOUNTS_KEYS.settlementReport(empId ?? '', fromDate, toDate),
    queryFn: () => accountsApi.getSettlementReport(empId as string, fromDate, toDate),
    enabled: !!empId,
  });
