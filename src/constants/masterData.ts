import type { SelectOption } from '../types/common.types';
import type { ExpenseCategory } from '../types/expenseType.types';

export const EXPENSE_CATEGORY_OPTIONS: ExpenseCategory[] = ['Office', 'Personal'];

export const PAYMENT_MODE_OPTIONS: SelectOption[] = [
  { value: 'Cash', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Card', label: 'Card' },
];

export const TRAVEL_MODE_OPTIONS: SelectOption[] = [
  { value: 'Bike', label: 'Bike' },
  { value: 'Car', label: 'Car' },
  { value: 'Auto', label: 'Auto' },
  { value: 'Train', label: 'Train' },
];

export const STATUS_COLORS: Record<string, 'warning' | 'success' | 'error' | 'info'> = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'error',
};

export const SETTLEMENT_STATUS_COLORS: Record<string, 'warning' | 'success' | 'error' | 'info' | 'default'> = {
  'Not Created': 'default',
  Pending: 'warning',
  Settled: 'success',
};

export const isTravelExpenseType = (expenseTypeName: string | null | undefined): boolean =>
  (expenseTypeName ?? '').trim().toLowerCase() === 'travel';

export const ROUTES = {
  LOGIN: '/login',
  USAGES: '/usages',
  EXPENSES: '/expenses',
  OFFICE_EXPENSES: '/office-expenses',
  APPROVALS: '/approvals',
  ACCOUNTS: '/accounts',
  USER_MANAGEMENT: '/user-management',
  EMPLOYEE_EXPENSE_USAGE: '/employee-expense-usage',
  SETTLEMENT_REPORT: '/settlement-report',
  OFFICE_REPORTS: '/office-reports',
  MY_SETTLEMENTS: '/my-settlements',
  ASSETS: '/assets',
  OFFICE_MANAGEMENT: '/office-management',
  TERMS: '/terms',
} as const;
