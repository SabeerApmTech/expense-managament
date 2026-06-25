import { useQuery } from '@tanstack/react-query';
import { masterApi } from '../../../api/master.api';

export const MASTER_KEYS = {
  expenseTypes: ['master', 'expense-types'] as const,
  travelModes: ['master', 'travel-modes'] as const,
  payModes: ['master', 'pay-modes'] as const,
  expensePageLoad: ['master', 'expense-page-load'] as const,
  statuses: ['master', 'expense-statuses'] as const,
};

export const useExpenseTypes = () =>
  useQuery({
    queryKey: MASTER_KEYS.expenseTypes,
    queryFn: () => masterApi.getExpenseTypes(),
    staleTime: 10 * 60 * 1000,
  });

export const useTravelModes = () =>
  useQuery({
    queryKey: MASTER_KEYS.travelModes,
    queryFn: () => masterApi.getTravelOrPaymentList(true),
    staleTime: 10 * 60 * 1000,
  });

export const usePayModes = () =>
  useQuery({
    queryKey: MASTER_KEYS.payModes,
    queryFn: () => masterApi.getTravelOrPaymentList(false),
    staleTime: 10 * 60 * 1000,
  });

export const useExpensePageLoad = () =>
  useQuery({
    queryKey: MASTER_KEYS.expensePageLoad,
    queryFn: () => masterApi.getExpensePageLoad(),
  });

export const useExpenseStatuses = () =>
  useQuery({
    queryKey: MASTER_KEYS.statuses,
    queryFn: () => masterApi.getExpenseStatuses(),
    staleTime: 60 * 60 * 1000,
  });
